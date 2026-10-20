import React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";

export function FinalCta() {
  return (
    <section className="py-16 sm:py-24 border-t border-[var(--border)] bg-[var(--surface)] transition-colors">
      <Container className="text-center max-w-3xl space-y-6">
        <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[var(--text)]">
          Ready to review an offer?
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Paste your internship or job offer to check for upfront fees, urgent
          deadlines, and missing terms before you take the next step.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/check"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[var(--primary-ledger)] text-white px-7 py-3.5 text-sm font-medium shadow-xs hover:bg-[var(--primary-ledger-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          >
            Check an offer
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] px-6 py-3.5 text-sm font-medium shadow-xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          >
            See how it works
          </a>
        </div>

        <p className="text-2xs text-[var(--text-muted)] pt-2">
          Free · No sign-in required · Tab memory only
        </p>
      </Container>
    </section>
  );
}
