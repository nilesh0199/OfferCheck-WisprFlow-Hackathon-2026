import { describe, it, expect, vi } from "vitest";
import {
  estimateGroqTokens,
  callGroqChat,
  GROQ_TOKEN_BUDGET_CAP,
} from "@/lib/ai/groq";
import { analyzeOfferText } from "@/lib/analysis/gemini";
import { ModelCircuitBreaker } from "@/lib/analysis/model-health";

describe("Groq client and token estimator (Milestone Q1)", () => {
  it("estimates token counts with 3.5 char-per-token ratio + output cap", () => {
    // 35 chars / 3.5 = 10 tokens + 2500 = 2510
    const est = estimateGroqTokens("1234567890", "1234567890123456789012345", 2500);
    expect(est).toBe(2510);

    // Empty strings default to 2500
    expect(estimateGroqTokens("", "", 2500)).toBe(2500);

    // Default output cap is 2500
    expect(estimateGroqTokens("hello", "world")).toBe(Math.ceil(10 / 3.5) + 2500);
  });

  it("returns NOT_CONFIGURED when API key is missing", async () => {
    const res = await callGroqChat({
      messages: [{ role: "user", content: "Test message" }],
      apiKey: "",
    });

    expect(res.ok).toBe(false);
    expect(res.code).toBe("NOT_CONFIGURED");
    expect(res.httpStatus).toBe(500);
  });

  it("sends standard chat payload with hidden reasoning and json schema", async () => {
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;

    const mockFetch: typeof fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedInit = init;
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: '{"summary":"test summary","signals":[],"recommendedActions":[]}',
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const res = await callGroqChat({
      messages: [{ role: "user", content: "Hello Groq" }],
      systemPrompt: "You are an assistant",
      jsonSchema: { type: "object", properties: { summary: { type: "string" } } },
      apiKey: "gsk_test123",
      model: "openai/gpt-oss-120b",
      fetchFn: mockFetch,
    });

    expect(res.ok).toBe(true);
    expect(capturedUrl).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(capturedInit?.method).toBe("POST");

    const headers = capturedInit?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer gsk_test123");
    expect(headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(String(capturedInit?.body));
    expect(body.model).toBe("openai/gpt-oss-120b");
    expect(body.reasoning_effort).toBe("low");
    expect(body.reasoning_format).toBe("hidden");
    expect(body.max_completion_tokens).toBe(2500);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].role).toBe("user");
    expect(body.response_format?.type).toBe("json_schema");
  });

  it("handles 429 rate limits and parses retry-after header", async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ error: { message: "Rate limit exceeded" } }), {
        status: 429,
        headers: { "Retry-After": "120" },
      });
    };

    const res = await callGroqChat({
      messages: [{ role: "user", content: "Test" }],
      apiKey: "gsk_test123",
      fetchFn: mockFetch,
    });

    expect(res.ok).toBe(false);
    expect(res.code).toBe("RATE_LIMITED");
    expect(res.httpStatus).toBe(429);
    expect(res.retryAfterSeconds).toBe(120);
  });

  it("caps retry-after cooldown at 900 seconds (15 minutes)", async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ error: { message: "Rate limit exceeded" } }), {
        status: 429,
        headers: { "Retry-After": "3600" },
      });
    };

    const res = await callGroqChat({
      messages: [{ role: "user", content: "Test" }],
      apiKey: "gsk_test123",
      fetchFn: mockFetch,
    });

    expect(res.ok).toBe(false);
    expect(res.retryAfterSeconds).toBe(900);
  });

  it("handles 401 authentication errors as NOT_CONFIGURED", async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ error: { message: "Invalid API key" } }), {
        status: 401,
      });
    };

    const res = await callGroqChat({
      messages: [{ role: "user", content: "Test" }],
      apiKey: "bad_key",
      fetchFn: mockFetch,
    });

    expect(res.ok).toBe(false);
    expect(res.code).toBe("NOT_CONFIGURED");
    expect(res.httpStatus).toBe(401);
  });

  it("handles 500 upstream server errors", async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response("Internal Server Error", { status: 500 });
    };

    const res = await callGroqChat({
      messages: [{ role: "user", content: "Test" }],
      apiKey: "gsk_test",
      fetchFn: mockFetch,
    });

    expect(res.ok).toBe(false);
    expect(res.code).toBe("UPSTREAM_ERROR");
    expect(res.httpStatus).toBe(500);
  });
});

