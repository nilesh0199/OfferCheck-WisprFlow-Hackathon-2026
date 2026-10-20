import { describe, it, expect, vi } from "vitest";
import {
  analyzeOfferText,
  cleanJsonSchemaForGemini,
  parseModelChain,
  resolveThinkingLevel,
  GEMINI_RESPONSE_SCHEMA,
  GeminiModelClient,
} from "@/lib/analysis/gemini";
import {
  MIN_INPUT_CHARS,
  MAX_INPUT_CHARS,
  DEFAULT_MODEL_CHAIN,
  MAX_OUTPUT_TOKENS,
} from "@/lib/config";
import { PROMPT_INJECTION_FIXTURE } from "@/data/test-fixtures";
import { OFFER_DELIMITER_START, OFFER_DELIMITER_END } from "@/lib/analysis/prompt";

describe("cleanJsonSchemaForGemini", () => {
  it("removes $schema, minLength, maxLength, and pattern while preserving types and arrays", () => {
    const rawSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {
        quote: {
          type: "string",
          minLength: 4,
          maxLength: 300,
        },
        concerns: {
          type: "array",
          maxItems: 10,
          items: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["upfront_payment", "other"],
              },
            },
          },
        },
      },
      required: ["quote"],
    };

    const cleaned = cleanJsonSchemaForGemini(rawSchema) as Record<string, unknown>;
    expect(cleaned.$schema).toBeUndefined();
    expect(cleaned.type).toBe("object");

    const props = cleaned.properties as Record<string, unknown>;
    const quoteProp = props.quote as Record<string, unknown>;
    expect(quoteProp.minLength).toBeUndefined();
    expect(quoteProp.maxLength).toBeUndefined();
    expect(quoteProp.type).toBe("string");

    const concernsProp = props.concerns as Record<string, unknown>;
    expect(concernsProp.maxItems).toBe(10);
  });

  it("GEMINI_RESPONSE_SCHEMA is a valid object without $schema", () => {
    expect(GEMINI_RESPONSE_SCHEMA).toBeDefined();
    expect(typeof GEMINI_RESPONSE_SCHEMA).toBe("object");
    expect((GEMINI_RESPONSE_SCHEMA as Record<string, unknown>).$schema).toBeUndefined();
  });
});

describe("parseModelChain and resolveThinkingLevel", () => {
  it("returns DEFAULT_MODEL_CHAIN when environment variables are unset", () => {
    const chain = parseModelChain(undefined, undefined);
    expect(chain).toEqual(DEFAULT_MODEL_CHAIN);
    expect(chain).toEqual([
      "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
    ]);
  });

  it("parses GEMINI_MODELS, trims whitespace, drops empty items, and caps at 3", () => {
    const chain = parseModelChain(" model-a , , model-b , model-c , model-d ");
    expect(chain).toEqual(["model-a", "model-b", "model-c"]);
  });

  it("falls back to legacy GEMINI_MODEL as a single-item chain if GEMINI_MODELS is unset", () => {
    const chain = parseModelChain(undefined, " gemini-legacy-flash ");
    expect(chain).toEqual(["gemini-legacy-flash"]);
  });

  it("resolves lowest documented thinking level per model", () => {
    expect(resolveThinkingLevel("gemini-3.8-flash")).toBe("low");
    expect(resolveThinkingLevel("gemini-3.6-flash")).toBe("minimal");
    expect(resolveThinkingLevel("gemini-3.5-flash-lite")).toBe("minimal");
  });

  it("applies GEMINI_THINKING_LEVEL override only when supported by the model", () => {
    // gemini-3.8-flash supports low, medium, high (NOT minimal)
    expect(resolveThinkingLevel("gemini-3.8-flash", "high")).toBe("high");
    expect(resolveThinkingLevel("gemini-3.8-flash", "minimal")).toBe("low"); // falls back to lowest supported

    // gemini-3.6-flash supports minimal, low, medium, high
    expect(resolveThinkingLevel("gemini-3.6-flash", "low")).toBe("low");
    expect(resolveThinkingLevel("gemini-3.6-flash", "minimal")).toBe("minimal");

    // unlisted model returns undefined (never guess)
    expect(resolveThinkingLevel("custom-unlisted-model")).toBeUndefined();
  });
});

