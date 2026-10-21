import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroInteractiveDocument } from "@/components/landing/HeroInteractiveDocument";
import { ScrollSceneSection } from "@/components/landing/ScrollSceneSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhatYouGetSection } from "@/components/landing/WhatYouGetSection";
import { WhatWeDoNotDoSection } from "@/components/landing/WhatWeDoNotDoSection";
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between overflow-x-hidden transition-colors">
      <LandingNav />

      <main className="flex-1">
        {/* Asymmetric Hero Section */}
        <section className="pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-[var(--border)]">
          <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Asymmetric Typography and CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--surface)] text-[var(--primary-ledger)] border border-[var(--border)] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-highlighter)]" />
                <span>Offer Due Diligence for Students & Job Seekers</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
                {TAGLINE}
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl leading-relaxed">
                Paste an internship or job offer and get quote-linked observations and
                questions to verify before you pay or share documents.
              </p>

              {/* Primary & Secondary CTAs (Guaranteed above fold at 1366x768 and 390x844) */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/check"
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--primary-ledger)] text-white px-6 py-3 text-sm font-medium shadow-xs hover:bg-[var(--primary-ledger-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                >
                  Check an offer
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-5 py-3 text-sm font-medium shadow-xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
                >
                  See how it works
                </a>
              </div>

              <div className="pt-2 flex items-center gap-4 text-2xs text-[var(--text-muted)] font-mono">
                <span>• Nothing saved after you leave</span>
                <span>• No accounts</span>
                <span>• Free</span>
              </div>
            </div>

            {/* Right Column: Interactive Annotated Document Card */}
            <div className="lg:col-span-6 w-full">
              <HeroInteractiveDocument />
            </div>
          </Container>
        </section>

        {/* Scroll-Driven Scene: A second look, line by line */}
        <ScrollSceneSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* What You Get Section */}
        <WhatYouGetSection />

        {/* What OfferCheck Will Not Do Section */}
        <WhatWeDoNotDoSection />

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
