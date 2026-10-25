import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { StaticAnnotatedCard } from "@/components/landing/StaticAnnotatedCard";
import { WizardOverviewSection } from "@/components/landing/WizardOverviewSection";
import { CommandBarPreviewSection } from "@/components/landing/CommandBarPreviewSection";
import { CapabilitiesComparisonSection } from "@/components/landing/CapabilitiesComparisonSection";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Container } from "@/components/Container";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP_NAME}: make every offer clear`,
  description:
    "Calm, evidence-linked internship and job offer analysis. Paste an offer to spot upfront payment requests, urgent deadlines, and missing details before you pay or share documents.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between transition-colors">
      <main className="flex-1">
        {/* Asymmetric Hero Section */}
        <section className="pt-4 pb-10 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-12 border-b border-[var(--border)] bg-[var(--tint-info-bg)]/40 transition-colors">
          <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start lg:items-center">
            {/* Left Column: Asymmetric Typography, Actions & Trust Bar */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="space-y-3">
                <h1 className="text-[clamp(2.75rem,5.5vw,4.5rem)] font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
                  Understand the offer. Know what to verify.
                </h1>
                <p className="text-[clamp(1.5rem,2.5vw,1.875rem)] font-serif text-[var(--text-muted)] leading-snug">
                  Make every offer clear.
                </p>
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/check"
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-8 py-3.5 text-[1.125rem] font-semibold shadow-xs hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[3.5rem]"
                >
                  Check an offer
                </Link>
                <Link
                  href="/check?sample=full-sample-course-as-internship"
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-8 py-3.5 text-[1.125rem] font-medium shadow-xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[3.5rem]"
                >
                  View sample review
                </Link>
              </div>

              {/* Trust Strip in Sans Font */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[1rem] text-[var(--text-muted)] font-sans leading-normal">
                <span>No sign-up</span>
                <span aria-hidden="true">•</span>
                <span>We do not store your offer text</span>
                <span aria-hidden="true">•</span>
                <span>Type or dictate</span>
                <span aria-hidden="true">•</span>
                <span>Free-tier AI with fallback</span>
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
