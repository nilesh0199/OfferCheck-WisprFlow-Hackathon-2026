import React, { useMemo } from "react";
import { ValidatedConcern } from "@/lib/analysis/schema";
import { buildHighlightSegments } from "@/lib/analysis/highlights";
import { ChevronDownIcon, FileTextIcon } from "./Icons";

interface HighlightedTextViewerProps {
  text: string;
  concerns: readonly ValidatedConcern[];
  activeConcernId?: string | null;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function HighlightedTextViewer({
  text,
  concerns,
  activeConcernId,
  isOpen = false,
  onToggle,
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

  // If there are no concerns with highlights, hide the viewer completely
  if (concerns.length === 0) {
    return null;
  }

  return (
    <details
      open={isOpen}
      onToggle={(e) => onToggle?.(e.currentTarget.open)}
      className="group rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors"
    >
      <summary className="cursor-pointer font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 rounded-md min-h-[44px] list-none select-none">
        <div className="flex items-center gap-2">
          <FileTextIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" size={16} />
          <span>Your text, with quotes highlighted</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            ({text.length.toLocaleString()} characters)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>{isOpen ? "Hide" : "Show"}</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </summary>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Quotes referenced in the observations above are highlighted below in the snapshot of text analyzed.
        </p>

        <div
          tabIndex={0}
          role="region"
          aria-label="Analyzed text with highlighted quotations"
          className="max-h-96 w-full overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 whitespace-pre-wrap break-words custom-scrollbar focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
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
                    ? "bg-amber-300 text-slate-950 ring-2 ring-slate-900 dark:bg-amber-400 dark:text-slate-950 dark:ring-slate-100"
                    : "bg-amber-100 text-slate-900 dark:bg-amber-950/80 dark:text-amber-200"
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
      </div>
    </details>
  );
}
