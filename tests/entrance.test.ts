import { describe, it, expect } from "vitest";
import {
  computeLensPath,
  computeEntranceState,
  TargetRect,
  CardSize,
} from "@/lib/landing/entrance";

describe("Hero entrance pure functions (computeLensPath & computeEntranceState)", () => {
  const sampleCardSize: CardSize = { width: 520, height: 420 };
  const sampleTargets: TargetRect[] = [
    { x: 40, y: 120, width: 220, height: 24 },
    { x: 40, y: 200, width: 260, height: 24 },
    { x: 40, y: 280, width: 200, height: 24 },
  ];

  it("computes path where duration never exceeds 3200 ms", () => {
    const path = computeLensPath(sampleTargets, sampleCardSize);
    expect(path.durationMs).toBeLessThanOrEqual(3200);
    expect(path.durationMs).toBeGreaterThan(1000);
    expect(path.waypoints).toHaveLength(3);
  });

  it("at t = 0 nothing is revealed, lens opacity is 0, and done is false", () => {
    const path = computeLensPath(sampleTargets, sampleCardSize);
    const stateAtZero = computeEntranceState(0, path);

    expect(stateAtZero.revealedCount).toBe(0);
    expect(stateAtZero.observationIndex).toBe(0);
    expect(stateAtZero.lens.opacity).toBe(0);
    expect(stateAtZero.done).toBe(false);

    // Negative time behaves as pre-start
    const stateNegative = computeEntranceState(-50, path);
    expect(stateNegative.revealedCount).toBe(0);
    expect(stateNegative.done).toBe(false);
  });

  it("guarantees reveal count never decreases as time advances (monotonic non-decreasing)", () => {
    const path = computeLensPath(sampleTargets, sampleCardSize);
    let previousCount = 0;

    // Step through the timeline in 50ms increments
    for (let t = 0; t <= path.durationMs + 200; t += 50) {
      const state = computeEntranceState(t, path);
      expect(state.revealedCount).toBeGreaterThanOrEqual(previousCount);
      expect(state.revealedCount).toBeLessThanOrEqual(sampleTargets.length);
      previousCount = state.revealedCount;
    }

    expect(previousCount).toBe(sampleTargets.length);
  });

  it("at t >= duration all three targets are revealed, lens opacity is 0, and done is true", () => {
    const path = computeLensPath(sampleTargets, sampleCardSize);

    const stateAtEnd = computeEntranceState(path.durationMs, path);
    expect(stateAtEnd.revealedCount).toBe(3);
    expect(stateAtEnd.done).toBe(true);
    expect(stateAtEnd.lens.opacity).toBe(0);

    const statePastEnd = computeEntranceState(path.durationMs + 500, path);
    expect(statePastEnd.revealedCount).toBe(3);
    expect(statePastEnd.done).toBe(true);
    expect(statePastEnd.lens.opacity).toBe(0);
  });

  it("handles zero targets without throwing", () => {
    expect(() => {
      const emptyPath = computeLensPath([], sampleCardSize);
      expect(emptyPath.durationMs).toBeLessThanOrEqual(3200);
      expect(emptyPath.waypoints).toHaveLength(0);

      const state0 = computeEntranceState(0, emptyPath);
      expect(state0.revealedCount).toBe(0);
      expect(state0.done).toBe(false);

      const stateDone = computeEntranceState(emptyPath.durationMs + 10, emptyPath);
      expect(stateDone.revealedCount).toBe(0);
      expect(stateDone.done).toBe(true);
      expect(stateDone.lens.opacity).toBe(0);
    }).not.toThrow();
  });

  it("handles one target without throwing and finishes within duration", () => {
    expect(() => {
      const singleTarget: TargetRect[] = [{ x: 50, y: 150, width: 180, height: 20 }];
      const singlePath = computeLensPath(singleTarget, sampleCardSize);
      expect(singlePath.durationMs).toBeLessThanOrEqual(3200);
      expect(singlePath.waypoints).toHaveLength(1);

      const stateStart = computeEntranceState(0, singlePath);
      expect(stateStart.revealedCount).toBe(0);

      const stateMid = computeEntranceState(800, singlePath);
      expect(stateMid.revealedCount).toBe(1);

      const stateEnd = computeEntranceState(singlePath.durationMs, singlePath);
      expect(stateEnd.revealedCount).toBe(1);
      expect(stateEnd.done).toBe(true);
      expect(stateEnd.lens.opacity).toBe(0);
    }).not.toThrow();
  });

  it("produces deterministic results for identical inputs", () => {
    const path = computeLensPath(sampleTargets, sampleCardSize);

    const runA = computeEntranceState(1500, path);
    const runB = computeEntranceState(1500, path);

    expect(runA).toEqual(runB);
    expect(runA.revealedCount).toBe(runB.revealedCount);
    expect(runA.lens.x).toBe(runB.lens.x);
    expect(runA.lens.y).toBe(runB.lens.y);
  });
});
