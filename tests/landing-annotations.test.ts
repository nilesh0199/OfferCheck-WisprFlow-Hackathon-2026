import { describe, it, expect } from "vitest";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import {
  LANDING_ANNOTATION_DEFS,
  findLandingAnnotations,
  buildLandingDocumentSegments,
} from "@/lib/landing-annotations";

describe("Landing Annotations", () => {
  const example1Text = SYNTHETIC_EXAMPLES[0].text;

  it("ensures every defined annotation phrase exists exactly in synthetic Example 1", () => {
    for (const def of LANDING_ANNOTATION_DEFS) {
      expect(
        example1Text.includes(def.phrase),
        `Phrase not found in Example 1: "${def.phrase}"`
      ).toBe(true);
    }
  });

  it("finds all annotations with accurate, verifiable character offsets in Example 1", () => {
    const annotations = findLandingAnnotations(example1Text);
    expect(annotations).toHaveLength(LANDING_ANNOTATION_DEFS.length);

    for (const ann of annotations) {
      const extracted = example1Text.slice(ann.start, ann.end);
      expect(extracted).toBe(ann.phrase);
    }
  });

  it("ensures annotations are non-overlapping and sorted chronologically by start offset", () => {
    const annotations = findLandingAnnotations(example1Text);
    for (let i = 0; i < annotations.length - 1; i++) {
      expect(annotations[i].end).toBeLessThanOrEqual(annotations[i + 1].start);
    }
  });

  it("guarantees the text segmentation invariant: segments joined exactly equal source text", () => {
    const annotations = findLandingAnnotations(example1Text);
    const segments = buildLandingDocumentSegments(example1Text, annotations);

    const reconstructed = segments.map((s) => s.text).join("");
    expect(reconstructed).toBe(example1Text);

    // Verify annotated segments match annotation data
    const annotatedSegments = segments.filter((s) => s.annotation !== undefined);
    expect(annotatedSegments).toHaveLength(annotations.length);
    annotatedSegments.forEach((seg, idx) => {
      expect(seg.text).toBe(annotations[idx].phrase);
      expect(seg.annotation?.id).toBe(annotations[idx].id);
    });
  });

  it("handles empty or missing input gracefully", () => {
    expect(findLandingAnnotations("")).toEqual([]);
    expect(buildLandingDocumentSegments("", [])).toEqual([]);

    const plainSegments = buildLandingDocumentSegments("Hello world", []);
    expect(plainSegments).toEqual([{ text: "Hello world" }]);
  });
});
