import { describe, it, expect } from "vitest";
import { buildHighlightSegments } from "@/lib/analysis/highlights";

describe("buildHighlightSegments", () => {
  it("returns empty array for empty or non-string text", () => {
    expect(buildHighlightSegments("", [])).toEqual([]);
    expect(buildHighlightSegments("", [{ start: 0, end: 5 }])).toEqual([]);
    // @ts-expect-error test invalid type
    expect(buildHighlightSegments(null, [])).toEqual([]);
  });

  it("returns single unhighlighted segment when spans array is empty", () => {
    const text = "OfferCheck test offer text.";
    const segments = buildHighlightSegments(text, []);
    expect(segments).toEqual([{ text, isHighlighted: false }]);
    expect(segments.map((s) => s.text).join("")).toBe(text);
  });

  it("handles a single span in the middle of text", () => {
    const text = "Please deposit ₹4,500 immediately to confirm.";
    const quote = "deposit ₹4,500";
    const start = text.indexOf(quote);
    const end = start + quote.length;

    const segments = buildHighlightSegments(text, [
      { start, end, concernId: "c1" },
    ]);

    expect(segments.length).toBe(3);
    expect(segments[0]).toEqual({
      text: "Please ",
      isHighlighted: false,
    });
    expect(segments[1]).toEqual({
      text: quote,
      isHighlighted: true,
      concernId: "c1",
      concernIds: ["c1"],
    });
    expect(segments[2]).toEqual({
      text: " immediately to confirm.",
      isHighlighted: false,
    });
    expect(segments.map((s) => s.text).join("")).toBe(text);
  });

  it("handles a span spanning the entire text", () => {
    const text = "Full text highlighted";
    const segments = buildHighlightSegments(text, [
      { start: 0, end: text.length, concernId: "c1" },
    ]);

    expect(segments.length).toBe(1);
    expect(segments[0]).toEqual({
      text,
      isHighlighted: true,
      concernId: "c1",
      concernIds: ["c1"],
    });
    expect(segments.map((s) => s.text).join("")).toBe(text);
  });

  it("handles adjacent spans cleanly", () => {
    const text = "ABCDEFGHIJ";
    const segments = buildHighlightSegments(text, [
      { start: 0, end: 3, concernId: "c1" },
      { start: 3, end: 6, concernId: "c2" },
    ]);

    expect(segments.length).toBe(3);
    expect(segments[0]).toEqual({
      text: "ABC",
      isHighlighted: true,
      concernId: "c1",
      concernIds: ["c1"],
    });
    expect(segments[1]).toEqual({
      text: "DEF",
      isHighlighted: true,
      concernId: "c2",
      concernIds: ["c2"],
    });
    expect(segments[2]).toEqual({
      text: "GHIJ",
      isHighlighted: false,
    });
    expect(segments.map((s) => s.text).join("")).toBe(text);
  });

  it("handles overlapping spans and retains matching concernIds", () => {
    const text = "0123456789";
    // c1: [2, 6] -> "2345"
    // c2: [4, 8] -> "4567"
    const segments = buildHighlightSegments(text, [
      { start: 2, end: 6, concernId: "c1" },
      { start: 4, end: 8, concernId: "c2" },
    ]);

    expect(segments.map((s) => s.text).join("")).toBe(text);
    // Interval [0, 2]: "01" (unhighlighted)
    // Interval [2, 4]: "23" (c1)
    // Interval [4, 6]: "45" (c1 and c2 overlapping)
    // Interval [6, 8]: "67" (c2)
    // Interval [8, 10]: "89" (unhighlighted)
    expect(segments.length).toBe(5);
    expect(segments[0]).toEqual({ text: "01", isHighlighted: false });
    expect(segments[1]).toEqual({
      text: "23",
      isHighlighted: true,
      concernId: "c1",
      concernIds: ["c1"],
    });
    expect(segments[2]).toEqual({
      text: "45",
      isHighlighted: true,
      concernId: "c1",
      concernIds: ["c1", "c2"],
    });
    expect(segments[3]).toEqual({
      text: "67",
      isHighlighted: true,
      concernId: "c2",
      concernIds: ["c2"],
    });
    expect(segments[4]).toEqual({ text: "89", isHighlighted: false });
  });

  it("clamps out-of-range spans and ignores invalid/reversed spans", () => {
    const text = "Short text.";
    const segments = buildHighlightSegments(text, [
      { start: -5, end: 5, concernId: "c1" }, // Negative start clamped to 0
      { start: 10, end: 50, concernId: "c2" }, // End clamped to text.length (11)
      { start: 8, end: 4, concernId: "c3" }, // Reversed span ignored
      { start: 3, end: 3, concernId: "c4" }, // Empty span ignored
      { start: 100, end: 150, concernId: "c5" }, // Out of range start ignored
    ]);

    expect(segments.map((s) => s.text).join("")).toBe(text);
    expect(segments[0].text).toBe("Short");
    expect(segments[0].isHighlighted).toBe(true);
  });

  it("preserves exact character offsets with emoji and Devanagari text before spans", () => {
    const text =
      "🚀 बधाई हो! You have been offered a stipend of ₹20,000 for this role.";
    const quote = "₹20,000";
    const start = text.indexOf(quote);
    const end = start + quote.length;

    const segments = buildHighlightSegments(text, [
      { start, end, concernId: "c_stipend" },
    ]);

    expect(segments.map((s) => s.text).join("")).toBe(text);
    const highlighted = segments.find((s) => s.isHighlighted);
    expect(highlighted).toBeDefined();
    expect(highlighted?.text).toBe("₹20,000");
    expect(highlighted?.concernId).toBe("c_stipend");
  });

  it("handles out-of-order spans and sorts them", () => {
    const text = "First Second Third Fourth";
    const segments = buildHighlightSegments(text, [
      { start: 19, end: 25, concernId: "c_fourth" }, // "Fourth"
      { start: 0, end: 5, concernId: "c_first" }, // "First"
      { start: 6, end: 12, concernId: "c_second" }, // "Second"
    ]);

    expect(segments.map((s) => s.text).join("")).toBe(text);
    expect(segments[0].text).toBe("First");
    expect(segments[0].isHighlighted).toBe(true);
    expect(segments[2].text).toBe("Second");
    expect(segments[2].isHighlighted).toBe(true);
    expect(segments[4].text).toBe("Fourth");
    expect(segments[4].isHighlighted).toBe(true);
  });
});
