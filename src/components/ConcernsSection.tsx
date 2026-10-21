import React from "react";
import { ValidatedConcern } from "@/lib/analysis/schema";
import { getConcernCategoryLabel } from "@/lib/analysis/labels";
import { sentenceCase } from "@/lib/analysis/sentence-case";
import { AttentionIcon, SearchIcon } from "./Icons";

interface ConcernsSectionProps {
  concerns: readonly ValidatedConcern[];
  onShowInText: (concernId: string) => void;
  activeConcernId?: string | null;
  onHoverConcern?: (concernId: string | null) => void;
}

export function ConcernsSection({
  concerns,
  onShowInText,
  activeConcernId,
  onHoverConcern,
}: ConcernsSectionProps) {
  return (
    <section id="section-observations" aria-labelledby="concerns-heading" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3
          id="concerns-heading"
          className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2"
        >
          <span>Section A: Potential concerns</span>
          <span className="inline-flex items-center rounded-xs bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-mono font-medium text-[var(--text-muted)] border border-[var(--border)]">
            {concerns.length} {concerns.length === 1 ? "item" : "items"}
          </span>
        </h3>
      </div>

      {concerns.length === 0 ? (
        <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--text-muted)] shadow-2xs">
          <p className="text-[var(--text)] font-medium">
            No specific concerns were identified in the text provided.
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Review missing details and verification questions below before proceeding.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {concerns.map((concern, idx) => {
            const categoryLabel = getConcernCategoryLabel(concern.category);
            const isTargeted = activeConcernId === concern.id;

            return (
              <div
                key={concern.id}
                id={`concern-card-${concern.id}`}
                tabIndex={0}
                onMouseEnter={() => onHoverConcern?.(concern.id)}
                onMouseLeave={() => onHoverConcern?.(null)}
                onFocus={() => {
                  onHoverConcern?.(concern.id);
                  const el = document.getElementById(`rail-highlight-${concern.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }
                }}
                onBlur={() => onHoverConcern?.(null)}
                className={`rounded border p-4 sm:p-5 shadow-2xs space-y-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  isTargeted
                    ? "border-l-4 border-l-[var(--color-accent-highlight)] bg-[var(--tint-attention-bg)] ring-1 ring-[var(--tint-attention-border)]"
                    : "border-[var(--border)] border-l-[3px] border-l-[var(--tint-attention-border)] bg-[var(--tint-attention-bg)]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <AttentionIcon
                      className="w-4 h-4 text-[var(--tint-attention-accent)] shrink-0"
                      size={16}
                    />
                    <span className="inline-flex items-center justify-center rounded-xs bg-[var(--surface)] px-1.5 py-0.5 text-xs font-mono font-semibold text-[var(--text)] border border-[var(--border)]">
                      #{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                      {categoryLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onShowInText(concern.id)}
                    className="inline-flex items-center gap-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
                    aria-label={`Scroll to quote for concern ${idx + 1}: ${categoryLabel}`}
                  >
                    <SearchIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Show in text</span>
                  </button>
                </div>

                {/* Observation */}
                <div>
                  <h4 className="text-xs font-sans text-[var(--text-muted)] font-semibold">
                    What the text says
                  </h4>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--text)] leading-relaxed max-w-[70ch]">
                    {sentenceCase(concern.observation)}
                  </p>
                </div>

                {/* Interpretation */}
                <div className="pt-2 border-t border-[var(--border)]">
                  <h4 className="text-xs font-sans text-[var(--text-muted)] font-semibold">
                    Why caution is recommended
                  </h4>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-relaxed max-w-[70ch]">
                    {sentenceCase(concern.interpretation)}
                  </p>
                </div>

                {/* Direct Quote Reference */}
                <div className="pt-1.5 border-t border-[var(--border)] flex items-baseline gap-2 text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text)] font-sans">
                    Quote:
                  </span>
                  <blockquote className="italic font-mono break-words border-l border-[var(--border)] pl-2 max-w-[70ch]">
                    &ldquo;{concern.quote}&rdquo;
                  </blockquote>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
