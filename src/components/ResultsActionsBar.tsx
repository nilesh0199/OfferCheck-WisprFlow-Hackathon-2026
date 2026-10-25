"use client";

import React, { useState, useCallback } from "react";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { buildReviewSummary } from "@/lib/analysis/summary";
import { generateReviewPdfBlob } from "@/lib/pdf/generateReviewPdf";
import { APP_NAME, HERO_HEADLINE } from "@/lib/config";
import { CopyIcon, CheckIcon, PrinterIcon, ShareIcon } from "./Icons";

interface ResultsActionsBarProps {
  analysis: ValidatedAnalysis;
  analyzedSnapshotText: string;
  sourceNote?: string;
  conversationText?: string;
  onClearSession?: () => void;
}

export function ResultsActionsBar({
  analysis,
  analyzedSnapshotText,
  sourceNote,
  conversationText,
}: ResultsActionsBarProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // Construct PDF title and print
  const handlePrint = useCallback(() => {
    if (typeof window === "undefined") return;

    const originalTitle = document.title;
    const dateStr = new Date().toISOString().split("T")[0];
    const newTitle = `OfferClara review ${dateStr}`;

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
  }, []);

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

  // Share review summary with PDF attachment, name, and tagline
  const handleShare = async () => {
    const summaryText = buildReviewSummary(analysis, analyzedSnapshotText, {
      sourceNote,
      conversationText,
    });

    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/check`
        : "/check";
    const shareTitle = `${APP_NAME} Review Summary — ${HERO_HEADLINE}`;
    const shareText = `${APP_NAME} — ${HERO_HEADLINE}\n\n${summaryText}\n\nReview an offer at: ${shareUrl}`;

    let pdfFile: File | null = null;
    try {
      const blob = generateReviewPdfBlob({
        analysis,
        analyzedSnapshotText,
        sourceNote,
        conversationText,
      });
      const companySlug = analysis.entities?.companyName
        ? analysis.entities.companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .slice(0, 30)
        : "offer";
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `offerclara-review-${companySlug}-${dateStr}.pdf`;
      pdfFile = new File([blob], filename, { type: "application/pdf" });
    } catch {
      // Fallback without file if File constructor unsupported
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        if (pdfFile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            files: [pdfFile],
          });
          setLiveAnnouncement("Shared review summary with PDF");
          return;
        }

        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setLiveAnnouncement("Shared review summary");
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setLiveAnnouncement("Review summary copied to clipboard");
      setTimeout(() => {
        setCopiedShare(false);
        setLiveAnnouncement("");
      }, 2000);
    } catch {
      // Fallback
    }
  };

  const openClearModal = () => {
    const dialog = document.getElementById("clear-review-dialog") as HTMLDialogElement | null;
    dialog?.showModal();
  };

  return (
    <>
      {/* Live announcement region */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-2 no-print print:hidden">
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
          aria-label="Share review summary with PDF"
        >
          {copiedShare ? (
            <>
              <CheckIcon className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Copied summary</span>
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
          Clear and start over
        </button>
      </div>
    </>
  );
}
