"use client";

import React from "react";
import { ExternalLinkIcon } from "@/components/Icons";

export interface ClickToLoadVideoProps {
  videoId: string;
  title: string;
  description: string;
  aspectRatio: "16:9" | "9:16";
  language: string;
  duration: string;
}

export function ClickToLoadVideo({
  videoId,
  title,
  description,
  aspectRatio,
  language,
  duration,
}: ClickToLoadVideoProps) {
  const isVertical = aspectRatio === "9:16";
  const youtubeUrl = isVertical
    ? `https://www.youtube.com/shorts/${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-4 transition-colors ${
        isVertical ? "max-w-md mx-auto" : "w-full"
      }`}
    >
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
            {language}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
            {duration}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-serif text-[var(--text)] leading-snug">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Video Thumbnail Link (Directs to YouTube, not played on website) */}
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch ${title} on YouTube (opens in a new tab)`}
        className="group relative block w-full rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] transition-transform hover:scale-[1.005]"
      >
        <div
          className={`relative w-full overflow-hidden flex items-center justify-center bg-[var(--surface-muted)] ${
            isVertical ? "aspect-[9/16] max-h-[480px]" : "aspect-[16/9]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={`Video thumbnail for ${title}`}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
          />

          {/* Contrast backdrop overlay */}
          <div className="absolute inset-0 bg-[var(--header-bg)]/25 group-hover:bg-[var(--header-bg)]/35 transition-colors flex items-center justify-center">
            {/* Play Button Indicator */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-lg group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 fill-current translate-x-0.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Corner badge indicating external destination */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[var(--header-bg)]/90 text-[var(--header-text)] text-xs font-mono font-medium flex items-center gap-1.5 shadow-sm">
            <span>Watch on YouTube</span>
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </div>
        </div>
      </a>

      {/* External Link & Third-Party Disclosure */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
        <span>External video guide hosted on YouTube. Not played on this website.</span>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]"
        >
          <span>Open on YouTube (new tab)</span>
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
