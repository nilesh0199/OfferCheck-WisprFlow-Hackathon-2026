import { describe, it, expect } from "vitest";
import { validateQuote } from "@/lib/analysis/quote-validator";
import { MIN_QUOTE_CHARS, MAX_QUOTE_CHARS } from "@/lib/config";

describe("validateQuote", () => {
  const sampleText =
    "Congratulations on your selection! A refundable deposit of ₹4,500 is required within 24 hours.\n\nPlease contact hr@example.com for payment details.";

  it("accepts an exact verbatim match", () => {
    const quote = "refundable deposit of ₹4,500";
    const result = validateQuote(quote, sampleText);
    expect(result.valid).toBe(true);
    expect(result.start).toBeDefined();
    expect(result.end).toBeDefined();
    expect(sampleText.slice(result.start, result.end)).toBe(
      "refundable deposit of ₹4,500"
    );
  });

  it("accepts a match where whitespace differs (tabs, spaces, newlines)", () => {
    const textWithWeirdWhitespace =
      "Please   transfer   the \t deposit\n\nwithin  24  hours.";
    const quote = "transfer the deposit within 24 hours";
    const result = validateQuote(quote, textWithWeirdWhitespace);
    expect(result.valid).toBe(true);
    expect(result.start).toBeDefined();
    expect(result.end).toBeDefined();
    // Offsets point into ORIGINAL text preserving multiple spaces, tabs, and newlines
    expect(textWithWeirdWhitespace.slice(result.start, result.end)).toBe(
      "transfer   the \t deposit\n\nwithin  24  hours"
    );
  });

  it("rejects a completely fabricated quote not present in source text", () => {
    const quote = "This text was completely fabricated by an AI model";
    const result = validateQuote(quote, sampleText);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("not found");
  });

  it("rejects when there is a case mismatch (case-sensitive matching)", () => {
    // Original is 'Congratulations' with capital C
    const quote = "congratulations on your selection";
    const result = validateQuote(quote, sampleText);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("not found");
  });

  it("rejects empty or whitespace-only quotes", () => {
    expect(validateQuote("", sampleText).valid).toBe(false);
    expect(validateQuote("   \t\n  ", sampleText).valid).toBe(false);
  });

  it(`rejects quotes shorter than MIN_QUOTE_CHARS (${MIN_QUOTE_CHARS})`, () => {
    const tooShort = "abc";
    expect(tooShort.length).toBeLessThan(MIN_QUOTE_CHARS);
    const result = validateQuote(tooShort, sampleText);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("shorter than minimum");
  });

  it(`rejects quotes longer than MAX_QUOTE_CHARS (${MAX_QUOTE_CHARS})`, () => {
    const tooLong = "a".repeat(MAX_QUOTE_CHARS + 1);
    const result = validateQuote(tooLong, sampleText);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("exceeds maximum");
  });

  it("returns the first occurrence when the quote appears multiple times", () => {
    const repeatedText =
      "Alpha report says standard stipend. Later, Beta report also says standard stipend.";
    const quote = "standard stipend";
    const result = validateQuote(quote, repeatedText);
    expect(result.valid).toBe(true);
    expect(result.start).toBe(repeatedText.indexOf("standard stipend"));
    expect(result.end).toBe(
      repeatedText.indexOf("standard stipend") + "standard stipend".length
    );
  });

  it("matches precomposed quote against decomposed source text and vice versa with exact offsets", () => {
    // Part 1: Precomposed quote ('é') vs decomposed source ('e' + '\u0301')
    const decomposedSource = "Please visit our cafe\u0301 tomorrow morning.";
    const precomposedQuote = "visit our café";
    const result1 = validateQuote(precomposedQuote, decomposedSource);
    expect(result1.valid).toBe(true);
    expect(result1.start).toBeDefined();
    expect(result1.end).toBeDefined();
    expect(decomposedSource.slice(result1.start, result1.end)).toBe(
      "visit our cafe\u0301"
    );

    // Part 2: Decomposed quote ('e' + '\u0301') vs precomposed source ('é')
    const precomposedSource = "Please visit our café tomorrow morning.";
    const decomposedQuote = "visit our cafe\u0301";
    const result2 = validateQuote(decomposedQuote, precomposedSource);
    expect(result2.valid).toBe(true);
    expect(result2.start).toBeDefined();
    expect(result2.end).toBeDefined();
    expect(precomposedSource.slice(result2.start, result2.end)).toBe(
      "visit our café"
    );
  });

  it("asserts start/end offsets slice into original text to reproduce exact original characters", () => {
    const rawSource =
      "Orientation details:\n\n\tInitial   training   stipend is ₹15,000.\nEnd.";
    const quote = "Initial training stipend is ₹15,000.";
    const result = validateQuote(quote, rawSource);
    expect(result.valid).toBe(true);
    const sliced = rawSource.slice(result.start, result.end);
    expect(sliced).toBe("Initial   training   stipend is ₹15,000.");
  });

  it("preserves correct offsets after earlier whitespace runs, newlines, tabs, emoji, and Devanagari text", () => {
    // Non-ASCII characters: Devanagari ('नमस्ते' with virama and matras) and emoji ('🚀')
    const complexSource =
      "नमस्ते \t\t \n\n 🚀 Welcome to the portal! A refundable deposit of ₹5,000 is required for dev equipment.";
    const quote = "refundable deposit of ₹5,000";
    const result = validateQuote(quote, complexSource);
    expect(result.valid).toBe(true);
    expect(complexSource.slice(result.start, result.end)).toBe(
      "refundable deposit of ₹5,000"
    );

    // Complex source where the match itself has collapsed internal whitespace following non-ASCII text
    const complexSource2 =
      "नमस्ते \t 🚀 \n\n We require a refundable   \t deposit\n\nof ₹5,000 today.";
    const result2 = validateQuote(quote, complexSource2);
    expect(result2.valid).toBe(true);
    expect(complexSource2.slice(result2.start, result2.end)).toBe(
      "refundable   \t deposit\n\nof ₹5,000"
    );
  });

  it("rejects a fabricated quote that differs by only one character", () => {
    // Differs by last digit: ₹4,501 instead of ₹4,500
    const quoteDifferentDigit = "refundable deposit of ₹4,501";
    const result1 = validateQuote(quoteDifferentDigit, sampleText);
    expect(result1.valid).toBe(false);
    expect(result1.reason).toContain("not found");

    // Differs by one letter: 'on' instead of 'of'
    const quoteDifferentLetter = "refundable deposit on ₹4,500";
    const result2 = validateQuote(quoteDifferentLetter, sampleText);
    expect(result2.valid).toBe(false);
    expect(result2.reason).toContain("not found");
  });
});
