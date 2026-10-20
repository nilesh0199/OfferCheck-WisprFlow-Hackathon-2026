import { MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "./config";

export type InputHygieneResult =
  | { ok: true; text: string }
  | {
      ok: false;
      code: "EMPTY_INPUT" | "TOO_SHORT" | "TOO_LONG" | "INVALID_CHARACTERS";
      message: string;
      httpStatus: number;
    };

/**
 * Validates text hygiene and character limits before rate limiting and analysis:
 * 1. Blocks NUL characters (\0).
 * 2. Blocks text with > 30% unprintable control characters.
 * 3. Enforces non-empty input.
 * 4. Enforces minimum characters (MIN_INPUT_CHARS = 40).
 * 5. Enforces maximum characters (MAX_INPUT_CHARS = 8000).
 * 6. Normalises CRLF to LF only if it does not change quote offsets (if text contains CRLF,
 *    stripping \r would alter offsets for quotes, so normalisation is NOT performed).
 */
export function validateInputHygiene(rawText: unknown): InputHygieneResult {
  if (typeof rawText !== "string") {
    return {
      ok: false,
      code: "EMPTY_INPUT",
      message: "Please provide offer text to review.",
      httpStatus: 422,
    };
  }

  // 1. Check for NUL characters
  if (rawText.includes("\0") || rawText.includes("\u0000")) {
    return {
      ok: false,
      code: "INVALID_CHARACTERS",
      message:
        "The submitted text contains invalid or unprintable characters. Please check and paste plain text.",
      httpStatus: 422,
    };
  }

  // 2. Check for excessive unprintable control characters (> 30%)
  // Allowed whitespace: \t (9), \n (10), \r (13). Control: < 32 or DEL (127).
  let controlCount = 0;
  for (let i = 0; i < rawText.length; i++) {
    const code = rawText.charCodeAt(i);
    if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127) {
      controlCount++;
    }
  }

  if (rawText.length > 0 && controlCount / rawText.length > 0.3) {
    return {
      ok: false,
      code: "INVALID_CHARACTERS",
      message:
        "The submitted text contains too many unprintable control characters. Please check and paste plain text.",
      httpStatus: 422,
    };
  }

  // 3. Empty input check
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      ok: false,
      code: "EMPTY_INPUT",
      message: "Please provide offer text to review.",
      httpStatus: 422,
    };
  }

  // 4. Minimum input length check
  if (trimmed.length < MIN_INPUT_CHARS) {
    return {
      ok: false,
      code: "TOO_SHORT",
      message: `Offer text is too short (minimum ${MIN_INPUT_CHARS} characters). Please include more complete context from the offer.`,
      httpStatus: 422,
    };
  }

  // 5. Maximum input length check
  if (rawText.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      code: "TOO_LONG",
      message: `Offer text exceeds the maximum allowed length of ${MAX_INPUT_CHARS.toLocaleString()} characters. Please shorten the text and try again.`,
      httpStatus: 413,
    };
  }

  // 6. CRLF to LF normalisation check:
  // Normalise ONLY IF doing so does not alter character offsets relative to original user text.
  // If the text contains \r\n, replacing \r\n with \n would shift character indices by 1
  // for every preceding CRLF, thereby breaking quotation offsets against the original submitted text.
  // Therefore, if CRLF is present, do NOT normalise.
  const text = normalizeCrlfIfSafe(rawText);

  return {
    ok: true,
    text,
  };
}

/**
 * Normalises CRLF to LF only if safe (does not shift character offsets).
 * If the string contains \r\n, removing \r would change character indices of quotes,
 * so the original string is returned unchanged.
 */
export function normalizeCrlfIfSafe(text: string): string {
  if (text.includes("\r\n")) {
    return text; // Do not normalise; preserving exact user offsets is critical
  }
  return text;
}
