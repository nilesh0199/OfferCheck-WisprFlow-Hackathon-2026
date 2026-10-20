import React from "react";

export function OutdatedBanner() {
  return (
    <div
      role="status"
      className="rounded-lg border border-zinc-300 bg-zinc-100/90 p-3.5 text-xs sm:text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200"
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 inline-block text-base select-none"
          aria-hidden="true"
        >
          ℹ️
        </span>
        <div>
          <p className="font-semibold">Review outdated</p>
          <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">
            The text in the box has changed since this review was generated.
            The findings and highlights below correspond to your previously analyzed text snapshot. Click &quot;Analyze offer&quot; to review the updated text.
          </p>
        </div>
      </div>
    </div>
  );
}
