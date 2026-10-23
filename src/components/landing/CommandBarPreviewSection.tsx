"use client";

import React from "react";
import { Container } from "../Container";

const SAMPLE_COMMAND_CHIPS = [
  "step 3",
  "check it",
  "save as pdf",
  "load sample 1",
  "toggle theme",
  "copy summary",
  "observations",
];

export function CommandBarPreviewSection() {
  return (
    <section
      id="voice-commands"
      aria-label="Global command bar and voice typing"
      className="py-16 sm:py-24 border-b border-[var(--border)] bg-[var(--tint-info-bg)]/30 transition-colors"
    >
      <Container className="space-y-10">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)] shadow-2xs">
            <span>No Hands / Wispr Flow Compatible</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-[-0.015em] text-[var(--text)]">
            Built for dictation and natural speech tools
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            OfferCheck has zero browser microphone permissions or proprietary speech APIs. It works with any external dictation tool — such as Wispr Flow, macOS Dictation, or Windows Voice Typing — via our Global Command Bar.
          </p>
        </div>

        {/* Mock Command Bar Container */}
        <div className="max-w-2xl mx-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-md space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span className="font-mono text-xs text-[var(--text-muted)]">
              Global Command Bar • Press <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[0.6875rem]">⌘K</kbd> or <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-muted)] text-[0.6875rem]">/</kbd>
            </span>
            <span className="text-[0.6875rem] font-mono text-[var(--color-primary)] font-medium">
              80+ Spoken Patterns Recognized
            </span>
          </div>

          {/* Mock Input Row */}
          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 px-3 py-2.5">
            <span className="text-sm text-[var(--text-muted)] font-mono select-none">
              ⌘
            </span>
            <span className="text-xs sm:text-sm text-[var(--text)] flex-1 font-sans">
              Could you please analyze this offer?
            </span>
            <span className="text-[0.6875rem] font-mono px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)]">
              Recognized: Analyze offer
            </span>
          </div>

          {/* Command Chips */}
          <div className="space-y-2">
            <span className="text-xs text-[var(--text-muted)] block font-medium">
              Try typing or dictating natural phrases:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_COMMAND_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-[var(--surface-muted)] text-[var(--text)] border border-[var(--border)]"
                >
                  <span className="text-[var(--text-muted)]">&ldquo;</span>
                  <span>{chip}</span>
                  <span className="text-[var(--text-muted)]">&rdquo;</span>
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
            Say phrases with conversational fillers like &ldquo;Can you please jump to step 3&rdquo; or &ldquo;Save as PDF now&rdquo;. Long dictated sentences are automatically preserved and offered directly into your offer text.
          </p>
        </div>
      </Container>
    </section>
  );
}
