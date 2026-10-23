import React, { useMemo } from "react";
import { ValidatedConcern } from "@/lib/analysis/schema";
import { buildHighlightSegments, HighlightSegment } from "@/lib/analysis/highlights";
import { isAnyMarkerLine } from "@/lib/upload";
import { ChevronDownIcon, FileTextIcon } from "./Icons";

interface HighlightedTextViewerProps {
  text: string;
  concerns: readonly ValidatedConcern[];
  activeConcernId?: string | null;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

interface LineSegment {
  text: string;
  isHighlighted: boolean;
  concernId?: string;
  concernIds?: string[];
}

interface DocumentLine {
  segments: LineSegment[];
}

function splitSegmentsIntoLines(segments: HighlightSegment[]): DocumentLine[] {
  const lines: DocumentLine[] = [{ segments: [] }];

  for (const seg of segments) {
    const parts = seg.text.split("\n");
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        lines.push({ segments: [] });
      }
      if (parts[i].length > 0) {
        lines[lines.length - 1].segments.push({
          text: parts[i],
          isHighlighted: seg.isHighlighted,
          concernId: seg.concernId,
          concernIds: seg.concernIds,
        });
      }
    }
  }

  return lines;
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

  const documentLines = useMemo(() => {
    return splitSegmentsIntoLines(segments);
  }, [segments]);

  // If there are no concerns with highlights, hide the viewer completely
  if (concerns.length === 0) {
    return null;
  }

  return (
    <details
      open={isOpen}
      onToggle={(e) => onToggle?.(e.currentTarget.open)}
      className="group rounded border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-2xs transition-colors"
    >
      <summary className="cursor-pointer font-bold text-xs sm:text-sm text-[var(--text)] flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[36px] list-none select-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2">
          <FileTextIcon className="w-4 h-4 text-[var(--text-muted)]" size={16} />
          <span>Your text, with quotes highlighted</span>
          <span className="text-xs font-mono font-normal text-[var(--text-muted)]">
            ({text.length.toLocaleString()} characters)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <span>{isOpen ? "Hide" : "Show"}</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </summary>

      <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
        <p className="text-xs text-[var(--text-muted)]">
          Quotes referenced in the observations above are highlighted below in the snapshot of text analyzed.
        </p>

        <div
          tabIndex={0}
          role="region"
          aria-label="Analyzed text with highlighted quotations"
          className="max-h-96 w-full overflow-y-auto rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 font-mono text-xs leading-relaxed text-[var(--text)] whitespace-pre-wrap break-words custom-scrollbar focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          {documentLines.map((line, lIdx) => {
            const lineText = line.segments.map((s) => s.text).join("");
            const isMarker = isAnyMarkerLine(lineText.trim());

            if (isMarker) {
              return (
                <div
                  key={lIdx}
                  className="py-1.5 my-1.5 border-t border-[var(--border)] text-[var(--text-muted)] font-mono text-xs font-semibold tracking-wider"
                >
                  {lineText.trim()}
                </div>
              );
            }

            return (
              <div key={lIdx} className="min-h-[1.25rem]">
                {line.segments.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  line.segments.map((seg, sIdx) => {
                    if (!seg.isHighlighted) {
                      return <React.Fragment key={sIdx}>{seg.text}</React.Fragment>;
                    }

                    const isTargeted =
                      activeConcernId &&
                      (seg.concernId === activeConcernId ||
                        seg.concernIds?.includes(activeConcernId));

                    return (
                      <mark
                        key={sIdx}
                        id={seg.concernId ? `highlight-concern-${seg.concernId}` : undefined}
                        className={`rounded-xs px-1 py-0.5 font-medium transition-all ${
                          isTargeted
                            ? "bg-[var(--accent-highlighter)] text-[var(--color-highlight-ink)] ring-2 ring-[var(--focus-ring)]"
                            : "bg-[var(--tint-attention-bg)] text-[var(--text)] border border-[var(--tint-attention-border)]"
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
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
