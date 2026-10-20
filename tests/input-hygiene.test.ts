import { describe, it, expect } from "vitest";
import { validateInputHygiene, normalizeCrlfIfSafe } from "@/lib/input-hygiene";
import { MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "@/lib/config";

describe("Input Hygiene Validator", () => {
  const baseValidText =
    "Congratulations on your selection for the Junior Software Developer Internship. Please review the terms.";

  it("accepts clean plain text with standard length", () => {
    const res = validateInputHygiene(baseValidText);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.text).toBe(baseValidText);
    }
  });

  it("accepts text with standard whitespace characters (tabs, newlines)", () => {
    const textWithWhitespace = `${baseValidText}\n\t- Role: Developer\n\t- Duration: 3 months`;
    const res = validateInputHygiene(textWithWhitespace);
    expect(res.ok).toBe(true);
  });

  it("rejects text containing NUL characters with 422 INVALID_CHARACTERS", () => {
    const textWithNul = `${baseValidText}\0malicious payload`;
    const res = validateInputHygiene(textWithNul);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("INVALID_CHARACTERS");
      expect(res.httpStatus).toBe(422);
      expect(res.message).toContain("invalid or unprintable characters");
    }
  });

  it("rejects text with >30% non-printable control characters with 422 INVALID_CHARACTERS", () => {
    // Construct string where 40% of chars are non-printable control codes (e.g. \x01, \x02)
    const controlChars = "\x01\x02\x03\x04\x05\x06\x07\x08".repeat(5); // 40 chars
    const printableChars = "Normal printable text for internship offer."; // 43 chars
    const noisyText = controlChars + printableChars;

    const res = validateInputHygiene(noisyText);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("INVALID_CHARACTERS");
      expect(res.httpStatus).toBe(422);
      expect(res.message).toContain("too many unprintable control characters");
    }
  });

  it("rejects empty or whitespace-only input with 422 EMPTY_INPUT", () => {
    expect(validateInputHygiene("")).toMatchObject({
      ok: false,
      code: "EMPTY_INPUT",
      httpStatus: 422,
    });
    expect(validateInputHygiene("     \n\t   ")).toMatchObject({
      ok: false,
      code: "EMPTY_INPUT",
      httpStatus: 422,
    });
  });

  it("rejects text shorter than MIN_INPUT_CHARS (40) with 422 TOO_SHORT", () => {
    const shortText = "Short offer letter text.";
    expect(shortText.length).toBeLessThan(MIN_INPUT_CHARS);

    const res = validateInputHygiene(shortText);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("TOO_SHORT");
      expect(res.httpStatus).toBe(422);
    }
  });

  it("rejects text longer than MAX_INPUT_CHARS (8000) with 413 TOO_LONG", () => {
    const longText = "A".repeat(MAX_INPUT_CHARS + 1);

    const res = validateInputHygiene(longText);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("TOO_LONG");
      expect(res.httpStatus).toBe(413);
    }
  });

  it("does NOT normalise CRLF to LF if doing so would alter character offsets", () => {
    const textWithCrlf = "Line 1\r\nLine 2 with an offer\r\nLine 3";
    const normalised = normalizeCrlfIfSafe(textWithCrlf);
    // Must preserve exact string unchanged to protect quote offsets
    expect(normalised).toBe(textWithCrlf);
    expect(normalised).toContain("\r\n");
  });
});
