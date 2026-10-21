/**
 * Pure functions, data definitions, and state calculations for the
 * scroll-driven scene ("A second look, line by line").
 */

export interface SceneStep {
  readonly id: string;
  readonly stepNumber: number;
  readonly label: string;
  readonly title: string;
  readonly phrase: string;
  readonly note: string;
}

export const SCENE_STEPS: readonly SceneStep[] = [
  {
    id: "scene-money",
    stepNumber: 1,
    label: "Money",
    title: "Money asked before anything is confirmed.",
    phrase: "refundable equipment deposit of ₹4,500",
    note: "A payment request before the offer is formalised is worth confirming independently. The AICTE National Internship Portal and National Career Service state that their services are free for applicants.",
  },
  {
    id: "scene-pressure",
    stepNumber: 2,
    label: "Pressure",
    title: "A tight deadline.",
    phrase: "within 24 hours to secure your internship slot",
    note: "Time pressure about paying is a reason to slow down and confirm, not a reason to hurry.",
  },
  {
    id: "scene-contact",
    stepNumber: 3,
    label: "Contact",
    title: "Contact details worth checking.",
    phrase: "reach out via WhatsApp at +91 98000 00000",
    note: "A messaging number next to an official-looking address is worth confirming through contact details you find yourself.",
  },
];

export const SCENE_CLOSING_LINE =
  "OfferCheck points at signals to investigate. A signal alone is not proof of anything, and the absence of signals is not proof that an offer is genuine.";

export interface SceneState {
  readonly activeStep: number;
  readonly stepProgress: readonly number[];
  readonly lensT: number;
}

/**
 * Pure function: calculates the scroll scene state from a normalized progress (0..1).
 *
 * Guaranteed Invariants:
 * - progress is clamped to [0, 1]
 * - NaN progress is safely mapped to 0
 * - activeStep is monotonic with respect to progress
 * - stepProgress array length equals stepCount
 */
export function getSceneState(progress: number, stepCount: number): SceneState {
  const safeCount = Math.max(1, Math.floor(stepCount || 1));
  const safeProgress = Number.isFinite(progress) ? progress : 0;
  const clamped = Math.max(0, Math.min(1, safeProgress));

  // Determine active step index: 0 .. safeCount - 1
  const rawStep = Math.floor(clamped * safeCount);
  const activeStep = Math.min(safeCount - 1, rawStep);

  // Compute local progress for each step
  const sliceSize = 1 / safeCount;
  const stepProgress: number[] = [];

  for (let i = 0; i < safeCount; i++) {
    const start = i * sliceSize;
    if (clamped <= start) {
      stepProgress.push(0);
    } else if (clamped >= start + sliceSize) {
      stepProgress.push(1);
    } else {
      stepProgress.push((clamped - start) / sliceSize);
    }
  }

  return {
    activeStep,
    stepProgress,
    lensT: clamped,
  };
}
