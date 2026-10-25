"use client";

import React from "react";
import Link from "next/link";
import {
  MAX_INPUT_CHARS,
  AI_DATA_NOTICE,
  AI_FILE_NOTICE,
} from "@/lib/config";
import {
  CHANNEL_LABELS,
  APPLIED_LABELS,
  ASKED_LABELS,
  PURPOSE_LABELS,
  DOCUMENT_LABELS,
  WizardStep,
} from "@/lib/combined-text";
import { useOfferSession } from "../SessionProvider";
import { CompanyResearchCard } from "../CompanyResearchCard";
import { ChevronDownIcon, SpinnerIcon } from "../Icons";

interface Step5ReviewProps {
  onGoToStep: (step: WizardStep) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  elapsedSeconds: number;
}

export function Step5Review({
  onGoToStep,
  onAnalyze,
  isLoading,
  elapsedSeconds,
}: Step5ReviewProps) {
  const {
    source,
    conversation,
    payment,
    offerText,
    combinedText,
    isReady,
    readyReason,
    selectedFiles,
  } = useOfferSession();

  const charCount = combinedText.length;
  const isTooLong = charCount > MAX_INPUT_CHARS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Left Column (8/12 on desktop): Step Summaries & Analyse Action */}
      <div className="lg:col-span-8 space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div>
              <h2 className="text-base font-semibold text-[var(--text)]">
                Review your details before analyzing
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Check each step below. You can edit any section before running the review.
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

          {/* Summaries list */}
          <div className="space-y-4">
            {/* Step 1 Summary */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                    Step 1.
                  </span>
                  <h3 className="text-xs font-bold text-[var(--text)]">Offer text</h3>
                </div>
                <div className="text-xs text-[var(--text-muted)] leading-relaxed font-mono line-clamp-3 bg-[var(--surface-muted)] p-2 rounded border border-[var(--border)]">
                  {offerText.trim() ? (
                    offerText.trim()
                  ) : (
                    <span className="italic text-[var(--text-muted)]">Not provided</span>
                  )}
                </div>
                {selectedFiles.length > 0 && (
                  <p className="text-[0.875rem] text-[var(--text-muted)]">
                    {selectedFiles.length} {selectedFiles.length === 1 ? "file" : "files"} attached
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(1)}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-2 min-h-[44px]"
              >
                Edit
              </button>
            </div>

            {/* Step 2 Summary */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                    Step 2.
                  </span>
                  <h3 className="text-xs font-bold text-[var(--text)]">Source</h3>
                </div>
                <div className="text-xs text-[var(--text-muted)] space-y-1">
                  <p>
                    <span className="font-medium text-[var(--text)]">Channel:</span>{" "}
                    {source.channel ? (
                      CHANNEL_LABELS[source.channel]
                    ) : (
                      <span className="italic">Not provided</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium text-[var(--text)]">You applied:</span>{" "}
                    {source.applied ? (
                      APPLIED_LABELS[source.applied]
                    ) : (
                      <span className="italic">Not provided</span>
                    )}
                  </p>
                  {source.note && (
                    <p>
                      <span className="font-medium text-[var(--text)]">Note:</span> {source.note}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-2 min-h-[44px]"
              >
                Edit
              </button>
            </div>

            {/* Step 3 Summary */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                    Step 3.
                  </span>
                  <h3 className="text-xs font-bold text-[var(--text)]">Call or conversation</h3>
                </div>
                <div className="text-xs text-[var(--text-muted)] leading-relaxed font-mono line-clamp-3 bg-[var(--surface-muted)] p-2 rounded border border-[var(--border)]">
                  {conversation.text.trim() ? (
                    conversation.text.trim()
                  ) : (
                    <span className="italic text-[var(--text-muted)]">Not provided</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(3)}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-2 min-h-[44px]"
              >
                Edit
              </button>
            </div>

            {/* Step 4 Summary */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                    Step 4.
                  </span>
                  <h3 className="text-xs font-bold text-[var(--text)]">Money and documents</h3>
                </div>
                <div className="text-xs text-[var(--text-muted)] space-y-1">
                  <p>
                    <span className="font-medium text-[var(--text)]">Asked to pay:</span>{" "}
                    {payment.asked ? (
                      ASKED_LABELS[payment.asked]
                    ) : (
                      <span className="italic">Not provided</span>
                    )}
                  </p>
                  {payment.purposes.length > 0 && (
                    <p>
                      <span className="font-medium text-[var(--text)]">Reason:</span>{" "}
                      {payment.purposes.map((p) => PURPOSE_LABELS[p]).join("; ")}
                    </p>
                  )}
                  {payment.amount && (
                    <p>
                      <span className="font-medium text-[var(--text)]">Amount:</span> {payment.amount}
                    </p>
                  )}
                  {payment.deadline && (
                    <p>
                      <span className="font-medium text-[var(--text)]">Deadline:</span> {payment.deadline}
                    </p>
                  )}
                  {payment.docsAsked.length > 0 && (
                    <p>
                      <span className="font-medium text-[var(--text)]">Documents asked:</span>{" "}
                      {payment.docsAsked.map((d) => DOCUMENT_LABELS[d]).join("; ")}
                    </p>
                  )}
                  {payment.docsShared.length > 0 && (
                    <p>
                      <span className="font-medium text-[var(--text)]">Documents shared:</span>{" "}
                      {payment.docsShared.map((d) => DOCUMENT_LABELS[d]).join("; ")}
                    </p>
                  )}
                  {payment.note && (
                    <p>
                      <span className="font-medium text-[var(--text)]">Note:</span> {payment.note}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(4)}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-2 min-h-[44px]"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Collapsible Read-only Preview of Combined Text */}
          <details className="group pt-2 border-t border-[var(--border)]">
            <summary className="cursor-pointer text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-between py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded list-none select-none min-h-[44px]">
              <span>Preview combined text to be analyzed</span>
              <ChevronDownIcon className="w-3.5 h-3.5 group-open:rotate-180 transition-transform duration-150" />
            </summary>
            <div className="pt-2">
              <pre className="max-h-60 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs font-mono text-[var(--text)] whitespace-pre-wrap break-words leading-relaxed custom-scrollbar">
                {combinedText.trim() ? combinedText : "(No content entered yet)"}
              </pre>
            </div>
          </details>

          {/* Primary Action Row with Data Notices */}
          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {!isLoading ? (
                  <button
                    type="button"
                    onClick={onAnalyze}
                    disabled={!isReady || isLoading}
                    className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-6 py-3 text-base font-semibold shadow-xs hover:bg-[var(--color-primary-hover)] active:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                  >
                    Analyze offer
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-6 py-3 text-base font-semibold cursor-wait min-h-[44px]"
                  >
                    <SpinnerIcon className="w-4 h-4 animate-spin text-[var(--color-primary-contrast)]" />
                    <span>Analyzing offer ({elapsedSeconds}s)...</span>
                  </button>
                )}

                {!isReady && readyReason && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5">
                    {readyReason}
                  </p>
                )}
              </div>
            </div>

            {/* Verbatim Data Notices */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] p-3.5 text-xs text-[var(--text-muted)] space-y-1.5">
              <div className="font-semibold text-[var(--text)]">Notice before analyzing</div>
              <p className="leading-relaxed">{AI_DATA_NOTICE}</p>
              <p className="leading-relaxed">{AI_FILE_NOTICE}</p>
              <Link
                href="/privacy"
                className="inline-block text-[var(--color-primary)] hover:underline pt-0.5 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
              >
                Read our full privacy policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (4/12 on desktop): Company Research Card Entry */}
      <aside className="lg:col-span-4 space-y-5">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
            Research the company (optional)
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            You will get a structured prompt with all the details filled after analysis.
          </p>
        </div>

        <CompanyResearchCard
          offerText={combinedText}
          level="optional"
          defaultCollapsed={true}
        />
      </aside>
    </div>
  );
}
