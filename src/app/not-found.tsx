import Link from "next/link";
import { Container } from "@/components/Container";
import { LogoIcon } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { APP_NAME } from "@/lib/config";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between">
      <nav className="w-full border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
        <Container className="h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-base tracking-tight text-[var(--text)] py-1 px-2 -ml-2 rounded-lg outline-none hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            <LogoIcon className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <span>{APP_NAME}</span>
          </Link>

          <ThemeToggle />
        </Container>
      </nav>

      <Container as="main" className="py-16 sm:py-24 flex-1 flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10 shadow-xs space-y-6">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
            404 — Page not found
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
              This page does not exist
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              The link you followed may be outdated or incorrect. You can return to the home page or open the offer review tool directly.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/check"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-5 py-2.5 text-xs font-medium shadow-xs hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
            >
              Check an offer
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-4 py-2.5 text-xs font-medium shadow-xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
            >
              Back to home
            </Link>
          </div>
        </div>
      </Container>

      <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] py-6 text-center text-xs text-[var(--text-muted)]">
        <p>Built for the No Hands: Wispr Challenge.</p>
      </footer>
    </div>
  );
}
