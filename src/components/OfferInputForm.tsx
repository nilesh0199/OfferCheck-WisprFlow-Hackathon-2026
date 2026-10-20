import React from "react";
import {
  MAX_INPUT_CHARS,
  MIN_INPUT_CHARS,
  AI_DATA_NOTICE,
} from "@/lib/config";
import { SamplePicker } from "./SamplePicker";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Sample picker */}
      <SamplePicker
        currentText={offerText}
        onSelectSample={(sampleText) => setOfferText(sampleText)}
        disabled={isLoading}
      />

      {/* Input container */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <label
            htmlFor="offer-text"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Paste internship offer or communication text
          </label>
          <span
            aria-live="polite"
            aria-atomic="true"
            className={`text-xs font-mono tabular-nums ${
              isTooLong
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : charCount > MAX_INPUT_CHARS - 500
                ? "text-amber-600 dark:text-amber-400"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}{" "}
            characters
          </span>
        </div>

        {/* Compact privacy note */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <span aria-hidden="true" className="select-none">
            🔒
          </span>
          <span>
            Remove names, phone numbers, addresses, bank details and ID numbers
            before pasting.
          </span>
        </p>

        {/* Textarea */}
        <textarea
          id="offer-text"
          name="offer-text"
          rows={9}
          value={offerText}
          onChange={(e) => setOfferText(e.target.value)}
          readOnly={isLoading}
          aria-describedby="privacy-compact-note ai-notice char-warning"
          aria-invalid={isTooLong || isTooShort}
          placeholder="Paste the email, message, or written offer letter text here (without personal identity details)..."
          className={`w-full rounded-xl border p-3.5 text-xs sm:text-sm font-mono leading-relaxed transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-zinc-900 ${
            isLoading
              ? "bg-zinc-100 text-zinc-500 cursor-not-allowed dark:bg-zinc-900/60 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
              : isTooLong
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950/50 text-zinc-900 dark:text-zinc-100"
              : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-200 dark:border-zinc-700 dark:focus:border-zinc-300 dark:focus:ring-zinc-800 text-zinc-900 dark:text-zinc-100"
          }`}
        />

        {/* Validation Warning or Guidance */}
        <div id="char-warning" className="min-h-[1.25rem] text-xs">
          {disabledReason && (
            <p className="text-zinc-500 dark:text-zinc-400">{disabledReason}</p>
          )}
        </div>
      </div>

      {/* Action panel & AI notice */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
        {/* Buttons and AI Notice side-by-side */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {!isLoading ? (
              <>
                <button
                  type="submit"
                  disabled={isAnalyzeDisabled}
                  className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-zinc-800 active:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 min-h-[44px]"
                >
                  Analyze offer
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isEmpty && !offerText}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 active:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 min-h-[44px]"
                >
                  Clear
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white cursor-wait dark:bg-zinc-200 dark:text-zinc-900 min-h-[44px]"
                >
                  <span
                    className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-white"
                    aria-hidden="true"
                  />
                  <span>Analyzing...</span>
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 active:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* AI Data Notice (must stay visible, not collapsed) */}
          <div
            id="ai-notice"
            className="sm:max-w-xs text-2xs text-zinc-500 dark:text-zinc-400 leading-normal"
          >
            {AI_DATA_NOTICE}
          </div>
        </div>

        {/* Loading Progress and Live Announcement */}
        {isLoading && (
          <div
            aria-live="polite"
            className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2"
          >
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">
                Evaluating offer terms... (Elapsed: {elapsedSeconds}s)
              </span>
              <span>This can take up to a minute.</span>
            </div>
            {/* Calm indeterminate progress bar */}
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
              role="progressbar"
              aria-label="Analysis in progress"
            >
              <div className="h-full w-2/5 animate-pulse rounded-full bg-zinc-600 dark:bg-zinc-400" />
            </div>
          </div>
        )}

        {/* Short line under the button */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
          OfferCheck reviews pasted text only. It cannot confirm that a sender
          is genuine.
        </div>
      </div>
    </form>
  );
}
