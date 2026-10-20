import React from "react";
import { Container } from "@/components/Container";
import { AI_DATA_NOTICE } from "@/lib/config";
import { LockIcon, ExternalLinkIcon } from "@/components/Icons";

export function PrivacySection() {
  return (
    <section
      id="privacy"
      className="py-16 sm:py-24 border-t border-[var(--border)] bg-[var(--surface)] transition-colors"
    >
      <Container className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="font-mono text-2xs uppercase tracking-wider text-[var(--primary-ledger)] font-semibold">
            Transparency
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[var(--text)]">
            Privacy and responsible data use
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            How your information is processed when you use OfferCheck.
          </p>
        </div>

        {/* AI Data Policy Callout */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] shrink-0">
              <LockIcon className="w-5 h-5 text-[var(--primary-ledger)]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                AI Processing Notice
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                {AI_DATA_NOTICE}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
            <div className="space-y-1">
              <strong className="text-[var(--text)] block font-semibold">
                In-memory tab session only
              </strong>
              <p>
                Your text and results exist solely in your browser tab&apos;s volatile memory. Refreshing or closing the tab resets everything immediately.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-[var(--text)] block font-semibold">
                Zero server-side persistence
              </strong>
              <p>
                Our server never saves offer text or uploaded files to databases, disk, or log files. We log only anonymized status codes and attempt response times for reliability.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-[var(--text)] block font-semibold">
                No accounts or analytics
              </strong>
              <p>
                There are no user accounts, passwords, cookies, or third-party tracking scripts.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026/blob/main/docs/privacy-and-responsible-use.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-ledger)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
            >
              <span>Read the complete Privacy and Responsible Use policy on GitHub</span>
              <ExternalLinkIcon className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
