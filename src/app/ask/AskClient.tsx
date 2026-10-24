"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { useOfferSession } from "@/components/SessionProvider";
import { AskReviewContext, AskResourceId } from "@/lib/ask/schema";
import { VERIFICATION_RESOURCES, VerificationResource } from "@/data/verification-resources";
import { ResourceCard } from "@/components/ResourceCard";
import {
  ExternalLinkIcon,
  SpinnerIcon,
  InfoIcon,
} from "@/components/Icons";

const EXAMPLE_CHIPS = [
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
    clearAskThread,
    analysis,
    offerText,
  } = useOfferSession();

  const [inputQuestion, setInputQuestion] = useState("");
  const [includeContext, setIncludeContext] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const hasSessionReview = Boolean(analysis || (offerText && offerText.trim().length > 0));
  const userTurnCount = askThread.filter((m) => m.role === "user").length;
  const isThreadFull = userTurnCount >= 6;

  // Auto-scroll to bottom of thread when new message arrives
  useEffect(() => {
    if (askThread.length > 0) {
      threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [askThread.length, askLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputQuestion.trim();
    if (!trimmed || askLoading || isThreadFull) return;

    let reviewContext: AskReviewContext | undefined;
    if (includeContext && analysis) {
      reviewContext = {
        categories: analysis.concerns.map((c) => c.category),
        topics: analysis.missingInfo.map((m) => m.topic),
        verificationQuestions: analysis.verificationQuestions.map((q) => q.question),
      };
    }

    setInputQuestion("");
    await sendAskQuestion(trimmed, reviewContext);
  };

  const handleChipClick = (chipText: string) => {
    setInputQuestion(chipText);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleConfirmClear = () => {
    clearAskThread();
    setShowClearConfirm(false);
    setInputQuestion("");
  };

  // Resolve resource identifiers into VerificationResource objects
  const resolveResource = (id: AskResourceId): VerificationResource | null => {
    if (id === "cybercrime" || id === "aicte" || id === "ncs" || id === "mca") {
      return VERIFICATION_RESOURCES.find((r) => r.id === id) || null;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between overflow-x-hidden transition-colors">
      <main className="flex-1 py-8 sm:py-12 space-y-8 sm:space-y-12">
        <Container className="space-y-8 max-w-4xl">
          {/* Header */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[var(--color-highlight)]" />
              <span>Independent inquiry helper</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl sm:text-4xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
                Clear doubt with AI
              </h1>
              {askThread.length > 0 && (
                <div className="self-center sm:self-auto">
                  {showClearConfirm ? (
                    <div className="inline-flex items-center gap-2 p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                      <span className="text-xs text-[var(--text-muted)] pl-2">Clear thread?</span>
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
                      className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Describe your situation or question in your own words. Dictate it or type it.
            </p>
          </div>

          {/* Conversation Thread */}
          {askThread.length > 0 && (
            <div className="space-y-6" aria-label="Conversation thread" role="region">
              {askThread.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-2xl rounded-2xl rounded-br-xs bg-[var(--surface-muted)] border border-[var(--border)] p-4 sm:p-5 text-sm sm:text-base text-[var(--text)] shadow-2xs break-words">
                        <p className="font-semibold text-xs text-[var(--text-muted)] mb-1">
                          You asked
                        </p>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ) : msg.data ? (
                    <div className="flex justify-start">
                      <div className="w-full rounded-2xl rounded-bl-xs bg-[var(--surface)] border border-[var(--border)] p-5 sm:p-7 space-y-6 shadow-xs break-words" aria-live="polite">
                        {/* Summary */}
                        <div className="space-y-1.5 border-b border-[var(--border)] pb-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-medium text-[var(--text-muted)]">
                              Guidance {msg.data.language === "hi" ? "(Hindi / हिंदी)" : "(English)"}
                            </span>
                          </div>
                          <p className="text-base sm:text-lg font-serif text-[var(--text)] leading-snug">
                            {msg.data.summary}
                          </p>
                        </div>

                        {/* What this may mean */}
                        {msg.data.whatThisMayMean && msg.data.whatThisMayMean.length > 0 && (
                          <div className="space-y-2">
                            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
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
                            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
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
                            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                              What to ask or check
                            </h2>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                              {msg.data.askOrCheck.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Clarifying question if any */}
                        {msg.data.clarifyingQuestion && (
                          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4 space-y-1">
                            <p className="text-xs font-mono font-semibold text-[var(--text-muted)]">
                              To give more specific guidance:
                            </p>
                            <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                              {msg.data.clarifyingQuestion}
                            </p>
                          </div>
                        )}

                        {/* Verified Resources */}
                        {msg.data.resources && msg.data.resources.length > 0 && (
                          <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                            <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                              Verified official resources
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
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
                                if (resId === "advisories") {
                                  return (
                                    <div
                                      key={resId}
                                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs"
                                    >
                                      <div>
                                        <p className="font-semibold text-[var(--text)]">
                                          Official university and institute advisories
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                          Advisories published by IITs and colleges regarding recruitment safety.
                                        </p>
                                      </div>
                                      <Link
                                        href="/resources#section-advisories"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--surface-muted)] min-h-[44px]"
                                      >
                                        <span>View</span>
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
                                          Official reporting channels, post-payment steps, and contacts.
                                        </p>
                                      </div>
                                      <Link
                                        href="/resources"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--surface-muted)] min-h-[44px]"
                                      >
                                        <span>Open</span>
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

                        {/* Fixed Required Guidance Disclaimer */}
                        <div className="pt-4 border-t border-[var(--border)] space-y-1 text-xs text-[var(--text-muted)]">
                          <p>
                            This is general guidance based on what you wrote. It is not legal advice, and OfferClara cannot confirm whether an offer or sender is genuine.
                          </p>
                          <p>
                            AI can make mistakes. Please verify facts through official portals.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}

              {askLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-xs bg-[var(--surface)] border border-[var(--border)] p-5 text-sm text-[var(--text-muted)] flex items-center gap-3 shadow-2xs">
                    <SpinnerIcon className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
                    <span>Reviewing your question against official verification facts...</span>
                  </div>
                </div>
              )}

              <div ref={threadEndRef} />
            </div>
          )}

          {/* Calm Error State */}
          {askError && (
            <div
              role="alert"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-[var(--text)]">
                    {askError.message}
                  </p>
                  <p className="text-xs font-mono text-[var(--text-muted)]">
                    Reference: {askError.code}
                  </p>
                </div>
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  href="/resources"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors min-h-[44px]"
                >
                  Open Help and reporting
                </Link>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={askLoading}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs sm:text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors min-h-[44px] disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Example Chips */}
          {!isThreadFull && (
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Example questions (click to fill):
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    disabled={askLoading}
                    className="inline-flex items-center text-left px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)] hover:bg-[var(--surface-muted)] hover:border-[var(--text-muted)]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] shadow-2xs disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form Area */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 space-y-4 shadow-xs">
            {/* Optional Context Checkbox */}
            {hasSessionReview && (
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeContext}
                  onChange={(e) => setIncludeContext(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--focus-ring)] shrink-0"
                />
                <span className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  <strong className="text-[var(--text)] font-semibold">
                    Use my current review as context
                  </strong>
                  <br />
                  Shares only observation categories, missing-detail topics, and verification questions from your active review. Raw offer text and uploaded files are never sent.
                </span>
              </label>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="your-question"
                  className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2"
                >
                  Your question
                </label>
                <textarea
                  id="your-question"
                  ref={textareaRef}
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value.slice(0, 1500))}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. They asked me to transfer Rs 2,500 for a laptop security deposit. What should I check?"
                  rows={4}
                  disabled={askLoading || isThreadFull}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3.5 sm:p-4 text-base sm:text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] resize-y min-h-[100px] leading-relaxed transition-colors disabled:opacity-50"
                  aria-label="Your question"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
                  <span>{inputQuestion.length}/1,500 characters</span>
                  <span>•</span>
                  <span>{userTurnCount}/6 questions</span>
                  <span>•</span>
                  <span className="hidden sm:inline">Ctrl+Enter to ask</span>
                </div>

                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || askLoading || isThreadFull}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-sm sm:text-base font-semibold shadow-2xs hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {askLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <SpinnerIcon className="w-4 h-4 animate-spin" />
                      <span>Asking...</span>
                    </span>
                  ) : (
                    <span>Ask</span>
                  )}
                </button>
              </div>
            </form>

            {isThreadFull && (
              <div className="text-center pt-3 border-t border-[var(--border)] space-y-2">
                <p className="text-xs text-[var(--text-muted)]">
                  You have reached the 6-question limit for this inquiry thread.
                </p>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs sm:text-sm font-semibold hover:bg-[var(--color-primary-hover)] min-h-[44px]"
                >
                  Start a new question
                </button>
              </div>
            )}
          </div>

          {/* Educational Disclaimer */}
          <div className="text-center pt-2">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xl mx-auto">
              General educational guidance, not legal advice. OfferClara does not verify companies or pronounce verdicts. All observations are based on official government advisories.
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}
