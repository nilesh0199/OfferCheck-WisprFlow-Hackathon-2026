"use client";

import React, { useMemo, useState, useEffect } from "react";
import { ValidatedConcern } from "@/lib/analysis/schema";
import { buildHighlightSegments, HighlightSegment } from "@/lib/analysis/highlights";
import { isAnyMarkerLine } from "@/lib/upload";
import { CheckIcon } from "./Icons";

export interface YourOfferWorkspaceProps {
  text: string;
  concerns: readonly ValidatedConcern[];
  onEditText: () => void;
  onNewReview: () => void;
  activeConcernId?: string | null;
  onSelectConcern?: (id: string | null) => void;
}

interface LineSegment {
  text: string;
  isHighlighted: boolean;
  concernId?: string;
  concernIds?: string[];
}

interface DocumentLine {
  lineNumber: number;
  segments: LineSegment[];
}

function splitSegmentsIntoLines(segments: HighlightSegment[]): DocumentLine[] {
  const lines: DocumentLine[] = [{ lineNumber: 1, segments: [] }];

  for (const seg of segments) {
    const parts = seg.text.split("\n");
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        lines.push({
          lineNumber: lines.length + 1,
          segments: [],
        });
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

export function YourOfferWorkspace({
  text,
  concerns,
  onEditText,
  onNewReview,
  activeConcernId,
  onSelectConcern,
}: YourOfferWorkspaceProps) {
  const [confirmingNew, setConfirmingNew] = useState(false);

  const spans = useMemo(() => {
    return concerns.map((c) => ({
      start: c.span.start,
      end: c.span.end,
      concernId: c.id,
    }));
  }, [concerns]);

  const segments = useMemo(() => {
    return buildHighlightSegments(text, spans);
  }, [text, spans]);

  const documentLines = useMemo(() => {
    return splitSegmentsIntoLines(segments);
  }, [segments]);

  const highlightCount = concerns.filter((c) => c.span).length;

  // Scroll to active concern highlight in rail when selected from results
  useEffect(() => {
    if (activeConcernId) {
      const el = document.getElementById(`rail-highlight-${activeConcernId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeConcernId]);

  return (
    <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-2xs space-y-3.5 transition-colors w-full">
      {/* Header with Title and Status on Tinted Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 p-3.5 sm:px-5 rounded-t bg-[var(--tint-info-bg)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">Your text</h3>
          <p className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
            {text.length.toLocaleString()} characters · {documentLines.length} lines
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${
              highlightCount > 0
                ? "bg-[var(--tint-attention-bg)] text-[var(--tint-attention-text)] border-[var(--tint-attention-border)]"
                : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]"
            }`}
          >
            {highlightCount > 0
              ? `${highlightCount} highlight${highlightCount === 1 ? "" : "s"}`
              : "No lines highlighted"}
          </span>
        </div>
      </div>

      {/* Snapshot with Line Numbers and Highlights */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Analyzed text with line numbers and quote highlights"
        className="max-h-[380px] 2xl:max-h-[calc(100dvh-17rem)] w-full overflow-y-auto rounded border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 font-mono text-xs leading-relaxed text-[var(--text)] custom-scrollbar focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        {documentLines.map((line) => {
          const fullLineText = line.segments.map((s) => s.text).join("");
          const isMarker = isAnyMarkerLine(fullLineText.trim());

          if (isMarker) {
            return (
              <div
                key={line.lineNumber}
                id={`rail-doc-line-${line.lineNumber}`}
                className="flex items-center group py-1.5 my-1 border-t border-[var(--border)] text-[var(--text-muted)]"
              >
                <span
                  className="w-8 shrink-0 pr-2 text-right font-mono text-xs tabular-nums text-[var(--text-muted)] select-none opacity-50"
                  aria-hidden="true"
                >
                  {line.lineNumber}
                </span>
                <div className="flex-1 min-w-0 font-mono text-xs font-semibold tracking-wider text-[var(--text-muted)]">
                  {fullLineText.trim()}
                </div>
              </div>
            );
          }

          return (
            <div
              key={line.lineNumber}
              id={`rail-doc-line-${line.lineNumber}`}
              className="flex items-start group hover:bg-[var(--surface)]/60 rounded-xs transition-colors py-0.5"
            >
              <span
                className="w-8 shrink-0 pr-2 text-right font-mono text-xs tabular-nums text-[var(--text-muted)] select-none opacity-50 group-hover:opacity-100"
                aria-hidden="true"
              >
                {line.lineNumber}
              </span>
              <div className="flex-1 min-w-0 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
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
                        id={seg.concernId ? `rail-highlight-${seg.concernId}` : undefined}
                        tabIndex={seg.concernId ? 0 : undefined}
                        role={seg.concernId ? "button" : undefined}
                        aria-label={
                          seg.concernId
                            ? `Jump to concern ${seg.concernId} in review findings`
                            : undefined
                        }
                        onClick={() => {
                          if (seg.concernId) {
                            onSelectConcern?.(seg.concernId);
                            const card = document.getElementById(`concern-card-${seg.concernId}`);
                            if (card) {
                              card.scrollIntoView({ behavior: "smooth", block: "nearest" });
                              card.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && seg.concernId) {
                            e.preventDefault();
                            onSelectConcern?.(seg.concernId);
                            const card = document.getElementById(`concern-card-${seg.concernId}`);
                            if (card) {
                              card.scrollIntoView({ behavior: "smooth", block: "nearest" });
                              card.focus();
                            }
                          }
                        }}
                        className={`rounded-xs px-0.5 font-medium transition-all select-text cursor-pointer ${
                          isTargeted
                            ? "bg-[var(--accent-highlighter)] text-[var(--color-highlight-ink)] ring-2 ring-[var(--focus-ring)] shadow-xs font-semibold"
                            : "bg-[var(--accent-highlighter)]/35 text-[var(--text)] hover:bg-[var(--accent-highlighter)]/65 border-b border-[var(--accent-highlighter)]"
                        }`}
                      >
                        {seg.text}
                      </mark>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      {!confirmingNew ? (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onEditText}
            className="inline-flex items-center gap-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
          >
            <svg
              className="w-3.5 h-3.5 text-[var(--text-muted)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit text</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmingNew(true)}
            className="inline-flex items-center gap-1.5 rounded-xs border border-transparent text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] px-2.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>New review</span>
          </button>
        </div>
      ) : (
        <div className="rounded border border-[var(--border-strong)] bg-[var(--surface-muted)] p-3 space-y-2 text-xs">
          <p className="font-medium text-[var(--text)]">
            Start a new review? Current review will be cleared.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNewReview}
              className="inline-flex items-center gap-1 rounded-xs bg-[var(--color-primary)] text-[var(--color-primary-contrast)] px-3 py-1 font-medium hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Yes, start new</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmingNew(false)}
              className="inline-flex items-center rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
