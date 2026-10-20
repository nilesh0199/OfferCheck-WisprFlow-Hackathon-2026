import React from "react";
import { ValidatedMissingInfo } from "@/lib/analysis/schema";
import { getMissingInfoTopicLabel } from "@/lib/analysis/labels";

interface MissingInfoSectionProps {
  missingInfo: readonly ValidatedMissingInfo[];
}

export function MissingInfoSection({ missingInfo }: MissingInfoSectionProps) {
  return (
    <section aria-labelledby="missing-info-heading" className="space-y-4">
      <div>
        <h3
          id="missing-info-heading"
          className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
        >
          <span>Section B: Missing or unclear information</span>
          <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
            ({missingInfo.length} {missingInfo.length === 1 ? "item" : "items"})
          </span>
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Not included in the provided text does not prove the term does not
          exist. These are standard internship terms that were unstated or
          ambiguous in the excerpt.
        </p>
      </div>

      {missingInfo.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            No standard terms were flagged as unstated.
          </p>
          <p className="mt-1 text-xs">
            Review the full text carefully to ensure all expectations are
            documented.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {missingInfo.map((item, idx) => {
            const topicLabel = getMissingInfoTopicLabel(item.topic);
            return (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <span className="text-zinc-400 dark:text-zinc-500">
                      #{idx + 1}
                    </span>
                    <span>{topicLabel}</span>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {item.note}
                  </p>
                </div>
                {item.relatedQuote && (
                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium">Mentioned: </span>
                    <span className="italic font-mono">
                      &ldquo;{item.relatedQuote}&rdquo;
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
