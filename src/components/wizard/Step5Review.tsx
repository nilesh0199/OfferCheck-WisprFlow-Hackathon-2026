"use client";

import React, { useState, useMemo } from "react";
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
  buildCombinedText,
} from "@/lib/combined-text";
import { useOfferSession } from "../SessionProvider";
import { CompanyResearchCard } from "../CompanyResearchCard";
import {
  SpinnerIcon,
  ShieldCheckIcon,
  HelpCircleIcon,
  XIcon,
  AttentionIcon,
} from "../Icons";
import {
  detectSensitiveEntities,
  buildPreviewSegments,
  applyRedactions,
} from "@/lib/scrubber";

interface Step5ReviewProps {
  onGoToStep: (step: WizardStep) => void;
  onAnalyze: (scrubbedTextOverride?: string) => void;
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

  // Client-side regex entity detection on Offer Text (Step 1)
  const offerEntities = useMemo(() => {
    return detectSensitiveEntities(offerText, "offer");
  }, [offerText]);

  // Client-side regex entity detection on Conversation Text (Step 3)
  const convEntities = useMemo(() => {
    return detectSensitiveEntities(conversation?.text || "", "conv");
  }, [conversation?.text]);

  const allEntities = useMemo(() => {
    return [...offerEntities, ...convEntities];
  }, [offerEntities, convEntities]);

  // Map of entity id -> boolean (true = redact, false = keep original)
  const [redactionState, setRedactionState] = useState<Record<string, boolean>>({});

