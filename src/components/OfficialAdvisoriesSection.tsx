"use client";

import React from "react";
import {
  InstitutionalAdvisory,
  INSTITUTIONAL_ADVISORIES,
} from "@/data/advisories";
import { ExternalLinkIcon } from "./Icons";

interface OfficialAdvisoriesSectionProps {
  advisories?: readonly InstitutionalAdvisory[];
}

export function OfficialAdvisoriesSection({
  advisories = INSTITUTIONAL_ADVISORIES,
}: OfficialAdvisoriesSectionProps) {
  return (
    <section
      id="section-advisories"
      aria-label="Institutional advisories and public notices"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-5 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--text)]">
            Institutional advisories & public alerts
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Confirmed public notices from premier universities and placement cells regarding internship fees and name misuse.
          </p>
        </div>
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {advisories.length} verified {advisories.length === 1 ? "notice" : "notices"}
        </span>
      </div>

      <div className="space-y-4">
        {advisories.map((advisory) => (
          <article
            key={advisory.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4 space-y-2.5 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                {advisory.institution}
              </h4>
              <div className="flex items-center gap-2 text-[0.75rem] font-mono text-[var(--text-muted)]">
                <span>{advisory.issuingAuthority}</span>
                <span>•</span>
                <span>{advisory.date}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
              {advisory.summary}
            </p>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--text)] space-y-1">
              <span className="font-semibold text-[var(--text-muted)] block text-[0.75rem] uppercase tracking-wider">
                Key Takeaway
              </span>
              <p className="font-medium text-[var(--color-primary)]">
                {advisory.keyTakeaway}
              </p>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <div className="flex flex-wrap gap-1.5">
                {advisory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-mono bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <a
                href={advisory.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium min-h-[44px] py-1 px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
                aria-label={`Read advisory from ${advisory.institution} (opens in new tab)`}
              >
                <span>Read source</span>
                <ExternalLinkIcon className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
