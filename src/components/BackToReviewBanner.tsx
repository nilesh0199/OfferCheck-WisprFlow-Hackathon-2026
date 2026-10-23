"use client";

import React from "react";
import Link from "next/link";
import { useOfferSession } from "./SessionProvider";

export function BackToReviewBanner() {
  const { analysis } = useOfferSession();

  if (!analysis) return null;

  return (
    <aside
      aria-label="Active review navigation"
      className="w-full bg-[var(--tint-info-bg)] border-b border-[var(--border)] py-2 px-4 text-xs transition-colors"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <span className="text-[var(--text)] font-medium">
          You have an active review in this tab.
        </span>
        <Link
          href="/check"
          className="font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 min-h-[36px] py-1 px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
        >
          <span>Back to your review</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
}
