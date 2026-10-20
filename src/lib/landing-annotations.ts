/**
 * Pure functions and static annotations for the landing page interactive document.
 * Matches exact substrings in synthetic Example 1 for demonstrative margin notes.
 */

export interface LandingAnnotation {
  readonly id: string;
  readonly phrase: string;
  readonly category: string;
  readonly title: string;
  readonly note: string;
  readonly start: number;
  readonly end: number;
}

export interface LandingAnnotationDefinition {
  readonly id: string;
  readonly phrase: string;
  readonly category: string;
  readonly title: string;
  readonly note: string;
}

/**
 * Static demo annotations defined for the landing page interactive document.
 * Each phrase is guaranteed to match synthetic Example 1.
 */
export const LANDING_ANNOTATION_DEFS: readonly LandingAnnotationDefinition[] = [
  {
    id: "ann-refundable-deposit",
    phrase: "refundable equipment deposit of ₹4,500",
    category: "refundable_deposit",
    title: "Refundable deposit requested",
    note: "Legitimate internships provide work equipment without requesting an upfront deposit or security fee.",
  },
  {
    id: "ann-urgent-deadline",
    phrase:
      "within 24 hours to secure your internship slot, or your offer will be immediately allocated to the next waitlisted applicant.",
    category: "payment_urgency",
    title: "Urgent payment deadline",
    note: "A 24-hour ultimatum creates artificial pressure to transfer funds before you have time to verify credentials.",
  },
  {
    id: "ann-off-platform",
    phrase: "reach out via WhatsApp at +91 98000 00000",
    category: "off_platform_communication",
    title: "Off-platform communication",
    note: "Directing recruitment conversations to personal messaging apps avoids an official company email record.",
  },
];

/**
 * Pure function: locates annotation definitions within the target text,
 * validating exact character offsets.
 */
export function findLandingAnnotations(
  text: string,
  defs: readonly LandingAnnotationDefinition[] = LANDING_ANNOTATION_DEFS
): LandingAnnotation[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const results: LandingAnnotation[] = [];

  for (const def of defs) {
    const start = text.indexOf(def.phrase);
    if (start !== -1) {
      const end = start + def.phrase.length;
      results.push({
        ...def,
        start,
        end,
      });
    }
  }

  // Sort ascending by start offset
  return results.sort((a, b) => a.start - b.start);
}

export interface LandingDocumentSegment {
  readonly text: string;
  readonly annotation?: LandingAnnotation;
}

/**
 * Pure function: slices source text into sequential segments of plain text
 * and annotated highlighted spans.
 *
 * Guaranteed Invariant:
 * segments.map(s => s.text).join("") === text
 */
export function buildLandingDocumentSegments(
  text: string,
  annotations: readonly LandingAnnotation[]
): LandingDocumentSegment[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  if (!annotations || annotations.length === 0) {
    return [{ text }];
  }

  const segments: LandingDocumentSegment[] = [];
  let cursor = 0;

  for (const ann of annotations) {
    if (ann.start > cursor) {
      segments.push({
        text: text.slice(cursor, ann.start),
      });
    }

    if (ann.end > ann.start && ann.start >= cursor) {
      segments.push({
        text: text.slice(ann.start, ann.end),
        annotation: ann,
      });
      cursor = ann.end;
    }
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
    });
  }

  return segments;
}
