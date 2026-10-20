import { MAX_TRANSCRIPT_CHARS } from "@/lib/config";

export interface FileTranscriptItem {
  readonly index: number;
  readonly transcript: string;
  readonly readable: boolean;
}

/**
 * Joins per-file transcripts into a single unified transcript text.
 * When multiple files are present, inserts "[File N of M]" before each file's content,
 * separated by blank lines.
 */
export function joinTranscripts(
  items: readonly FileTranscriptItem[]
): string {
  if (!items || items.length === 0) {
    return "";
  }

  // Sort by file index ascending
  const sorted = [...items].sort((a, b) => a.index - b.index);

  if (sorted.length === 1) {
    return sorted[0].transcript.trim();
  }

  const total = sorted.length;
  const sections: string[] = [];

  for (let i = 0; i < total; i++) {
    const item = sorted[i];
    const header = `[File ${i + 1} of ${total}]`;
    const body = item.transcript.trim();
    sections.push(`${header}\n${body}`);
  }

  return sections.join("\n\n");
}

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
