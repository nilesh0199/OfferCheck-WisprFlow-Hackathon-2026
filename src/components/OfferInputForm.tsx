"use client";

import React from "react";
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
    activeTab,
    setActiveTab,
    selectedFiles,
    addSelectedFiles,
    removeSelectedFile,
    clearSelectedFiles,
    transcribeStatus,
    isTranscribing,
    transcribeError,
    transcribeWarnings,
    transcribeElapsedSeconds,
    transcriptBannerDismissed,
    handleTranscribe,
    handleCancelTranscribe,
    dismissTranscriptBanner,
  } = useOfferSession();

  const charCount = offerText.length;
  const trimmed = offerText.trim();
  const isEmpty = trimmed.length === 0;
  const isTooShort = !isEmpty && trimmed.length < MIN_INPUT_CHARS;
  const isTooLong = charCount > MAX_INPUT_CHARS;

  const isAnalyzeDisabled = isEmpty || isTooShort || isTooLong || isLoading || isTranscribing;

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
      {/* Tab Switcher (if documentUpload feature is enabled) */}
      {FEATURES.documentUpload ? (
        <div className="space-y-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2
                id="offer-text-heading"
                className="text-base font-semibold text-[var(--text)]"
              >
                Offer input
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Paste offer text or upload screenshots and PDFs.
              </p>
            </div>
          </div>

          {/* Segmented Control */}
          <div
            role="tablist"
            aria-label="Input method"
            className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-1 text-xs font-medium w-full sm:w-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "paste"}
              aria-controls="paste-tab-panel"
              id="tab-paste"
              onClick={() => setActiveTab("paste")}
              disabled={isLoading || isTranscribing}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px] ${
                activeTab === "paste"
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <span>Paste text</span>
              {offerText.length > 0 && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary-ledger)]" />
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "upload"}
              aria-controls="upload-tab-panel"
              id="tab-upload"
              onClick={() => setActiveTab("upload")}
              disabled={isLoading || isTranscribing}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px] ${
                activeTab === "upload"
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <span>Upload files</span>
              {selectedFiles.length > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] px-1.5 text-2xs tabular-nums text-[var(--text)] font-semibold">
                  {selectedFiles.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "paste" && (
            <SamplePicker
              currentText={offerText}
              onSelectSample={(sampleText) => setOfferText(sampleText)}
              disabled={isLoading || isTranscribing}
            />
          )}
        </div>
      ) : (
        /* Legacy Header without tabs */
        <div className="space-y-3 pb-3 border-b border-[var(--border)]">
          <div>
            <h2
              id="offer-text-heading"
              className="text-base font-semibold text-[var(--text)]"
            >
              Offer text
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Paste the raw message, email, or offer letter below.
            </p>
          </div>

          <SamplePicker
            currentText={offerText}
            onSelectSample={(sampleText) => setOfferText(sampleText)}
            disabled={isLoading}
          />
        </div>
      )}

      {/* TAB PANEL 1: PASTE TEXT */}
      {activeTab === "paste" && (
        <form
          id="paste-tab-panel"
          role="tabpanel"
          aria-labelledby="tab-paste"
          onSubmit={handleAnalyzeSubmit}
          className="space-y-4"
        >
          {/* Post-transcription Banner */}
          {transcribeStatus === "success" && !transcriptBannerDismissed && (
            <div
              role="status"
              className="rounded-lg border border-[var(--border)] bg-[var(--tint-attention-bg)] p-3.5 text-xs text-[var(--tint-attention-text)] space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-semibold text-2xs sm:text-xs">
                    Text extracted from your files
                  </p>
                  <p>
                    Review and edit the text below before analyzing. Crop or remove personal details, phone numbers, and account numbers first.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismissTranscriptBanner}
                  aria-label="Dismiss extracted text notice"
                  className="rounded p-1 text-[var(--tint-attention-text)] hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {transcribeWarnings.length > 0 && (
                <ul className="list-disc pl-4 space-y-0.5 text-2xs opacity-90 border-t border-[var(--border)] pt-1.5">
                  {transcribeWarnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Textarea Area */}
          <div className="space-y-2">
            <label htmlFor="offer-text" className="sr-only">
              Paste the internship or job offer
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

          {/* Privacy Callout */}
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
      )}

      {/* TAB PANEL 2: UPLOAD FILES */}
      {activeTab === "upload" && (
        <div
          id="upload-tab-panel"
          role="tabpanel"
          aria-labelledby="tab-upload"
          className="space-y-4"
        >
          {/* Dropzone */}
          <FileUploadDropzone
            onFilesSelected={addSelectedFiles}
            currentCount={selectedFiles.length}
            disabled={isTranscribing}
          />

          {/* Selected File List */}
          <SelectedFileList
            files={selectedFiles}
            onRemove={removeSelectedFile}
            onClearAll={clearSelectedFiles}
            disabled={isTranscribing}
          />

          {/* Transcription Error Alert */}
          {transcribeError && (
            <div
              role="alert"
              className="rounded-lg border border-[var(--border)] bg-[var(--tint-attention-bg)] p-3 text-xs text-[var(--tint-attention-text)]"
            >
              {transcribeError}
            </div>
          )}

          {/* Action Row for Upload */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              {!isTranscribing ? (
                <>
                  <button
                    type="button"
                    onClick={handleTranscribe}
                    disabled={selectedFiles.length === 0}
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs hover:opacity-90 active:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity min-h-[44px]"
                  >
                    Extract text from files
                  </button>
                  <button
                    type="button"
                    onClick={clearSelectedFiles}
                    disabled={selectedFiles.length === 0}
                    className="inline-flex items-center justify-center rounded-lg border border-transparent px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-30 min-h-[44px]"
                  >
                    Clear files
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
                    <span>Extracting text...</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelTranscribe}
                    className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
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

          {/* AI File Privacy Notice */}
          <div
            id="file-privacy-callout"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 text-xs text-[var(--text-muted)] space-y-2"
          >
            <div className="flex items-start gap-2.5 text-[var(--text)]">
              <LockIcon className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
              <div className="space-y-1.5 leading-relaxed">
                <p className="font-semibold text-2xs sm:text-xs">
                  File privacy and data handling
                </p>
                <p className="text-2xs opacity-90">
                  {AI_FILE_NOTICE}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
