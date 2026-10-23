import { describe, it, expect } from "vitest";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import { LANDING_ANNOTATION_DEFS } from "@/lib/landing-annotations";

describe("Landing phrases and vocabulary compliance", () => {
  const example1Text = SYNTHETIC_EXAMPLES[0].text;

  it("verifies every phrase in the landing annotations is an exact substring of synthetic Example 1", () => {
    for (const def of LANDING_ANNOTATION_DEFS) {
      expect(
        example1Text.includes(def.phrase),
        `Hero phrase not found in Example 1: "${def.phrase}"`
      ).toBe(true);
    }
  });

  it("verifies no annotation text contains forbidden verdict words (safe, scam, fraud, verified, legit)", () => {
    const forbiddenPattern = /\b(safe|scam|fraud|verified|legit)\b/i;

    for (const def of LANDING_ANNOTATION_DEFS) {
      expect(def.title).not.toMatch(forbiddenPattern);
      expect(def.note).not.toMatch(forbiddenPattern);
    }
  });

  it("verifies landing annotations contain no unsupported claims about hiring practice ('standard internship', 'typically', 'usually', 'legitimate employer')", () => {
    const forbiddenPatterns = [
      /standard\s+internship/i,
      /\btypically\b/i,
      /\busually\b/i,
      /legitimate\s+employer/i,
    ];

    for (const def of LANDING_ANNOTATION_DEFS) {
      for (const pattern of forbiddenPatterns) {
        expect(def.title).not.toMatch(pattern);
        expect(def.note).not.toMatch(pattern);
      }
    }
  });
});