  // Privacy popup disclosure
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);

  // Active counts across all fields
  const totalDetected = allEntities.length;
  const activeRedactedCount = useMemo(() => {
    return allEntities.filter((e) => redactionState[e.id] !== false).length;
  }, [allEntities, redactionState]);

  // Segments and scrubbed text for Step 1 Offer Text
  const offerSegments = useMemo(() => {
    return buildPreviewSegments(offerText, offerEntities, redactionState);
  }, [offerText, offerEntities, redactionState]);

  const scrubbedOfferText = useMemo(() => {
    return applyRedactions(offerText, offerEntities, redactionState);
  }, [offerText, offerEntities, redactionState]);

  // Segments and scrubbed text for Step 3 Conversation Text
  const convSegments = useMemo(() => {
    return buildPreviewSegments(conversation?.text || "", convEntities, redactionState);
  }, [conversation?.text, convEntities, redactionState]);

  const scrubbedConvText = useMemo(() => {
    return applyRedactions(conversation?.text || "", convEntities, redactionState);
  }, [conversation?.text, convEntities, redactionState]);

  // Combined scrubbed text for submission
  const scrubbedCombinedText = useMemo(() => {
    return buildCombinedText({
      offerText: scrubbedOfferText,
      source,
      conversation: {
        ...conversation,
        text: scrubbedConvText,
      },
      payment,
    }).text;
  }, [scrubbedOfferText, source, conversation, scrubbedConvText, payment]);

  const handleToggleEntity = (entityId: string) => {
    setRedactionState((prev) => {
      const currentState = prev[entityId] !== undefined ? prev[entityId] : true;
      return {
        ...prev,
        [entityId]: !currentState,
      };
    });
  };

  const handleRedactOffer = () => {
    setRedactionState((prev) => {
      const next = { ...prev };
      for (const e of offerEntities) next[e.id] = true;
      return next;
    });
  };

  const handleKeepOffer = () => {
    setRedactionState((prev) => {
      const next = { ...prev };
      for (const e of offerEntities) next[e.id] = false;
      return next;
    });
  };

  const handleRedactConv = () => {
    setRedactionState((prev) => {
      const next = { ...prev };
      for (const e of convEntities) next[e.id] = true;
      return next;
    });
  };

  const handleKeepConv = () => {
    setRedactionState((prev) => {
      const next = { ...prev };
      for (const e of convEntities) next[e.id] = false;
      return next;
    });
  };

  const isTooLong = combinedText.length > MAX_INPUT_CHARS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Left Column (8/12 on desktop): Step Summaries & Analyse Action */}
      <div className="lg:col-span-8 space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header: Focused on Privacy Shield rather than technical character boundaries */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div>
              <h2 className="text-base font-semibold text-[var(--text)]">
                Review your details before analyzing
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Check each step below. You can toggle sensitive details or edit any section before running the review.
              </p>
            </div>

            {/* Privacy Protection Badge replacing character boundary counter */}
            <div className="flex items-center gap-2">
              {totalDetected > 0 ? (
                <span
                  role="status"
                  aria-live="polite"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--tint-action-bg)] border border-[var(--color-tint-action-border)] text-[var(--color-primary)]"
                >
                  <ShieldCheckIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {activeRedactedCount} of {totalDetected} {totalDetected === 1 ? "item" : "items"} masked
                  </span>
                </span>
              ) : (
                <span
                  role="status"
                  aria-live="polite"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-muted)]"
                >
                  <ShieldCheckIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Client-side protected</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowPrivacyPopup((prev) => !prev)}
                aria-label="How client-side privacy masking works"
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px] min-w-[36px] inline-flex items-center justify-center transition-colors"
                title="Privacy shield info"
              >
                <HelpCircleIcon className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* Privacy Explanation Popup Modal / Banner */}
          {showPrivacyPopup && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="privacy-shield-title"
              className="rounded-xl border border-[var(--color-tint-action-border)] bg-[var(--tint-action-bg)] p-4 shadow-sm space-y-2.5 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                  <h4 id="privacy-shield-title" className="text-xs font-bold text-[var(--text)]">
                    Client-side Privacy Shield
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrivacyPopup(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-w-[28px] min-h-[28px] inline-flex items-center justify-center"
                  aria-label="Dismiss privacy info"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-[var(--text)] leading-relaxed">
                Your personal identifiers (names, phone numbers, email addresses, Aadhaar, PAN) are scrubbed directly on your device. Only the masked text is sent for AI analysis — your real identity never leaves your browser.
              </p>
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[var(--text-muted)] italic">
                  Click any highlighted badge in your offer or conversation text to mask or keep it.
                </span>
                <button
                  type="button"
                  onClick={() => setShowPrivacyPopup(false)}
                  className="px-3 py-1 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] font-medium hover:bg-[var(--color-primary-hover)] transition-colors min-h-[32px]"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Summaries list with Integrated Scrubber in Step 1 and Step 3 */}
          <div className="space-y-4">
            {/* Step 1 Summary with Top-Level Scrubber */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                    Step 1.
                  </span>
                  <h3 className="text-xs font-bold text-[var(--text)]">Offer text</h3>
                  {offerEntities.length > 0 ? (
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--tint-action-bg)] text-[var(--color-primary)] border border-[var(--color-tint-action-border)]">
                      {offerEntities.length} {offerEntities.length === 1 ? "identifier" : "identifiers"} found
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
                      0 identifiers found
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {offerEntities.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleRedactOffer}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] hover:bg-[var(--surface-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] transition-colors min-h-[36px]"
                      >
                        Redact all
                      </button>
                      <button
                        type="button"
                        onClick={handleKeepOffer}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] hover:bg-[var(--surface-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] transition-colors min-h-[36px]"
                      >
                        Keep all
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onGoToStep(1)}
                    className="text-xs font-medium text-[var(--color-primary)] hover:underline self-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-2 min-h-[36px]"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Interactive Visual Scrubber Preview for Step 1 */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Offer text with interactive privacy badges"
                className="max-h-60 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 text-xs font-mono text-[var(--text)] whitespace-pre-wrap break-words leading-relaxed custom-scrollbar focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                {offerText.trim() ? (
                  offerSegments.map((seg, idx) => {
                    if (seg.type === "text") {
                      return <span key={idx}>{seg.text}</span>;
                    }

                    const isRedacted = seg.isRedacted;
                    return (
                      <button
                        key={seg.entity.id}
                        type="button"
                        onClick={() => handleToggleEntity(seg.entity.id)}
                        title={
                          isRedacted
                            ? `Masked: "${seg.entity.original}" (${seg.entity.label}). Click to keep original.`
                            : `Original: "${seg.entity.original}". Click to mask with ${seg.entity.placeholder}.`
                        }
                        className={`inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded font-mono text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer ${
                          isRedacted
                            ? "bg-[var(--color-header-bg)] text-[var(--color-header-text)] border border-[var(--border-strong)] hover:opacity-85 shadow-2xs"
                            : "bg-[var(--tint-attention-bg)] text-[var(--tint-attention-text)] border border-[var(--tint-attention-border)] hover:opacity-85 shadow-2xs"
                        }`}
                      >
                        <span>{isRedacted ? seg.entity.placeholder : seg.entity.original}</span>
                        <span className="text-xs opacity-75 font-sans font-normal uppercase ml-0.5">
                          {isRedacted ? "Masked" : "Kept"}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <span className="italic text-[var(--text-muted)]">Not provided</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Click any highlighted tag to toggle masking.</span>
                  <span className="text-[var(--text-subtle)]">
                    Check for any sensitive info we may have missed.
                  </span>
                  {selectedFiles.length > 0 && (
                    <span className="italic">
                      ({selectedFiles.length} {selectedFiles.length === 1 ? "file" : "files"} attached)
                    </span>
                  )}
                </div>
                <span className="font-mono tabular-nums text-[0.875rem] shrink-0">
                  {scrubbedOfferText.length.toLocaleString()} characters
                </span>
              </div>
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

            {/* Step 3 Summary with Integrated Scrubber */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                    Step 3.
                  </span>
                  <h3 className="text-xs font-bold text-[var(--text)]">Call or conversation</h3>
                  {convEntities.length > 0 && (
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--tint-action-bg)] text-[var(--color-primary)] border border-[var(--color-tint-action-border)]">
                      {convEntities.length} {convEntities.length === 1 ? "identifier" : "identifiers"} found
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {convEntities.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleRedactConv}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] hover:bg-[var(--surface-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] transition-colors min-h-[36px]"
                      >
                        Redact all
                      </button>
                      <button
                        type="button"
                        onClick={handleKeepConv}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] hover:bg-[var(--surface-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] transition-colors min-h-[36px]"
                      >
                        Keep all
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onGoToStep(3)}
                    className="text-xs font-medium text-[var(--color-primary)] hover:underline self-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-2 min-h-[36px]"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Interactive Visual Scrubber Preview for Step 3 */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Conversation description with interactive privacy badges"
                className="max-h-52 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 text-xs font-mono text-[var(--text)] whitespace-pre-wrap break-words leading-relaxed custom-scrollbar focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                {conversation?.text?.trim() ? (
                  convSegments.map((seg, idx) => {
                    if (seg.type === "text") {
                      return <span key={idx}>{seg.text}</span>;
                    }

                    const isRedacted = seg.isRedacted;
                    return (
                      <button
                        key={seg.entity.id}
                        type="button"
                        onClick={() => handleToggleEntity(seg.entity.id)}
                        title={
                          isRedacted
                            ? `Masked: "${seg.entity.original}" (${seg.entity.label}). Click to keep original.`
                            : `Original: "${seg.entity.original}". Click to mask with ${seg.entity.placeholder}.`
                        }
                        className={`inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded font-mono text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer ${
                          isRedacted
                            ? "bg-[var(--color-header-bg)] text-[var(--color-header-text)] border border-[var(--border-strong)] hover:opacity-85 shadow-2xs"
                            : "bg-[var(--tint-attention-bg)] text-[var(--tint-attention-text)] border border-[var(--tint-attention-border)] hover:opacity-85 shadow-2xs"
                        }`}
                      >
                        <span>{isRedacted ? seg.entity.placeholder : seg.entity.original}</span>
                        <span className="text-xs opacity-75 font-sans font-normal uppercase ml-0.5">
                          {isRedacted ? "Masked" : "Kept"}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <span className="italic text-[var(--text-muted)]">Not provided</span>
                )}
              </div>

              {conversation?.text?.trim() && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] pt-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Click any highlighted tag to toggle masking.</span>
                    <span className="text-[var(--text-subtle)]">
                      Check for any sensitive info we may have missed.
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-[0.875rem] shrink-0">
                    {scrubbedConvText.length.toLocaleString()} characters
                  </span>
                </div>
              )}
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

          {/* Character limit warning if applicable */}
          {isTooLong && (
            <p
              role="alert"
              className="text-xs font-bold text-[var(--color-danger-text)] inline-flex items-center gap-1.5 pt-2"
            >
              <AttentionIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                Combined text exceeds {MAX_INPUT_CHARS.toLocaleString()} characters. Please shorten it before analyzing.
              </span>
            </p>
          )}

          {/* Primary Action Row with Data Notices */}
          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {!isLoading ? (
                  <button
                    type="button"
                    onClick={() =>
                      onAnalyze(activeRedactedCount > 0 ? scrubbedCombinedText : undefined)
                    }
                    disabled={!isReady || isLoading || isTooLong}
                    className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-6 py-3 text-base font-semibold shadow-xs hover:bg-[var(--color-primary-hover)] active:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                  >
                    {activeRedactedCount > 0
                      ? "Analyze offer (with privacy mask)"
                      : "Analyze offer"}
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

                {activeRedactedCount > 0 && (
                  <p className="text-xs text-[var(--color-primary)] font-medium mt-1.5 inline-flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {activeRedactedCount} {activeRedactedCount === 1 ? "detail" : "details"} will be masked before reaching the AI.
                    </span>
                  </p>
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
          offerText={scrubbedCombinedText}
          level="optional"
          defaultCollapsed={true}
        />
      </aside>
    </div>
  );
}
