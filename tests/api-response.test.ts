import { describe, it, expect } from "vitest";
import {
  isAnalyzeApiResponse,
  isAnalyzeSuccessResponse,
  isAnalyzeErrorResponse,
  isValidatedAnalysis,
} from "@/lib/analysis/api-response";
import { ValidatedAnalysis } from "@/lib/analysis/schema";

describe("api-response type guards", () => {
  const validAnalysis: ValidatedAnalysis = {
    concerns: [
      {
        id: "concern-1",
        category: "upfront_payment",
        observation: "Text requests a security deposit of ₹4,500.",
        interpretation: "Legitimate internships typically do not require security deposits.",
        quote: "refundable equipment deposit of ₹4,500",
        span: { start: 257, end: 322 },
      },
    ],
    missingInfo: [
      {
        id: "missing-1",
        topic: "stipend_or_pay",
        note: "Stipend terms are not stated in the provided text.",
        relatedQuote: "monthly stipend",
      },
    ],
    verificationQuestions: [
      {
        id: "q-1",
        question: "Can you clarify whether any fees are required before onboarding?",
        relatedConcernId: "concern-1",
      },
    ],
    overallNote: "Review is limited to the provided text.",
    droppedCount: 0,
    limits: ["Reviews supplied text only."],
  };

  const validSuccess = {
    ok: true,
    analysis: validAnalysis,
  };

  const validError = {
    ok: false,
    error: {
      code: "RATE_LIMITED",
      message: "The review service is currently busy.",
    },
  };

  it("recognizes a valid success response", () => {
    expect(isAnalyzeSuccessResponse(validSuccess)).toBe(true);
    expect(isAnalyzeErrorResponse(validSuccess)).toBe(false);
    expect(isAnalyzeApiResponse(validSuccess)).toBe(true);
  });

  it("recognizes a valid error response", () => {
    expect(isAnalyzeErrorResponse(validError)).toBe(true);
    expect(isAnalyzeSuccessResponse(validError)).toBe(false);
    expect(isAnalyzeApiResponse(validError)).toBe(true);
  });

  it("validates zero-concern valid analysis", () => {
    const emptyAnalysis: ValidatedAnalysis = {
      concerns: [],
      missingInfo: [],
      verificationQuestions: [],
      droppedCount: 0,
      limits: ["Sample limit"],
    };
    expect(isValidatedAnalysis(emptyAnalysis)).toBe(true);
    expect(isAnalyzeSuccessResponse({ ok: true, analysis: emptyAnalysis })).toBe(
      true
    );
  });

  it("rejects non-object and null values", () => {
    expect(isAnalyzeApiResponse(null)).toBe(false);
    expect(isAnalyzeApiResponse(undefined)).toBe(false);
    expect(isAnalyzeApiResponse("string")).toBe(false);
    expect(isAnalyzeApiResponse(123)).toBe(false);
    expect(isAnalyzeApiResponse(true)).toBe(false);
    expect(isAnalyzeApiResponse([])).toBe(false);
  });

  it("rejects malformed success responses", () => {
    // Missing analysis
    expect(isAnalyzeSuccessResponse({ ok: true })).toBe(false);

    // Analysis is not an object
    expect(isAnalyzeSuccessResponse({ ok: true, analysis: "not-an-object" })).toBe(
      false
    );

    // Missing concerns array
    expect(
      isAnalyzeSuccessResponse({
        ok: true,
        analysis: { ...validAnalysis, concerns: null },
      })
    ).toBe(false);

    // Malformed concern span
    expect(
      isAnalyzeSuccessResponse({
        ok: true,
        analysis: {
          ...validAnalysis,
          concerns: [
            {
              ...validAnalysis.concerns[0],
              span: { start: "not-a-number", end: 10 },
            },
          ],
        },
      })
    ).toBe(false);

    // Negative droppedCount
    expect(
      isAnalyzeSuccessResponse({
        ok: true,
        analysis: { ...validAnalysis, droppedCount: -1 },
      })
    ).toBe(false);

    // Non-string limits element
    expect(
      isAnalyzeSuccessResponse({
        ok: true,
        analysis: { ...validAnalysis, limits: [123] },
      })
    ).toBe(false);
  });

  it("rejects malformed error responses", () => {
    // Missing error object
    expect(isAnalyzeErrorResponse({ ok: false })).toBe(false);

    // Empty code
    expect(isAnalyzeErrorResponse({ ok: false, error: { code: "", message: "err" } })).toBe(
      false
    );

    // Non-string message
    expect(
      isAnalyzeErrorResponse({ ok: false, error: { code: "ERR", message: 123 } })
    ).toBe(false);
  });
});
