"use client";

import React from "react";
import { Container } from "../Container";

interface WizardStepCard {
  number: number;
  title: string;
  summary: string;
  detail: string;
}

const WIZARD_STEPS: readonly WizardStepCard[] = [
  {
    number: 1,
    title: "Offer text & documents",
    summary: "Paste letter or attach files",
    detail:
      "Paste text from your email, letter, or PDF. You can also attach screenshots and PDFs to extract text automatically.",
  },
  {
    number: 2,
    title: "Where it came from",
    summary: "Channel & application status",
    detail:
      "Select whether the contact arrived via LinkedIn, WhatsApp, Telegram, or email, and whether you applied for the role.",
  },
  {
    number: 3,
    title: "Described conversation",
    summary: "Type or dictate phone calls",
    detail:
      "Describe phone calls, interviews, or verbal assurances in your own words using keyboard or speech dictation.",
  },
  {
    number: 4,
    title: "Money & documents asked",
    summary: "Deposits, training fees & IDs",
    detail:
      "Record whether upfront deposits, laptop fees, training charges, or sensitive identification documents were demanded.",
  },
  {
    number: 5,
    title: "Review & submit",
    summary: "On-device masking & analysis",
    detail:
      "Review your answers, scrub sensitive personal details with on-device privacy masking, and run the analysis safely.",
  },
];

export function WizardOverviewSection() {
  return (
    <section
      id="how-it-works"
      aria-label="5-step review process"
      className="scroll-mt-16 sm:scroll-mt-20 py-16 sm:py-24 border-b border-[var(--border)] bg-[var(--surface)] transition-colors"
    >
      <Container className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
            <span>5-Step Guided Review</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-[-0.015em] text-[var(--text)]">
            A structured review designed around real offer interactions
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Internship recruitment happens across emails, calls, and messaging apps. OfferCheck walks you through 5 clear steps to build a complete picture before analyzing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {WIZARD_STEPS.map((step) => (
            <div
              key={step.number}
              className="wizard-step-card rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-5 space-y-3 flex flex-col justify-between transition-colors hover:border-[var(--color-primary)]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] font-mono text-xs font-bold inline-flex items-center justify-center">
                    0{step.number}
                  </span>
                  <span className="text-[0.6875rem] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    Step {step.number}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)] pt-1">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {step.detail}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] text-[0.6875rem] font-medium text-[var(--color-primary)]">
                {step.summary}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
