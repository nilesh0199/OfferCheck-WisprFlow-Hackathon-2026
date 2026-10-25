import { describe, it, expect } from "vitest";
import { computeDockOffset, formatDockOffset, DOCK_BAR_DEFAULT_HEIGHT_PX, DOCK_BAR_GAP_PX } from "@/lib/dock-layout";

describe("Dock layout offset calculations across viewports", () => {
  it("returns 0px when the command bar is not rendered", () => {
    expect(computeDockOffset(false, 56)).toBe(0);
    expect(computeDockOffset(false, 80)).toBe(0);
    expect(formatDockOffset(computeDockOffset(false, 56))).toBe("0px");
  });

  it("calculates bar height + 16px when rendered", () => {
    expect(computeDockOffset(true, 56)).toBe(72);
    expect(computeDockOffset(true, 60)).toBe(76);
    expect(formatDockOffset(computeDockOffset(true, 56))).toBe("72px");
  });

  it("handles default height correctly", () => {
    expect(computeDockOffset(true)).toBe(DOCK_BAR_DEFAULT_HEIGHT_PX + DOCK_BAR_GAP_PX);
  });

  it("verifies offset across responsive viewport breakpoints (360px, 390px, 768px, 1280px, 1920px)", () => {
    const viewports = [
      { width: 360, name: "compact mobile", barHeight: 56, defaultRendered: false },
      { width: 390, name: "standard mobile", barHeight: 56, defaultRendered: false },
      { width: 768, name: "tablet", barHeight: 56, defaultRendered: true },
      { width: 1280, name: "desktop", barHeight: 56, defaultRendered: true },
      { width: 1920, name: "large display", barHeight: 56, defaultRendered: true },
    ];

    for (const vp of viewports) {
      // Default initial state
      const defaultOffset = computeDockOffset(vp.defaultRendered, vp.barHeight);
      if (vp.defaultRendered) {
        expect(defaultOffset, `${vp.name} (${vp.width}px) default rendered`).toBe(72);
      } else {
        expect(defaultOffset, `${vp.name} (${vp.width}px) default hidden`).toBe(0);
      }

      // Explicit user toggle ON
      const forcedOnOffset = computeDockOffset(true, vp.barHeight);
      expect(forcedOnOffset, `${vp.name} forced on`).toBe(72);

      // Explicit user toggle OFF
      const forcedOffOffset = computeDockOffset(false, vp.barHeight);
      expect(forcedOffOffset, `${vp.name} forced off`).toBe(0);
    }
  });

  it("returns 0 for non-positive bar heights", () => {
    expect(computeDockOffset(true, 0)).toBe(0);
    expect(computeDockOffset(true, -10)).toBe(0);
  });
});
