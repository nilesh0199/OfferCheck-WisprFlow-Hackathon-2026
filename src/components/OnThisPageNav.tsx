"use client";

import React, { useEffect, useState } from "react";

export interface PageSectionItem {
  id: string;
  label: string;
  count?: number;
}

export interface OnThisPageNavProps {
  sections: readonly PageSectionItem[];
  onCopySummary?: () => void;
  copiedSummary?: boolean;
}

export function OnThisPageNav({
  sections,
  onCopySummary,
  copiedSummary = false,
}: OnThisPageNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible entries
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position or take the top-most
          const topEntry = visibleEntries[0];
          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: "-10% 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="On this page navigation"
      className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs space-y-3 transition-colors"
    >
      <div className="border-b border-[var(--border)] pb-2">
        <h4 className="text-xs font-sans font-semibold text-[var(--text-muted)]">
          On this page
        </h4>
      </div>

      <ul className="space-y-0.5 text-xs">
        {sections.map((section) => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`flex items-center justify-between rounded-xs px-2.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  isActive
                    ? "bg-[var(--tint-action-bg)] text-[var(--color-primary)] font-semibold border-l-[3px] border-l-[var(--color-primary)] pl-2"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)]/60"
                }`}
              >
                <span className="truncate">{section.label}</span>
                {typeof section.count === "number" && (
                  <span className="font-mono text-xs tabular-nums text-[var(--text-muted)] opacity-80 shrink-0 ml-2">
                    {section.count}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Quick Actions (Copy summary, Print / PDF) */}
      <div className="pt-3 border-t border-[var(--border)] space-y-2">
        <h4 className="text-xs font-sans font-semibold text-[var(--text-muted)]">
          Quick actions
        </h4>
        <div className="space-y-1.5">
          {onCopySummary && (
            <button
              type="button"
              onClick={onCopySummary}
              className="w-full inline-flex items-center justify-between rounded-xs border border-[var(--border)] bg-[var(--surface-muted)]/60 px-2.5 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
            >
              <span>{copiedSummary ? "Summary copied!" : "Copy summary"}</span>
              <span className="font-mono text-xs text-[var(--text-muted)]">TXT</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full inline-flex items-center justify-between rounded-xs border border-[var(--border)] bg-[var(--surface-muted)]/60 px-2.5 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
          >
            <span>Print / PDF</span>
            <span className="font-mono text-xs text-[var(--text-muted)]">PDF</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
