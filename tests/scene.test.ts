import { describe, it, expect } from "vitest";
import { getSceneState, SCENE_STEPS } from "@/lib/landing/scene";

describe("Scroll scene pure functions (getSceneState)", () => {
  it("clamps progress values below 0 and above 1", () => {
    const under = getSceneState(-0.5, 3);
    expect(under.lensT).toBe(0);
    expect(under.activeStep).toBe(0);
    expect(under.stepProgress).toEqual([0, 0, 0]);

    const over = getSceneState(1.5, 3);
    expect(over.lensT).toBe(1);
    expect(over.activeStep).toBe(2);
    expect(over.stepProgress).toEqual([1, 1, 1]);
  });

  it("handles NaN input gracefully by mapping to 0", () => {
    const nanState = getSceneState(Number.NaN, 3);
    expect(nanState.lensT).toBe(0);
    expect(nanState.activeStep).toBe(0);
    expect(nanState.stepProgress).toEqual([0, 0, 0]);
  });

  it("evaluates correct step boundaries for 3 steps", () => {
    // Step 0: [0, 0.333...)
    const start = getSceneState(0, 3);
    expect(start.activeStep).toBe(0);
    expect(start.stepProgress[0]).toBe(0);

    const midStep0 = getSceneState(0.166, 3);
    expect(midStep0.activeStep).toBe(0);
    expect(midStep0.stepProgress[0]).toBeCloseTo(0.5, 1);
    expect(midStep0.stepProgress[1]).toBe(0);

    // Step 1: [0.333..., 0.666...)
    const step1Start = getSceneState(0.35, 3);
    expect(step1Start.activeStep).toBe(1);
    expect(step1Start.stepProgress[0]).toBe(1);

    // Step 2: [0.666..., 1.0]
    const step2Start = getSceneState(0.7, 3);
    expect(step2Start.activeStep).toBe(2);
    expect(step2Start.stepProgress[0]).toBe(1);
    expect(step2Start.stepProgress[1]).toBe(1);

    // End at 1.0
    const end = getSceneState(1.0, 3);
    expect(end.activeStep).toBe(2);
    expect(end.stepProgress).toEqual([1, 1, 1]);
  });

  it("guarantees activeStep is monotonic with increasing progress", () => {
    let lastActive = 0;
    for (let p = 0; p <= 1.0; p += 0.02) {
      const state = getSceneState(p, 3);
      expect(state.activeStep).toBeGreaterThanOrEqual(lastActive);
      expect(state.activeStep).toBeLessThan(3);
      lastActive = state.activeStep;
    }
    expect(lastActive).toBe(2);
  });

  it("handles stepCount = 1 gracefully", () => {
    const single0 = getSceneState(0, 1);
    expect(single0.activeStep).toBe(0);
    expect(single0.stepProgress).toEqual([0]);

    const singleMid = getSceneState(0.5, 1);
    expect(singleMid.activeStep).toBe(0);
    expect(singleMid.stepProgress).toEqual([0.5]);

    const single1 = getSceneState(1.0, 1);
    expect(single1.activeStep).toBe(0);
    expect(single1.stepProgress).toEqual([1]);
  });

  it("SCENE_STEPS contains exactly 3 steps in logical order", () => {
    expect(SCENE_STEPS).toHaveLength(3);
    expect(SCENE_STEPS.map((s) => s.stepNumber)).toEqual([1, 2, 3]);
    expect(SCENE_STEPS.map((s) => s.label)).toEqual(["Money", "Pressure", "Contact"]);
  });
});
