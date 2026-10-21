"use client";

import React, { useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { LogoIcon, GitHubIcon, ExternalLinkIcon } from "@/components/Icons";
import { Container } from "@/components/Container";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      aria-label="Landing navigation"
      className="sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--header-bg)] text-[var(--header-text)] transition-colors"
    >
      <Container className="h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-base tracking-tight text-[var(--header-text)] py-1 px-2 -ml-2 rounded-lg outline-none hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)]"
          >
            <LogoIcon className="w-5 h-5 text-[var(--header-text)] shrink-0" />
            <span>{APP_NAME}</span>
          </Link>
        </div>

        {/* Desktop Anchor Links */}
        <div className="hidden md:flex items-center gap-5 text-xs font-medium text-[var(--header-nav-text)]">
          <a
            href="#how-it-works"
            className="hover:text-[var(--header-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] rounded py-1 px-1.5"
          >
            How it works
          </a>
          <a
            href="#what-you-get"
            className="hover:text-[var(--header-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] rounded py-1 px-1.5"
          >
            What you get
          </a>
          <a
            href="#privacy"
            className="hover:text-[var(--header-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] rounded py-1 px-1.5"
          >
            Privacy
          </a>
          <a
            href="#faq"
            className="hover:text-[var(--header-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] rounded py-1 px-1.5"
          >
            FAQ
          </a>
          <Link
            href="/resources"
            className="hover:text-[var(--header-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] rounded py-1 px-1.5"
          >
            Resources
          </Link>
          <a
            href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-[var(--header-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] rounded py-1 px-1.5"
            aria-label="GitHub repository (opens in a new tab)"
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <ExternalLinkIcon className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* Action Button & Theme Selector */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle onHeader />

          <Link
            href="/check"
            className="inline-flex items-center justify-center rounded-xs bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-3.5 py-1.5 text-xs font-medium shadow-2xs hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] min-h-[36px]"
          >
            Check an offer
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-xs border border-[var(--color-border-strong)]/40 text-[var(--header-nav-text)] hover:text-[var(--header-text)] hover:bg-[var(--surface-muted)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] min-h-[36px] min-w-[36px]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-[var(--text-muted)]">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xs hover:bg-[var(--surface-muted)] hover:text-[var(--text)] transition-colors min-h-[40px] flex items-center"
            >
              How it works
            </a>
            <a
              href="#what-you-get"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xs hover:bg-[var(--surface-muted)] hover:text-[var(--text)] transition-colors min-h-[40px] flex items-center"
            >
              What you get
            </a>
            <a
              href="#privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xs hover:bg-[var(--surface-muted)] hover:text-[var(--text)] transition-colors min-h-[40px] flex items-center"
            >
              Privacy
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xs hover:bg-[var(--surface-muted)] hover:text-[var(--text)] transition-colors min-h-[40px] flex items-center"
            >
              FAQ
            </a>
            <Link
              href="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xs hover:bg-[var(--surface-muted)] hover:text-[var(--text)] transition-colors min-h-[40px] flex items-center"
            >
              Resources
            </Link>
            <a
              href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xs hover:bg-[var(--surface-muted)] hover:text-[var(--text)] transition-colors min-h-[40px] flex items-center gap-2"
            >
              <GitHubIcon className="w-4 h-4" />
              <span>GitHub repository</span>
              <ExternalLinkIcon className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
