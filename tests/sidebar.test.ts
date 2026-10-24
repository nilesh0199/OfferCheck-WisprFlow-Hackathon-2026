import { describe, it, expect } from "vitest";
import { itemHeightRem } from "@/lib/sidebar";

describe("itemHeightRem sidebar height calculator", () => {
  it("returns 2.75rem for standard heights >= 720px", () => {
    expect(itemHeightRem(900, 10)).toBe(2.75);
    expect(itemHeightRem(720, 10)).toBe(2.75);
    expect(itemHeightRem(1080, 10)).toBe(2.75);
  });

  it("interpolates smoothly between 560px and 720px", () => {
    const at640 = itemHeightRem(640, 10);
    expect(at640).toBeGreaterThanOrEqual(2.25);
    expect(at640).toBeLessThanOrEqual(2.75);
    expect(at640).toBe(2.5); // (640-560)/(720-560) = 80/160 = 0.5 -> 2.25 + 0.25 = 2.5
  });

  it("returns 2.25rem for compact viewports at 560px and below", () => {
    expect(itemHeightRem(560, 10)).toBe(2.25);
    expect(itemHeightRem(500, 10)).toBe(2.25);
    expect(itemHeightRem(400, 10)).toBe(2.25);
  });

  it("handles edge cases cleanly without NaN or zero division", () => {
    expect(itemHeightRem(0, 10)).toBe(2.25);
    expect(itemHeightRem(800, 0)).toBe(2.75);
    expect(itemHeightRem(-100, 10)).toBe(2.25);
  });
});
