"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { MAX_INPUT_CHARS, AI_DATA_NOTICE, AI_FILE_NOTICE } from "@/lib/config";
import { SYNTHETIC_EXAMPLES, SyntheticExample } from "@/data/examples";
import { FULL_WIZARD_SAMPLES, FullWizardSample } from "@/data/wizard-samples";
import { FileUploadDropzone } from "../upload/FileUploadDropzone";
import { SelectedFileList } from "../upload/SelectedFileList";
import { useOfferSession } from "../SessionProvider";
import { WizardStep } from "@/lib/combined-text";
import { ChevronDownIcon, SpinnerIcon, AttentionIcon } from "../Icons";

interface Step1OfferProps {
  onGoToStep: (step: WizardStep) => void;
}

export function Step1Offer({ onGoToStep }: Step1OfferProps) {
  const {
    offerText,
    setOfferText,
    undoOfferText,
    addedFileCount,
    selectedFiles,
    addSelectedFiles,
    removeSelectedFile,
    clearSelectedFiles,
    transcribeStatus,
    isTranscribing,
    transcribeError,
    transcribeErrorCode,
    transcribeWarnings,
    transcribeElapsedSeconds,
    transcriptBannerDismissed,
    handleTranscribe,
    handleCancelTranscribe,
    dismissTranscriptBanner,
    handleUndoAppendTranscript,
    loadWizardSample,
  } = useOfferSession();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevTextLengthRef = useRef(offerText.length);
  const wasTranscribingRef = useRef(isTranscribing);

  const [confirmSample, setConfirmSample] = useState<{
    type: "single" | "full";
    sample: SyntheticExample | FullWizardSample;
  } | null>(null);

  const charCount = offerText.length;
  const isTooLong = charCount > MAX_INPUT_CHARS;

  // Auto-scroll textarea to start of appended text after transcription
  useEffect(() => {
    if (wasTranscribingRef.current && !isTranscribing && transcribeStatus === "success") {
      if (textareaRef.current) {
        const prevLen = prevTextLengthRef.current;
        const appendStart = prevLen > 0 ? prevLen + 2 : 0;
        textareaRef.current.focus();
        try {
          textareaRef.current.setSelectionRange(appendStart, appendStart);
          const linesBefore = offerText.slice(0, appendStart).split("\n").length;
          textareaRef.current.scrollTop = Math.max(0, (linesBefore - 2) * 20);
        } catch {
          // Ignore
        }
      }
    }
    prevTextLengthRef.current = offerText.length;
    wasTranscribingRef.current = isTranscribing;
  }, [offerText, isTranscribing, transcribeStatus]);

  const handleLoadSingle = (sample: SyntheticExample) => {
    if (offerText.trim().length > 0) {
      setConfirmSample({ type: "single", sample });
    } else {
      setOfferText(sample.text);
    }
  };

  const handleLoadFull = (sample: FullWizardSample) => {
    if (offerText.trim().length > 0) {
      setConfirmSample({ type: "full", sample });
    } else {
      loadWizardSample(sample);
      onGoToStep(5);
    }
  };

  const executeConfirmedLoad = () => {
    if (!confirmSample) return;
    if (confirmSample.type === "single") {
      setOfferText((confirmSample.sample as SyntheticExample).text);
    } else {
      loadWizardSample(confirmSample.sample as FullWizardSample);
      onGoToStep(5);
    }
    setConfirmSample(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Left Form Card (8/12 on desktop) */}
      <div className="lg:col-span-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">
              Offer text or files
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Paste the offer letter, email, or message text, or attach files.
            </p>
          </div>

          <span
            aria-live="polite"
            className={`font-mono text-xs tabular-nums text-[var(--text-muted)] ${
              isTooLong ? "font-bold text-[var(--color-tint-obs-text)]" : ""
            }`}
          >
            {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()} characters
          </span>
        </div>

        {/* Textarea */}
        <div className="space-y-1.5">
          <label htmlFor="wizard-offer-text" className="sr-only">
            Offer text
          </label>
          <textarea
            id="wizard-offer-text"
            ref={textareaRef}
            rows={8}
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            placeholder="Paste the offer letter, email, or message here..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-xs sm:text-sm font-mono text-[var(--text)] leading-relaxed placeholder:text-[var(--text-muted)] placeholder:font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:border-[var(--color-primary)] transition-colors resize-y custom-scrollbar"
          />
        </div>

        {/* Link for candidates without written documents & sensitive info warning */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1 text-xs">
          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 inline-flex items-center gap-1 font-medium min-h-[44px]"
          >
            I don&apos;t have a document (describe a call or conversation instead)
          </button>

          <div
            role="alert"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-danger-text)]"
          >
            <AttentionIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Warning: Please remove personal / sensitive information</span>
          </div>
        </div>

        {/* File Attachments & Transcription */}
        <div className="pt-2 border-t border-[var(--border)] space-y-3">
          <FileUploadDropzone
            onFilesSelected={addSelectedFiles}
            disabled={isTranscribing}
            currentCount={selectedFiles.length}
          />

          <SelectedFileList
            files={selectedFiles}
            onRemove={removeSelectedFile}
            onClearAll={clearSelectedFiles}
            disabled={isTranscribing}
          />

          {/* Transcription warnings */}
          {transcribeWarnings.length > 0 && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs text-[var(--text-muted)] space-y-1"
            >
              {transcribeWarnings.map((warning, idx) => (
                <p key={idx}>{warning}</p>
              ))}
            </div>
          )}

          {/* Transcription error */}
          {transcribeError && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-[var(--border)] bg-[var(--tint-attention-bg)] p-3 text-xs text-[var(--tint-attention-text)] space-y-1"
            >
              <p>{transcribeError}</p>
              <p className="text-xs opacity-75 font-mono">
                Reference: {transcribeErrorCode || "TRANSCRIBE_ERROR"}
              </p>
            </div>
          )}

          {/* Action Row for Transcribe */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                {!isTranscribing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleTranscribe}
                      disabled={selectedFiles.length === 0}
                      className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-4 py-2 text-xs sm:text-sm font-medium shadow-xs hover:bg-[var(--color-primary-hover)] active:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                    >
                      Add text from files
                    </button>
                    <button
                      type="button"
                      onClick={clearSelectedFiles}
                      className="inline-flex items-center justify-center rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                    >
                      Clear files
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-4 py-2 text-xs sm:text-sm font-medium cursor-wait min-h-[44px]"
                    >
                      <SpinnerIcon className="w-4 h-4 animate-spin text-[var(--color-primary-contrast)]" />
                      <span>Adding text from files...</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelTranscribe}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isTranscribing && (
                <div
                  aria-live="polite"
                  className="text-xs text-[var(--text-muted)] font-mono"
                >
                  Elapsed: {transcribeElapsedSeconds}s
                </div>
              )}
            </div>
          )}

          {/* Dismissible success & undo banner */}
          {transcribeStatus === "success" && !transcriptBannerDismissed && undoOfferText !== null && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs flex flex-wrap items-center justify-between gap-2"
            >
              <span className="text-[var(--text)]">
                Text from {addedFileCount} {addedFileCount === 1 ? "file" : "files"} added below.
                Review and edit as needed.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleUndoAppendTranscript}
                  className="font-medium text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] py-1 px-2"
                >
                  Undo append
                </button>
                <button
                  type="button"
                  onClick={dismissTranscriptBanner}
                  className="text-[var(--text-muted)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] py-1 px-2"
                  aria-label="Dismiss banner"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Aside (4/12 on desktop) */}
      <aside className="lg:col-span-4 space-y-5">
        {/* Full Examples Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
              Full examples
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Loads an entire offer flow across all 5 steps to try OfferClara instantly.
            </p>
          </div>

          <div className="space-y-2.5">
            {FULL_WIZARD_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadFull(sample)}
                className="w-full text-left p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] hover:border-[var(--color-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] group"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {sample.title}
                  </span>
                  <span className="text-[0.875rem] font-mono text-[var(--text-muted)]">
                    All steps
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                  {sample.subtitle}
                </p>
              </button>
            ))}
          </div>

          {/* More single examples disclosure */}
          <details className="group pt-2 border-t border-[var(--border)]">
            <summary className="cursor-pointer text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-between py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded list-none select-none min-h-[44px]">
              <span>More text examples</span>
              <ChevronDownIcon className="w-3.5 h-3.5 group-open:rotate-180 transition-transform duration-150" />
            </summary>
            <div className="space-y-2 pt-2">
              {SYNTHETIC_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleLoadSingle(ex)}
                  className="w-full text-left p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-xs text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                >
                  <div className="font-medium">{ex.title}</div>
                  <div className="text-[0.875rem] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                    {ex.text}
                  </div>
                </button>
              ))}
            </div>
          </details>
        </div>

        {/* Confirmation Modal/Card for Overwriting Existing Text */}
        {confirmSample && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-replace-title"
            className="rounded-2xl border border-[var(--color-tint-obs-border)] bg-[var(--color-tint-obs-bg)] p-4 shadow-sm space-y-3"
          >
            <h4
              id="confirm-replace-title"
              className="text-xs font-semibold text-[var(--color-tint-obs-text)]"
            >
              Replace existing text?
            </h4>
            <p className="text-xs text-[var(--color-tint-obs-text)] leading-relaxed">
              Loading &ldquo;{confirmSample.sample.title}&rdquo; will replace your currently entered
              details. This cannot be undone.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={executeConfirmedLoad}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
              >
                Replace text
              </button>
              <button
                type="button"
                onClick={() => setConfirmSample(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
              >
                Keep my text
              </button>
            </div>
          </div>
        )}

        {/* Data & Privacy Notice */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 text-xs text-[var(--text-muted)] space-y-2">
          <div className="font-semibold text-[var(--text)]">Data handling</div>
          <p className="leading-relaxed">{AI_DATA_NOTICE}</p>
          <p className="leading-relaxed">{AI_FILE_NOTICE}</p>
          <Link
            href="/privacy"
            className="inline-block text-[var(--color-primary)] hover:underline pt-1 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
          >
            Read privacy details
          </Link>
        </div>
      </aside>
    </div>
  );
}
