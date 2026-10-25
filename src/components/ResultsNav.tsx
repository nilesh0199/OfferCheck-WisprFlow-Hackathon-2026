"use client";

import React, { useEffect, useState } from "react";

export interface ResultsNavItem {
  id: string;
  label: string;
  badge?: string | number;
}

interface ResultsNavProps {
  items: readonly ResultsNavItem[];
  scrollContainerId?: string;
}

export function ResultsNav({ items, scrollContainerId }: ResultsNavProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollContainer = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : null;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Sort by top offset to pick the uppermost visible section
          const sorted = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          setActiveId(sorted[0].target.id);
        }
      },
      {
        root: scrollContainer || null,
        rootMargin: "-10% 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [items, scrollContainerId]);

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="Review sections navigation"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs space-y-2 w-full transition-colors print:hidden"
    >
      <div className="border-b border-[var(--border)] pb-2.5 px-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          On this review
        </h3>
      </div>

      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[38px] ${
                  isActive
                    ? "bg-[var(--surface-muted)] text-[var(--color-primary)] font-semibold border-l-2 border-[var(--color-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)]/50"
                }`}
              >
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded text-[0.6875rem] font-mono tabular-nums ${
                      isActive
                        ? "bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)]"
                        : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
