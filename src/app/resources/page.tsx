import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ResourceCard } from "@/components/ResourceCard";
import { LogoIcon, GitHubIcon, ExternalLinkIcon } from "@/components/Icons";
import { VERIFICATION_RESOURCES } from "@/data/verification-resources";
import { POST_PAYMENT_STEPS } from "@/data/post-payment-steps";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `Official resources and reporting links — ${APP_NAME}`,
  description:
    "Official verification portals, official reporting helplines, and actionable guidance for students and first-time job seekers in India.",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between overflow-x-hidden transition-colors">
      {/* Navigation */}
      <nav
        aria-label="Resources page navigation"
        className="sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md"
      >
        <Container className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-bold text-base tracking-tight text-[var(--text)] py-1 px-2 -ml-2 rounded-lg outline-none hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <LogoIcon className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span>{APP_NAME}</span>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link
              href="/"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5"
            >
              Home
            </Link>
            <Link
              href="/check"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5 font-semibold text-[var(--primary-ledger)] dark:text-emerald-400"
            >
              Check an offer
            </Link>
            <a
              href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5"
              aria-label="GitHub repository (opens in a new tab)"
            >
              <GitHubIcon className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
              <ExternalLinkIcon className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </Container>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12 space-y-12">
        <Container className="space-y-10">
          {/* Header */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--surface)] text-[var(--primary-ledger)] border border-[var(--border)] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-highlighter)]" />
              <span>Official portals and reporting channels</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
              Official resources and reporting links
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              OfferCheck evaluates text only; it does not vouch for companies, verify job offers, or confirm identities. If you need to verify an opportunity or report suspicious demands, use the official resources below.
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
        </Container>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] py-8 transition-colors">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-medium text-[var(--text)]">OfferCheck</p>
            <p>
              Links checked as of 20 October 2026. OfferCheck does not endorse or vouch for external parties.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1"
            >
              Home
            </Link>
            <Link
              href="/check"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1"
            >
              Check an offer
            </Link>
            <a
              href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026/blob/main/docs/privacy-and-responsible-use.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1"
            >
              <span>Privacy</span>
              <ExternalLinkIcon className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1"
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
