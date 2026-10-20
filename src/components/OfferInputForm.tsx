import React from "react";
import {
  MAX_INPUT_CHARS,
  MIN_INPUT_CHARS,
  AI_DATA_NOTICE,
} from "@/lib/config";
import { SamplePicker } from "./SamplePicker";
import { LockIcon, SpinnerIcon } from "./Icons";

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
  const charCount = offerText.length;
  const trimmed = offerText.trim();
  const isEmpty = trimmed.length === 0;
  const isTooShort = !isEmpty && trimmed.length < MIN_INPUT_CHARS;
  const isTooLong = charCount > MAX_INPUT_CHARS;

  const isAnalyzeDisabled = isEmpty || isTooShort || isTooLong || isLoading;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnalyzeDisabled) {
      onAnalyze();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* Header with Title and Sample Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <h2
            id="offer-text-heading"
            className="text-base font-semibold text-[var(--text)]"
          >
            Offer text
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Paste the raw message, email, or offer letter below.
          </p>
        </div>

        <SamplePicker
          currentText={offerText}
          onSelectSample={(sampleText) => setOfferText(sampleText)}
          disabled={isLoading}
        />
      </div>

      {/* Textarea Area */}
      <div className="space-y-2">
        <label htmlFor="offer-text" className="sr-only">
          Paste internship offer or communication text
        </label>
        <textarea
          id="offer-text"
          name="offer-text"
          rows={10}
          value={offerText}
          onChange={(e) => setOfferText(e.target.value)}
          readOnly={isLoading}
          aria-describedby="char-count-meta privacy-callout"
          aria-invalid={isTooLong || isTooShort}
          placeholder="Paste the written offer letter, email, or chat message here..."
          className={`w-full rounded-lg border p-3.5 text-xs sm:text-sm font-mono leading-relaxed transition-colors custom-scrollbar focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] bg-[var(--surface-muted)] text-[var(--text)] ${
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

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
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

      {/* ONE info callout with lock icon containing privacy reminder, AI_DATA_NOTICE, and tool limitation */}
      <div
        id="privacy-callout"
        className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 text-xs text-[var(--text-muted)] space-y-2"
      >
        <div className="flex items-start gap-2.5 text-[var(--text)]">
          <LockIcon className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
          <div className="space-y-1.5 leading-relaxed">
            <p className="font-semibold text-2xs sm:text-xs">
              Privacy and data handling
            </p>
            <p>
              Remove names, phone numbers, addresses, bank details, ID numbers, passwords, and one-time passwords (OTPs) before pasting.
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
  );
}
