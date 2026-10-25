import { describe, it, expect } from "vitest";
import { generateReviewPdfBytes, generateReviewPdfBlob } from "@/lib/pdf/generateReviewPdf";
import { ValidatedAnalysis } from "@/lib/analysis/schema";

const mockAnalysis: ValidatedAnalysis = {
  concerns: [
    {
      id: "concern-1",
      category: "upfront_payment",
      observation: "The sender requests a registration fee of Rs. 2,000.",
      interpretation: "Internships do not require candidates to pay registration fees.",
      quote: "Please deposit Rs. 2,000 for training material.",
      span: { start: 10, end: 55 },
    },
  ],
  missingInfo: [
    {
      id: "missing-1",
      topic: "stipend_or_pay",
      note: "Stipend amount and payment schedule are not mentioned.",
    },
  ],
  verificationQuestions: [
    {
      id: "q-1",
      question: "Can you provide the company registration number?",
    },
  ],
  entities: {
    companyName: "Acme Corp Pvt Ltd",
    roleTitle: "Software Intern",
  },
  droppedCount: 0,
  limits: [
    "Reviews text only. Cannot confirm that a sender is genuine.",
    "Does not replace checking official registers.",
  ],
};

describe("generateReviewPdf", () => {
  it("generates a valid %PDF-1.4 binary buffer", () => {
    const bytes = generateReviewPdfBytes({
      analysis: mockAnalysis,
      analyzedSnapshotText: "Please deposit Rs. 2,000 for training material.",
    });

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(500);

    const text = new TextDecoder().decode(bytes);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text.includes("/Type /Catalog")).toBe(true);
    expect(text.includes("/Type /Pages")).toBe(true);
    expect(text.includes("/Type /Page")).toBe(true);
    expect(text.includes("OfferClara Review Summary")).toBe(true);
    expect(text.includes("Acme Corp Pvt Ltd")).toBe(true);
    expect(text.includes("xref")).toBe(true);
    expect(text.includes("trailer")).toBe(true);
    expect(text.trim().endsWith("%%EOF")).toBe(true);
  });

  it("creates a Blob with application/pdf MIME type", () => {
    const blob = generateReviewPdfBlob({
      analysis: mockAnalysis,
    });

    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(500);
  });
});
