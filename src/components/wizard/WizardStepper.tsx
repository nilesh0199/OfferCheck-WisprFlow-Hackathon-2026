"use client";

import React from "react";
import { WizardStep } from "@/lib/combined-text";

interface WizardStepperProps {
  currentStep: WizardStep;
  visitedSteps: Record<number, boolean>;
  skippedSteps: Record<number, boolean>;
  onSelectStep: (step: WizardStep) => void;
}

const STEPS: { step: WizardStep; label: string; optional?: boolean }[] = [
  { step: 1, label: "Offer" },
  { step: 2, label: "Source", optional: true },
  { step: 3, label: "Conversation", optional: true },
  { step: 4, label: "Money and documents", optional: true },
  { step: 5, label: "Review" },
];

export function WizardStepper({
  currentStep,
  visitedSteps,
  skippedSteps,
  onSelectStep,
}: WizardStepperProps) {
  const currentStepObj = STEPS.find((s) => s.step === currentStep) || STEPS[0];

  return (
    <nav aria-label="Review steps" className="w-full">
      {/* Mobile compact header (< 768px): "Step X of 5: Name" + horizontally scrollable chip track */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
          <span>
            Step {currentStep} of {STEPS.length}:{" "}
            <strong className="text-[var(--text)] font-sans">{currentStepObj.label}</strong>
          </span>
          {currentStepObj.optional && (
            <span className="text-[0.875rem] text-[var(--text-muted)] font-sans">
              (optional)
            </span>
          )}
        </div>

        <ol className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {STEPS.map((s) => {
            const isCurrent = s.step === currentStep;
            const isVisited = visitedSteps[s.step] && !isCurrent;
            const isSkipped = skippedSteps[s.step];

            let stateLabel = "";
            if (isCurrent) stateLabel = "current";
            else if (isSkipped) stateLabel = "skipped";
            else if (isVisited) stateLabel = "done";

            return (
              <li key={s.step} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectStep(s.step)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`min-h-[44px] px-3 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                    isCurrent
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-contrast)] border-[var(--color-primary)] shadow-2xs"
                      : isVisited
                      ? "bg-[var(--color-surface)] text-[var(--color-primary)] border-[var(--color-border-strong)] hover:border-[var(--color-primary)]"
                      : isSkipped
                      ? "bg-[var(--color-surface-muted)] text-[var(--text-muted)] border-[var(--color-border)] italic"
                      : "bg-[var(--color-surface)] text-[var(--text-muted)] border-[var(--color-border)] hover:text-[var(--text)]"
                  }`}
                >
                  <span className="font-mono">{s.step}.</span>
                  <span>{s.label}</span>
                  {stateLabel && !isCurrent && (
                    <span className="text-[0.875rem] opacity-75">
                      ({stateLabel})
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Desktop stepper (>= 768px): Ordered list of 5 steps */}
      <ol className="hidden md:grid md:grid-cols-5 gap-2 w-full">
        {STEPS.map((s) => {
          const isCurrent = s.step === currentStep;
          const isVisited = visitedSteps[s.step] && !isCurrent;
          const isSkipped = skippedSteps[s.step];

          let badgeText = "";
          if (isCurrent) badgeText = "Current";
          else if (isSkipped) badgeText = "Skipped";
          else if (isVisited) badgeText = "Done";

          return (
            <li key={s.step}>
              <button
                type="button"
                onClick={() => onSelectStep(s.step)}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-full text-left p-3 rounded-xl border transition-all min-h-[44px] flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  isCurrent
                    ? "bg-[var(--color-surface)] border-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]"
                    : isVisited
                    ? "bg-[var(--color-surface)] border-[var(--color-border-strong)] hover:border-[var(--color-primary)]"
                    : isSkipped
                    ? "bg-[var(--color-surface-muted)] border-[var(--color-border)] opacity-80"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full text-xs font-mono text-[var(--text-muted)] mb-1">
                  <span>Step {s.step}</span>
                  {s.optional && (
                    <span className="font-sans text-[0.875rem] text-[var(--text-muted)]">
                      optional
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 w-full">
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-[var(--color-primary)] font-bold"
                        : "text-[var(--text)]"
                    }`}
                  >
                    {s.label}
                  </span>

                  {badgeText && (
                    <span
                      className={`text-[0.875rem] font-mono px-1.5 py-0.5 rounded ${
                        isCurrent
                          ? "bg-[var(--tint-action-bg)] text-[var(--color-primary)]"
                          : isVisited
                          ? "bg-[var(--color-surface-muted)] text-[var(--color-primary)]"
                          : "text-[var(--text-muted)] italic"
                      }`}
                    >
                      {badgeText}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
