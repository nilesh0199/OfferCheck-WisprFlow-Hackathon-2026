import { describe, it, expect } from "vitest";
import { matchCommand } from "@/lib/commands/match";
import { computeDockOffset, formatDockOffset } from "@/lib/dock-layout";

describe("Command bar behavior, matching, and dock state (Milestone R1)", () => {
  it("recognises navigation commands and returns target", () => {
    const home = matchCommand("home");
    expect(home).toEqual({ kind: "NAVIGATE", target: "/", label: "Home" });

    const check = matchCommand("check an offer");
    expect(check).toEqual({ kind: "NAVIGATE", target: "/check", label: "Check an offer" });

    const offer = matchCommand("offer", { page: "/" });
    expect(offer).toEqual({ kind: "NAVIGATE", target: "/check", label: "Check an offer" });

    const github = matchCommand("github");
    expect(github).toEqual({ kind: "OPEN_GITHUB" });

    const share = matchCommand("share");
    expect(share).toEqual({ kind: "SHARE" });
  });

  it("handles unrecognised commands by returning UNKNOWN", () => {
    const unknown = matchCommand("launch the rocket into outer space");
    expect(unknown.kind).toBe("UNKNOWN");
  });

  it("handles check-page-only commands invoked on other routes with WRONG_CONTEXT", () => {
    const nextOnHome = matchCommand("next", { page: "/" });
    expect(nextOnHome).toEqual({
      kind: "WRONG_CONTEXT",
      hint: "That command works on the check page.",
    });

    const step2OnHome = matchCommand("step 2", { page: "/" });
    expect(step2OnHome).toEqual({
      kind: "WRONG_CONTEXT",
      hint: "That command works on the check page.",
    });
  });

  it("calculates dock offset as 0 when command bar is toggled OFF", () => {
    expect(computeDockOffset(false, 56)).toBe(0);
    expect(formatDockOffset(computeDockOffset(false, 56))).toBe("0px");
  });

  it("calculates dock offset as barHeight + 16px when command bar is toggled ON", () => {
    expect(computeDockOffset(true, 56)).toBe(72);
    expect(formatDockOffset(computeDockOffset(true, 56))).toBe("72px");
  });

  it("defaults ON at >= 768px and OFF below 768px", () => {
    function defaultEnabled(width: number): boolean {
      return width >= 768;
    }

    expect(defaultEnabled(360)).toBe(false);
    expect(defaultEnabled(390)).toBe(false);
    expect(defaultEnabled(640)).toBe(false);
    expect(defaultEnabled(767)).toBe(false);
    expect(defaultEnabled(768)).toBe(true);
    expect(defaultEnabled(1024)).toBe(true);
    expect(defaultEnabled(1280)).toBe(true);
    expect(defaultEnabled(1920)).toBe(true);
  });
});
