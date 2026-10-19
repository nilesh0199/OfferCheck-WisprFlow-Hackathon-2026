/**
 * Why Intl.Segmenter is used:
 * JavaScript strings index by UTF-16 code units rather than visual characters or grapheme clusters.
 * We use Intl.Segmenter with grapheme granularity to iterate over text by user-perceived characters,
 * preserving each segment's exact original start and end character offsets in the unnormalized input text.
 * This allows us to collapse whitespace runs and normalize Unicode representations (such as decomposed
 * accent marks) while guaranteeing that the returned match spans accurately index into the original source text.
 */

import { MIN_QUOTE_CHARS, MAX_QUOTE_CHARS } from "@/lib/config";

export interface QuoteValidationResult {
  valid: boolean;
  start?: number;
  end?: number;
  reason?: string;
}

interface NormalizedMap {
  normText: string;
  startMap: number[];
  endMap: number[];
}

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

/**
 * Builds a normalized representation of sourceText where:
 * 1. Runs of whitespace are collapsed to a single space (" ").
 * 2. Unicode characters are normalized to NFC.
 * 3. startMap and endMap maintain exact character offsets into the original unnormalized sourceText.
 */
function buildNormalizedMap(text: string): NormalizedMap {
  let normText = "";
  const startMap: number[] = [];
  const endMap: number[] = [];
  let inWhitespace = false;
  let wsStart = -1;
  let wsEnd = -1;

  for (const seg of segmenter.segment(text)) {
    const isWs = /^\s+$/.test(seg.segment);
    const origStart = seg.index;
    const origEnd = seg.index + seg.segment.length;

    if (isWs) {
      if (!inWhitespace) {
        inWhitespace = true;
        wsStart = origStart;
        wsEnd = origEnd;
      } else {
        wsEnd = origEnd;
      }
    } else {
      if (inWhitespace) {
        normText += " ";
        startMap.push(wsStart);
        endMap.push(wsEnd);
        inWhitespace = false;
      }
      const nfc = seg.segment.normalize("NFC");
      for (let i = 0; i < nfc.length; i++) {
        normText += nfc[i];
        startMap.push(origStart);
        endMap.push(origEnd);
      }
    }
  }

  if (inWhitespace) {
    normText += " ";
    startMap.push(wsStart);
    endMap.push(wsEnd);
  }

  return { normText, startMap, endMap };
}

/**
 * Validates that a quote is an exact, verbatim quotation from the original sourceText.
 *
 * Rules:
 * - Trims the quote.
 * - Rejects empty quotes, quotes shorter than MIN_QUOTE_CHARS, or longer than MAX_QUOTE_CHARS.
 * - Matching is strictly CASE-SENSITIVE and exact, except that runs of whitespace are treated as equal
 *   and Unicode is NFC-normalized.
 * - No fuzzy matching, stemming, or punctuation/quote-mark alterations are allowed.
 * - Returns start/end character offsets pointing into the ORIGINAL sourceText.
 * - If the quote appears multiple times, the first occurrence is returned.
 */
export function validateQuote(
  quote: string,
  sourceText: string
): QuoteValidationResult {
  if (typeof quote !== "string" || typeof sourceText !== "string") {
    return { valid: false, reason: "Quote and source text must be strings" };
  }

  const trimmed = quote.trim();

  if (trimmed.length === 0) {
    return { valid: false, reason: "Quote is empty" };
  }

  if (trimmed.length < MIN_QUOTE_CHARS) {
    return {
      valid: false,
      reason: `Quote is shorter than minimum required length of ${MIN_QUOTE_CHARS} characters`,
    };
  }

  if (trimmed.length > MAX_QUOTE_CHARS) {
    return {
      valid: false,
      reason: `Quote exceeds maximum allowed length of ${MAX_QUOTE_CHARS} characters`,
    };
  }

  const normQuote = trimmed.normalize("NFC").replace(/\s+/g, " ");
  const { normText, startMap, endMap } = buildNormalizedMap(sourceText);

  const idx = normText.indexOf(normQuote);
  if (idx === -1) {
    return {
      valid: false,
      reason: "Quote not found in original text",
    };
  }

  const start = startMap[idx];
  const end = endMap[idx + normQuote.length - 1];

  return {
    valid: true,
    start,
    end,
  };
}
