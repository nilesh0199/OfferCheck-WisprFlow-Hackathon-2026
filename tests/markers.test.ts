import { describe, it, expect } from "vitest";
import {
  formatSourceMarker,
  isSourceMarkerLine,
  containsSourceMarkerLine,
  nextSourceNumber,
  buildAppendBlock,
  TranscribedItem,
} from "@/lib/upload/markers";

describe("Source Markers - formatSourceMarker", () => {
  it("formats Screenshot marker correctly", () => {
    expect(formatSourceMarker("Screenshot", 1)).toBe("---- Text from Screenshot 1 ----");
    expect(formatSourceMarker("Screenshot", 42)).toBe("---- Text from Screenshot 42 ----");
  });

  it("formats PDF marker correctly", () => {
    expect(formatSourceMarker("PDF", 1)).toBe("---- Text from PDF 1 ----");
    expect(formatSourceMarker("PDF", 99)).toBe("---- Text from PDF 99 ----");
  });
});

describe("Source Markers - isSourceMarkerLine", () => {
  it("matches exact valid marker lines", () => {
    expect(isSourceMarkerLine("---- Text from Screenshot 1 ----")).toBe(true);
    expect(isSourceMarkerLine("---- Text from Screenshot 12 ----")).toBe(true);
    expect(isSourceMarkerLine("---- Text from PDF 1 ----")).toBe(true);
    expect(isSourceMarkerLine("---- Text from PDF 999 ----")).toBe(true);
  });

  it("tolerates trailing carriage return (\\r)", () => {
    expect(isSourceMarkerLine("---- Text from Screenshot 1 ----\r")).toBe(true);
    expect(isSourceMarkerLine("---- Text from PDF 2 ----\r")).toBe(true);
  });

  it("rejects invalid, partial, or malformed marker lines", () => {
    expect(isSourceMarkerLine("")).toBe(false);
    expect(isSourceMarkerLine("---- Text from Screenshot ----")).toBe(false);
    expect(isSourceMarkerLine("---- Text from Image 1 ----")).toBe(false);
    expect(isSourceMarkerLine("Prefix ---- Text from Screenshot 1 ----")).toBe(false);
    expect(isSourceMarkerLine("---- Text from Screenshot 1 ---- Suffix")).toBe(false);
    expect(isSourceMarkerLine("Text from Screenshot 1")).toBe(false);
    expect(isSourceMarkerLine("---- Text from PDF 1")).toBe(false);
    expect(isSourceMarkerLine("---- Text from screenshot 1 ----")).toBe(false); // Case-sensitive
  });
});

describe("Source Markers - containsSourceMarkerLine", () => {
  it("detects marker lines within multi-line quotes or texts", () => {
    const textWithMarker =
      "Some text here\n---- Text from Screenshot 1 ----\nMore text here";
    expect(containsSourceMarkerLine(textWithMarker)).toBe(true);
  });

  it("detects section heading marker lines within quotes or texts", () => {
    expect(containsSourceMarkerLine("Quote with ---- Offer text ---- inside")).toBe(true);
    expect(
      containsSourceMarkerLine("Line 1\n---- How you received it (your answers) ----\nLine 2")
    ).toBe(true);
    expect(
      containsSourceMarkerLine("---- Call or conversation (your description) ----")
    ).toBe(true);
    expect(
      containsSourceMarkerLine("---- Money and documents (your answers) ----")
    ).toBe(true);
  });

  it("returns false when text contains no marker lines", () => {
    const normalText = "Dear Candidate,\nYour monthly stipend is 20,000 INR.";
    expect(containsSourceMarkerLine(normalText)).toBe(false);
  });
});

describe("Source Markers - nextSourceNumber", () => {
  it("returns 1 for empty or blank text", () => {
    expect(nextSourceNumber("", "Screenshot")).toBe(1);
    expect(nextSourceNumber("   ", "PDF")).toBe(1);
  });

  it("returns 1 when no markers of that kind exist", () => {
    const text = "Some initial user text\n---- Text from PDF 1 ----\nPDF content";
    expect(nextSourceNumber(text, "Screenshot")).toBe(1);
    expect(nextSourceNumber(text, "PDF")).toBe(2);
  });

  it("finds highest marker number and adds 1 across sequential additions", () => {
    const text = [
      "Initial text",
      "---- Text from Screenshot 1 ----",
      "Transcript 1",
      "---- Text from Screenshot 2 ----",
      "Transcript 2",
    ].join("\n");
    expect(nextSourceNumber(text, "Screenshot")).toBe(3);
  });

  it("preserves continuous numbering when an earlier block was deleted by the user", () => {
    // User deleted block 1, leaving only block 3
    const text = [
      "Initial text",
      "---- Text from Screenshot 3 ----",
      "Transcript 3",
    ].join("\n");
    expect(nextSourceNumber(text, "Screenshot")).toBe(4);
  });

  it("respects a marker line typed manually by the user", () => {
    const text = "---- Text from PDF 5 ----\nSome typed content";
    expect(nextSourceNumber(text, "PDF")).toBe(6);
  });
});

