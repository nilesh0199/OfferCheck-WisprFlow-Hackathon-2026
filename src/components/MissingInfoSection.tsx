import React from "react";
import { ValidatedMissingInfo } from "@/lib/analysis/schema";
import { getMissingInfoTopicLabel } from "@/lib/analysis/labels";
import { sentenceCase } from "@/lib/analysis/sentence-case";

interface MissingInfoSectionProps {
  missingInfo: readonly ValidatedMissingInfo[];
}

export function MissingInfoSection({ missingInfo }: MissingInfoSectionProps) {
  return (
    <section id="section-missing" aria-labelledby="missing-info-heading" className="space-y-4">
      <div>
        <h3
          id="missing-info-heading"
          className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"
        >
          <span>Section B: Missing or unclear information</span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {missingInfo.length} {missingInfo.length === 1 ? "item" : "items"}
          </span>
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Not included in the provided text does not prove the term does not
          exist. These are standard offer terms that were unstated or
          ambiguous in the excerpt.
        </p>
      </div>

      {missingInfo.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <p className="font-medium text-slate-800 dark:text-slate-200">
            No standard terms were flagged as unstated.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
                className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between space-y-2.5 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <span className="text-slate-400 dark:text-slate-500">
                      #{idx + 1}
                    </span>
                    <span>{topicLabel}</span>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sentenceCase(item.note)}
                  </p>
                </div>
                {item.relatedQuote && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Mentioned: </span>
                    <span className="italic font-mono break-words">
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
