"use client";

import React from "react";
import { Container } from "../Container";

const WHAT_IT_DOES = [
  {
    title: "Exact verbatim quotes",
    description:
      "Every observation is backed by a word-for-word quote from your text, highlighted in yellow so you see exactly what triggered it.",
  },
  {
    title: "Spots fee and course demands",
    description:
      "Identifies requests for registration fees, training packages, laptop deposits, or verification charges presented as internships.",
  },
  {
    title: "Flags missing contract terms",
    description:
      "Checks whether stipend amounts, working hours, duration, start dates, and supervisor names are explicitly documented.",
  },
  {
    title: "Tailored verification questions",
    description:
      "Formulates specific, professional questions you can send back to the recruiter to clarify vague terms or payment clauses.",
  },
  {
    title: "Official helplines & advisories",
    description:
      "Connects you directly to government grievance portals (National Cyber Crime, UGC, Labour Ministry) and verified institutional notices.",
  },
];

const WHAT_IT_DOES_NOT_DO = [
  {
    title: "Never declares an offer 'safe' or 'verified'",
    description:
      "Zero findings in an offer text does not prove the sender is legitimate. An unauthorized sender can copy genuine appointment letters.",
  },
  {
    title: "Cannot authenticate company senders",
    description:
      "OfferClara analyzes text only; it cannot verify whether an email address, phone number, or domain belongs to the real organization.",
  },
  {
    title: "Never provides legal advice",
    description:
      "Our observations are educational self-check prompts, not legal opinions, contractual warranties, or binding dispute counsel.",
  },
  {
    title: "Zero server storage of your documents",
    description:
      "All review data lives exclusively in your temporary browser tab memory. We do not store your letters, names, or contact notes.",
  },
  {
    title: "No microphone or speech API calls",
    description:
      "We never access your microphone. Dictation is performed by your own operating system or tools like Wispr Flow running outside the browser.",
  },
];

export function CapabilitiesComparisonSection() {
  return (
    <section
      id="what-you-get"
      aria-label="What OfferClara does and does not do"
      className="scroll-mt-16 sm:scroll-mt-20 py-16 sm:py-24 border-b border-[var(--border)] bg-[var(--surface)] transition-colors"
    >
      <Container className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
            <span>Honest Product Boundaries</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-[-0.015em] text-[var(--text)]">
            What OfferClara does — and what it will never do
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Honest software clearly states what it cannot do. Here is a transparent side-by-side comparison.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Column 1: What it does */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
              <h3 className="text-base sm:text-lg font-semibold text-[var(--text)]">
                What OfferClara does
              </h3>
            </div>

            <ul className="space-y-4">
              {WHAT_IT_DOES.map((item, idx) => (
                <li key={idx} className="space-y-1 text-left">
                  <h4 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: What it will not do */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]" />
              <h3 className="text-base sm:text-lg font-semibold text-[var(--text)]">
                What OfferClara will not do
              </h3>
            </div>

            <ul className="space-y-4">
              {WHAT_IT_DOES_NOT_DO.map((item, idx) => (
                <li key={idx} className="space-y-1 text-left">
                  <h4 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
