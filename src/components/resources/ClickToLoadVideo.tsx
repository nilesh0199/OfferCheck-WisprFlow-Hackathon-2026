"use client";

import React, { useState } from "react";
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
  const [isLoaded, setIsLoaded] = useState(false);

  const isVertical = aspectRatio === "9:16";

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

      {/* Video Container */}
      <div
        className={`relative w-full rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-center ${
          isVertical ? "aspect-[9/16] max-h-[520px]" : "aspect-[16/9]"
        }`}
      >
        {isLoaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <button
              type="button"
              onClick={() => setIsLoaded(true)}
              aria-label={`Play video: ${title}`}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-md hover:bg-[var(--color-primary-hover)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] min-w-[44px]"
            >
              <svg
                className="w-6 h-6 fill-current translate-x-0.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">
                Click to load video
              </p>
              <p className="text-[0.75rem] text-[var(--text-muted)] max-w-xs">
                Plays via privacy-enhanced YouTube embed without tracking cookies until activated.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* External Link & Third-Party Disclosure */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
        <span>Third-party video content under Google terms.</span>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]"
        >
          <span>Watch on YouTube</span>
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
