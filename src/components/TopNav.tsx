"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuSheet } from "@/components/MenuSheet";
import { Container } from "@/components/Container";

interface TopNavProps {
  rightAction?: React.ReactNode;
}

export function TopNav({ rightAction }: TopNavProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <header
      role="banner"
      aria-label="Site header"
      className="w-full bg-[var(--bg)] text-[var(--text)] transition-colors h-12 sm:h-14 flex items-center print:hidden"
    >
      <Container className="w-full flex items-center justify-between">
        {/* Top-left: 44px menu button */}
        <MenuSheet />

        {/* Top-right: On landing page, primary 'Check an offer' button (or custom rightAction if provided) */}
        {rightAction !== undefined ? (
          rightAction
        ) : isLanding ? (
          <Link
            href="/check"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-3.5 py-1.5 text-xs sm:text-sm font-semibold shadow-2xs hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          >
            Check an offer
          </Link>
        ) : null}
      </Container>
    </header>
  );
}
