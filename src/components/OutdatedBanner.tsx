import React from "react";
import { InfoIcon } from "./Icons";

export function OutdatedBanner() {
  return (
    <div
      role="status"
      className="rounded-xl border border-slate-300 bg-slate-150/80 p-3.5 text-xs sm:text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 shadow-xs transition-colors"
    >
      <div className="flex items-start gap-2.5">
        <InfoIcon
          className="mt-0.5 w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0"
          size={16}
        />
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Review outdated
          </p>
          <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
            The text in the box has changed since this review was generated.
            The findings and highlights below correspond to your previously analyzed text snapshot. Click &quot;Analyze offer&quot; to review the updated text.
          </p>
        </div>
      </div>
    </div>
  );
}
