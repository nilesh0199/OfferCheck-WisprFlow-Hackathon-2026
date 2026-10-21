import { describe, it, expect } from "vitest";
import { lineOfOffset } from "@/lib/analysis/line-offset";

describe("lineOfOffset", () => {
  it("returns { line: 1, col: 1 } for empty text or offset <= 0", () => {
    expect(lineOfOffset("", 0)).toEqual({ line: 1, col: 1 });
    expect(lineOfOffset("", 5)).toEqual({ line: 1, col: 1 });
    expect(lineOfOffset("hello", 0)).toEqual({ line: 1, col: 1 });
    expect(lineOfOffset("hello", -3)).toEqual({ line: 1, col: 1 });
  });

  it("calculates offset in first line correctly", () => {
    const text = "Offer letter content";
    expect(lineOfOffset(text, 1)).toEqual({ line: 1, col: 2 });
    expect(lineOfOffset(text, 5)).toEqual({ line: 1, col: 6 });
  });

  it("calculates offset across standard LF (\\n) newlines", () => {
    const text = "First line\nSecond line\nThird line";
    // Index 10 is '\n' after "First line"
    expect(lineOfOffset(text, 10)).toEqual({ line: 1, col: 11 });
    // Index 11 is 'S' at start of second line
    expect(lineOfOffset(text, 11)).toEqual({ line: 2, col: 1 });
    // Index 17 is ' ' in "Second line"
    expect(lineOfOffset(text, 17)).toEqual({ line: 2, col: 7 });
    // Index 23 is 'T' at start of third line
    expect(lineOfOffset(text, 23)).toEqual({ line: 3, col: 1 });
  });

  it("calculates offset across Windows CRLF (\\r\\n) newlines", () => {
    const text = "First line\r\nSecond line\r\nThird line";
    // Index 10 is '\r'
    expect(lineOfOffset(text, 10)).toEqual({ line: 1, col: 11 });
    // Index 12 is 'S' in second line
    expect(lineOfOffset(text, 12)).toEqual({ line: 2, col: 1 });
    // Index 18 is ' ' in second line
    expect(lineOfOffset(text, 18)).toEqual({ line: 2, col: 7 });
  });

  it("handles offset at end of text", () => {
    const text = "Alpha\nBeta";
    expect(lineOfOffset(text, text.length)).toEqual({ line: 2, col: 5 });
  });

  it("clamps out-of-bounds offset safely", () => {
    const text = "Line 1\nLine 2";
    expect(lineOfOffset(text, 9999)).toEqual(lineOfOffset(text, text.length));
  });

  it("handles multi-byte and Devanagari characters accurately", () => {
    // "नमस्ते" has 6 UTF-16 code units, 5 code points
    const text = "नमस्ते\nदुनिया";
    // Start of line 2: index of '\n' is 6
    expect(lineOfOffset(text, 6)).toEqual({ line: 1, col: Array.from("नमस्ते").length + 1 });
    expect(lineOfOffset(text, 7)).toEqual({ line: 2, col: 1 });
    expect(lineOfOffset(text, 7 + 3)).toEqual({ line: 2, col: Array.from("दुन").length + 1 });
  });

  it("handles emoji and surrogate pairs", () => {
    const text = "Document 📄\nPage 2";
    // 📄 is a surrogate pair (2 code units, 1 code point)
    expect(lineOfOffset(text, 11)).toEqual({ line: 1, col: 11 });
    const newlineIdx = text.indexOf("\n");
    expect(lineOfOffset(text, newlineIdx + 1)).toEqual({ line: 2, col: 1 });
  });
});
