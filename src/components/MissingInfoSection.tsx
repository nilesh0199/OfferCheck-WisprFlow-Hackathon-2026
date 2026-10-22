import React from "react";
import { ValidatedMissingInfo } from "@/lib/analysis/schema";
import { getMissingInfoTopicLabel } from "@/lib/analysis/labels";
import { sentenceCase } from "@/lib/analysis/sentence-case";

interface MissingInfoSectionProps {
  missingInfo: readonly ValidatedMissingInfo[];
}

export function MissingInfoSection({ missingInfo }: MissingInfoSectionProps) {
  return (
    <section id="section-missing" aria-labelledby="missing-info-heading" className="space-y-3.5">
      <div>
        <h3
          id="missing-info-heading"
          className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2"
        >
          <span>Section B: Missing or unclear information</span>
          <span className="inline-flex items-center rounded-xs bg-[var(--tint-info-bg)] px-2 py-0.5 text-xs font-mono font-medium text-[var(--color-primary)] border border-[var(--border)]">
            {missingInfo.length} {missingInfo.length === 1 ? "item" : "items"}
          </span>
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          &ldquo;Not stated in the text&rdquo; is an observation about this message, not proof that the term does not exist in the full offer.
        </p>
      </div>

      {missingInfo.length === 0 ? (
        <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--text-muted)] shadow-2xs">
          <p className="font-medium text-[var(--text)]">
            No standard employment terms were flagged as unstated.
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Review the original documentation carefully to ensure all expectations are confirmed in writing.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-[var(--border)] bg-[var(--surface)] shadow-2xs">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--tint-info-bg)] text-[var(--text)] font-sans text-sm">
                <th className="py-2.5 px-3 sm:px-4 w-1/3 sm:w-1/4 font-semibold">
                  Topic
                </th>
                <th className="py-2.5 px-3 sm:px-4 font-semibold">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {missingInfo.map((item, idx) => {
                const topicLabel = getMissingInfoTopicLabel(item.topic);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--surface-muted)]/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 sm:px-4 font-medium text-[var(--text)] align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--text-muted)] font-mono text-xs">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold">{topicLabel}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-[var(--text)] align-top leading-relaxed space-y-1">
                      <p>{sentenceCase(item.note)}</p>
                      {item.relatedQuote && (
                        <p className="text-xs text-[var(--text-muted)] font-mono italic">
                          Mentioned: &ldquo;{item.relatedQuote}&rdquo;
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
