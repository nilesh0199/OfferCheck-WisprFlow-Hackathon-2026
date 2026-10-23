import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { StaticAnnotatedCard } from "@/components/landing/StaticAnnotatedCard";
import { WizardOverviewSection } from "@/components/landing/WizardOverviewSection";
import { CommandBarPreviewSection } from "@/components/landing/CommandBarPreviewSection";
import { CapabilitiesComparisonSection } from "@/components/landing/CapabilitiesComparisonSection";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Container } from "@/components/Container";
import { APP_NAME, TAGLINE } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${TAGLINE}`,
  description:
    "Calm, evidence-linked internship and job offer analysis. Paste an offer to spot upfront payment requests, urgent deadlines, and missing details before you pay or share documents.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between transition-colors">
      <LandingNav />

      <main className="flex-1">
        {/* Asymmetric Hero Section */}
        <section className="pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-[var(--border)] bg-[var(--tint-info-bg)]/40 transition-colors">
          <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Asymmetric Typography, Actions & Trust Bar */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-highlighter)]" />
                <span>Offer Due Diligence for Students & Job Seekers</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
                Review an internship or job offer before you pay or share documents
              </h1>

              <p className="text-[1.0625rem] sm:text-[1.1875rem] text-[var(--text-muted)] max-w-xl leading-relaxed">
                Paste an offer letter, describe a call, or attach screenshots. OfferCheck highlights requested fees, urgent deadlines, and missing details — with direct quotes from your text.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/check"
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-6 py-3 text-base font-semibold shadow-xs hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                >
                  Check an offer
                </Link>
                <Link
                  href="/check?sample=full-sample-a"
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-5 py-3 text-base font-medium shadow-xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                >
                  View sample review
                </Link>
              </div>

              {/* Trust Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] font-mono">
                <span>• No sign-up</span>
                <span>• Nothing stored on our servers</span>
                <span>• Typed or dictated</span>
                <span>• Free-tier AI with fallback</span>
              </div>
            </div>

            {/* Right Column: Static Annotated Card */}
            <div className="lg:col-span-6 w-full">
              <StaticAnnotatedCard />
            </div>
          </Container>
        </section>

        {/* 5-Step Guided Review Wizard Overview */}
        <WizardOverviewSection />

        {/* Global Command Bar Preview & Voice Tool Compatibility */}
        <CommandBarPreviewSection />

        {/* What OfferCheck Does and Does Not Do (Two-Column Comparison) */}
        <CapabilitiesComparisonSection />

        {/* Privacy & Transparency Section */}
        <PrivacySection />

        {/* Frequently Asked Questions Section */}
        <FaqSection />

        {/* Final Call to Action */}
        <FinalCta />
      </main>

      <LandingFooter />
    </div>
  );
}
