import { describe, it, expect } from "vitest";
import { parseModelOutput } from "@/lib/analysis/validate-result";

describe("parseModelOutput", () => {
  // Hand-written MOCK model output (strictly a synthetic mock fixture for testing)
  const validMock = {
    concerns: [
      {
        id: "concern-1",
        category: "upfront_payment",
        observation: "Text requests a ₹4,500 security deposit.",
        interpretation:
          "Legitimate internships generally do not require interns to pay money upfront.",
        quote: "refundable equipment deposit of ₹4,500",
      },
    ],
    missingInfo: [
      {
        id: "missing-1",
        topic: "stipend_or_pay",
        note: "Stipend payment schedule is not stated in the provided text.",
      },
    ],
    verificationQuestions: [
      {
        id: "q-1",
        question:
          "Can you clarify whether any fees are required prior to joining?",
        relatedConcernId: "concern-1",
      },
    ],
    overallNote: "Review is limited to the provided communication.",
  };

  it("successfully parses valid object input", () => {
    const result = parseModelOutput(validMock);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.concerns.length).toBe(1);
      expect(result.data.concerns[0].category).toBe("upfront_payment");
    }
  });

  it("successfully parses valid JSON string input", () => {
    const result = parseModelOutput(JSON.stringify(validMock));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.missingInfo.length).toBe(1);
    }
  });

  it("safely handles null and undefined without throwing", () => {
    expect(() => parseModelOutput(null)).not.toThrow();
    expect(parseModelOutput(null).ok).toBe(false);

    expect(() => parseModelOutput(undefined)).not.toThrow();
    expect(parseModelOutput(undefined).ok).toBe(false);
  });

  it("safely handles invalid JSON strings without throwing", () => {
    expect(() => parseModelOutput("{ not-valid-json ]")).not.toThrow();
    const result = parseModelOutput("{ not-valid-json ]");
    expect(result.ok).toBe(false);
  });

  it("safely handles wrong types (numbers, booleans, arrays) without throwing", () => {
    expect(() => parseModelOutput(12345)).not.toThrow();
    expect(parseModelOutput(12345).ok).toBe(false);

    expect(() => parseModelOutput(true)).not.toThrow();
    expect(parseModelOutput(true).ok).toBe(false);

    expect(() => parseModelOutput([])).not.toThrow();
    expect(parseModelOutput([]).ok).toBe(false);
  });

  it("safely handles missing required fields", () => {
    // Missing 'concerns' array
    const incomplete = {
      missingInfo: [],
      verificationQuestions: [],
    };
    const result = parseModelOutput(incomplete);
    expect(result.ok).toBe(false);
  });

  it("safely handles invalid enum values in concerns", () => {
    const invalidEnum = {
      ...validMock,
      concerns: [
        {
          ...validMock.concerns[0],
          category: "unrecognized_category_123",
        },
      ],
    };
    const result = parseModelOutput(invalidEnum);
    expect(result.ok).toBe(false);
  });

  it("tolerates extra unknown fields without failing or throwing", () => {
    const withExtra = {
      ...validMock,
      extraUnusedField: "this should be stripped or ignored",
      modelConfidenceScore: 0.99,
    };
    const result = parseModelOutput(withExtra);
    expect(result.ok).toBe(true);
  });

  it("rejects over-length arrays exceeding maximum limits (max 10)", () => {
    const tooManyConcerns = {
      ...validMock,
      concerns: Array.from({ length: 11 }, (_, i) => ({
        id: `concern-${i}`,
        category: "other" as const,
        observation: `Observation ${i}`,
        interpretation: `Interpretation ${i}`,
        quote: `Quote ${i}`,
      })),
    };
    const result = parseModelOutput(tooManyConcerns);
    expect(result.ok).toBe(false);
  });
});
