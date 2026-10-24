import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ResourceCard } from "@/components/ResourceCard";
import { GitHubIcon, ExternalLinkIcon } from "@/components/Icons";
import { VERIFICATION_RESOURCES } from "@/data/verification-resources";
import { BackToReviewBanner } from "@/components/BackToReviewBanner";
import { OfficialAdvisoriesSection } from "@/components/OfficialAdvisoriesSection";
import { AfterPaymentCard } from "@/components/resources/AfterPaymentCard";
import { ClickToLoadVideo } from "@/components/resources/ClickToLoadVideo";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `Help, reporting and official resources — ${APP_NAME}`,
  description:
    "What to do if you have paid or shared documents, how to report it, and official resources for checking an offer.",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between overflow-x-hidden transition-colors">
      {/* Active Review Navigation Banner (if session exists) */}
      <BackToReviewBanner />

      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12 space-y-12">
        <Container className="space-y-10">
          {/* Header */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[var(--color-highlight)]" />
              <span>Official portals and reporting channels</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
              Help, reporting and official resources
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              OfferClara evaluates text only; it does not vouch for companies, verify job offers, or confirm identities. If you need to verify an opportunity or report suspicious demands, use the official resources below.
            </p>
          </div>

          {/* Section 1: If you have already paid or shared documents (Expandable card with video & questionnaire) */}
          <AfterPaymentCard />

          {/* Section 2: Awareness video */}
          <section
            id="video-guides"
            aria-labelledby="video-guides-heading"
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <h2
                id="video-guides-heading"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                Official student awareness video
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Watch this official overview on how to identify irregular internship recruiting demands.
              </p>
            </div>

            <ClickToLoadVideo
              videoId="Kr-B8sAE6ek"
              title="Official student internship awareness video"
              description="Educational guide for students and job seekers detailing red flags in employment communications."
              aspectRatio="16:9"
              language="English"
              duration="12 min"
            />
          </section>

          {/* Section 3: All 4 official resources */}
          <section
            id="official-portals"
            aria-labelledby="official-portals-heading"
            className="space-y-6"
          >
            <div className="space-y-1.5">
              <h2
                id="official-portals-heading"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                Official verification and reporting portals
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                All contacts and portals are static and verified directly against official government websites. OfferClara uses zero external network calls.
              </p>
            </div>

            <div className="space-y-4">
              {VERIFICATION_RESOURCES.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isCollapsible={false}
                  defaultExpanded={true}
                />
              ))}
            </div>
          </section>

          {/* Institutional Advisories */}
          <OfficialAdvisoriesSection />
        </Container>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] py-8 transition-colors">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-medium text-[var(--text)]">OfferClara</p>
            <p>
              Links checked as of 23 October 2026. OfferClara does not endorse or vouch for external parties.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Home
            </Link>
            <Link
              href="/check"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Check an offer
            </Link>
            <Link
              href="/ask"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Clear doubt
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Privacy
            </Link>
            <Link
              href="/about"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              About
            </Link>
            <a
              href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px]"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLinkIcon className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </Container>
      </footer>
    </div>
  );
}
