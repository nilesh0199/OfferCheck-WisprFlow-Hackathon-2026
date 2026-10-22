"use client";

import React, { useState } from "react";
import { SYNTHETIC_EXAMPLES, SyntheticExample } from "@/data/examples";

interface SampleCardsProps {
  currentText: string;
  onSelectSample: (text: string) => void;
  disabled?: boolean;
}

export function SampleCards({
  currentText,
  onSelectSample,
  disabled = false,
}: SampleCardsProps) {
  const [pendingSample, setPendingSample] = useState<SyntheticExample | null>(null);

  const handleCardClick = (sample: SyntheticExample) => {
    if (disabled) return;

    const trimmed = currentText.trim();
    const isCustomText =
      trimmed.length > 0 &&
      !SYNTHETIC_EXAMPLES.some((ex) => ex.text.trim() === trimmed);

    if (isCustomText) {
      setPendingSample(sample);
    } else {
      onSelectSample(sample.text);
      setPendingSample(null);
    }
  };

  const handleConfirmReplace = () => {
    if (pendingSample) {
      onSelectSample(pendingSample.text);
      setPendingSample(null);
    }
  };

  const handleCancelReplace = () => {
    setPendingSample(null);
  };

  return (
    <div className="space-y-3 w-full">
      {/* Inline confirmation when custom text exists */}
      {pendingSample && (
        <div
          role="alert"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs text-[var(--text)] space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-[var(--text)]">
              Replace your current text with &ldquo;{pendingSample.title}&rdquo;?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmReplace}
                className="rounded-md bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-3.5 py-2 text-xs font-semibold hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleCancelReplace}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-3.5 py-2 text-xs font-medium hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of sample cards */}
      <div className="space-y-2.5">
        {SYNTHETIC_EXAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => handleCardClick(sample)}
            disabled={disabled}
            className="w-full text-left p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/60 hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-semibold text-[var(--text)] group-hover:text-[var(--color-primary)]">
                {sample.title}
              </span>
              <span className="text-xs font-sans text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                Use sample
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
              {sample.text.slice(0, 140)}...
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
