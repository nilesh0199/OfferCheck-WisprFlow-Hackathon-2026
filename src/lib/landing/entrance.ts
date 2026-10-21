/**
 * Pure functions and timeline math for the landing page hero document entrance animation.
 *
 * Sequence:
 * 1. Plain text with no highlights.
 * 2. Magnifying lens enters from card's right edge.
 * 3. Glides smoothly to each target phrase, pausing briefly.
 * 4. At each pause, the phrase highlight reveals and the observation card updates.
 * 5. Lens exits toward bottom-right and fades out.
 * 6. Total duration is <= 3200 ms.
 */

export interface TargetPoint {
  readonly x: number;
  readonly y: number;
}

export interface TargetRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface CardSize {
  readonly width: number;
  readonly height: number;
}

export interface LensPosition {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly opacity: number;
}

export interface LensPath {
  readonly startPoint: TargetPoint;
  readonly waypoints: readonly TargetPoint[];
  readonly exitPoint: TargetPoint;
  readonly durationMs: number;
}

export interface EntranceState {
  readonly lens: LensPosition;
  readonly revealedCount: number;
  readonly observationIndex: number;
  readonly done: boolean;
}

/**
 * Standard cubic ease-in-out for smooth organic translation.
 */
export function easeInOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

/**
 * Linear interpolation helper.
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Pure function: calculates the waypoints and bounding path for the magnifying lens
 * given the measured target phrase bounding boxes relative to the card.
 */
export function computeLensPath(
  targetRects: readonly TargetRect[],
  cardSize: CardSize
): LensPath {
  const width = Math.max(cardSize?.width || 480, 200);
  const height = Math.max(cardSize?.height || 400, 200);

  if (!targetRects || targetRects.length === 0) {
    return {
      startPoint: { x: width + 50, y: height * 0.3 },
      waypoints: [],
      exitPoint: { x: width + 50, y: height * 0.8 },
      durationMs: 1200,
    };
  }

  const waypoints: TargetPoint[] = targetRects.map((rect) => ({
    x: rect.x + rect.width * 0.5,
    y: rect.y + rect.height * 0.5,
  }));

  const first = waypoints[0];
  const last = waypoints[waypoints.length - 1];

  const startPoint: TargetPoint = {
    x: width + 60,
    y: Math.max(20, first.y - 20),
  };

  const exitPoint: TargetPoint = {
    x: width + 60,
    y: Math.min(height + 20, last.y + 60),
  };

  // 3 targets -> 3000 ms (strictly <= 3200 ms)
  // 1 target -> 1800 ms
  // 2 targets -> 2400 ms
  const durationMs = targetRects.length === 1 ? 1800 : targetRects.length === 2 ? 2400 : 3000;

  return {
    startPoint,
    waypoints,
    exitPoint,
    durationMs,
  };
}

/**
 * Pure function: computes the deterministic visual state at time `timeMs`.
 */
