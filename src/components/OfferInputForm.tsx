"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import {
  MAX_INPUT_CHARS,
  MIN_INPUT_CHARS,
  AI_DATA_NOTICE,
  AI_FILE_NOTICE,
} from "@/lib/config";
import { FEATURES } from "@/lib/features";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import { SpinnerIcon } from "./Icons";
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
    if (isTranscribing) return "Adding text from files...";
    if (isEmpty) return "Add at least 40 characters, or add text from your files, to review.";
    if (isTooShort)
      return `Offer text is too short (minimum ${MIN_INPUT_CHARS} characters; currently ${trimmed.length}).`;
    if (isTooLong)
      return `Offer text exceeds the limit by ${(charCount - MAX_INPUT_CHARS).toLocaleString()} characters.`;
    return null;
  };

  const disabledReason = getDisabledReason();

  const handleAttachFilesClick = () => {
    const fileInput = document.getElementById("offer-file-input") as HTMLInputElement | null;
    if (fileInput) {
      fileInput.click();
    }
  };

  const matchingExample = SYNTHETIC_EXAMPLES.find(
    (ex) => ex.text.trim() === offerText.trim()
  );

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-xs space-y-4">
      {/* 1. Title Row: Heading, optional synthetic badge, and live character counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2
            id="offer-text-heading"
            className="text-base font-semibold text-[var(--text)]"
          >
            Your text
          </h2>
          {matchingExample && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] opacity-60"
                aria-hidden="true"
              />
              Synthetic example, not a real offer
            </span>
          )}
        </div>

        <span
          id="char-counter"
          aria-live="polite"
          className={`font-mono text-xs tabular-nums text-[var(--text-muted)] ${
            isTooLong ? "font-bold text-[var(--color-tint-attention-accent)]" : ""
          }`}
        >
          {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()} characters
        </span>
      </div>

      {/* 2. Top Action Bar: Primary Analyze, Secondary Attach Files, Ghost Clear */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary Analyze button (hidden on < 640px where sticky bottom bar takes over) */}
          {!isLoading ? (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzeDisabled}
              aria-describedby={disabledReason ? "analyze-disabled-reason" : undefined}
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-5 py-2.5 text-base font-semibold shadow-xs hover:bg-[var(--color-primary-hover)] active:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              Analyze offer
            </button>
          ) : (
            <div className="hidden sm:inline-flex items-center gap-2.5">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-5 py-2.5 text-base font-semibold cursor-wait min-h-[44px]"
              >
                <SpinnerIcon className="w-4 h-4 animate-spin text-[var(--color-primary-contrast)]" />
                <span>Analyzing...</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-base font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Secondary Attach files button */}
          {FEATURES.documentUpload && (
            <button
              type="button"
              onClick={handleAttachFilesClick}
              disabled={isTranscribing || isLoading}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-base font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-40 min-h-[44px] transition-colors"
            >
              Attach files
            </button>
          )}

          {/* Ghost Clear button */}
          <button
            type="button"
            onClick={onClear}
            disabled={isEmpty && selectedFiles.length === 0}
            className="inline-flex items-center justify-center rounded-lg border border-transparent px-3 py-2.5 text-base font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-30 min-h-[44px] transition-colors"
          >
            Clear
          </button>

          {/* One-line disabled reason beside Analyze button */}
          {disabledReason && (
            <span
              id="analyze-disabled-reason"
              className="hidden sm:inline text-xs text-[var(--text-muted)] leading-tight max-w-xs"
            >
              {disabledReason}
            </span>
          )}

          {/* Ctrl/Cmd+Enter hint: only on devices with hover pointer */}
          {!isLoading && (
            <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline text-xs text-[var(--text-muted)] font-mono ml-auto">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] font-semibold text-[var(--text)]">Ctrl+Enter</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] font-semibold text-[var(--text)]">⌘+Enter</kbd>) to analyze
            </span>
          )}

          {isLoading && (
            <div
              aria-live="polite"
              className="text-xs text-[var(--text-muted)] font-mono ml-auto"
            >
              Elapsed: {elapsedSeconds}s
            </div>
          )}
        </div>

        {/* 3. Compact Data Notice directly under action bar, staying adjacent */}
        <div className="pt-1.5 pb-2 text-xs text-[var(--text-muted)] leading-normal flex flex-wrap items-baseline gap-1">
          <span>
            {selectedFiles.length > 0
              ? `${AI_DATA_NOTICE} ${AI_FILE_NOTICE}`
              : AI_DATA_NOTICE}
          </span>
          <Link
            href="/privacy"
            className="font-semibold text-[var(--color-primary)] underline underline-offset-2 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
          >
            Details
          </Link>
        </div>
      </div>

      <div className="space-y-4">
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
              <ul className="list-disc pl-4 space-y-0.5 text-xs opacity-90 border-t border-[var(--border)] pt-1.5 text-left">
                {transcribeWarnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            )}

            {isTooLong && (
              <p className="text-xs font-semibold text-[var(--color-tint-attention-accent)] border-t border-[var(--border)] pt-1 text-left">
                The combined text exceeds the limit by {(charCount - MAX_INPUT_CHARS).toLocaleString()} characters. Please edit or trim it before analyzing.
              </p>
            )}
          </div>
        )}

        {/* Textarea Area */}
        <div className="space-y-2 text-left">
          <label htmlFor="offer-text" className="sr-only">
            Paste or describe the offer or conversation
          </label>
          <textarea
            ref={textareaRef}
            id="offer-text"
            name="offer-text"
            rows={10}
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isAnalyzeDisabled) {
                e.preventDefault();
                onAnalyze();
              }
            }}
            readOnly={isLoading}
            aria-describedby="char-count-meta"
            aria-invalid={isTooLong || isTooShort}
            placeholder="Paste an offer, message or contract, or describe a conversation in your own words"
            className={`w-full h-64 sm:h-72 min-h-[14rem] max-h-[22rem] resize-y rounded-lg border p-3.5 text-xs sm:text-sm font-mono leading-relaxed transition-colors custom-scrollbar overflow-y-auto scroll-mb-24 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] bg-[var(--surface-muted)] text-[var(--text)] ${
              isLoading
                ? "opacity-60 cursor-not-allowed border-[var(--border)]"
                : isTooLong
                ? "border-[var(--color-tint-attention-border)] focus-visible:ring-[var(--color-tint-attention-border)]"
                : "border-[var(--border)] focus:border-[var(--text)]"
            }`}
          />
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            No document? Describe what happened in your own words. You can type or dictate it. Include who contacted you, how (call, WhatsApp, email), what they asked for, and any deadlines. Leave out names, phone numbers and ID numbers.
          </p>
        </div>

        {/* Dropzone & File List (Stay below the textarea) */}
        {FEATURES.documentUpload && (
          <div className="pt-4 border-t border-[var(--border)] space-y-3 text-left">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                Attach files (optional)
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
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
                <p className="text-xs opacity-75 font-mono">
                  Reference: {transcribeErrorCode || "TRANSCRIBE_ERROR"}
                </p>
              </div>
            )}

            {/* Action Row for Transcribe */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                {!isTranscribing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleTranscribe}
                      disabled={selectedFiles.length === 0 || isLoading}
                      className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-4 py-2 text-xs sm:text-sm font-medium shadow-xs hover:bg-[var(--color-primary-hover)] active:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
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
            <p className="text-xs opacity-75 font-mono">
              Reference: {errorState.code || errorState.type}
            </p>
          </div>
        )}

        {/* Mobile Sticky Action Bar (< 640px) */}
        {!isLoading && (
          <div
            className="sm:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md p-3 shadow-lg flex items-center justify-between gap-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
              {charCount.toLocaleString()} chars
            </span>
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzeDisabled}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-5 py-2.5 text-base font-semibold shadow-xs hover:bg-[var(--color-primary-hover)] active:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-40 min-h-[44px] flex-1 max-w-[200px]"
            >
              Analyze offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

