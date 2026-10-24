"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, TAGLINE } from "@/lib/config";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GitHubIcon, ExternalLinkIcon } from "@/components/Icons";

export function MenuSheet() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    }
  };

  const closeMenu = () => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
      setIsOpen(false);
      document.body.style.overflow = "";
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      closeMenu();
    }
  };

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    closeMenu();
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const shareTitle = APP_NAME;
  const shareText = `${APP_NAME}: ${TAGLINE} Check job and internship offers before you pay or share documents.`;
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
        // Fall back to clipboard if share was dismissed or unsupported
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard unavailable
      }
    }
  };

  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`
  )}`;

  return (
    <>
      {/* 44 px menu button top-left */}
      <button
        type="button"
        onClick={openMenu}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] min-w-[44px] transition-colors"
      >
        <Logo size={24} className="shrink-0" />
        <svg
          className="w-5 h-5 text-[var(--text)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span className="font-semibold text-sm tracking-tight text-[var(--text)]">
          {APP_NAME}
        </span>
      </button>

      {/* Slide-over Menu Panel Dialog */}
      <dialog
        ref={dialogRef}
        aria-label="OfferClara menu"
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
        }}
        onClick={handleBackdropClick}
        className={`fixed inset-y-0 left-0 m-0 h-full max-h-none w-[min(320px,calc(100vw-56px))] border-0 border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text)] p-0 shadow-2xl backdrop:bg-[rgba(0,0,0,0.45)] backdrop:backdrop-blur-xs z-50 transition-transform duration-200 ease-out motion-reduce:transition-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Top Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <Logo size={32} className="shrink-0" />
              <div>
                <div className="font-bold text-base tracking-tight text-[var(--text)]">
                  {APP_NAME}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {TAGLINE}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="inline-flex items-center justify-center p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] min-w-[44px] transition-colors"
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

          {/* Navigation Links */}
          <nav
            aria-label="Menu navigation links"
            className="flex-1 p-3 space-y-1 text-sm font-medium"
          >
            {/* 1. Primary Action: Check an offer */}
            <Link
              href="/check"
              onClick={closeMenu}
              aria-current={pathname === "/check" ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg min-h-[44px] transition-colors ${
                pathname === "/check"
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-contrast)] font-semibold"
                  : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 font-semibold"
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0"
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

            {/* 2. Clear doubt with AI */}
            <Link
              href="/ask"
              onClick={closeMenu}
              aria-current={pathname === "/ask" ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg min-h-[44px] hover:bg-[var(--surface-muted)] transition-colors ${
                pathname === "/ask"
                  ? "text-[var(--text)] font-semibold bg-[var(--surface-muted)]"
                  : "text-[var(--text)]"
              }`}
            >
              <svg
                className="w-5 h-5 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Clear doubt with AI</span>
            </Link>

            {/* 3. Resources */}
            <Link
              href="/resources"
              onClick={closeMenu}
              aria-current={pathname === "/resources" ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg min-h-[44px] hover:bg-[var(--surface-muted)] transition-colors ${
                pathname === "/resources"
                  ? "text-[var(--text)] font-semibold bg-[var(--surface-muted)]"
                  : "text-[var(--text)]"
              }`}
            >
              <svg
                className="w-5 h-5 text-[var(--text-muted)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>Resources</span>
            </Link>

            <div className="py-2">
              <hr className="border-[var(--border)]" />
            </div>

            {/* 4. How it works */}
            <Link
              href="/#how-it-works"
              onClick={(e) => handleSectionClick(e, "how-it-works")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg min-h-[44px] text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <svg
                className="w-5 h-5 text-[var(--text-muted)] shrink-0"
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg min-h-[44px] text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <svg
                className="w-5 h-5 text-[var(--text-muted)] shrink-0"
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg min-h-[44px] text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <svg
                className="w-5 h-5 text-[var(--text-muted)] shrink-0"
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
              onClick={closeMenu}
              aria-current={pathname === "/privacy" ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg min-h-[44px] hover:bg-[var(--surface-muted)] transition-colors ${
                pathname === "/privacy"
                  ? "text-[var(--text)] font-semibold bg-[var(--surface-muted)]"
                  : "text-[var(--text)]"
              }`}
            >
              <svg
                className="w-5 h-5 text-[var(--text-muted)] shrink-0"
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
              onClick={closeMenu}
              aria-current={pathname === "/about" ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg min-h-[44px] hover:bg-[var(--surface-muted)] transition-colors ${
                pathname === "/about"
                  ? "text-[var(--text)] font-semibold bg-[var(--surface-muted)]"
                  : "text-[var(--text)]"
              }`}
            >
              <svg
                className="w-5 h-5 text-[var(--text-muted)] shrink-0"
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
              className="flex items-center justify-between px-3 py-2.5 rounded-lg min-h-[44px] text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <GitHubIcon className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                <span>GitHub</span>
              </div>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </a>

            <div className="py-2">
              <hr className="border-[var(--border)]" />
            </div>

            {/* 10. Share */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg min-h-[44px] text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[var(--text-muted)] shrink-0"
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
                <span>{copied ? "Link copied!" : "Share OfferClara"}</span>
              </div>
              {copied && (
                <span className="text-xs font-mono text-[var(--color-primary)]">
                  Copied
                </span>
              )}
            </button>

            {/* Direct WhatsApp Share */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg min-h-[44px] text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[var(--text-muted)] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
                <span>Share via WhatsApp</span>
              </div>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </a>
          </nav>

          {/* Bottom Theme Selector */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-muted)]/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Theme
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
