import React, { useMemo } from "react";
import { ValidatedConcern } from "@/lib/analysis/schema";
import { buildHighlightSegments } from "@/lib/analysis/highlights";

interface HighlightedTextViewerProps {
  text: string;
  concerns: readonly ValidatedConcern[];
  activeConcernId?: string | null;
}

export function HighlightedTextViewer({
  text,
  concerns,
  activeConcernId,
}: HighlightedTextViewerProps) {
  // Extract spans with concern IDs from validated concerns
  const spans = useMemo(() => {
    return concerns.map((c) => ({
      start: c.span.start,
      end: c.span.end,
      concernId: c.id,
    }));
  }, [concerns]);

  // Build segmented text with exact character slicing
  const segments = useMemo(() => {
    return buildHighlightSegments(text, spans);
  }, [text, spans]);

  return (
    <section aria-labelledby="viewer-heading" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3
          id="viewer-heading"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Your text, with quotes highlighted
        </h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Showing snapshot analyzed ({text.length.toLocaleString()} characters)
        </span>
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-label="Analyzed text with highlighted quotations"
        className="max-h-96 w-full overflow-y-auto rounded-xl border border-zinc-300 bg-white p-4 font-mono text-xs sm:text-sm leading-relaxed text-zinc-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-words"
      >
        {segments.map((seg, idx) => {
          if (!seg.isHighlighted) {
            return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
          }

          const isTargeted =
            activeConcernId &&
            (seg.concernId === activeConcernId ||
              seg.concernIds?.includes(activeConcernId));

          return (
            <mark
              key={idx}
              id={seg.concernId ? `highlight-concern-${seg.concernId}` : undefined}
              className={`rounded px-1 py-0.5 font-semibold transition-all ${
                isTargeted
                  ? "bg-amber-300 text-zinc-950 ring-2 ring-zinc-900 dark:bg-amber-400 dark:text-zinc-950 dark:ring-zinc-100"
                  : "bg-amber-100 text-zinc-900 dark:bg-amber-950/80 dark:text-amber-200"
              }`}
              title={
                seg.concernIds && seg.concernIds.length > 1
                  ? `Concerns: ${seg.concernIds.join(", ")}`
                  : seg.concernId
                  ? `Concern: ${seg.concernId}`
                  : "Identified quote"
              }
            >
              {seg.text}
            </mark>
          );
        })}
      </div>
    </section>
  );
}
