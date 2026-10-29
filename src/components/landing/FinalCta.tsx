import React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";

export function FinalCta() {
  return (
    <section className="py-16 sm:py-24 border-t border-[var(--border)] bg-[var(--surface)] transition-colors overflow-hidden">
      <Container className="final-cta-card text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
          Ready to review an offer?
        </h2>
        <p className="text-[1.0625rem] text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Paste your internship or job offer to check for upfront fees, urgent
          deadlines, and missing terms before you take the next step.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/check"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-7 py-3.5 text-base font-medium shadow-xs hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          >
            Check an offer
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] px-6 py-3.5 text-base font-medium shadow-xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          >
            See how it works
          </a>
        </div>

        <p className="text-xs text-[var(--text-muted)] pt-2">
          Free · No sign-in required · Tab memory only
        </p>
      </Container>
    </section>
  );
}
