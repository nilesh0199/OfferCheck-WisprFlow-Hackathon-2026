"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/config";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/Container";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sidebar } from "@/components/Sidebar";

export function TopBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Listen for voice command or programmatic sidebar triggers
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ open?: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.open === "boolean") {
        setSidebarOpen(customEvent.detail.open);
      } else {
        setSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  return (
    <>
      <header
        role="banner"
        aria-label="Main site navigation"
        className="sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--header-bg)] text-[var(--header-text)] transition-colors print:hidden"
      >
        <Container className="h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left Side: [sidebar toggle button] [logo mark + wordmark as one link to "/"] */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Sidebar toggle button: 44px square ghost button */}
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
              className="inline-flex items-center justify-center p-2 rounded-lg text-[var(--header-nav-text)] hover:text-[var(--header-text)] hover:bg-[var(--surface-muted)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] min-h-[44px] min-w-[44px] transition-colors"
            >
              <svg
                className="w-5 h-5 text-current"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <path d="M9 4v16" />
              </svg>
            </button>

            {/* Logo mark + wordmark "OfferClara" as one link to "/" */}
            <Link
              href="/"
              aria-label="OfferClara, home"
              className="inline-flex items-center gap-2 sm:gap-2.5 font-bold text-base tracking-tight text-[var(--header-text)] py-1.5 px-2 -ml-1 sm:-ml-2 rounded-lg outline-none hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] min-h-[44px]"
            >
              <Logo size={24} className="shrink-0" />
              <span>{APP_NAME}</span>
            </Link>
          </div>

          {/* Right Controls: Theme toggle + Home link + Primary "Check an offer" CTA button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle onHeader className="hidden sm:inline-flex" />

            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className={`hover:text-[var(--header-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] rounded py-1.5 px-2.5 text-sm sm:text-base font-medium inline-flex items-center min-h-[44px] ${
                pathname === "/"
                  ? "text-[var(--header-text)] font-semibold"
                  : "text-[var(--header-nav-text)]"
              }`}
            >
              Home
            </Link>

            <Link
              href="/check"
              className="inline-flex items-center justify-center rounded-xs bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-3.5 sm:px-4 py-2 text-sm sm:text-base font-medium shadow-2xs hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--header-text)] min-h-[44px]"
            >
              <span className="hidden min-[480px]:inline">Check an offer</span>
              <span className="min-[480px]:hidden">Check</span>
            </Link>
          </div>
        </Container>
      </header>

      {/* Slide-over Drawer Dialog */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
