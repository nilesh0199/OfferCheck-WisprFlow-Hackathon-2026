/**
 * Pure helper utilities for source markers when text comes from several places
 * (e.g. pasted user text and transcribed screenshots or PDFs).
 *
 * Rules:
 * - Uses generic labels only (NEVER user file names).
 * - Exact marker format: "---- Text from (Screenshot|PDF) <digits> ----".
 * - Next source number is the highest existing number of that kind in the text + 1.
 * - If a file has no readable text, its block contains "[No text could be read from this file]".
 * - User text is never modified, reordered, or labelled.
 */

export type SourceKind = "Screenshot" | "PDF";

export interface TranscribedItem {
  kind: SourceKind;
  transcript: string;
  readable: boolean;
}

/**
 * Formats a source marker line: "---- Text from <kind> <n> ----".
 */
export function formatSourceMarker(kind: SourceKind, n: number): string {
  return `---- Text from ${kind} ${n} ----`;
}

/**
 * Checks if a string line matches exactly: "---- Text from (Screenshot|PDF) <digits> ----".
 * Ignores an optional trailing carriage return (\r).
 */
export function isSourceMarkerLine(line: string): boolean {
  if (!line || typeof line !== "string") return false;
  const clean = line.replace(/\r$/, "");
  return /^---- Text from (Screenshot|PDF) \d+ ----$/.test(clean);
}

/**
 * Checks if a multi-line text or quote contains any source marker line.
 */
export function containsSourceMarkerLine(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const lines = text.split("\n");
  return lines.some((line) => isSourceMarkerLine(line.trim()));
}

/**
 * Finds the highest existing marker number for a kind in the current text, and returns that number + 1.
 * If no marker of that kind exists, returns 1.
 * Ensures deleting earlier blocks never creates duplicate numbers.
 */
export function nextSourceNumber(text: string, kind: SourceKind): number {
  if (!text || typeof text !== "string") return 1;

  const regex = new RegExp(`^---- Text from ${kind} (\\d+) ----$`, "gm");
  let max = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && num > max) {
      max = num;
    }
  }

  return max + 1;
}

/**
 * Builds an append block for newly transcribed items.
 *
 * - If items is empty, returns existingText unchanged.
 * - If existingText is empty, returns the formatted blocks directly.
 * - Otherwise, keeps existingText byte-for-byte unchanged at the start,
 *   inserts exactly one blank line before the appended blocks,
 *   and appends the blocks with each file having its own marker.
 * - If a file was not readable or produced empty text, uses "[No text could be read from this file]".
 */
export function buildAppendBlock(
  existingText: string,
  items: readonly TranscribedItem[]
): string {
  if (!items || items.length === 0) {
    return existingText ?? "";
  }

  let nextScreenshot = nextSourceNumber(existingText, "Screenshot");
  let nextPdf = nextSourceNumber(existingText, "PDF");

  const blocks: string[] = [];
  for (const item of items) {
    const num = item.kind === "Screenshot" ? nextScreenshot++ : nextPdf++;
    const marker = formatSourceMarker(item.kind, num);
    const content =
      item.readable && item.transcript.trim().length > 0
        ? item.transcript.trim()
        : "[No text could be read from this file]";

    blocks.push(`${marker}\n${content}`);
  }

  const appended = blocks.join("\n\n");

  if (!existingText || existingText.length === 0) {
    return appended;
  }

  // Ensure exactly one blank line before appended text while keeping existingText byte-for-byte unchanged
  if (existingText.endsWith("\r\n\r\n") || existingText.endsWith("\n\n")) {
    return `${existingText}${appended}`;
  }
  if (existingText.endsWith("\r\n")) {
    return `${existingText}\r\n${appended}`;
  }
  if (existingText.endsWith("\n")) {
    return `${existingText}\n${appended}`;
  }
  return `${existingText}\n\n${appended}`;
}
