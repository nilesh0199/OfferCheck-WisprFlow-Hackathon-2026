import React from "react";
import { APP_NAME, TAGLINE } from "@/lib/config";
import { LogoIcon, GitHubIcon, ExternalLinkIcon } from "./Icons";

export function Header() {
  return (
    <>
      {/* Slim sticky top navigation bar */}
      <nav
        aria-label="Main navigation"
        className="sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md"
      >
        <div className="max-w-[1152px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="flex items-center gap-2 font-bold text-base tracking-tight text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
            >
              <LogoIcon className="w-5 h-5 text-[var(--accent)]" />
              <span>{APP_NAME}</span>
            </a>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
              Hackathon prototype
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <a
              href="#how-it-works"
              className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1.5"
            >
              How it works
            </a>
            <a
              href="#limits"
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
        </div>
      </nav>

      {/* Hero section */}
      <header className="pt-6 sm:pt-8 pb-4 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
          {TAGLINE}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--text-muted)] max-w-3xl leading-relaxed">
          Paste an internship offer, get evidence-linked observations and
          questions to verify before you pay or share documents.
        </p>

        {/* Three-step strip */}
        <div
          id="how-it-works"
          className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-[var(--border)]"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface-muted)] text-[var(--text)] font-semibold border border-[var(--border)] shrink-0">
              1
            </span>
            <span>Paste the offer</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface-muted)] text-[var(--text)] font-semibold border border-[var(--border)] shrink-0">
              2
            </span>
            <span>Review the observations</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface-muted)] text-[var(--text)] font-semibold border border-[var(--border)] shrink-0">
              3
            </span>
            <span>Verify with the sender</span>
          </div>
        </div>
      </header>
    </>
  );
}
