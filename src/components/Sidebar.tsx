"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME, TAGLINE, HERO_HEADLINE } from "@/lib/config";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GitHubIcon, ExternalLinkIcon } from "@/components/Icons";
import { itemHeightRem } from "@/lib/sidebar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerHeight : 800
  );
  const pathname = usePathname();
  const router = useRouter();

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClose();
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    if (pathname === "/") {
      e.preventDefault();
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      } catch {
        window.scrollTo(0, 0);
      }
      if (typeof window !== "undefined" && window.location.hash) {
        window.history.pushState(null, "", "/");
      }
    } else {
      e.preventDefault();
      router.push("/");
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  };

  // Track viewport height for zero-scroll sizing
  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync dialog modal with isOpen state and lock page scrolling
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Prevent wheel and touch dragging from scrolling background page while sidebar is open
  useEffect(() => {
    if (!isOpen) return;

    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      onClose();
    }
  };

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    onClose();
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${hash}`);
      }
    }
  };

  const shareTitle = `${APP_NAME} — ${HERO_HEADLINE}`;
  const shareText = `${HERO_HEADLINE} Check job and internship offers before you pay or share documents with ${APP_NAME}.`;
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://offerclara.vercel.app";

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall back to clipboard if share was cancelled or unavailable
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard unavailable
      }
    }
  };

  // Check if /ask exists (Part 2 creates it; in Part 1 it does not exist)
  // We do NOT render /ask until Part 2
  const hasAskRoute = false;

  // Active items count: Home, Check, Help & reporting, How it works, What you get, FAQ, Privacy, About, GitHub, Share
  const itemCount = hasAskRoute ? 11 : 10;
  const itemHeight = itemHeightRem(viewportHeight, itemCount);
  const isCompact = viewportHeight < 560;

  return (
    <dialog
      id="app-sidebar"
      ref={dialogRef}
      aria-label="OfferClara navigation sidebar"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (isOpen) {
          onClose();
        }
      }}
      onClick={handleBackdropClick}
      className={`fixed inset-y-0 left-0 m-0 h-[100dvh] max-h-none w-[min(320px,calc(100vw-56px))] border-0 border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text)] p-0 shadow-2xl backdrop:bg-[rgba(0,0,0,0.45)] backdrop:backdrop-blur-xs z-50 overflow-hidden overscroll-contain select-none transition-transform duration-200 ease-out motion-reduce:transition-none print:hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-[100dvh] overflow-hidden">
        {/* Panel Header */}
        <div
          className={`flex items-center justify-between border-b border-[var(--border)] shrink-0 ${
            isCompact ? "p-2.5 px-3" : "p-3.5 px-4"
          }`}
        >
          <Link
            href="/"
            onClick={handleHomeClick}
            aria-label="OfferClara, home"
            className="flex items-center gap-2.5 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
          >
            <Logo size={isCompact ? 24 : 28} className="shrink-0" />
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-[var(--text)] leading-tight">
                {APP_NAME}
              </div>
              {!isCompact && (
                <div className="text-[0.75rem] text-[var(--text-muted)] leading-tight mt-0.5">
                  {TAGLINE}
                </div>
              )}
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] min-w-[44px] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items (Zero-Scroll Flex Column) */}
        <nav
          aria-label="Sidebar navigation links"
          className="flex-1 flex flex-col justify-between p-2 sm:p-2.5 overflow-hidden"
        >
          <div className="flex-1 flex flex-col justify-evenly">
            {/* 1. Home */}
            <Link
              href="/"
              onClick={handleHomeClick}
              aria-current={pathname === "/" ? "page" : undefined}
              style={{ minHeight: `${itemHeight}rem` }}
              className={`flex items-center gap-3 px-3 rounded-lg text-sm transition-colors ${
                pathname === "/"
                  ? "bg-[var(--surface-muted)] text-[var(--text)] font-semibold"
                  : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <svg
                className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Home</span>
            </Link>

            {/* 2. Check an offer (Primary) */}
            <Link
              href="/check"
              onClick={onClose}
              aria-current={pathname === "/check" ? "page" : undefined}
              style={{ minHeight: `${itemHeight}rem` }}
              className={`flex items-center gap-3 px-3 rounded-lg text-sm transition-colors ${
                pathname === "/check"
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-contrast)] font-semibold"
                  : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 font-semibold"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Check an offer</span>
            </Link>

            {/* 3. Clear doubt with AI */}
            <Link
              href="/ask"
              onClick={onClose}
              aria-current={pathname === "/ask" ? "page" : undefined}
              style={{ minHeight: `${itemHeight}rem` }}
              className={`flex items-center gap-3 px-3 rounded-lg text-sm transition-colors ${
                pathname === "/ask"
                  ? "bg-[var(--surface-muted)] text-[var(--text)] font-semibold"
                  : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <svg
                className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Clear doubt with AI</span>
            </Link>

            {/* 4. Help and reporting (formerly Resources) */}
            <Link
              href="/resources"
              onClick={onClose}
              aria-current={pathname === "/resources" ? "page" : undefined}
              style={{ minHeight: `${itemHeight}rem` }}
              className={`flex items-center gap-3 px-3 rounded-lg text-sm transition-colors ${
                pathname === "/resources"
                  ? "bg-[var(--surface-muted)] text-[var(--text)] font-semibold"
                  : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <svg
                className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Help and reporting</span>
            </Link>

            {/* Divider (hidden in compact) */}
            {!isCompact && (
              <div className="py-0.5">
                <hr className="border-[var(--border)]" />
              </div>
            )}

            {/* 4. How it works */}
            <Link
              href="/#how-it-works"
              onClick={(e) => handleSectionClick(e, "how-it-works")}
              style={{ minHeight: `${itemHeight}rem` }}
              className="flex items-center gap-3 px-3 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <svg
                className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span>How it works</span>
            </Link>

            {/* 5. What you get */}
            <Link
              href="/#what-you-get"
              onClick={(e) => handleSectionClick(e, "what-you-get")}
              style={{ minHeight: `${itemHeight}rem` }}
              className="flex items-center gap-3 px-3 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <svg
                className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>What you get</span>
            </Link>

            {/* 6. FAQ */}
            <Link
              href="/#faq"
              onClick={(e) => handleSectionClick(e, "faq")}
              style={{ minHeight: `${itemHeight}rem` }}
              className="flex items-center gap-3 px-3 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <svg
                className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>FAQ</span>
            </Link>

            {/* 7. Privacy */}
            <Link
              href="/privacy"
              onClick={onClose}
              aria-current={pathname === "/privacy" ? "page" : undefined}
              style={{ minHeight: `${itemHeight}rem` }}
              className={`flex items-center gap-3 px-3 rounded-lg text-sm transition-colors ${
                pathname === "/privacy"
                  ? "bg-[var(--surface-muted)] text-[var(--text)] font-semibold"
                  : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <svg
                className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Privacy</span>
            </Link>

            {/* 8. About */}
            <Link
              href="/about"
              onClick={onClose}
              aria-current={pathname === "/about" ? "page" : undefined}
              style={{ minHeight: `${itemHeight}rem` }}
              className={`flex items-center gap-3 px-3 rounded-lg text-sm transition-colors ${
                pathname === "/about"
                  ? "bg-[var(--surface-muted)] text-[var(--text)] font-semibold"
                  : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <svg
                className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>About</span>
            </Link>

            {/* 9. GitHub */}
            <a
              href="https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026"
              target="_blank"
              rel="noopener noreferrer"
              style={{ minHeight: `${itemHeight}rem` }}
              className="flex items-center justify-between px-3 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <GitHubIcon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <span>GitHub</span>
              </div>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </a>

            {/* 10. Share */}
            <button
              type="button"
              onClick={handleShare}
              style={{ minHeight: `${itemHeight}rem` }}
              className="w-full flex items-center justify-between px-3 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-[var(--text-muted)] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>{copied ? "Link copied" : "Share"}</span>
              </div>
              {copied && (
                <span className="text-xs font-mono text-[var(--color-primary)]">
                  Copied
                </span>
              )}
            </button>
          </div>

          {/* Bottom Theme Control */}
          <div className="pt-2 border-t border-[var(--border)] shrink-0">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Theme
              </span>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>
    </dialog>
  );
}
