import React from "react";
import { Container } from "@/components/Container";

export function WhatYouGetSection() {
  const items = [
    {
      badge: "Observation Spans",
      title: "Quote-linked observations",
      body: "Every flagged item is pinned to an exact phrase from the offer text with an objective explanation. We do not show vague warning scores or ungrounded accusations.",
      detail: "Examples: upfront deposits, 24-hour ultimatums, personal WhatsApp recruitment.",
    },
    {
      badge: "Term Checklist",
      title: "Missing details kept separate",
      body: "Essential terms often omitted in informal offers—like compensation or stipend amounts, expected working hours, duration or contract terms, and physical office addresses—are tracked in a dedicated checklist.",
      detail: "Helps you know what standard information is missing before accepting.",
    },
    {
      badge: "Clarification Drafts",
      title: "Questions to ask the sender",
      body: "Professional, neutral questions you can send directly to the recruiter to verify company identity, supervisor reporting structure, and compensation or stipend payment terms.",
      detail: "Gives students and first-time job seekers concrete wording to request formal documentation.",
    },
    {
      badge: "Official Portals",
      title: "Official Indian resources",
      body: "Guidance on how to use authentic Indian registries and helplines rather than relying solely on automated text analysis.",
      detail:
        "Includes MCA company search, AICTE National Internship Portal, NCS, and the Cybercrime Portal (1930).",
    },
    {
      badge: "External Research",
      title: "Company research prompt",
      body: "Generates a structured, evidence-focused research prompt from verified company details for you to copy and run in an external assistant like Perplexity.",
      detail:
        "Isolates company metadata without exposing your offer text, and guides you on how to interpret the results.",
    },
  ];

  return (
    <section
      id="what-you-get"
      className="py-16 sm:py-24 border-t border-[var(--border)] bg-[var(--surface)] transition-colors"
    >
      <Container className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="font-mono text-2xs uppercase tracking-wider text-[var(--primary-ledger)] font-semibold">
            Deliverables
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[var(--text)]">
            What OfferCheck gives you
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Practical tools and evidence to help you evaluate offers objectively,
            without arbitrary ratings or alarmist language.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-mono font-medium bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
                    {item.badge}
                  </span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text)]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {item.body}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] text-2xs text-[var(--text-muted)] leading-normal font-sans">
                <strong className="text-[var(--text)] font-semibold">Scope: </strong>
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
