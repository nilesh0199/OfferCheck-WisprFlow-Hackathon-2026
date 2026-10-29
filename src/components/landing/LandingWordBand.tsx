"use client";

import React from "react";

const WORDS = [
  "Upfront deposits",
  "Verbatim quote evidence",
  "WhatsApp & Telegram traps",
  "Courses sold as internships",
  "Institutional name misuse",
  "Missing stipend & terms",
  "Voice-first navigation",
  "On-device privacy",
];

export function LandingWordBand() {
  return (
    <section
      aria-label="Core Review Capabilities"
      className="w-full py-5 sm:py-6 border-y border-[var(--border)] bg-[var(--surface-muted)]/40 overflow-hidden select-none transition-colors"
    >
      <div className="relative w-full overflow-hidden flex items-center">
        <div
          id="word-band-track"
          className="animate-word-band flex items-center gap-6 sm:gap-10 whitespace-nowrap text-base sm:text-lg md:text-xl font-serif font-bold tracking-tight text-[var(--text)] leading-snug"
        >
          {/* First loop */}
          {WORDS.map((word, idx) => (
            <React.Fragment key={`word-1-${idx}`}>
              <span className="hover:text-[var(--color-primary)] transition-colors descender-safe">
                {word}
              </span>
              <span
                className="text-[var(--color-primary)] text-sm sm:text-base opacity-80 inline-block align-middle"
                aria-hidden="true"
              >
                ✦
              </span>
            </React.Fragment>
          ))}

          {/* Second loop for seamless continuous repetition */}
          {WORDS.map((word, idx) => (
            <React.Fragment key={`word-2-${idx}`}>
              <span className="hover:text-[var(--color-primary)] transition-colors descender-safe">
                {word}
              </span>
              <span
                className="text-[var(--color-primary)] text-sm sm:text-base opacity-80 inline-block align-middle"
                aria-hidden="true"
              >
                ✦
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
