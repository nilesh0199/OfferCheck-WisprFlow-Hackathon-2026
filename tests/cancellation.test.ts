import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analyzeOfferText, GeminiModelClient } from "@/lib/analysis/gemini";

describe("Real cancellation and AbortSignal handling", () => {
  const validOfferText =
    "Congratulations! We are pleased to extend an offer for the Software Development Internship at ExampleCorp.";

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes an AbortSignal to client.interactions.create options", async () => {
    let capturedSignal: AbortSignal | undefined;
    let capturedOptions: Record<string, unknown> | undefined;

    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockImplementation((_params, options) => {
          capturedOptions = options;
          capturedSignal = options?.signal;
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

    const promise = analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      modelChain: ["gemini-3.8-flash"],
      client: fakeClient,
    });

    await promise;

    expect(capturedOptions).toBeDefined();
    expect(capturedSignal).toBeDefined();
    expect(capturedSignal).toBeInstanceOf(AbortSignal);
    expect(capturedSignal?.aborted).toBe(false);
  });

  it("aborts the AbortSignal when the per-attempt timeout fires", async () => {
    let capturedSignal: AbortSignal | undefined;

    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockImplementation((_params, options) => {
          capturedSignal = options?.signal;
          // Never resolves naturally; simulates stalled HTTP request
          return new Promise(() => {});
        }),
      },
    };

    const promise = analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      modelChain: ["gemini-3.8-flash"],
      client: fakeClient,
      perAttemptTimeoutMs: 2000,
      overallDeadlineMs: 10000,
    });

    expect(capturedSignal?.aborted).toBe(false);

    // Advance fake timers past the 2000ms perAttemptTimeoutMs
    await vi.advanceTimersByTimeAsync(2500);

    const res = await promise;
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("TIMEOUT");
    }

    // The signal must be aborted!
    expect(capturedSignal?.aborted).toBe(true);
  });

  it("a completed attempt clears the timeout handle and does not leave a pending timer", async () => {
    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockResolvedValue({
          output_text: JSON.stringify({
            concerns: [],
            missingInfo: [],
            verificationQuestions: [],
          }),
        }),
      },
    };

    const promise = analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      modelChain: ["gemini-3.8-flash"],
      client: fakeClient,
      perAttemptTimeoutMs: 10000,
    });

    const res = await promise;
    expect(res.ok).toBe(true);

    // Number of active timers in fake timer system should be 0 because clearTimeout was called in finally
    expect(vi.getTimerCount()).toBe(0);
  });
});
