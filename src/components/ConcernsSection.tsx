import React from "react";
import { ValidatedConcern } from "@/lib/analysis/schema";
import { getConcernCategoryLabel } from "@/lib/analysis/labels";

interface ConcernsSectionProps {
  concerns: readonly ValidatedConcern[];
  onShowInText: (concernId: string) => void;
}

export function ConcernsSection({
  concerns,
  onShowInText,
}: ConcernsSectionProps) {
  return (
    <section aria-labelledby="concerns-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          id="concerns-heading"
          className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
        >
          <span>Section A: Potential concerns</span>
          <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
            ({concerns.length} {concerns.length === 1 ? "item" : "items"})
          </span>
        </h3>
      </div>

      {concerns.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            No specific concerns were identified in the text provided.
          </p>
          <p className="mt-1 text-xs">
            This observation applies only to the explicit statements in your
            pasted text. It is not a safety assessment or guarantee of
            legitimacy.
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
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      #{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {categoryLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onShowInText(concern.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-100 active:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 min-h-[36px]"
                    aria-label={`Scroll to quote for concern ${idx + 1}: ${categoryLabel}`}
                  >
                    <span aria-hidden="true">🔍</span>
                    <span>Show in text</span>
                  </button>
                </div>

                {/* Observation */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    What the text says
                  </h4>
                  <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {concern.observation}
                  </p>
                </div>

                {/* Interpretation */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Why it may matter
                  </h4>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {concern.interpretation}
                  </p>
                </div>

                {/* Verbatim Quote */}
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    From your text:
                  </div>
                  <blockquote className="text-xs sm:text-sm italic font-mono text-zinc-800 dark:text-zinc-200 break-words">
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
