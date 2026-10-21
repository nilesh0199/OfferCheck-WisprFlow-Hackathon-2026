import React from "react";
import { Container } from "@/components/Container";

export function WhatWeDoNotDoSection() {
  const limits = [
    {
      title: "No scam scores or numeric ratings",
      description:
        "We do not compute a percentage probability, safety score, or danger grade. Complex employment fraud cannot be reduced to a single number.",
    },
    {
      title: "No safety verdicts or 'verified' stamps",
      description:
        "We do not label an offer 'safe', 'verified', or 'legit'. An offer that produces zero observations may still come from an impersonator using existing contract templates.",
    },
    {
      title: "Cannot confirm that a sender is genuine",
      description:
        "OfferCheck inspects the text you paste. It does not contact employers, verify domain registrations, or validate bank accounts.",
    },
    {
      title: "Not legal or employment counsel",
      description:
        "The observations and questions provided are educational checklists designed to guide due diligence for students and first-time job seekers, not formal legal advice.",
    },
    {
      title: "Automated analysis can be wrong",
      description:
        "AI models can misinterpret unusual phrases or miss issues in communications. Exercise personal discretion and independent verification.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-t border-[var(--border)] transition-colors">
      <Container className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="font-mono text-2xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
            Epistemic Limits
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
            What OfferCheck will not do
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Honest boundaries are essential for safety. Here is what this tool
            explicitly avoids doing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {limits.map((limit, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] mb-2" />
                <h3 className="text-sm font-bold text-[var(--text)]">
                  {limit.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {limit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
