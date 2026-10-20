import { describe, it, expect, beforeEach, vi } from "vitest";
import { ModelCircuitBreaker } from "@/lib/analysis/model-health";
import { analyzeOfferText, GeminiModelClient } from "@/lib/analysis/gemini";
import {
  CIRCUIT_BREAKER_TIMEOUT_COOLDOWN_MS,
  CIRCUIT_BREAKER_SERVER_ERROR_COOLDOWN_MS,
} from "@/lib/config";

describe("ModelCircuitBreaker", () => {
  let virtualTime: number;
  const mockNow = () => virtualTime;

  beforeEach(() => {
    virtualTime = 1_700_000_000_000;
  });

  it("puts model on cooldown for 5 minutes after TIMEOUT", () => {
    const breaker = new ModelCircuitBreaker({ now: mockNow });
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(true);

    breaker.recordFailure("gemini-3.8-flash", "TIMEOUT", 504);
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(false);

    // After 4m59s still on cooldown
    virtualTime += CIRCUIT_BREAKER_TIMEOUT_COOLDOWN_MS - 1000;
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(false);

    // After 5m is available again
    virtualTime += 2000;
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(true);
  });

  it("puts model on cooldown for 15 minutes after RATE_LIMITED (429)", () => {
    const breaker = new ModelCircuitBreaker({ now: mockNow });

    breaker.recordFailure("gemini-3.8-flash", "RATE_LIMITED", 429);
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(false);

    // After 14 minutes still on cooldown
    virtualTime += 14 * 60 * 1000;
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(false);

    // After 15 minutes is available
    virtualTime += 61 * 1000;
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(true);
  });

  it("puts model on cooldown for 1 minute after 5xx server error", () => {
    const breaker = new ModelCircuitBreaker({ now: mockNow });

    breaker.recordFailure("gemini-3.8-flash", "UPSTREAM_ERROR", 503);
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(false);

    virtualTime += CIRCUIT_BREAKER_SERVER_ERROR_COOLDOWN_MS + 1000;
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(true);
  });

  it("recordSuccess immediately clears cooldown for that model", () => {
    const breaker = new ModelCircuitBreaker({ now: mockNow });
    breaker.recordFailure("gemini-3.8-flash", "RATE_LIMITED", 429);
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(false);

    breaker.recordSuccess("gemini-3.8-flash");
    expect(breaker.isModelAvailable("gemini-3.8-flash")).toBe(true);
  });

  it("skips cooled-down models when filtering", () => {
    const breaker = new ModelCircuitBreaker({ now: mockNow });
    const chain = ["model-1", "model-2", "model-3"];

    breaker.recordFailure("model-1", "TIMEOUT", 504);

    const { modelsToTry, skippedModels, allWereOnCooldown } = breaker.filterModels(chain);
    expect(allWereOnCooldown).toBe(false);
    expect(skippedModels).toEqual(["model-1"]);
    expect(modelsToTry).toEqual(["model-2", "model-3"]);
  });

  it("never fails closed: if ALL models are on cooldown, tries all models normally", () => {
    const breaker = new ModelCircuitBreaker({ now: mockNow });
    const chain = ["model-1", "model-2", "model-3"];

    breaker.recordFailure("model-1", "RATE_LIMITED", 429);
    breaker.recordFailure("model-2", "TIMEOUT", 504);
    breaker.recordFailure("model-3", "UPSTREAM_ERROR", 503);

    const { modelsToTry, skippedModels, allWereOnCooldown } = breaker.filterModels(chain);
    expect(allWereOnCooldown).toBe(true);
    expect(skippedModels).toEqual([]);
    expect(modelsToTry).toEqual(["model-1", "model-2", "model-3"]);
  });

  it("skipped model does not count toward MAX_MODEL_ATTEMPTS in analyzeOfferText", async () => {
    const breaker = new ModelCircuitBreaker({ now: mockNow });
    // Put model-1 on cooldown
    breaker.recordFailure("model-1", "RATE_LIMITED", 429);

    const calledModels: string[] = [];
    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockImplementation((params) => {
          calledModels.push(params.model);
          return Promise.resolve({
            output_text: JSON.stringify({
              concerns: [],
              missingInfo: [],
              verificationQuestions: [],
            }),
          });
        }),
      },
    };

    const validOfferText =
      "Congratulations! We are pleased to extend an offer for the Software Development Internship at ExampleCorp.";

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      modelChain: ["model-1", "model-2", "model-3"],
      client: fakeClient,
      circuitBreaker: breaker,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.modelUsed).toBe("model-2");
      // Exactly 1 attempt was made (model-1 was skipped and did not count as an attempt)
      expect(res.attempts).toHaveLength(1);
      expect(res.attempts[0].model).toBe("model-2");
      expect(calledModels).toEqual(["model-2"]);
    }
  });
});
