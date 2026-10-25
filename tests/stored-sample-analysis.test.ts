import { describe, it, expect } from "vitest";
import { getStoredSampleAnalysis } from "@/data/stored-sample-analysis";
import { FULL_WIZARD_SAMPLES } from "@/data/wizard-samples";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import { buildCombinedText } from "@/lib/combined-text";

describe("Stored Sample Analysis", () => {
  it("returns null for non-sample input or empty text", () => {
    expect(getStoredSampleAnalysis("")).toBeNull();
    expect(getStoredSampleAnalysis("Some random company offer text that is not a sample")).toBeNull();
  });

  describe("full-sample-course-as-internship (HelixBrattice Skillcraft)", () => {
    it("successfully validates against full wizard combined text with 0 dropped quotes", () => {
      const sample = FULL_WIZARD_SAMPLES[0];
      const { text } = buildCombinedText(sample);
      const analysis = getStoredSampleAnalysis(text);

      expect(analysis).not.toBeNull();
      expect(analysis!.droppedCount).toBe(0);
      expect(analysis!.concerns.length).toBe(3);

      // Verify every quote matches exact substring in the text
      for (const concern of analysis!.concerns) {
        expect(concern.span.start).toBeGreaterThanOrEqual(0);
        expect(concern.span.end).toBeGreaterThan(concern.span.start);
        const extracted = text.slice(concern.span.start, concern.span.end);
        expect(extracted).toBe(concern.quote);
      }

      // Verify entities
      expect(analysis!.entities?.companyName).toBe("HelixBrattice Skillcraft");
      expect(analysis!.missingInfo.length).toBeGreaterThan(0);
      expect(analysis!.verificationQuestions.length).toBeGreaterThan(0);
      expect(analysis!.limits.length).toBeGreaterThan(0);
    });

    it("successfully validates against raw offer text", () => {
      const sample = FULL_WIZARD_SAMPLES[0];
      const analysis = getStoredSampleAnalysis(sample.offerText);

      expect(analysis).not.toBeNull();
      expect(analysis!.droppedCount).toBe(0);
      expect(analysis!.concerns.length).toBe(3);

      for (const concern of analysis!.concerns) {
        const extracted = sample.offerText.slice(concern.span.start, concern.span.end);
        expect(extracted).toBe(concern.quote);
      }
    });
  });

  describe("full-sample-phone-call-account (KiteSpindle Business Services)", () => {
    it("successfully validates against full wizard combined text with 0 dropped quotes", () => {
      const sample = FULL_WIZARD_SAMPLES[1];
      const { text } = buildCombinedText(sample);
      const analysis = getStoredSampleAnalysis(text);

      expect(analysis).not.toBeNull();
      expect(analysis!.droppedCount).toBe(0);
      expect(analysis!.concerns.length).toBe(3);

      for (const concern of analysis!.concerns) {
        const extracted = text.slice(concern.span.start, concern.span.end);
        expect(extracted).toBe(concern.quote);
      }

      expect(analysis!.entities?.companyName).toBe("KiteSpindle Business Services");
    });
  });

  describe("Example 1 (AetherFlume Cloud Technologies)", () => {
    it("successfully validates against example 1 text with 0 dropped quotes", () => {
      const ex1 = SYNTHETIC_EXAMPLES[0];
      const analysis = getStoredSampleAnalysis(ex1.text);

      expect(analysis).not.toBeNull();
      expect(analysis!.droppedCount).toBe(0);
      expect(analysis!.concerns.length).toBe(3);

      for (const concern of analysis!.concerns) {
        const extracted = ex1.text.slice(concern.span.start, concern.span.end);
        expect(extracted).toBe(concern.quote);
      }

      expect(analysis!.entities?.companyName).toBe("AetherFlume Cloud Technologies Pvt. Ltd.");
    });
  });
});
