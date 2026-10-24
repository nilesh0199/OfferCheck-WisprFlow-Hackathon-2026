"use client";

import React, { useCallback } from "react";
import { ValidatedAnalysis } from "@/lib/analysis/schema";

interface ClearReviewDialogProps {
  analysis: ValidatedAnalysis | null;
  onClearSession: () => void;
}

export function ClearReviewDialog({
  analysis,
  onClearSession,
}: ClearReviewDialogProps) {
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

    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);
  }, []);

  const closeDialog = () => {
    const dialog = document.getElementById("clear-review-dialog") as HTMLDialogElement | null;
    dialog?.close();
  };

  const handleConfirmClear = () => {
    closeDialog();
    onClearSession();
  };

  return (
    <dialog
      id="clear-review-dialog"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl backdrop:bg-[rgba(0,0,0,0.4)] max-w-md w-full text-[var(--text)] space-y-4 print:hidden"
      onCancel={closeDialog}
    >
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-[var(--text)]">
          Start a new review?
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          Any text or answers you entered will be cleared from this browser tab&apos;s memory.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={closeDialog}
          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[var(--border)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          autoFocus
        >
          Cancel
        </button>
        {Boolean(analysis) && (
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[var(--border)] text-xs sm:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
          >
            Save as PDF first
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirmClear}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] text-xs sm:text-sm font-semibold hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
        >
          Clear and start over
        </button>
      </div>
    </dialog>
  );
}
