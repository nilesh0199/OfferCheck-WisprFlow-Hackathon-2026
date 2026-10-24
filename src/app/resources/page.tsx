import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { TopNav } from "@/components/TopNav";
import { ResourceCard } from "@/components/ResourceCard";
import { GitHubIcon, ExternalLinkIcon } from "@/components/Icons";
import { VERIFICATION_RESOURCES } from "@/data/verification-resources";
import { POST_PAYMENT_STEPS } from "@/data/post-payment-steps";
import { BackToReviewBanner } from "@/components/BackToReviewBanner";
import { OfficialAdvisoriesSection } from "@/components/OfficialAdvisoriesSection";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `Official resources and reporting links — ${APP_NAME}`,
  description:
    "Official verification portals, official reporting helplines, and actionable guidance for students and first-time job seekers in India.",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between overflow-x-hidden transition-colors">
      <TopNav />

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
              Official resources and reporting links
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              OfferClara evaluates text only; it does not vouch for companies, verify job offers, or confirm identities. If you need to verify an opportunity or report suspicious demands, use the official resources below.
            </p>
          </div>

          {/* Section 1: If you have already paid or shared documents */}
          <section
            id="reporting-steps"
            aria-labelledby="reporting-steps-heading"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <div className="space-y-1.5">
              <h2
                id="reporting-steps-heading"
                className="text-lg sm:text-xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]"
              >
                If you have already paid or shared documents
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Take these four steps calmly if you have transferred funds or shared documents.
              </p>
            </div>

            <ol className="space-y-4 list-none p-0 m-0">
              {POST_PAYMENT_STEPS.map((item) => (
                <li
                  key={item.step}
                  className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border-muted)] bg-[var(--bg)]/50"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--surface-muted)] text-[var(--text)] font-mono text-xs font-bold border border-[var(--border)] shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Section 2: All 4 official resources */}
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
                All contacts and portals are static and verified directly against official government websites. OfferCheck uses zero external network calls.
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
              Links checked as of 20 October 2026. OfferClara does not endorse or vouch for external parties.
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
