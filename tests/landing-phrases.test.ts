import { describe, it, expect } from "vitest";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import { LANDING_ANNOTATION_DEFS } from "@/lib/landing-annotations";
import { SCENE_STEPS, SCENE_CLOSING_LINE } from "@/lib/landing/scene";

describe("Landing phrases and vocabulary compliance", () => {
  const example1Text = SYNTHETIC_EXAMPLES[0].text;

  it("verifies every phrase in the hero entrance is an exact substring of synthetic Example 1", () => {
    for (const def of LANDING_ANNOTATION_DEFS) {
      expect(
        example1Text.includes(def.phrase),
        `Hero phrase not found in Example 1: "${def.phrase}"`
      ).toBe(true);
    }
  });

  it("verifies every phrase in the scroll scene is an exact substring of synthetic Example 1", () => {
    for (const step of SCENE_STEPS) {
      expect(
        example1Text.includes(step.phrase),
        `Scene phrase not found in Example 1: "${step.phrase}"`
      ).toBe(true);
    }
  });

  it("verifies no step text contains forbidden verdict words (safe, scam, fraud, verified, legit)", () => {
    const forbiddenPattern = /\b(safe|scam|fraud|verified|legit)\b/i;

    for (const step of SCENE_STEPS) {
      expect(step.title).not.toMatch(forbiddenPattern);
      expect(step.note).not.toMatch(forbiddenPattern);
      expect(step.label).not.toMatch(forbiddenPattern);
    }

    for (const def of LANDING_ANNOTATION_DEFS) {
      expect(def.title).not.toMatch(forbiddenPattern);
      expect(def.note).not.toMatch(forbiddenPattern);
    }
  });

  it("verifies closing line contains the required non-verdict 'not proof' wording", () => {
    expect(SCENE_CLOSING_LINE).toBe(
      "OfferCheck points at signals to investigate. A signal alone is not proof of anything, and the absence of signals is not proof that an offer is genuine."
    );

    // Ensure closing line contains no verdict affirmations
    expect(SCENE_CLOSING_LINE).not.toMatch(/\b(safe|scam|fraud|verified|legit)\b/i);
  });

  it("verifies landing annotations and scene text contain no unsupported claims about hiring practice ('standard internship', 'typically', 'usually', 'legitimate employer')", () => {
    const forbiddenPatterns = [
      /standard\s+internship/i,
      /\btypically\b/i,
      /\busually\b/i,
      /legitimate\s+employer/i,
    ];

    for (const step of SCENE_STEPS) {
      for (const pattern of forbiddenPatterns) {
        expect(step.title).not.toMatch(pattern);
        expect(step.note).not.toMatch(pattern);
        expect(step.label).not.toMatch(pattern);
      }
    }

    for (const def of LANDING_ANNOTATION_DEFS) {
      for (const pattern of forbiddenPatterns) {
        expect(def.title).not.toMatch(pattern);
        expect(def.note).not.toMatch(pattern);
      }
    }
  });
});
