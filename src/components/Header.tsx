import React from "react";
import Link from "next/link";
import { APP_NAME, TAGLINE } from "@/lib/config";
import { LogoIcon, GitHubIcon, ExternalLinkIcon } from "./Icons";
import { Container } from "./Container";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <>
      {/* Slim sticky top navigation bar */}
      <nav
        aria-label="Main navigation"
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

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link
              href="/"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5 hidden sm:inline"
            >
              Home
            </Link>
            <Link
              href="/resources"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5"
            >
              Resources
            </Link>
            <a
              href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5"
              aria-label="GitHub repository (opens in a new tab)"
            >
              <GitHubIcon className="w-4 h-4" />
              <span className="hidden md:inline">GitHub</span>
              <ExternalLinkIcon className="w-3 h-3 opacity-60" />
            </a>

            {/* Segmented theme selector */}
            <ThemeToggle />
          </div>
        </Container>
      </nav>

      {/* Hero and steps section wrapped in shared Container */}
      <header className="w-full">
        <Container className="pt-6 sm:pt-8 pb-4 text-left">
          <h1 className="text-2xl sm:text-3xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
            {TAGLINE}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Review internship and job offers before you pay or share documents.
            Paste offer text or attach screenshots and PDFs for quote-linked
            observations and specific verification questions.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-6 text-2xs sm:text-xs text-[var(--text-muted)] font-mono border-t border-[var(--border)] pt-3">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--surface-muted)] text-[var(--text)] text-2xs font-bold border border-[var(--border)]">
                1
              </span>
              <span>Input offer text or files</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--surface-muted)] text-[var(--text)] text-2xs font-bold border border-[var(--border)]">
                2
              </span>
              <span>Review flagged observations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--surface-muted)] text-[var(--text)] text-2xs font-bold border border-[var(--border)]">
                3
              </span>
              <span>Ask verification questions</span>
            </div>
          </div>
        </Container>
      </header>
    </>
  );
}
