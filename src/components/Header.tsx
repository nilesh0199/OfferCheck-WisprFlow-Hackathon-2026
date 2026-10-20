import React from "react";
import Link from "next/link";
import { APP_NAME, TAGLINE } from "@/lib/config";
import { LogoIcon, GitHubIcon, ExternalLinkIcon } from "./Icons";
import { Container } from "./Container";

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
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
              Hackathon prototype
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link
              href="/"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5"
            >
              Home
            </Link>
            <a
              href="#how-it-works"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5"
            >
              How it works
            </a>
            <a
              href="#about-this-tool"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5"
            >
              Limits
            </a>
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

      {/* Hero and steps section wrapped in shared Container */}
      <header className="w-full">
        <Container className="pt-6 sm:pt-8 pb-4 text-left">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[var(--text)]">
            {TAGLINE}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--text-muted)] max-w-[40rem] leading-relaxed">
            Paste an internship or job offer, get evidence-linked observations and
            questions to verify before you pay or share documents.
          </p>

          {/* Three-step strip */}
          <div
            id="how-it-works"
            className="mt-6 pt-5 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6"
          >
            <div className="flex items-center gap-2.5 text-xs font-medium text-[var(--text-muted)]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface-muted)] text-[var(--text)] font-semibold border border-[var(--border)] shrink-0">
                1
              </span>
              <span>Paste the offer</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-[var(--text-muted)]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface-muted)] text-[var(--text)] font-semibold border border-[var(--border)] shrink-0">
                2
              </span>
              <span>Review the observations</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-[var(--text-muted)]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface-muted)] text-[var(--text)] font-semibold border border-[var(--border)] shrink-0">
                3
              </span>
              <span>Verify with the sender</span>
            </div>
          </div>
        </Container>
      </header>
    </>
  );
}
