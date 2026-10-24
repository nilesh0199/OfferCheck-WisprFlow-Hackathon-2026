"use client";

import React, { useCallback } from "react";
import { WizardStep } from "@/lib/combined-text";
import { useOfferSession } from "../SessionProvider";
import { WizardStepper } from "./WizardStepper";
import { Step1Offer } from "./Step1Offer";
import { Step2Source } from "./Step2Source";
import { Step3Conversation } from "./Step3Conversation";
import { Step4Payment } from "./Step4Payment";
import { Step5Review } from "./Step5Review";
import { SpinnerIcon } from "../Icons";

interface WizardContainerProps {
  onAnalyze: () => void;
  isLoading: boolean;
  elapsedSeconds: number;
}

const STEP_NAMES: Record<WizardStep, string> = {
  1: "Offer",
  2: "Source",
  3: "Conversation",
  4: "Money and documents",
  5: "Review",
};

export function WizardContainer({
  onAnalyze,
  isLoading,
  elapsedSeconds,
}: WizardContainerProps) {
  const {
    currentStep,
    setStep,
    visitedSteps,
    skippedSteps,
    setStepSkipped,
    isReady,
    readyReason,
    offerText,
    addedFileCount,
    source,
    conversation,
    payment,
    analysis,
  } = useOfferSession();

  const hasEnteredData = Boolean(
    offerText.trim().length > 0 ||
    addedFileCount > 0 ||
    source.channel !== undefined ||
    source.applied !== undefined ||
    source.note?.trim() ||
    conversation.text?.trim() ||
    payment.asked !== undefined ||
    payment.purposes?.length > 0 ||
    payment.amount?.trim() ||
    payment.deadline?.trim() ||
    payment.docsAsked?.length > 0 ||
    payment.docsShared?.length > 0 ||
    payment.note?.trim() ||
    analysis !== null
  );

  const handleOpenClear = useCallback(() => {
    const dialog = document.getElementById("clear-review-dialog") as HTMLDialogElement | null;
    dialog?.showModal();
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < 5) {
      setStep((currentStep + 1) as WizardStep);
    }
  }, [currentStep, setStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setStep((currentStep - 1) as WizardStep);
    }
  }, [currentStep, setStep]);

  const handleSkip = useCallback(() => {
    setStepSkipped(currentStep, true);
    if (currentStep < 5) {
      setStep((currentStep + 1) as WizardStep);
    }
  }, [currentStep, setStep, setStepSkipped]);

  const nextStepName = currentStep < 5 ? STEP_NAMES[(currentStep + 1) as WizardStep] : "";

  return (
    <div className="w-full space-y-6">
      {/* 1. Stepper Navigation */}
      <WizardStepper
        currentStep={currentStep}
        visitedSteps={visitedSteps}
        skippedSteps={skippedSteps}
        onSelectStep={setStep}
        showClear={hasEnteredData}
        onClear={handleOpenClear}
      />

      {/* 2. Active Step Content */}
      <div className="w-full">
        {currentStep === 1 && <Step1Offer onGoToStep={setStep} />}
        {currentStep === 2 && <Step2Source />}
        {currentStep === 3 && <Step3Conversation onGoToStep={setStep} />}
        {currentStep === 4 && <Step4Payment />}
        {currentStep === 5 && (
          <Step5Review
            onGoToStep={setStep}
            onAnalyze={onAnalyze}
            isLoading={isLoading}
            elapsedSeconds={elapsedSeconds}
          />
        )}
      </div>

      {/* 3. Bottom Navigation Controls (Steps 1-4) */}
      {currentStep < 5 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Back and Skip buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep >= 2 && currentStep <= 4 && (
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
              >
                Skip this step
              </button>
            )}
          </div>

          {/* Right: Next primary button and secondary "Analyse now" button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-end">
            {isReady ? (
              <button
                type="button"
                onClick={onAnalyze}
                disabled={isLoading}
                className="order-2 sm:order-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </span>
                ) : (
                  "Analyse now"
                )}
              </button>
            ) : (
              readyReason && (
                <span className="order-2 sm:order-1 text-[0.875rem] text-[var(--text-muted)] max-w-xs text-center sm:text-right">
                  {readyReason}
                </span>
              )
            )}

            <button
              type="button"
              onClick={handleNext}
              className="order-1 sm:order-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs sm:text-sm font-semibold shadow-xs hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
            >
              Next: {nextStepName}
            </button>
          </div>
        </div>
      )}

      {/* 4. Mobile Sticky Bottom Bar (< 640px) on Steps 1-4 */}
      {currentStep < 5 && (
        <div
          role="region"
          aria-label="Mobile step navigation"
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-lg flex items-center justify-between gap-3 print:hidden"
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text)] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              Back
            </button>
          ) : (
            <div className="w-16" />
          )}

          {isReady && (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--color-primary)] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              Analyse now
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs font-semibold min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            Next: {nextStepName}
          </button>
        </div>
      )}
    </div>
  );
}
