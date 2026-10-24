"use client";

import React, { useSyncExternalStore, useRef, useEffect } from "react";
import {
  ThemePreference,
  THEME_STORAGE_KEY,
  DEFAULT_THEME_PREFERENCE,
  parseStoredTheme,
  resolveTheme,
} from "@/lib/theme";

interface ThemeOption {
  value: ThemePreference;
  label: string;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: "light", label: "Light theme" },
  { value: "dark", label: "Dark theme" },
  { value: "system", label: "System theme" },
];

function applyTheme(pref: ThemePreference) {
  if (typeof window === "undefined") return;
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const resolved = resolveTheme(pref, mediaQuery.matches);
  document.documentElement.setAttribute("data-theme", resolved);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", resolved === "dark" ? "#0a111a" : "#10263f");
  }
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleMediaChange = () => {
    callback();
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleMediaChange);
  } else {
    mediaQuery.addListener(handleMediaChange);
  }

  return () => {
    window.removeEventListener("storage", callback);
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener("change", handleMediaChange);
    } else {
      mediaQuery.removeListener(handleMediaChange);
    }
  };
}

function getSnapshot(): ThemePreference {
  if (typeof window === "undefined") return DEFAULT_THEME_PREFERENCE;
  try {
    return parseStoredTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

function getServerSnapshot(): ThemePreference {
  return DEFAULT_THEME_PREFERENCE;
}

export function ThemeToggle({
  className = "",
  onHeader = false,
}: {
  className?: string;
  onHeader?: boolean;
}) {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    applyTheme(preference);
  }, [preference]);

  const selectPreference = (newPref: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newPref);
    } catch {
      // Storage access blocked or unavailable
    }
    applyTheme(newPref);
    window.dispatchEvent(new Event("storage"));
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % THEME_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
    }

    if (nextIndex >= 0) {
      const nextPref = THEME_OPTIONS[nextIndex].value;
      selectPreference(nextPref);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      className={`inline-flex items-center rounded-full border p-1 gap-1 text-xs shadow-2xs transition-colors ${
        onHeader
          ? "border-[var(--color-border-strong)]/40 bg-[var(--color-header-bg)]/80"
          : "border-[var(--border)] bg-[var(--surface-muted)]"
      } ${className}`}
    >
      {THEME_OPTIONS.map((opt, idx) => {
        const isSelected = preference === opt.value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            title={opt.label}
            aria-label={opt.label}
            onClick={() => selectPreference(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 ${
              onHeader
                ? "focus-visible:ring-[var(--header-text)] focus-visible:z-10"
                : "focus-visible:ring-[var(--focus-ring)] focus-visible:z-10"
            } ${
              isSelected
                ? "bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-xs font-semibold"
                : onHeader
                ? "text-[var(--header-nav-text)] hover:text-[var(--header-text)] hover:bg-[var(--surface-muted)]/10"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]/50"
            }`}
          >
            {opt.value === "light" && (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
            {opt.value === "dark" && (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {opt.value === "system" && (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            )}
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
