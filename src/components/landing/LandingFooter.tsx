import React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { GitHubIcon, ExternalLinkIcon } from "@/components/Icons";

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] py-8 transition-colors">
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-medium text-[var(--text)]">OfferCheck</p>
          <p>Built for the No Hands: Wispr Challenge (WeMakeDevs x Wispr Flow).</p>
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
            href="/resources"
            className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
          >
            Resources
          </Link>
          <Link
            href="/privacy"
            className="hover:text-[var(--text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
          >
            Privacy
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
  );
}
