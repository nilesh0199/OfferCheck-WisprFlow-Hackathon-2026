export interface HighlightSpanInput {
  start: number;
  end: number;
  concernId?: string;
}

export interface HighlightSegment {
  text: string;
  isHighlighted: boolean;
  concernId?: string;
  concernIds?: string[];
}

/**
 * Builds non-overlapping highlighted and unhighlighted text segments from source text and spans.
 *
 * Requirements:
 * - Deterministically sorts and clamps spans against the source text length.
 * - Handles overlapping, adjacent, and nested spans.
 * - Discards invalid spans (negative, reversed, empty, non-finite).
 * - Preserves UTF-16 character offsets so that emojis and multi-byte scripts (Devanagari, CJK)
 *   slice character-for-character.
 * - Guarantees the invariant: segments.map(s => s.text).join("") === text.
 */
export function buildHighlightSegments(
  text: string,
  spans: readonly HighlightSpanInput[]
): HighlightSegment[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  if (!spans || spans.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  const textLength = text.length;

  // 1. Sanitize and clamp spans
  interface CleanSpan {
    start: number;
    end: number;
    concernId?: string;
  }

  const validSpans: CleanSpan[] = [];
  for (const s of spans) {
    if (
      typeof s.start !== "number" ||
      typeof s.end !== "number" ||
      !Number.isFinite(s.start) ||
      !Number.isFinite(s.end)
    ) {
      continue;
    }

    const start = Math.max(0, Math.floor(s.start));
    const end = Math.min(textLength, Math.floor(s.end));

    if (start >= end || start >= textLength) {
      continue;
    }

    validSpans.push({
      start,
      end,
      concernId: s.concernId,
    });
  }

  if (validSpans.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  // 2. Collect all unique interval boundary points
  const pointsSet = new Set<number>([0, textLength]);
  for (const s of validSpans) {
    pointsSet.add(s.start);
    pointsSet.add(s.end);
  }

  const sortedPoints = Array.from(pointsSet).sort((a, b) => a - b);

  // 3. Segment each interval between adjacent boundary points
  const rawSegments: HighlightSegment[] = [];

  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const p1 = sortedPoints[i];
    const p2 = sortedPoints[i + 1];
    if (p1 >= p2) continue;

    const segmentText = text.slice(p1, p2);
    if (segmentText.length === 0) continue;

    const matching = validSpans.filter((s) => s.start <= p1 && s.end >= p2);

    if (matching.length > 0) {
      const concernIds = matching
        .map((s) => s.concernId)
        .filter((id): id is string => typeof id === "string" && id.length > 0);

      rawSegments.push({
        text: segmentText,
        isHighlighted: true,
        concernId: concernIds[0] ?? matching[0].concernId,
        concernIds: concernIds.length > 0 ? concernIds : undefined,
      });
    } else {
      rawSegments.push({
        text: segmentText,
        isHighlighted: false,
      });
    }
  }

  // 4. Merge adjacent unhighlighted segments, and adjacent highlighted segments that share the same concern
  const merged: HighlightSegment[] = [];

  for (const seg of rawSegments) {
    if (merged.length === 0) {
      merged.push({ ...seg });
      continue;
    }

    const prev = merged[merged.length - 1];

    if (!prev.isHighlighted && !seg.isHighlighted) {
      // Merge consecutive unhighlighted segments
      prev.text += seg.text;
    } else if (
      prev.isHighlighted &&
      seg.isHighlighted &&
      prev.concernId === seg.concernId &&
      JSON.stringify(prev.concernIds) === JSON.stringify(seg.concernIds)
    ) {
      // Merge consecutive highlighted segments belonging to the same concern
      prev.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
}
