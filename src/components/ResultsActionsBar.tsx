"use client";

import React, { useRef, useState, useCallback } from "react";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { buildReviewSummary } from "@/lib/analysis/summary";
import { sortConcernsByPriority } from "@/lib/analysis/priorities";
import { getConcernCategoryLabel } from "@/lib/analysis/labels";
import { CopyIcon, CheckIcon, PrinterIcon, ShareIcon } from "./Icons";

interface ResultsActionsBarProps {
  analysis: ValidatedAnalysis;
  analyzedSnapshotText: string;
  sourceNote?: string;
  conversationText?: string;
  onClearSession: () => void;
}

export function ResultsActionsBar({
  analysis,
  analyzedSnapshotText,
  sourceNote,
  conversationText,
  onClearSession,
}: ResultsActionsBarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // Construct PDF title and print
  const handlePrint = useCallback(() => {
    if (typeof window === "undefined") return;

    const originalTitle = document.title;
    const company = analysis.entities?.companyName || "Offer";
    const dateStr = new Date().toISOString().split("T")[0];
    const newTitle = `OfferCheck Review - ${company} - ${dateStr}.pdf`;

    document.title = newTitle;

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    window.print();

    // Fallback restoration in case afterprint does not fire
    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);
  }, [analysis.entities?.companyName]);

  // Copy plain text review summary
  const handleCopySummary = async () => {
    const text = buildReviewSummary(analysis, analyzedSnapshotText, {
      sourceNote,
      conversationText,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setLiveAnnouncement("Review summary copied to clipboard");
      setTimeout(() => {
        setCopiedSummary(false);
        setLiveAnnouncement("");
      }, 2000);
    } catch {
      // Fallback
    }
  };

  // Safe share text that does NOT leak full offer text
  const handleShare = async () => {
    const sorted = sortConcernsByPriority(analysis.concerns);
    const top2 = sorted.slice(0, 2).map((c, i) => {
      const label = getConcernCategoryLabel(c.category);
      return `${i + 1}. ${label}: ${c.observation}`;
    });

    const concernsText =
      top2.length > 0
        ? top2.join(" ")
        : "No upfront fees or severe warning signs identified in the provided text.";

    const sharePayload = {
      title: "OfferCheck Internship Review",
      text: `I just reviewed an internship offer using OfferCheck. Here is what to watch out for: ${concernsText} Check yours at https://offercheck.app/check`,
      url: "https://offercheck.app/check",
    };

    if (navigator?.share) {
      try {
        await navigator.share(sharePayload);
        setLiveAnnouncement("Shared review summary");
        return;
      } catch {
        // User cancelled or unsupported, fallback to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(sharePayload.text);
      setCopiedShare(true);
      setLiveAnnouncement("Share message copied to clipboard");
      setTimeout(() => {
        setCopiedShare(false);
        setLiveAnnouncement("");
      }, 2000);
    } catch {
      // Fallback
    }
  };

  const openClearModal = () => {
    dialogRef.current?.showModal();
  };

  const closeClearModal = () => {
    dialogRef.current?.close();
  };

  const handleConfirmClear = () => {
    closeClearModal();
    onClearSession();
  };

  return (
    <>
      {/* Live announcement region */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
          aria-label="Save review as PDF"
        >
          <PrinterIcon className="w-4 h-4 text-[var(--text-muted)]" />
          <span>Save as PDF</span>
        </button>

        <button
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
          aria-label="Copy review summary to clipboard"
        >
          {copiedSummary ? (
            <>
              <CheckIcon className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Copy summary</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
          aria-label="Share review"
        >
          {copiedShare ? (
            <>
              <CheckIcon className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Copied link</span>
            </>
          ) : (
            <>
              <ShareIcon className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Share</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={openClearModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] transition-colors"
        >
          Start new review
        </button>
      </div>

      {/* Native Confirmation Dialog */}
      <dialog
        ref={dialogRef}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl backdrop:bg-[rgba(0,0,0,0.4)] max-w-md w-full text-[var(--text)] space-y-4"
        onCancel={closeClearModal}
      >
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-[var(--text)]">
            Clear this review?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Any text or answers you entered will be cleared from this browser tab&apos;s memory.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeClearModal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[var(--border)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[var(--border)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          >
            Save as PDF first
          </button>
          <button
            type="button"
            onClick={handleConfirmClear}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs sm:text-sm font-semibold hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          >
            Clear and start over
          </button>
        </div>
      </dialog>
    </>
  );
}
