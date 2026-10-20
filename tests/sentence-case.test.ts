import { describe, it, expect } from "vitest";
import { sentenceCase } from "@/lib/analysis/sentence-case";

describe("sentenceCase", () => {
  it("capitalises a lowercase first letter", () => {
    expect(sentenceCase("monthly stipend is not stated.")).toBe(
      "Monthly stipend is not stated."
    );
    expect(sentenceCase("what the text says")).toBe("What the text says");
    expect(sentenceCase("a")).toBe("A");
  });

  it("leaves already capitalised strings unchanged", () => {
    expect(sentenceCase("Company policy requires a deposit.")).toBe(
      "Company policy requires a deposit."
    );
    expect(sentenceCase("Already capitalised.")).toBe("Already capitalised.");
  });

  it("preserves leading whitespace while capitalising the first letter", () => {
    expect(sentenceCase("   indented observation")).toBe(
      "   Indented observation"
    );
    expect(sentenceCase("\n  multiline with space")).toBe(
      "\n  Multiline with space"
    );
  });

  it("safely handles empty strings and whitespace-only strings", () => {
    expect(sentenceCase("")).toBe("");
    // @ts-expect-error testing invalid type
    expect(sentenceCase(null)).toBe("");
    // @ts-expect-error testing invalid type
    expect(sentenceCase(undefined)).toBe("");
  });

  it("leaves non-Latin, symbol, or numerical first characters unchanged", () => {
    expect(sentenceCase("₹15,000 security deposit")).toBe(
      "₹15,000 security deposit"
    );
    expect(sentenceCase("10 days selection deadline")).toBe(
      "10 days selection deadline"
    );
    expect(sentenceCase("बधाई हो")).toBe("बधाई हो");
    expect(sentenceCase('"quoted text"')).toBe('"quoted text"');
  });

  it("handles accented Latin characters", () => {
    expect(sentenceCase("état initial")).toBe("État initial");
  });
});
