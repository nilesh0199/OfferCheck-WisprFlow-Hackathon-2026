/**
 * Pure function: calculates the 1-indexed line and column number of a character offset in text.
 * Handles Unix (\n), Windows CRLF (\r\n), Mac Classic (\r), out-of-bounds offsets,
 * and multi-byte unicode code points (including Devanagari and emoji).
 */
export interface LineCol {
  line: number;
  col: number;
}

export function lineOfOffset(text: string, offset: number): LineCol {
  if (!text || offset <= 0) {
    return { line: 1, col: 1 };
  }

  // Clamp offset to text length
  const clampedOffset = Math.min(Math.max(0, offset), text.length);

  let line = 1;
  let lineStart = 0;

  for (let i = 0; i < clampedOffset; i++) {
    if (text[i] === "\r" && text[i + 1] === "\n") {
      line++;
      i++; // advance past \n in CRLF sequence
      lineStart = i + 1;
    } else if (text[i] === "\n" || text[i] === "\r") {
      line++;
      lineStart = i + 1;
    }
  }

  // Column calculation (1-indexed) based on unicode characters from lineStart to clampedOffset
  const lineSlice = text.slice(lineStart, clampedOffset);
  const col = Array.from(lineSlice).length + 1;

  return { line, col };
}
