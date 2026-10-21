"use client";

import React, { useMemo, useState } from "react";
import { ValidatedConcern } from "@/lib/analysis/schema";
import { buildHighlightSegments } from "@/lib/analysis/highlights";
import { CheckIcon } from "./Icons";

export interface YourOfferWorkspaceProps {
  text: string;
  concerns: readonly ValidatedConcern[];
  onEditText: () => void;
  onNewReview: () => void;
}

export function YourOfferWorkspace({
  text,
  concerns,
  onEditText,
  onNewReview,
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

  const highlightCount = concerns.filter((c) => c.span).length;

  return (
    <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-2xs space-y-3.5 transition-colors">
      {/* Header with Title and Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">Your offer</h3>
          <p className="text-2xs text-[var(--text-muted)] font-mono">
            {text.length.toLocaleString()} characters
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono font-medium border ${
              highlightCount > 0
                ? "bg-[var(--tint-attention-bg)] text-[var(--tint-attention-text)] border-[var(--tint-attention-border)]"
                : "bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--border)]"
            }`}
          >
            {highlightCount > 0
              ? `${highlightCount} highlight${highlightCount === 1 ? "" : "s"}`
              : "No lines were highlighted for this review."}
          </span>
        </div>
      </div>

      {/* Snapshot with Highlights */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Analyzed offer text snapshot"
        className="max-h-72 w-full overflow-y-auto rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-xs leading-relaxed text-[var(--text)] whitespace-pre-wrap break-words custom-scrollbar focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        {segments.map((seg, idx) => {
          if (!seg.isHighlighted) {
            return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
          }
          return (
            <mark
              key={idx}
              className="bg-[var(--accent-highlighter)] text-slate-900 rounded-xs px-0.5 font-medium select-text"
            >
              {seg.text}
            </mark>
          );
        })}
      </div>

      {/* Controls */}
      {!confirmingNew ? (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onEditText}
            className="inline-flex items-center gap-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[34px]"
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
            className="inline-flex items-center gap-1.5 rounded-xs border border-transparent text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] px-2.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[34px]"
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
              className="inline-flex items-center gap-1 rounded-xs bg-[var(--primary-ledger)] text-white px-3 py-1 font-medium hover:bg-[var(--primary-ledger-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[32px]"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Yes, start new</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmingNew(false)}
              className="inline-flex items-center rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[32px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
