"use client";

import React, { useRef, useEffect } from "react";
import {
  MAX_INPUT_CHARS,
  MIN_INPUT_CHARS,
  AI_DATA_NOTICE,
  AI_FILE_NOTICE,
} from "@/lib/config";
import { FEATURES } from "@/lib/features";
import { SamplePicker } from "./SamplePicker";
import { LockIcon, SpinnerIcon } from "./Icons";
import { FileUploadDropzone } from "./upload/FileUploadDropzone";
import { SelectedFileList } from "./upload/SelectedFileList";
import { useOfferSession } from "./SessionProvider";

interface OfferInputFormProps {
  offerText: string;
  setOfferText: (text: string) => void;
  onAnalyze: () => void;
  onCancel: () => void;
  onClear: () => void;
  isLoading: boolean;
  elapsedSeconds: number;
}

export function OfferInputForm({
  offerText,
  setOfferText,
  onAnalyze,
  onCancel,
  onClear,
  isLoading,
  elapsedSeconds,
}: OfferInputFormProps) {
  const {
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
    errorState,
  } = useOfferSession();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevTextLengthRef = useRef(offerText.length);
  const wasTranscribingRef = useRef(isTranscribing);

  const charCount = offerText.length;
  const trimmed = offerText.trim();
  const isEmpty = trimmed.length === 0;
  const isTooShort = !isEmpty && trimmed.length < MIN_INPUT_CHARS;
  const isTooLong = charCount > MAX_INPUT_CHARS;

  const isAnalyzeDisabled =
    isEmpty || isTooShort || isTooLong || isLoading || isTranscribing;

  // Auto-scroll textarea to start of appended text and focus after successful transcription
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

  const getDisabledReason = (): string | null => {
    if (isLoading) return null;
    if (isEmpty) return "Paste offer text to analyze.";
    if (isTooShort)
      return `Offer text is too short (minimum ${MIN_INPUT_CHARS} characters; currently ${trimmed.length}).`;
    if (isTooLong)
      return `Offer text exceeds the limit by ${(charCount - MAX_INPUT_CHARS).toLocaleString()} characters.`;
    return null;
  };

  const disabledReason = getDisabledReason();

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnalyzeDisabled) {
      onAnalyze();
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header and Sample Picker */}
      <div className="space-y-3 pb-3 border-b border-[var(--border)]">
        <div>
          <h2
            id="offer-text-heading"
            className="text-base font-semibold text-[var(--text)]"
          >
            Offer input
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Paste text, attach files, or both.
          </p>
        </div>

        <SamplePicker
          currentText={offerText}
          onSelectSample={(sampleText) => setOfferText(sampleText)}
          disabled={isLoading || isTranscribing}
        />
      </div>

      <form onSubmit={handleAnalyzeSubmit} className="space-y-4">
        {/* Post-transcription Success Banner with Undo */}
        {transcribeStatus === "success" && !transcriptBannerDismissed && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-[var(--border)] bg-[var(--tint-attention-bg)] p-3.5 text-xs text-[var(--tint-attention-text)] space-y-2 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 text-left">
                <p className="font-semibold text-xs text-[var(--text)]">
                  Text added from {addedFileCount || 1} file{addedFileCount === 1 ? "" : "s"}
                </p>
                <p className="leading-relaxed">
                  Text from {addedFileCount || 1} file{addedFileCount === 1 ? "" : "s"} was added below your text. Check it against the originals, fix any mistakes and remove personal details. The review uses exactly this text.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {undoOfferText !== null && (
                  <button
                    type="button"
                    onClick={handleUndoAppendTranscript}
                    className="inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[32px] transition-colors"
                  >
                    Undo
                  </button>
                )}
                <button
                  type="button"
                  onClick={dismissTranscriptBanner}
                  aria-label="Dismiss banner"
                  className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <span aria-hidden="true" className="text-sm font-bold leading-none">&times;</span>
                </button>
              </div>
            </div>

            {transcribeWarnings.length > 0 && (
              <ul className="list-disc pl-4 space-y-0.5 text-2xs opacity-90 border-t border-[var(--border)] pt-1.5 text-left">
                {transcribeWarnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            )}

            {isTooLong && (
              <p className="text-2xs font-semibold text-amber-700 dark:text-amber-400 border-t border-[var(--border)] pt-1 text-left">
                The combined text exceeds the limit by {(charCount - MAX_INPUT_CHARS).toLocaleString()} characters. Please edit or trim it before analyzing.
              </p>
            )}
          </div>
        )}

        {/* Textarea Area */}
        <div className="space-y-2 text-left">
          <label htmlFor="offer-text" className="sr-only">
            Paste the internship or job offer
          </label>
          <textarea
            ref={textareaRef}
            id="offer-text"
            name="offer-text"
            rows={10}
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            readOnly={isLoading}
            aria-describedby="char-count-meta privacy-callout"
            aria-invalid={isTooLong || isTooShort}
            placeholder="Paste the email, message or offer letter here (remove names, phone numbers, bank details and ID numbers first)"
            className={`w-full h-64 sm:h-72 min-h-[14rem] max-h-[22rem] resize-y rounded-lg border p-3.5 text-xs sm:text-sm font-mono leading-relaxed transition-colors custom-scrollbar overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] bg-[var(--surface-muted)] text-[var(--text)] ${
              isLoading
                ? "opacity-60 cursor-not-allowed border-[var(--border)]"
                : isTooLong
                ? "border-amber-600 focus-visible:ring-amber-600"
                : "border-[var(--border)] focus:border-[var(--text)]"
            }`}
          />

          {/* Counter and Guidance Row */}
          <div
            id="char-count-meta"
            className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]"
          >
            <span>
              {disabledReason ? (
                <span>{disabledReason}</span>
              ) : (
                <span>Ready for review.</span>
              )}
            </span>
            <span
              aria-live="polite"
              className={`font-mono tabular-nums ${
                isTooLong ? "font-bold text-amber-600" : ""
              }`}
            >
              {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()} characters
            </span>
          </div>
        </div>

        {/* Attach Files (Optional) Area */}
        {FEATURES.documentUpload && (
          <div className="pt-4 border-t border-[var(--border)] space-y-3 text-left">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                Attach files (optional)
              </h3>
              <p className="text-2xs sm:text-xs text-[var(--text-muted)]">
                Attach up to 5 screenshots or PDFs (max 4 MB total) to extract text and add it below your notes.
              </p>
            </div>

            <FileUploadDropzone
              onFilesSelected={addSelectedFiles}
              currentCount={selectedFiles.length}
              disabled={isTranscribing || isLoading}
            />

            <SelectedFileList
              files={selectedFiles}
              onRemove={removeSelectedFile}
              onClearAll={clearSelectedFiles}
              disabled={isTranscribing || isLoading}
            />

            {transcribeError && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-[var(--border)] bg-[var(--tint-attention-bg)] p-3 text-xs text-[var(--tint-attention-text)] space-y-1"
              >
                <p>{transcribeError}</p>
                <p className="text-2xs opacity-75 font-mono">
                  Reference: {transcribeErrorCode || "TRANSCRIBE_ERROR"}
                </p>
              </div>
            )}

            {/* AI File Privacy Notice directly above button */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-2xs text-[var(--text-muted)] leading-relaxed">
              <p>{AI_FILE_NOTICE}</p>
            </div>

            {/* Action Row for Transcribe */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                {!isTranscribing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleTranscribe}
                      disabled={selectedFiles.length === 0 || isLoading}
                      className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] px-4 py-2 text-xs sm:text-sm font-medium shadow-xs hover:opacity-90 active:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity min-h-[44px]"
                    >
                      Add text from files
                    </button>
                    {selectedFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSelectedFiles}
                        className="inline-flex items-center justify-center rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                      >
                        Clear files
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] px-4 py-2 text-xs sm:text-sm font-medium cursor-wait min-h-[44px]"
                    >
                      <SpinnerIcon className="w-4 h-4 animate-spin text-[var(--accent-contrast)]" />
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
          </div>
        )}

        {/* Analysis Error Alert */}
        {errorState && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-[var(--border)] bg-[var(--tint-attention-bg)] p-3 text-xs text-[var(--tint-attention-text)] space-y-1 text-left"
          >
            <p>{errorState.message || "An error occurred during review."}</p>
            <p className="text-2xs opacity-75 font-mono">
              Reference: {errorState.code || errorState.type}
            </p>
          </div>
        )}

        {/* Main Analyze Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            {!isLoading ? (
              <>
                <button
                  type="submit"
                  disabled={isAnalyzeDisabled}
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs hover:opacity-90 active:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity min-h-[44px]"
                >
                  Analyze offer
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isEmpty && !offerText}
                  className="inline-flex items-center justify-center rounded-lg border border-transparent px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-30 min-h-[44px]"
                >
                  Clear
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-wait min-h-[44px]"
                >
                  <SpinnerIcon className="w-4 h-4 animate-spin text-[var(--accent-contrast)]" />
                  <span>Analyzing...</span>
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isLoading && (
            <div
              aria-live="polite"
              className="text-xs text-[var(--text-muted)] font-mono"
            >
              Elapsed: {elapsedSeconds}s
            </div>
          )}
        </div>

        {/* Privacy Callout */}
        <div
          id="privacy-callout"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 text-xs text-[var(--text-muted)] space-y-2 text-left"
        >
          <div className="flex items-start gap-2.5 text-[var(--text)]">
            <LockIcon className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
            <div className="space-y-1.5 leading-relaxed">
              <p className="font-semibold text-2xs sm:text-xs">
                Privacy and data handling
              </p>
              <p>
                Remove names, phone numbers, addresses, bank details, ID numbers, passwords, and one-time passwords (OTPs) before pasting or attaching files.
              </p>
              <p className="text-2xs opacity-90 border-t border-[var(--border)] pt-1.5">
                {AI_DATA_NOTICE}
              </p>
              <p className="text-2xs opacity-80">
                OfferCheck reviews pasted text only. It cannot confirm that a sender is genuine.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