export function computeEntranceState(
  timeMs: number,
  path: LensPath
): EntranceState {
  const duration = path.durationMs;
  const numTargets = path.waypoints.length;

  if (numTargets === 0) {
    if (timeMs >= duration) {
      return {
        lens: { x: path.exitPoint.x, y: path.exitPoint.y, rotation: 10, opacity: 0 },
        revealedCount: 0,
        observationIndex: 0,
        done: true,
      };
    }
    const t = Math.max(0, timeMs) / duration;
    const progress = easeInOutCubic(t);
    const opacity = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
    return {
      lens: {
        x: lerp(path.startPoint.x, path.exitPoint.x, progress),
        y: lerp(path.startPoint.y, path.exitPoint.y, progress),
        rotation: lerp(-10, 10, progress),
        opacity: Math.max(0, Math.min(1, opacity)),
      },
      revealedCount: 0,
      observationIndex: 0,
      done: false,
    };
  }

  // Pre-start: t <= 0
  if (timeMs <= 0) {
    return {
      lens: {
        x: path.startPoint.x,
        y: path.startPoint.y,
        rotation: -12,
        opacity: 0,
      },
      revealedCount: 0,
      observationIndex: 0,
      done: false,
    };
  }

  // Finished: t >= duration
  if (timeMs >= duration) {
    return {
      lens: {
        x: path.exitPoint.x,
        y: path.exitPoint.y,
        rotation: 15,
        opacity: 0,
      },
      revealedCount: numTargets,
      observationIndex: Math.max(0, numTargets - 1),
      done: true,
    };
  }

  // Single target schedule
  if (numTargets === 1) {
    const p1 = path.waypoints[0];
    if (timeMs < 500) {
      // Entry
      const t = timeMs / 500;
      const progress = easeInOutCubic(t);
      return {
        lens: {
          x: lerp(path.startPoint.x, p1.x, progress),
          y: lerp(path.startPoint.y, p1.y, progress),
          rotation: lerp(-12, -2, progress),
          opacity: Math.min(1, timeMs / 250),
        },
        revealedCount: 0,
        observationIndex: 0,
        done: false,
      };
    } else if (timeMs < 1200) {
      // Pause
      return {
        lens: {
          x: p1.x,
          y: p1.y,
          rotation: -2,
          opacity: 1,
        },
        revealedCount: 1,
        observationIndex: 0,
        done: false,
      };
    } else {
      // Exit
      const t = (timeMs - 1200) / 600;
      const progress = easeInOutCubic(t);
      return {
        lens: {
          x: lerp(p1.x, path.exitPoint.x, progress),
          y: lerp(p1.y, path.exitPoint.y, progress),
          rotation: lerp(-2, 15, progress),
          opacity: Math.max(0, 1 - (timeMs - 1500) / 300),
        },
        revealedCount: 1,
        observationIndex: 0,
        done: false,
      };
    }
  }

  // Standard 3 targets schedule (duration: 3000 ms)
  // Segments:
  // [0, 400]      : Move startPoint -> waypoint[0] (fade in [0, 200])
  // [400, 850]    : Pause at waypoint[0] (revealedCount = 1, obs = 0)
  // [850, 1300]   : Move waypoint[0] -> waypoint[1] (revealedCount = 1, obs = 0)
  // [1300, 1750]  : Pause at waypoint[1] (revealedCount = 2, obs = 1)
  // [1750, 2200]  : Move waypoint[1] -> waypoint[2] (revealedCount = 2, obs = 1)
  // [2200, 2650]  : Pause at waypoint[2] (revealedCount = 3, obs = 2)
  // [2650, 3000]  : Move waypoint[2] -> exitPoint (fade out [2750, 3000])

  const p0 = path.waypoints[0];
  const p1 = path.waypoints[1] || p0;
  const p2 = path.waypoints[2] || p1;

  if (timeMs < 400) {
    const t = timeMs / 400;
    const progress = easeInOutCubic(t);
    return {
      lens: {
        x: lerp(path.startPoint.x, p0.x, progress),
        y: lerp(path.startPoint.y, p0.y, progress),
        rotation: lerp(-12, -3, progress),
        opacity: Math.min(1, timeMs / 200),
      },
      revealedCount: 0,
      observationIndex: 0,
      done: false,
    };
  }

  if (timeMs < 850) {
    return {
      lens: {
        x: p0.x,
        y: p0.y,
        rotation: -3,
        opacity: 1,
      },
      revealedCount: 1,
      observationIndex: 0,
      done: false,
    };
  }

  if (timeMs < 1300) {
    const t = (timeMs - 850) / 450;
    const progress = easeInOutCubic(t);
    return {
      lens: {
        x: lerp(p0.x, p1.x, progress),
        y: lerp(p0.y, p1.y, progress),
        rotation: lerp(-3, 3, progress),
        opacity: 1,
      },
      revealedCount: 1,
      observationIndex: 0,
      done: false,
    };
  }

  if (timeMs < 1750) {
    return {
      lens: {
        x: p1.x,
        y: p1.y,
        rotation: 3,
        opacity: 1,
      },
      revealedCount: 2,
      observationIndex: 1,
      done: false,
    };
  }

  if (timeMs < 2200) {
    const t = (timeMs - 1750) / 450;
    const progress = easeInOutCubic(t);
    return {
      lens: {
        x: lerp(p1.x, p2.x, progress),
        y: lerp(p1.y, p2.y, progress),
        rotation: lerp(3, -2, progress),
        opacity: 1,
      },
      revealedCount: 2,
      observationIndex: 1,
      done: false,
    };
  }

  if (timeMs < 2650) {
    return {
      lens: {
        x: p2.x,
        y: p2.y,
        rotation: -2,
        opacity: 1,
      },
      revealedCount: 3,
      observationIndex: 2,
      done: false,
    };
  }

  // Exit: 2650 -> 3000
  const t = (timeMs - 2650) / 350;
  const progress = easeInOutCubic(t);
  const fadeStart = 2750;
  const opacity = timeMs < fadeStart ? 1 : Math.max(0, 1 - (timeMs - fadeStart) / 250);

  return {
    lens: {
      x: lerp(p2.x, path.exitPoint.x, progress),
      y: lerp(p2.y, path.exitPoint.y, progress),
      rotation: lerp(-2, 15, progress),
      opacity,
    },
    revealedCount: 3,
    observationIndex: 2,
    done: false,
  };
}
