import React from "react";
import { InfoIcon } from "./Icons";

export function OutdatedBanner() {
  return (
    <div
      role="status"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3.5 text-xs sm:text-sm text-[var(--color-text)] shadow-xs transition-colors"
    >
      <div className="flex items-start gap-2.5">
        <InfoIcon
          className="mt-0.5 w-4 h-4 text-[var(--color-text-muted)] shrink-0"
          size={16}
        />
        <div>
          <p className="font-semibold text-[var(--color-text)]">
            Review outdated
          </p>
          <p className="mt-0.5 text-[var(--color-text-muted)] leading-relaxed">
            The text in the box has changed since this review was generated.
            The findings and highlights below correspond to your previously analyzed text snapshot. Click &quot;Analyze offer&quot; to review the updated text.
          </p>
        </div>
      </div>
    </div>
  );
}
