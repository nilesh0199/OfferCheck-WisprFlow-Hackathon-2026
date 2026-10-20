import { describe, it, expect, vi } from "vitest";
import {
  analyzeOfferText,
  cleanJsonSchemaForGemini,
  GEMINI_RESPONSE_SCHEMA,
  GeminiModelClient,
} from "@/lib/analysis/gemini";
import { MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "@/lib/config";
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

describe("analyzeOfferText offline validation and error handling", () => {
  const validOfferText =
    "We are pleased to offer you the Software Engineering Internship at Nebula Dynamics. A refundable equipment deposit of ₹4,500 is required within 24 hours to secure your workspace setup. Please contact hr@example.com for payment instructions.";

  // Hand-written MOCK valid model response
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

  it("returns RATE_LIMITED on upstream 429 / RESOURCE_EXHAUSTED", async () => {
    const rateLimitError = new Error("Resource exhausted: quota exceeded (429)");
    (rateLimitError as unknown as { status: number }).status = 429;

    const fakeClient: GeminiModelClient = {
      interactions: { create: vi.fn().mockRejectedValue(rateLimitError) },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("RATE_LIMITED");
      expect(res.httpStatus).toBe(429);
      expect(res.message).toContain("busy");
    }
  });

  it("returns TIMEOUT on abort / timeout error", async () => {
    const timeoutErr = new Error("The operation was aborted due to timeout");
    timeoutErr.name = "TimeoutError";

    const fakeClient: GeminiModelClient = {
      interactions: { create: vi.fn().mockRejectedValue(timeoutErr) },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("TIMEOUT");
      expect(res.httpStatus).toBe(504);
      expect(res.message).toContain("timed out");
    }
  });

  it("returns UPSTREAM_ERROR on generic upstream error", async () => {
    const networkErr = new Error("Fetch failed: network unreachable");

    const fakeClient: GeminiModelClient = {
      interactions: { create: vi.fn().mockRejectedValue(networkErr) },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("UPSTREAM_ERROR");
      expect(res.httpStatus).toBe(502);
    }
  });

  it("a second invalid model response produces INVALID_MODEL_OUTPUT after exactly 2 attempts and not more", async () => {
    // Both attempts return unparseable string
    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockResolvedValue({ output_text: "{ malformed json..." }),
      },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(fakeClient.interactions!.create).toHaveBeenCalledTimes(2); // Exactly 2 attempts and not more!
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("INVALID_MODEL_OUTPUT");
      expect(res.httpStatus).toBe(502);
    }
  });

  it("retries once on invalid output and succeeds if attempt 2 returns valid JSON", async () => {
    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi
          .fn()
          .mockResolvedValueOnce({ output_text: "broken output" })
          .mockResolvedValueOnce({ output_text: mockValidModelJson }),
      },
    };

    const res = await analyzeOfferText(validOfferText, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(fakeClient.interactions!.create).toHaveBeenCalledTimes(2);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.analysis.concerns.length).toBe(1);
      expect(res.analysis.concerns[0].quote).toBe("refundable equipment deposit of ₹4,500");
    }
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
    }
  });

  it("a concern with a fabricated quote is dropped and droppedCount increments through analyzeOfferText", async () => {
    // Model hallucinates a quote not found anywhere in the offer text
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
      // The real concern is kept
      expect(res.analysis.concerns.length).toBe(1);
      expect(res.analysis.concerns[0].id).toBe("c-real");
      expect(res.analysis.concerns[0].quote).toBe("refundable equipment deposit of ₹4,500");
      // The fabricated concern was dropped and droppedCount was incremented
      expect(res.analysis.droppedCount).toBe(1);
    }
  });

  it("console spies prove no logged call ever contains the offer text, even when the model call fails", async () => {
    const logSpy = vi.spyOn(console, "log");
    const warnSpy = vi.spyOn(console, "warn");
    const errorSpy = vi.spyOn(console, "error");

    const sensitiveOfferText =
      "CONFIDENTIAL_SENSITIVE_TEXT: We offer student Jane Doe an internship with stipend details and private contact 9876543210 at SecretCorp.";

    // Test Failure Case (model fails)
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
