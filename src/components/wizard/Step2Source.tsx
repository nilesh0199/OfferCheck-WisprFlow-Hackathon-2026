"use client";

import React, { useMemo } from "react";
import {
  SourceChannel,
  AppliedStatus,
  CHANNEL_LABELS,
  APPLIED_LABELS,
} from "@/lib/combined-text";
import {
  detectSensitiveIdentifiers,
  SENSITIVE_IDENTIFIER_WARNING,
} from "@/lib/sensitive-identifiers";
import { useOfferSession } from "../SessionProvider";

const CHANNELS: NonNullable<SourceChannel>[] = [
  "platform",
  "messaging",
  "email",
  "social",
  "college",
  "person",
  "call",
  "other",
];

const APPLIED_OPTIONS: NonNullable<AppliedStatus>[] = ["yes", "no", "unsure"];

export function Step2Source() {
  const { source, setSourceChannel, setSourceApplied, setSourceNote } =
    useOfferSession();

  const sensitiveKinds = useMemo(() => {
    return detectSensitiveIdentifiers(source.note);
  }, [source.note]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Left Form Card (8/12 on desktop) */}
      <div className="lg:col-span-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)]">
            How you received this communication
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Understanding the channel and contact context helps tailor verification advice.
          </p>
        </div>

        {/* 1. Channel Radio Group */}
        <fieldset className="space-y-2.5">
          <legend className="text-xs font-semibold text-[var(--text)]">
            Where did you receive or find this offer?
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHANNELS.map((ch) => {
              const isSelected = source.channel === ch;
              return (
                <label
                  key={ch}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors min-h-[44px] ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--tint-action-bg)] font-medium text-[var(--color-primary)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="source-channel"
                    value={ch}
                    checked={isSelected}
                    onChange={() => setSourceChannel(ch)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--border-strong)] bg-[var(--surface)]"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-contrast)]" />
                    )}
                  </span>
                  <span>{CHANNEL_LABELS[ch]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 2. Did you apply? */}
        <fieldset className="space-y-2.5 pt-2 border-t border-[var(--border)]">
          <legend className="text-xs font-semibold text-[var(--text)]">
            Did you apply for this position first?
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {APPLIED_OPTIONS.map((opt) => {
              const isSelected = source.applied === opt;
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors min-h-[44px] ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--tint-action-bg)] font-medium text-[var(--color-primary)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="source-applied"
                    value={opt}
                    checked={isSelected}
                    onChange={() => setSourceApplied(opt)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--border-strong)] bg-[var(--surface)]"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-contrast)]" />
                    )}
                  </span>
                  <span>{APPLIED_LABELS[opt]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 3. Optional Note */}
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <label
              htmlFor="source-note-input"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Additional note (optional)
            </label>
            <span className="text-[0.875rem] font-mono text-[var(--text-muted)]">
              {source.note.length} / 200
            </span>
          </div>

          <input
            id="source-note-input"
            type="text"
            maxLength={200}
            value={source.note}
            onChange={(e) => setSourceNote(e.target.value)}
            placeholder="Which platform, or who sent it? Do not include names, numbers or links."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:border-[var(--color-primary)] transition-colors min-h-[44px]"
          />

          {sensitiveKinds.length > 0 && (
            <p
              role="alert"
              className="text-xs text-[var(--color-tint-obs-text)] bg-[var(--color-tint-obs-bg)] p-2.5 rounded-lg border border-[var(--color-tint-obs-border)]"
            >
              {SENSITIVE_IDENTIFIER_WARNING}
            </p>
          )}
        </div>
      </div>

      {/* Right Aside (4/12 on desktop) */}
      <aside className="lg:col-span-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
          Why this helps
        </h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          This is context. It never counts as evidence on its own.
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Offers received via personal messaging apps or social media without an application can carry
          different verification risks than offers received through an on-campus placement cell.
        </p>
      </aside>
    </div>
  );
}