describe("analyzeOfferText offline validation and fallback handling", () => {
  const validOfferText =
    "We are pleased to offer you the Software Engineering Internship at Nebula Dynamics. A refundable equipment deposit of ₹4,500 is required within 24 hours to secure your workspace setup. Please contact hr@example.com for payment instructions.";

  const mockValidModelJson = JSON.stringify({
    concerns: [
      {
        id: "c-1",
        category: "refundable_deposit",
        observation: "The offer requires a refundable equipment deposit of ₹4,500.",
        interpretation: "Legitimate internships generally do not require upfront deposits.",
        quote: "refundable equipment deposit of ₹4,500",
      },
    ],
    missingInfo: [
      {
        id: "m-1",
        topic: "stipend_or_pay",
        note: "Stipend payment terms are not stated in the provided text.",
      },
    ],
    verificationQuestions: [
      {
        id: "q-1",
        question: "Can you provide documentation regarding equipment refund policies?",
        relatedConcernId: "c-1",
      },
    ],
    overallNote: "Review is based exclusively on the provided text.",
  });

  it("returns EMPTY_INPUT for empty or whitespace-only input without calling model", async () => {
    const fakeClient: GeminiModelClient = {
      interactions: { create: vi.fn() },
    };

    const res1 = await analyzeOfferText("", { apiKey: "fake-key", client: fakeClient });
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.code).toBe("EMPTY_INPUT");
      expect(res1.httpStatus).toBe(422);
    }

    const res2 = await analyzeOfferText("   \n\t  ", {
      apiKey: "fake-key",
      client: fakeClient,
    });
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.code).toBe("EMPTY_INPUT");
    }

    expect(fakeClient.interactions!.create).not.toHaveBeenCalled();
  });

  it("returns TOO_SHORT when trimmed input is under MIN_INPUT_CHARS without calling model", async () => {
    const fakeClient: GeminiModelClient = {
      interactions: { create: vi.fn() },
    };

    const shortText = "Short offer letter.";
    expect(shortText.length).toBeLessThan(MIN_INPUT_CHARS);

    const res = await analyzeOfferText(shortText, {
      apiKey: "fake-key",
      client: fakeClient,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("TOO_SHORT");
      expect(res.httpStatus).toBe(422);
    }
    expect(fakeClient.interactions!.create).not.toHaveBeenCalled();
  });

  it("returns TOO_LONG when input exceeds MAX_INPUT_CHARS without calling model", async () => {
    const fakeClient: GeminiModelClient = {
      interactions: { create: vi.fn() },
    };

    const longText = "A".repeat(MAX_INPUT_CHARS + 1);
    const res = await analyzeOfferText(longText, {
      apiKey: "fake-key",
      client: fakeClient,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("TOO_LONG");
      expect(res.httpStatus).toBe(413);
    }
    expect(fakeClient.interactions!.create).not.toHaveBeenCalled();
  });

  it("returns NOT_CONFIGURED when API key is missing", async () => {
    const fakeClient: GeminiModelClient = {
      interactions: { create: vi.fn() },
    };

    const prevEnv = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const res = await analyzeOfferText(validOfferText, {
        apiKey: "",
        client: fakeClient,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("NOT_CONFIGURED");
        expect(res.httpStatus).toBe(500);
      }
      expect(fakeClient.interactions!.create).not.toHaveBeenCalled();
    } finally {
      if (prevEnv) process.env.GEMINI_API_KEY = prevEnv;
    }
  });

  it("400/401/403 fails immediately with no fallback and exactly one call", async () => {
    // 400 Bad Request
    const err400 = new Error("Invalid parameter: 400 Bad Request");
    (err400 as unknown as { status: number }).status = 400;

    const fakeClient400: GeminiModelClient = {
      interactions: { create: vi.fn().mockRejectedValue(err400) },
    };

    const res400 = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient400,
      modelChain: ["model-1", "model-2", "model-3"],
    });

    expect(fakeClient400.interactions!.create).toHaveBeenCalledTimes(1); // Exactly 1 call, no fallback!
    expect(res400.ok).toBe(false);
    if (!res400.ok) {
      expect(res400.code).toBe("UPSTREAM_ERROR");
      expect(res400.httpStatus).toBe(400);
    }

    // 401 Unauthorized
    const err401 = new Error("API key invalid: 401 Unauthorized");
    (err401 as unknown as { status: number }).status = 401;

    const fakeClient401: GeminiModelClient = {
      interactions: { create: vi.fn().mockRejectedValue(err401) },
    };

    const res401 = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient401,
      modelChain: ["model-1", "model-2", "model-3"],
    });

    expect(fakeClient401.interactions!.create).toHaveBeenCalledTimes(1);
    expect(res401.ok).toBe(false);
    if (!res401.ok) {
      expect(res401.code).toBe("NOT_CONFIGURED");
      expect(res401.httpStatus).toBe(500);
    }

    // 403 Forbidden
    const err403 = new Error("Permission denied: 403 Forbidden");
    (err403 as unknown as { status: number }).status = 403;

    const fakeClient403: GeminiModelClient = {
      interactions: { create: vi.fn().mockRejectedValue(err403) },
    };

    const res403 = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient403,
      modelChain: ["model-1", "model-2", "model-3"],
    });

    expect(fakeClient403.interactions!.create).toHaveBeenCalledTimes(1);
    expect(res403.ok).toBe(false);
    if (!res403.ok) {
      expect(res403.code).toBe("NOT_CONFIGURED");
      expect(res403.httpStatus).toBe(500);
    }
  });

  it("primary 429 -> secondary used and modelUsed reported", async () => {
    const rateLimitError = new Error("Resource exhausted: 429 quota exceeded");
    (rateLimitError as unknown as { status: number }).status = 429;

    const mockCreate = vi
      .fn()
      .mockRejectedValueOnce(rateLimitError) // primary 429
      .mockResolvedValueOnce({ output_text: mockValidModelJson }); // secondary succeeds

    const fakeClient: GeminiModelClient = {
      interactions: { create: mockCreate },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["gemini-3.8-flash", "gemini-3.6-flash"],
    });

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockCreate.mock.calls[0][0].model).toBe("gemini-3.8-flash");
    expect(mockCreate.mock.calls[1][0].model).toBe("gemini-3.6-flash");

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.modelUsed).toBe("gemini-3.6-flash");
      expect(res.attempts.length).toBe(2);
      expect(res.attempts[0].outcome).toBe("RATE_LIMITED");
      expect(res.attempts[1].outcome).toBe("SUCCESS");
    }
  });

  it("primary 503 overloaded -> falls back to next model", async () => {
    const overloadError = new Error("503 Service Unavailable: The model is overloaded");
    (overloadError as unknown as { status: number }).status = 503;

    const mockCreate = vi
      .fn()
      .mockRejectedValueOnce(overloadError) // primary 503
      .mockResolvedValueOnce({ output_text: mockValidModelJson }); // secondary succeeds

    const fakeClient: GeminiModelClient = {
      interactions: { create: mockCreate },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["gemini-3.8-flash", "gemini-3.6-flash"],
    });

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.modelUsed).toBe("gemini-3.6-flash");
      expect(res.attempts[0].outcome).toBe("UPSTREAM_ERROR");
      expect(res.attempts[0].httpStatus).toBe(503);
    }
  });

  it("primary timeout -> falls back to next model within deadline, never retrying same model on timeout", async () => {
    const timeoutErr = new Error("The operation was aborted due to timeout");
    timeoutErr.name = "TimeoutError";

    const mockCreate = vi
      .fn()
      .mockRejectedValueOnce(timeoutErr) // primary timeout
      .mockResolvedValueOnce({ output_text: mockValidModelJson }); // secondary succeeds

    const fakeClient: GeminiModelClient = {
      interactions: { create: mockCreate },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["gemini-3.8-flash", "gemini-3.6-flash"],
    });

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockCreate.mock.calls[0][0].model).toBe("gemini-3.8-flash");
    expect(mockCreate.mock.calls[1][0].model).toBe("gemini-3.6-flash");

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.modelUsed).toBe("gemini-3.6-flash");
      expect(res.attempts[0].outcome).toBe("TIMEOUT");
      expect(res.attempts[0].httpStatus).toBe(504);
      expect(res.attempts[1].outcome).toBe("SUCCESS");
    }
  });

  it("all three fail with 429 -> returns RATE_LIMITED after exactly 3 attempts", async () => {
    const rateLimitError = new Error("Resource exhausted: 429 quota exceeded");
    (rateLimitError as unknown as { status: number }).status = 429;

    const mockCreate = vi.fn().mockRejectedValue(rateLimitError);

    const fakeClient: GeminiModelClient = {
      interactions: { create: mockCreate },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"],
    });

    expect(mockCreate).toHaveBeenCalledTimes(3); // Exactly 3 attempts!
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("RATE_LIMITED");
      expect(res.httpStatus).toBe(429);
      expect(res.attempts.length).toBe(3);
      expect(res.attempts.every((a) => a.outcome === "RATE_LIMITED")).toBe(true);
    }
  });

  it("invalid output on the first model -> valid output on the next model succeeds", async () => {
    const mockCreate = vi
      .fn()
      .mockResolvedValueOnce({ output_text: "{ invalid json format..." }) // model 1 unparseable
      .mockResolvedValueOnce({ output_text: mockValidModelJson }); // model 2 valid

    const fakeClient: GeminiModelClient = {
      interactions: { create: mockCreate },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["gemini-3.8-flash", "gemini-3.6-flash"],
    });

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.modelUsed).toBe("gemini-3.6-flash");
      expect(res.attempts[0].outcome).toBe("INVALID_MODEL_OUTPUT");
      expect(res.attempts[1].outcome).toBe("SUCCESS");
    }
  });

  it("never makes more than 3 attempts even if chain has more models", async () => {
    const serverErr = new Error("500 Internal Error");
    (serverErr as unknown as { status: number }).status = 500;

    const mockCreate = vi.fn().mockRejectedValue(serverErr);

    const fakeClient: GeminiModelClient = {
      interactions: { create: mockCreate },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["model-1", "model-2", "model-3", "model-4", "model-5"],
    });

    expect(mockCreate).toHaveBeenCalledTimes(3); // Capped at 3!
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.attempts.length).toBe(3);
    }
  });

  it("shared deadline stops further attempts when little time remains", async () => {
    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockImplementation(async () => {
          // Simulate model taking 3500ms
          await new Promise((r) => setTimeout(r, 50));
          throw new Error("Generic failure");
        }),
      },
    };

    // Overall deadline of 2000ms: with safety margin of 3000ms, time remaining is immediately insufficient
    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["model-1", "model-2", "model-3"],
      overallDeadlineMs: 1500, // Insufficient deadline (< 3000ms safety threshold)
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("TIMEOUT");
      expect(res.httpStatus).toBe(504);
      expect(fakeClient.interactions!.create).not.toHaveBeenCalled();
    }
  });

  it("passes correct thinking_level and max_output_tokens in generation_config", async () => {
    let capturedConfig: Record<string, unknown> | undefined;

    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockImplementation((params) => {
          capturedConfig = params.generation_config;
          return Promise.resolve({ output_text: mockValidModelJson });
        }),
      },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["gemini-3.8-flash"],
    });

    expect(res.ok).toBe(true);
    expect(capturedConfig).toBeDefined();
    expect(capturedConfig?.thinking_level).toBe("low"); // lowest documented level for 3.8
    expect(capturedConfig?.max_output_tokens).toBe(MAX_OUTPUT_TOKENS);
  });

  it("runs validateAnalysis and returns structured validated analysis on valid model output", async () => {
    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockResolvedValue({ output_text: mockValidModelJson }),
      },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.analysis.concerns.length).toBe(1);
      expect(res.analysis.concerns[0].span.start).toBeDefined();
      expect(res.analysis.limits.length).toBeGreaterThanOrEqual(4);
      expect(res.analysis.droppedCount).toBe(0);
      expect(res.modelUsed).toBe("gemini-3.8-flash");
    }
  });

  it("a concern with a fabricated quote is dropped and droppedCount increments through analyzeOfferText", async () => {
    const responseWithFabricatedQuote = JSON.stringify({
      concerns: [
        {
          id: "c-real",
          category: "refundable_deposit",
          observation: "The offer requires a deposit.",
          interpretation: "Legitimate internships do not require deposits.",
          quote: "refundable equipment deposit of ₹4,500",
        },
        {
          id: "c-fake",
          category: "upfront_payment",
          observation: "The candidate must send crypto tokens.",
          interpretation: "Crypto payments are fraudulent.",
          quote: "send 500 USDT to wallet 0xABCD1234", // FABRICATED: not in source text!
        },
      ],
      missingInfo: [],
      verificationQuestions: [],
      overallNote: "Analysis complete.",
    });

    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockResolvedValue({ output_text: responseWithFabricatedQuote }),
      },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.analysis.concerns.length).toBe(1);
      expect(res.analysis.concerns[0].id).toBe("c-real");
      expect(res.analysis.concerns[0].quote).toBe("refundable equipment deposit of ₹4,500");
      expect(res.analysis.droppedCount).toBe(1);
    }
  });

  it("console spies prove no logged call ever contains the offer text, even when the model call fails", async () => {
    const logSpy = vi.spyOn(console, "log");
    const warnSpy = vi.spyOn(console, "warn");
    const errorSpy = vi.spyOn(console, "error");

    const sensitiveOfferText =
      "CONFIDENTIAL_SENSITIVE_TEXT: We offer student Jane Doe an internship with stipend details and private contact 9876543210 at SecretCorp.";

    // Test Failure Case (all models fail)
    const failingClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockRejectedValue(new Error("Generic model failure")),
      },
    };

    const failRes = await analyzeOfferText(sensitiveOfferText, {
      apiKey: "fake-key",
      client: failingClient,
    });
    expect(failRes.ok).toBe(false);

    // Test Success Case (model succeeds)
    const successClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockResolvedValue({
          output_text: JSON.stringify({
            concerns: [],
            missingInfo: [],
            verificationQuestions: [],
            overallNote: "Standard offer text review.",
          }),
        }),
      },
    };

    const successRes = await analyzeOfferText(sensitiveOfferText, {
      apiKey: "fake-key",
      client: successClient,
    });
    expect(successRes.ok).toBe(true);

    // Verify all console calls
    const allLoggedMessages = [
      ...logSpy.mock.calls.flat(),
      ...warnSpy.mock.calls.flat(),
      ...errorSpy.mock.calls.flat(),
    ].map((arg) => String(arg));

    for (const msg of allLoggedMessages) {
      expect(msg).not.toContain(sensitiveOfferText);
      expect(msg).not.toContain("CONFIDENTIAL_SENSITIVE_TEXT");
      expect(msg).not.toContain("Jane Doe");
      expect(msg).not.toContain("SecretCorp");
      expect(msg).not.toContain("fake-key");
    }

    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("wraps prompt injection content in delimiters without altering system instructions", async () => {
    let capturedInput = "";

    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockImplementation((params) => {
          capturedInput = params.input;
          return Promise.resolve({ output_text: mockValidModelJson });
        }),
      },
    };

    const res = await analyzeOfferText(PROMPT_INJECTION_FIXTURE.text, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(res.ok).toBe(true);
    expect(capturedInput).toContain(OFFER_DELIMITER_START);
    expect(capturedInput).toContain(OFFER_DELIMITER_END);
    expect(capturedInput).toContain("SYSTEM OVERRIDE");
  });
});
