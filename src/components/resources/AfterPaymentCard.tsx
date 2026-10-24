"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { POST_PAYMENT_STEPS } from "@/data/post-payment-steps";
import { ClickToLoadVideo } from "./ClickToLoadVideo";
import {
  QuestionnaireAnswers,
  Q1Option,
  Q2Option,
  Q3Option,
  Q4Option,
  buildAfterPaymentChecklist,
  AfterPaymentChecklist,
} from "@/lib/resources/after-payment";
import {
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/Icons";

const INITIAL_ANSWERS: QuestionnaireAnswers = {
  q1: "internship_or_job",
  q2: ["nothing_yet"],
  q3: "no",
  q4: ["nothing_sensitive"],
};

export function AfterPaymentCard() {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.location.hash === "#already-paid" || true;
    }
    return true;
  });
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(INITIAL_ANSWERS);
  const [showChecklist, setShowChecklist] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  // Automatically expand if URL hash changes to #already-paid
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#already-paid") {
        setIsExpanded(true);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const checklist: AfterPaymentChecklist = buildAfterPaymentChecklist(answers);

  const handleQ1Change = (val: Q1Option) => {
    setAnswers((prev) => ({ ...prev, q1: val }));
  };

  const handleQ2Toggle = (opt: Q2Option) => {
    setAnswers((prev) => {
      let current = [...prev.q2];
      if (opt === "nothing_yet") {
        return { ...prev, q2: ["nothing_yet"] };
      }
      current = current.filter((o) => o !== "nothing_yet");
      if (current.includes(opt)) {
        current = current.filter((o) => o !== opt);
      } else {
        current.push(opt);
      }
      if (current.length === 0) current = ["nothing_yet"];
      return { ...prev, q2: current };
    });
  };

  const handleQ3Change = (val: Q3Option) => {
    setAnswers((prev) => ({ ...prev, q3: val }));
  };

  const handleQ4Toggle = (opt: Q4Option) => {
    setAnswers((prev) => {
      let current = [...prev.q4];
      if (opt === "nothing_sensitive") {
        return { ...prev, q4: ["nothing_sensitive"] };
      }
      current = current.filter((o) => o !== "nothing_sensitive");
      if (current.includes(opt)) {
        current = current.filter((o) => o !== opt);
      } else {
        current.push(opt);
      }
      if (current.length === 0) current = ["nothing_sensitive"];
      return { ...prev, q4: current };
    });
  };

  const handleClearAnswers = () => {
    setAnswers(INITIAL_ANSWERS);
    setShowChecklist(true);
  };

  const handleCopyChecklist = async () => {
    const lines: string[] = [
      "OfferClara Action Checklist",
      "Generated based on official advisories. General guidance, not legal advice.",
      "",
    ];

    if (checklist.doNow.length > 0) {
      lines.push("--- DO THESE NOW ---");
      checklist.doNow.forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.title}`);
        lines.push(`   ${item.description}`);
      });
      lines.push("");
    }

    if (checklist.keepEvidence.length > 0) {
      lines.push("--- KEEP AS EVIDENCE ---");
      checklist.keepEvidence.forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.title}`);
        lines.push(`   ${item.description}`);
      });
      lines.push("");
    }

    if (checklist.askOrCheck.length > 0) {
      lines.push("--- ASK FOR IN WRITING OR CHECK ---");
      checklist.askOrCheck.forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.title}`);
        lines.push(`   ${item.description}`);
      });
      lines.push("");
    }

    if (checklist.report.length > 0) {
      lines.push("--- REPORT ---");
      checklist.report.forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.title}`);
        lines.push(`   ${item.description}`);
      });
      lines.push("");
    }

    if (checklist.protectAccounts.length > 0) {
      lines.push("--- PROTECT YOUR ACCOUNTS AND IDENTITY ---");
      checklist.protectAccounts.forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.title}`);
        lines.push(`   ${item.description}`);
      });
      lines.push("");
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      prompt("Copy your customized checklist:", lines.join("\n"));
    }
  };

  return (
    <section
      id="already-paid"
      aria-labelledby="already-paid-heading"
      className="scroll-mt-16 sm:scroll-mt-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-6 shadow-xs transition-colors"
    >
      {/* Header with expand/collapse toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
            Step-by-step guidance
          </div>
          <h2
            id="already-paid-heading"
            className="text-lg sm:text-2xl font-serif tracking-[-0.015em] text-[var(--text)] leading-snug"
          >
            I already paid or shared documents — what now?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Follow these clear steps if you have transferred money, shared personal documents, or received fee demands.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          aria-controls="already-paid-body"
          className="inline-flex items-center justify-center p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] min-w-[44px]"
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
          <span className="sr-only">
            {isExpanded ? "Collapse guidance" : "Expand guidance"}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div id="already-paid-body" className="space-y-8 pt-2">
          {/* Part A: Video 2 */}
          <div className="space-y-3">
            <ClickToLoadVideo
              videoId="3S47zE8cWCI"
              title="If you have already paid or shared documents"
              description="A short guide in Hindi on what to do next."
              aspectRatio="9:16"
              language="Hindi"
              duration="1 min"
            />
          </div>

          {/* Part B: 4 Initial Steps */}
          <div className="space-y-3 border-t border-[var(--border)] pt-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Initial protective steps
            </h3>
            <ol className="space-y-3 list-none p-0 m-0">
              {POST_PAYMENT_STEPS.map((item) => (
                <li
                  key={item.step}
                  className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border border-[var(--border-muted)] bg-[var(--bg)]/50"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--surface-muted)] text-[var(--text)] font-mono text-xs font-bold border border-[var(--border)] shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Part C: 4-Question Questionnaire */}
          <div className="space-y-6 border-t border-[var(--border)] pt-6">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-serif font-semibold text-[var(--text)]">
                Checklist questionnaire
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Select your circumstances below to generate a tailored action checklist. Your answers stay in tab memory only. Do not type account numbers, UPI IDs, or identity numbers anywhere.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Q1: What did they tell you that you were getting? */}
              <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 p-4 space-y-2.5">
                <legend className="text-xs font-semibold text-[var(--text)] px-1">
                  1. What did they tell you that you were getting?
                </legend>
                <div className="space-y-2 text-xs sm:text-sm">
                  {[
                    { val: "internship_or_job", label: "An internship or job" },
                    { val: "course_or_training", label: "A course or training program" },
                    { val: "internship_plus_training", label: "Internship plus training" },
                    { val: "not_clear", label: "Not clear" },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="q1"
                        value={opt.val}
                        checked={answers.q1 === opt.val}
                        onChange={() => handleQ1Change(opt.val as Q1Option)}
                        className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--focus-ring)]"
                      />
                      <span className="text-[var(--text)]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Q2: What exactly did you pay for? */}
              <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 p-4 space-y-2.5">
                <legend className="text-xs font-semibold text-[var(--text)] px-1">
                  2. What exactly did you pay for?
                </legend>
                <div className="space-y-2 text-xs sm:text-sm">
                  {[
                    { val: "registration_fee", label: "Registration or application fee" },
                    { val: "training_fee", label: "Training or course fee" },
                    { val: "security_deposit", label: "Security deposit" },
                    { val: "laptop_or_software_fee", label: "Laptop, software or certificate fee" },
                    { val: "nothing_yet", label: "Nothing yet" },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        value={opt.val}
                        checked={answers.q2.includes(opt.val as Q2Option)}
                        onChange={() => handleQ2Toggle(opt.val as Q2Option)}
                        className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--focus-ring)]"
                      />
                      <span className="text-[var(--text)]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Q3: Did they promise an internship, stipend or job after the course? */}
              <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 p-4 space-y-2.5">
                <legend className="text-xs font-semibold text-[var(--text)] px-1">
                  3. Did they promise an internship, stipend or job after the course?
                </legend>
                <div className="space-y-2 text-xs sm:text-sm">
                  {[
                    { val: "yes_in_writing", label: "Yes, clearly in writing" },
                    { val: "yes_verbal_or_whatsapp", label: "Yes, but only verbally or on WhatsApp" },
                    { val: "no", label: "No" },
                    { val: "not_sure", label: "Not sure" },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="q3"
                        value={opt.val}
                        checked={answers.q3 === opt.val}
                        onChange={() => handleQ3Change(opt.val as Q3Option)}
                        className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--focus-ring)]"
                      />
                      <span className="text-[var(--text)]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Q4: What documents did you share? */}
              <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 p-4 space-y-2.5">
                <legend className="text-xs font-semibold text-[var(--text)] px-1">
                  4. What documents did you share?
                </legend>
                <div className="space-y-2 text-xs sm:text-sm">
                  {[
                    { val: "nothing_sensitive", label: "Nothing sensitive" },
                    { val: "resume_only", label: "Resume only" },
                    { val: "aadhaar_pan_or_id", label: "Aadhaar, PAN or ID" },
                    { val: "bank_details_or_cheque", label: "Bank details or cancelled cheque" },
                    {
                      val: "otp_pin_card_or_remote_app",
                      label: "OTP, UPI PIN, card details, or a remote-access app",
                    },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        value={opt.val}
                        checked={answers.q4.includes(opt.val as Q4Option)}
                        onChange={() => handleQ4Toggle(opt.val as Q4Option)}
                        className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--focus-ring)]"
                      />
                      <span className="text-[var(--text)]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowChecklist(true)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs sm:text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors min-h-[44px]"
              >
                Show my checklist
              </button>
              <button
                type="button"
                onClick={handleClearAnswers}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors min-h-[44px]"
              >
                Clear answers
              </button>
            </div>
          </div>

          {/* Part D: Dynamic Checklist */}
          {showChecklist && (
            <div className="space-y-6 border-t border-[var(--border)] pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-serif font-semibold text-[var(--text)]">
                    Your tailored checklist
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Grounded in official government guidance. General guidance, not legal advice.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyChecklist}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] shrink-0 self-start sm:self-auto"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-[var(--color-primary)]" />
                      <span>Copied checklist</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      <span>Copy checklist</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6" role="region" aria-live="polite">
                {/* 1. Do these now */}
                {checklist.doNow.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      Do these now
                    </h4>
                    <div className="space-y-2.5">
                      {checklist.doNow.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4 space-y-1.5"
                        >
                          <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                            {item.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {item.description}
                          </p>
                          {item.sourceLabel && (
                            <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                              <span>Source: {item.sourceLabel}</span>
                              {item.sourceUrl && (
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-[var(--text)] inline-flex items-center gap-1"
                                >
                                  <span>Portal</span>
                                  <ExternalLinkIcon className="w-3 h-3" />
                                </a>
                              )}
                              {item.checkedDate && <span>({item.checkedDate})</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Keep as evidence */}
                {checklist.keepEvidence.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      Keep as evidence
                    </h4>
                    <div className="space-y-2.5">
                      {checklist.keepEvidence.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4 space-y-1.5"
                        >
                          <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                            {item.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Ask for in writing or check */}
                {checklist.askOrCheck.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      Ask for in writing or check
                    </h4>
                    <div className="space-y-2.5">
                      {checklist.askOrCheck.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4 space-y-1.5"
                        >
                          <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                            {item.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {item.description}
                          </p>
                          {item.id === "ask-course-vs-internship" && (
                            <div className="pt-1">
                              <Link
                                href="#section-advisories"
                                className="text-xs text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                              >
                                <span>View institutional advisories</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Report */}
                {checklist.report.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      Report
                    </h4>
                    <div className="space-y-2.5">
                      {checklist.report.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4 space-y-1.5"
                        >
                          <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                            {item.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {item.description}
                          </p>
                          {item.sourceLabel && (
                            <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                              <span>Source: {item.sourceLabel}</span>
                              {item.sourceUrl && (
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-[var(--text)] inline-flex items-center gap-1"
                                >
                                  <span>Portal</span>
                                  <ExternalLinkIcon className="w-3 h-3" />
                                </a>
                              )}
                              {item.checkedDate && <span>({item.checkedDate})</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Protect your accounts and identity */}
                {checklist.protectAccounts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      Protect your accounts and identity
                    </h4>
                    <div className="space-y-2.5">
                      {checklist.protectAccounts.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4 space-y-1.5"
                        >
                          <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                            {item.title}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {item.description}
                          </p>
                          {item.sourceLabel && (
                            <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                              <span>Source: {item.sourceLabel}</span>
                              {item.sourceUrl && (
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-[var(--text)] inline-flex items-center gap-1"
                                >
                                  <span>Portal</span>
                                  <ExternalLinkIcon className="w-3 h-3" />
                                </a>
                              )}
                              {item.checkedDate && <span>({item.checkedDate})</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
