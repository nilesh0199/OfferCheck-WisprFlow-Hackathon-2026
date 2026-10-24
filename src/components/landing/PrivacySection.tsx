import React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { AI_DATA_NOTICE } from "@/lib/config";
import { LockIcon } from "@/components/Icons";

export function PrivacySection() {
  return (
    <section
      id="privacy"
      className="scroll-mt-16 sm:scroll-mt-20 py-16 sm:py-24 border-t border-[var(--border)] bg-[var(--surface)] transition-colors"
    >
      <Container className="space-y-12">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
            Privacy and responsible data use
          </h2>
          <p className="text-[1.0625rem] text-[var(--text-muted)] leading-relaxed max-w-2xl">
            How your information is processed when you use OfferClara.
          </p>
        </div>

        {/* AI Data Policy Callout */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] shrink-0">
              <LockIcon className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                AI Processing Notice
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
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
                Your text and results exist solely in your browser tab&apos;s volatile memory. Refreshing or closing the tab resets everything on refresh.
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
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]"
            >
              <span>Read the full privacy page</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
