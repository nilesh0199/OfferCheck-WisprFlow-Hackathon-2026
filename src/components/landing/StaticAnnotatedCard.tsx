"use client";

import React from "react";

export function StaticAnnotatedCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden transition-colors">
      {/* Top Document Header Bar */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]/60 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
          <span className="ml-2 font-mono text-[0.75rem] text-[var(--text-muted)] truncate max-w-[200px] sm:max-w-none">
            internship_offer_letter_synthetic.pdf
          </span>
        </div>
        <span className="font-mono text-[0.6875rem] px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
          Demo Document
        </span>
      </div>

      {/* Document Body with Highlighted Phrases and Callout Badges */}
      <div className="p-5 sm:p-6 space-y-5 text-left font-sans text-xs sm:text-sm">
        <div className="space-y-1 text-[var(--text-muted)] font-mono text-[0.75rem] border-b border-[var(--border)] pb-3">
          <p>Sender: careers@vortexpulse-tech-portal.online</p>
          <p>Subject: Internship Selection — Data Analyst Trainee</p>
        </div>

        <p className="text-[var(--text)] leading-relaxed">
          Dear Candidate, we are pleased to offer you a virtual internship with VortexPulse Technologies.
        </p>

        {/* Highlight 1: Training fee clause */}
        <div className="space-y-2 rounded-xl p-2.5 bg-[var(--tint-info-bg)]/40 border border-[var(--border)]">
          <p className="text-[var(--text)] leading-relaxed">
            &quot;To confirm your seat,{" "}
            <mark className="bg-[var(--accent-highlighter)] text-[var(--color-primary-contrast)] font-medium px-1 rounded-xs">
              a mandatory training and certification fee of ₹6,500 must be deposited
            </mark>{" "}
            prior to project assignment.&quot;
          </p>
          <div className="flex items-center gap-1.5 text-[0.75rem] text-[var(--color-primary)] font-medium pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-highlighter)]" aria-hidden="true" />
            <span>Observation: Paid training requested before internship starts</span>
          </div>
        </div>

        {/* Highlight 2: 24-hour urgency deadline */}
        <div className="space-y-2 rounded-xl p-2.5 bg-[var(--tint-info-bg)]/40 border border-[var(--border)]">
          <p className="text-[var(--text)] leading-relaxed">
            &quot;Payment and document submission must be completed{" "}
            <mark className="bg-[var(--accent-highlighter)] text-[var(--color-primary-contrast)] font-medium px-1 rounded-xs">
              strictly within 24 hours to secure your internship slot
            </mark>
            .&quot;
          </p>
          <div className="flex items-center gap-1.5 text-[0.75rem] text-[var(--color-primary)] font-medium pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-highlighter)]" aria-hidden="true" />
            <span>Observation: Urgent payment deadline prevents independent verification</span>
          </div>
        </div>

        {/* Highlight 3: Unverified Telegram handle */}
        <div className="space-y-2 rounded-xl p-2.5 bg-[var(--tint-info-bg)]/40 border border-[var(--border)]">
          <p className="text-[var(--text)] leading-relaxed">
            &quot;After transferring the fee, send your payment screenshot to{" "}
            <mark className="bg-[var(--accent-highlighter)] text-[var(--color-primary-contrast)] font-medium px-1 rounded-xs">
              @hr_lead_vortex on Telegram
            </mark>{" "}
            for instant batch allocation.&quot;
          </p>
          <div className="flex items-center gap-1.5 text-[0.75rem] text-[var(--color-primary)] font-medium pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-highlighter)]" aria-hidden="true" />
            <span>Observation: Contact and payment proof diverted to personal messaging app</span>
          </div>
        </div>

      </div>
    </div>
  );
}