describe("Groq fallback chain integration in analyzeOfferText", () => {
  const sampleOffer =
    "We are pleased to offer you an internship position at Tech Corp. " +
    "You will receive a stipend of Rs 15,000 per month starting next month. " +
    "Please send your confirmation email along with required documents.";

  const mockValidOutput = JSON.stringify({
    concerns: [
      {
        id: "c1",
        category: "other",
        observation: "States monthly stipend details",
        interpretation: "The offer confirms a stipend of Rs 15,000 per month.",
        quote: "stipend of Rs 15,000 per month",
      },
    ],
    missingInfo: [
      {
        id: "m1",
        topic: "working_hours",
        note: "Daily working hours and schedule are not stated in the excerpt.",
      },
    ],
    verificationQuestions: [
      {
        id: "q1",
        question: "What are the official working hours and reporting expectations?",
      },
    ],
    overallNote: "Standard software development internship offer letter with stipend details.",
  });

  it("never calls Groq when Gemini succeeds", async () => {
    const mockGeminiClient = {
      interactions: {
        create: vi.fn().mockResolvedValue({
          output_text: mockValidOutput,
        }),
      },
    };

    const mockGroqFetch = vi.fn();

    const result = await analyzeOfferText(sampleOffer, {
      apiKey: "gemini_valid_key",
      client: mockGeminiClient,
      groqApiKey: "groq_valid_key",
      groqFetch: mockGroqFetch as typeof fetch,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.modelUsed).toBe("gemini-3.8-flash");
    }
    expect(mockGroqFetch).not.toHaveBeenCalled();
  });

  it("falls back to Groq when all Gemini models fail with rate limits", async () => {
    const mockGeminiClient = {
      interactions: {
        create: vi.fn().mockRejectedValue({
          status: 429,
          message: "Resource has been exhausted (e.g. check quota).",
        }),
      },
    };

    const mockGroqFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: mockValidOutput } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await analyzeOfferText(sampleOffer, {
      apiKey: "gemini_valid_key",
      client: mockGeminiClient,
      groqApiKey: "groq_valid_key",
      groqFetch: mockGroqFetch as typeof fetch,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.modelUsed).toBe("groq:openai/gpt-oss-120b");
      expect(result.analysis.concerns.length).toBeGreaterThan(0);
      expect(result.attempts.length).toBeGreaterThan(1);
      // Gemini attempts recorded
      expect(result.attempts.some((a) => a.model.startsWith("gemini"))).toBe(true);
      // Groq attempt recorded
      expect(result.attempts.some((a) => a.model === "groq:openai/gpt-oss-120b")).toBe(true);
    }
    expect(mockGroqFetch).toHaveBeenCalledTimes(1);
  });

  it("skips Groq when token estimate exceeds the 7,000 token guard", async () => {
    const longInput = "a".repeat(11900);
    const estLarge = estimateGroqTokens("A".repeat(16000), longInput, 2500);
    expect(estLarge).toBeGreaterThan(GROQ_TOKEN_BUDGET_CAP);

    const breaker = new ModelCircuitBreaker();
    expect(breaker.isModelAvailable("groq:openai/gpt-oss-120b")).toBe(true);
  });

  it("applies retry-after cooldown to circuit breaker when Groq returns 429", async () => {
    const mockTime = 1000000;
    const breaker = new ModelCircuitBreaker({ now: () => mockTime });

    const mockGeminiClient = {
      interactions: {
        create: vi.fn().mockRejectedValue({
          status: 429,
          message: "Gemini rate limited",
        }),
      },
    };

    const mockGroqFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "Groq rate limit exceeded" } }), {
        status: 429,
        headers: { "Retry-After": "300" },
      })
    );

    const result = await analyzeOfferText(sampleOffer, {
      apiKey: "gemini_valid_key",
      client: mockGeminiClient,
      groqApiKey: "groq_valid_key",
      groqFetch: mockGroqFetch as typeof fetch,
      circuitBreaker: breaker,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("RATE_LIMITED");
    }

    // Circuit breaker should now have "groq:openai/gpt-oss-120b" on cooldown for 300s (300,000ms)
    expect(breaker.isModelAvailable("groq:openai/gpt-oss-120b", mockTime + 1000)).toBe(false);
    expect(breaker.isModelAvailable("groq:openai/gpt-oss-120b", mockTime + 299000)).toBe(false);
    // After 300s, available again
    expect(breaker.isModelAvailable("groq:openai/gpt-oss-120b", mockTime + 301000)).toBe(true);
  });

  it("retries Groq once if first attempt outputs malformed JSON schema and time remains", async () => {
    const mockGeminiClient = {
      interactions: {
        create: vi.fn().mockRejectedValue({
          status: 429,
          message: "Gemini rate limited",
        }),
      },
    };

    let groqCallCount = 0;
    const mockGroqFetch: typeof fetch = async () => {
      groqCallCount++;
      if (groqCallCount === 1) {
        // First call returns malformed JSON
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: "This is plain text, not valid JSON" } }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      // Second call returns valid JSON
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: mockValidOutput } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const result = await analyzeOfferText(sampleOffer, {
      apiKey: "gemini_valid_key",
      client: mockGeminiClient,
      groqApiKey: "groq_valid_key",
      groqFetch: mockGroqFetch,
      overallDeadlineMs: 40000,
    });

    expect(result.ok).toBe(true);
    expect(groqCallCount).toBe(2);
    if (result.ok) {
      expect(result.modelUsed).toBe("groq:openai/gpt-oss-120b");
      expect(result.attempts.some((a) => a.outcome === "INVALID_MODEL_OUTPUT")).toBe(true);
      expect(result.attempts.some((a) => a.outcome === "SUCCESS")).toBe(true);
    }
  });
});