describe("Source Markers - buildAppendBlock", () => {
  it("first addition to empty text sets text directly with no preceding blank line", () => {
    const items: TranscribedItem[] = [
      { kind: "Screenshot", transcript: "First screenshot content", readable: true },
    ];
    const result = buildAppendBlock("", items);
    expect(result).toBe("---- Text from Screenshot 1 ----\nFirst screenshot content");
  });

  it("addition to existing text inserts exactly one blank line before appended text", () => {
    const existing = "My own notes about the job.";
    const items: TranscribedItem[] = [
      { kind: "PDF", transcript: "Offer letter terms from PDF.", readable: true },
    ];
    const result = buildAppendBlock(existing, items);
    expect(result).toBe(
      "My own notes about the job.\n\n---- Text from PDF 1 ----\nOffer letter terms from PDF."
    );
    expect(result.startsWith(existing)).toBe(true);
  });

  it("handles several files with mixed kinds and independent numbering", () => {
    const items: TranscribedItem[] = [
      { kind: "Screenshot", transcript: "Screenshot 1 text", readable: true },
      { kind: "PDF", transcript: "PDF 1 text", readable: true },
      { kind: "Screenshot", transcript: "Screenshot 2 text", readable: true },
    ];
    const result = buildAppendBlock("", items);
    expect(result).toBe(
      "---- Text from Screenshot 1 ----\nScreenshot 1 text\n\n" +
        "---- Text from PDF 1 ----\nPDF 1 text\n\n" +
        "---- Text from Screenshot 2 ----\nScreenshot 2 text"
    );
  });

  it("continues numbering correctly across sequential additions", () => {
    const firstAddition = buildAppendBlock("", [
      { kind: "Screenshot", transcript: "Page 1", readable: true },
    ]);
    const secondAddition = buildAppendBlock(firstAddition, [
      { kind: "Screenshot", transcript: "Page 2", readable: true },
    ]);

    expect(secondAddition).toBe(
      "---- Text from Screenshot 1 ----\nPage 1\n\n" +
        "---- Text from Screenshot 2 ----\nPage 2"
    );
  });

  it("handles unreadable file with fallback placeholder", () => {
    const items: TranscribedItem[] = [
      { kind: "Screenshot", transcript: "", readable: false },
    ];
    const result = buildAppendBlock("", items);
    expect(result).toBe(
      "---- Text from Screenshot 1 ----\n[No text could be read from this file]"
    );
  });

  it("preserves byte-for-byte user text with emoji and Devanagari characters", () => {
    const userText = "प्रिय महोदय, मुझे यह ईमेल मिला 🌟\nरोल: डेवलपर";
    const items: TranscribedItem[] = [
      { kind: "Screenshot", transcript: "Attached contract", readable: true },
    ];
    const result = buildAppendBlock(userText, items);

    // Verify user text is byte-for-byte identical at start
    expect(result.startsWith(userText)).toBe(true);
    expect(result.slice(0, userText.length)).toBe(userText);
    expect(result).toBe(
      `${userText}\n\n---- Text from Screenshot 1 ----\nAttached contract`
    );
  });

  it("handles user text with existing CRLF line breaks byte-for-byte", () => {
    const crlfText = "Line 1\r\nLine 2\r\n";
    const items: TranscribedItem[] = [
      { kind: "PDF", transcript: "PDF content", readable: true },
    ];
    const result = buildAppendBlock(crlfText, items);

    expect(result.startsWith(crlfText)).toBe(true);
    expect(result.slice(0, crlfText.length)).toBe(crlfText);
    expect(result).toBe(
      `${crlfText}\r\n---- Text from PDF 1 ----\nPDF content`
    );
  });

  it("returns existingText unchanged when items array is empty", () => {
    expect(buildAppendBlock("Hello", [])).toBe("Hello");
  });
});
