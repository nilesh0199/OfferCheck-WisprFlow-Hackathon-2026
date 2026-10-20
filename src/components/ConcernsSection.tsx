import React from "react";
import { ValidatedConcern } from "@/lib/analysis/schema";
import { getConcernCategoryLabel } from "@/lib/analysis/labels";
import { sentenceCase } from "@/lib/analysis/sentence-case";
import { AttentionIcon, SearchIcon } from "./Icons";

interface ConcernsSectionProps {
  concerns: readonly ValidatedConcern[];
  onShowInText: (concernId: string) => void;
}

export function ConcernsSection({
  concerns,
  onShowInText,
}: ConcernsSectionProps) {
  return (
    <section id="section-observations" aria-labelledby="concerns-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          id="concerns-heading"
          className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"
        >
          <span>Section A: Potential concerns</span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {concerns.length} {concerns.length === 1 ? "item" : "items"}
          </span>
        </h3>
      </div>

      {concerns.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <p className="text-slate-600 dark:text-slate-400">
            No concerns listed for this text. See the missing details below.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {concerns.map((concern, idx) => {
            const categoryLabel = getConcernCategoryLabel(concern.category);
            return (
              <div
                key={concern.id}
                id={`concern-card-${concern.id}`}
                className="rounded-xl border border-amber-200/80 border-l-4 border-l-amber-500 bg-amber-50/40 p-5 shadow-xs dark:border-amber-900/60 dark:border-l-amber-500 dark:bg-stone-900/40 space-y-3 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3 dark:border-amber-900/50">
                  <div className="flex items-center gap-2">
                    <AttentionIcon
                      className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0"
                      size={16}
                    />
                    <span className="inline-flex items-center justify-center rounded-md bg-amber-100/80 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
                      #{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {categoryLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onShowInText(concern.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-xs hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 min-h-[36px]"
                    aria-label={`Scroll to quote for concern ${idx + 1}: ${categoryLabel}`}
                  >
                    <SearchIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Show in text</span>
                  </button>
                </div>

                {/* Observation */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    What the text says
                  </h4>
                  <p className="mt-1 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {sentenceCase(concern.observation)}
                  </p>
                </div>

                {/* Interpretation */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Why it may matter
                  </h4>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sentenceCase(concern.interpretation)}
                  </p>
                </div>

                {/* Verbatim Quote */}
                <div className="rounded-lg bg-white/80 p-3.5 dark:bg-slate-950/60 border border-amber-200/70 dark:border-amber-900/40">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    From your text:
                  </div>
                  <blockquote className="text-xs sm:text-sm italic font-mono text-slate-800 dark:text-slate-200 break-words">
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
