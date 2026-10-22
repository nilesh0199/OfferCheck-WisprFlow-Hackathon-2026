import { MAX_TRANSCRIPT_CHARS } from "@/lib/config";

/**
 * Sanitizes a model-generated transcript:
 * - Strips NUL characters (\0).
 * - Strips unprintable control characters (< 32 except \t, \n, \r) and DEL (127).
 * - Truncates at MAX_TRANSCRIPT_CHARS if necessary.
 */
export function sanitizeTranscript(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Filter unprintable control characters
  let clean = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Allow tab (9), newline (10), carriage return (13), and printable characters (>= 32 except 127)
    if (code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127)) {
      clean += text[i];
    }
  }

  if (clean.length > MAX_TRANSCRIPT_CHARS) {
    clean = clean.slice(0, MAX_TRANSCRIPT_CHARS);
  }

  return clean;
}
