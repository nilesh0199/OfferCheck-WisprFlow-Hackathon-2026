"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useOfferSession } from "@/components/SessionProvider";
import { AskReviewContext, AskResourceId } from "@/lib/ask/schema";
import { VERIFICATION_RESOURCES, VerificationResource } from "@/data/verification-resources";
import { ResourceCard } from "@/components/ResourceCard";
import { ExternalLinkIcon, InfoIcon } from "@/components/Icons";

const EXAMPLE_CARDS = [
  "I paid Rs 2,000 for a course that was sold as an internship. What should I do now?",
  "They asked for my Aadhaar and bank details before giving an offer letter. What should I check first?",
  "How do I check whether a company is registered?",
  "I got an offer on WhatsApp and I did not apply. What should I check?",
];

export function AskClient() {
  const {
    askThread,
    askLoading,
    askError,
    sendAskQuestion,
    cancelAskQuestion,
    clearAskThread,
    analysis,
    offerText,
  } = useOfferSession();

  const [inputQuestion, setInputQuestion] = useState("");
  const [includeContext, setIncludeContext] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRegionRef = useRef<HTMLDivElement>(null);
  const latestUserMessageRef = useRef<HTMLDivElement>(null);
  const latestAssistantMessageRef = useRef<HTMLDivElement>(null);
  const prevThreadLengthRef = useRef(askThread.length);

  const hasSessionReview = Boolean(analysis || (offerText && offerText.trim().length > 0));
  const userTurnCount = askThread.filter((m) => m.role === "user").length;
  const isThreadFull = userTurnCount >= 6;
  const isTooLong = inputQuestion.length > 1500;
  const canSubmit = inputQuestion.trim().length > 0 && !isTooLong && !askLoading && !isThreadFull;

  // Auto-grow textarea height from 1 to 6 lines (internal scroll after 144px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 144);
    el.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [inputQuestion]);

  // Handle scroll behavior:
  // - on user send: scroll to user message
  // - on assistant reply: scroll to top of assistant answer
  useEffect(() => {
    const prevLength = prevThreadLengthRef.current;
    const currentLength = askThread.length;
    prevThreadLengthRef.current = currentLength;

    if (currentLength === 0) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    const lastMsg = askThread[currentLength - 1];
    if (lastMsg.role === "user") {
      latestUserMessageRef.current?.scrollIntoView({ behavior, block: "nearest" });
    } else if (lastMsg.role === "assistant" && currentLength > prevLength) {
      latestAssistantMessageRef.current?.scrollIntoView({ behavior, block: "start" });
    }
  }, [askThread]);

  const handleSubmit = useCallback(async () => {
    const trimmed = inputQuestion.trim();
    if (!trimmed || askLoading || isThreadFull || isTooLong) return;

    let reviewContext: AskReviewContext | undefined;
    if (includeContext && analysis) {
      reviewContext = {
        categories: analysis.concerns.map((c) => c.category),
        topics: analysis.missingInfo.map((m) => m.topic),
        verificationQuestions: analysis.verificationQuestions.map((q) => q.question),
      };
    }

    setInputQuestion("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.focus();
    }

    await sendAskQuestion(trimmed, reviewContext);
    textareaRef.current?.focus();
  }, [inputQuestion, askLoading, isThreadFull, isTooLong, includeContext, analysis, sendAskQuestion]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Guard against sending while an IME is composing (e.g. Indic typing tools)
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCardClick = (cardText: string) => {
    setInputQuestion(cardText);
    textareaRef.current?.focus();
  };

  const handleConfirmClear = () => {
    clearAskThread();
    setShowClearConfirm(false);
    setInputQuestion("");
    textareaRef.current?.focus();
  };

  const resolveResource = (id: AskResourceId): VerificationResource | null => {
    if (id === "cybercrime" || id === "aicte" || id === "ncs" || id === "mca") {
      return VERIFICATION_RESOURCES.find((r) => r.id === id) || null;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] bg-[var(--bg)] text-[var(--text)] transition-colors overflow-hidden">
      {/* Zone 1: Compact Header Row */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] shrink-0 px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-serif text-[var(--text)] leading-snug">
              Clear doubt with AI
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">
              Describe your situation or question in your own words. Dictate it or type it.
            </p>
          </div>

          {askThread.length > 0 && (
            <div className="shrink-0">
              {showClearConfirm ? (
                <div className="inline-flex items-center gap-1.5 p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xs">
                  <span className="text-xs text-[var(--text-muted)] pl-1.5">Clear thread?</span>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="px-2.5 py-1 rounded bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs font-semibold min-h-[36px]"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text)] min-h-[36px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Zone 2: Scrollable Thread Region */}
      <div
        ref={scrollRegionRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 focus:outline-none"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Empty State with 2x2 Question Cards */}
          {askThread.length === 0 && (
            <div className="space-y-6 pt-4 sm:pt-8 text-center sm:text-left">
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-serif text-[var(--text)]">
                  Have a question or confusing offer detail?
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Select an example below to fill the composer, or type your own question.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {EXAMPLE_CARDS.map((cardText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCardClick(cardText)}
                    className="text-left p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)] hover:bg-[var(--surface-muted)] hover:border-[var(--color-primary)]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] shadow-2xs leading-relaxed"
                  >
                    {cardText}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Messages */}
          {askThread.map((msg, index) => {
            const isLastMessage = index === askThread.length - 1;
            const isLastAssistant =
              msg.role === "assistant" &&
              (isLastMessage || index === askThread.length - 2);

            if (msg.role === "user") {
              return (
                <div
                  key={msg.id}
                  ref={isLastMessage ? latestUserMessageRef : undefined}
                  className="flex justify-end"
                >
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-[4px] bg-[var(--surface-alt)] border border-[var(--border)] p-4 text-sm sm:text-base text-[var(--text)] break-words shadow-2xs leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              );
            }

            if (!msg.data) return null;

            return (
              <div
                key={msg.id}
                ref={isLastAssistant ? latestAssistantMessageRef : undefined}
                className="flex justify-start"
              >
                <article
                  className="w-full rounded-xl bg-[var(--surface)] border border-[var(--border)] p-5 sm:p-6 space-y-5 shadow-xs break-words"
                  aria-label="Guidance answer"
                >
                  {/* Fallback indicator: always visible when offline/fallback answered */}
                  {typeof msg.data.summary === "string" &&
                    msg.data.summary.includes("The AI service is unavailable right now, so this is general guidance.") && (
                      <div
                        data-testid="ask-fallback-indicator"
                        role="status"
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-muted)] flex items-center gap-2"
                      >
                        <InfoIcon className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                        <span className="font-medium text-[var(--text)]">
                          The AI service is unavailable right now, so this is general guidance.
                        </span>
                      </div>
                    )}

                  {/* Summary */}
                  <div className="border-b border-[var(--border)] pb-3">
                    <p className="text-base sm:text-lg font-serif text-[var(--text)] leading-snug">
                      {msg.data.summary}
                    </p>
                  </div>

                  {/* What this may mean */}
                  {msg.data.whatThisMayMean && msg.data.whatThisMayMean.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-semibold text-[var(--text)]">
                        What this may mean
                      </h2>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                        {msg.data.whatThisMayMean.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What to do now */}
                  {msg.data.doNow && msg.data.doNow.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-semibold text-[var(--text)]">
                        What to do now
                      </h2>
                      <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text)] leading-relaxed font-medium">
                        {msg.data.doNow.map((item, idx) => (
                          <li key={idx} className="text-[var(--text)]">
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* What to ask or check */}
                  {msg.data.askOrCheck && msg.data.askOrCheck.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-sm font-semibold text-[var(--text)]">
                        What to ask or check
                      </h2>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                        {msg.data.askOrCheck.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Clarifying Question */}
                  {msg.data.clarifyingQuestion && (
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 space-y-1">
                      <p className="text-xs font-semibold text-[var(--text)]">
                        To give more specific guidance:
                      </p>
                      <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                        {msg.data.clarifyingQuestion}
                      </p>
                    </div>
                  )}

                  {/* Verified Official Resources */}
                  {msg.data.resources && msg.data.resources.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                      <h2 className="text-sm font-semibold text-[var(--text)]">
                        Verified official resources
                      </h2>
                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.data.resources.map((resId) => {
                          const resolved = resolveResource(resId);
                          if (resolved) {
                            return (
                              <ResourceCard
                                key={resolved.id}
                                resource={resolved}
                                isCollapsible
                                defaultExpanded={false}
                              />
                            );
                          }
                          if (resId === "research_prompt") {
                            return (
                              <div
                                key={resId}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div>
                                  <p className="font-semibold text-[var(--text)]">
                                    Company research prompt
                                  </p>
                                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    Run a verification query on Perplexity to search official public records.
                                  </p>
                                </div>
                                <Link
                                  href="/check#section-research"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--surface-muted)] min-h-[44px]"
                                >
                                  <span>View prompt</span>
                                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            );
                          }
                          if (resId === "advisories") {
                            return (
                              <div
                                key={resId}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div>
                                  <p className="font-semibold text-[var(--text)]">
                                    Official university advisories
                                  </p>
                                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    Guidelines published by IITs and engineering colleges regarding placement safety.
                                  </p>
                                </div>
                                <Link
                                  href="/resources#section-advisories"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--surface-muted)] min-h-[44px]"
                                >
                                  <span>View advisories</span>
                                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            );
                          }
                          if (resId === "resources_page") {
                            return (
                              <div
                                key={resId}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div>
                                  <p className="font-semibold text-[var(--text)]">
                                    Help and reporting page
                                  </p>
                                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    Official reporting channels, post-payment steps, and contact numbers.
                                  </p>
                                </div>
                                <Link
                                  href="/resources"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--surface-muted)] min-h-[44px]"
                                >
                                  <span>Open page</span>
                                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            );
                          }
                          if (resId === "check_page") {
                            return (
                              <div
                                key={resId}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div>
                                  <p className="font-semibold text-[var(--text)]">
                                    Review an offer letter
                                  </p>
                                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    Paste a complete offer or contract to evaluate all terms step by step.
                                  </p>
                                </div>
                                <Link
                                  href="/check"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--surface-muted)] min-h-[44px]"
                                >
                                  <span>Check offer</span>
                                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fixed Guidance Disclaimer */}
                  <div className="pt-3 border-t border-[var(--border)] space-y-1 text-xs text-[var(--text-muted)]">
                    <p>
                      This is general guidance based on what you wrote. It is not legal advice, and OfferClara cannot verify the standing of an offer or sender.
                    </p>
                    <p>
                      AI can make mistakes. Please verify facts through official portals.
                    </p>
                  </div>
                </article>
              </div>
            );
          })}

          {/* Loading State: calm text only, no spinner, cancel button */}
          {askLoading && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text-muted)] shadow-2xs">
                <span>Thinking...</span>
                <button
                  type="button"
                  onClick={cancelAskQuestion}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs py-1 px-1.5 min-h-[36px] inline-flex items-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Calm Error State */}
          {askError && (
            <div
              role="alert"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 space-y-3 shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-xs sm:text-sm text-[var(--text)]">
                    {askError.message}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Reference code: {askError.code}
                  </p>
                </div>
              </div>
              <div className="pt-1 flex flex-wrap gap-2">
                <Link
                  href="/resources"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors min-h-[44px]"
                >
                  Open Help and reporting
                </Link>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={askLoading}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs sm:text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors min-h-[44px] disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Docked Bottom Composer */}
      <div
        className="border-t border-[var(--border)] bg-[var(--surface)] shrink-0 px-4 py-3 sm:px-6 transition-all"
        style={{
          paddingBottom: "calc(var(--dock-offset, 0px) + env(safe-area-inset-bottom, 0px) + 0.5rem)",
        }}
      >
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Top Controls: Examples Disclosure + Context Checkbox */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {askThread.length > 0 && !isThreadFull && (
              <details className="group">
                <summary className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text)] select-none list-none inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs py-1">
                  <span className="font-medium">Examples</span>
                  <span className="text-[0.625rem] transition-transform group-open:rotate-180" aria-hidden="true">
                    ▾
                  </span>
                </summary>
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXAMPLE_CARDS.map((cardText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCardClick(cardText)}
                      className="text-left p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors min-h-[44px]"
                    >
                      {cardText}
                    </button>
                  ))}
                </div>
              </details>
            )}

            {hasSessionReview && (
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={includeContext}
                  onChange={(e) => setIncludeContext(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--focus-ring)]"
                />
                <span>Use my current review as context</span>
              </label>
            )}
          </div>

          {/* Composer Input Box */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2 focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-colors shadow-2xs">
            <textarea
              ref={textareaRef}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={askLoading || isThreadFull}
              placeholder="Describe your situation or question... (dictate or type)"
              rows={1}
              aria-label="Describe your situation or question"
              className="w-full bg-transparent px-2 py-1 text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/60 focus:outline-none resize-none leading-relaxed overflow-y-auto"
              style={{ minHeight: "44px", maxHeight: "144px" }}
            />

            <div className="flex items-center justify-between gap-3 pt-1 px-1">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="font-mono tabular-nums">
                  {inputQuestion.length}/1,500
                </span>
                {isTooLong && (
                  <span className="text-[var(--color-danger-text)] font-medium">
                    Question exceeds 1,500 characters.
                  </span>
                )}
                {isThreadFull && (
                  <span className="text-[var(--text-muted)]">
                    6-question limit reached.
                  </span>
                )}
              </div>

              {askLoading ? (
                <button
                  type="button"
                  onClick={cancelAskQuestion}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors min-h-[44px] min-w-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  aria-label="Ask"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs sm:text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span className="hidden sm:inline ml-1.5">Ask</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Data Notice & Details Link */}
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
            <span>
              Answers stay in tab memory.{" "}
              <Link
                href="/privacy"
                className="underline hover:text-[var(--text)] transition-colors"
              >
                Details
              </Link>
            </span>
            <span className="hidden sm:inline">
              Press Enter to ask, Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
