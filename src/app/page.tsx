"use client";

import { useState } from "react";
import { APP_NAME, TAGLINE, MAX_INPUT_CHARS } from "@/lib/config";

export default function Home() {
  const [offerText, setOfferText] = useState("");

  const charCount = offerText.length;
  const isOverLimit = charCount > MAX_INPUT_CHARS;
  const charsRemaining = MAX_INPUT_CHARS - charCount;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col justify-between">
      <main className="w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-200/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 mb-3">
            <span>Solo Hackathon Prototype</span>
            <span aria-hidden="true">•</span>
            <span>Phase 1 Shell</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {TAGLINE}
          </p>
        </header>

        {/* Status Notice */}
        <div
          role="status"
          className="mb-8 rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200"
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 inline-block text-base select-none"
              aria-hidden="true"
            >
              ℹ️
            </span>
            <div>
              <p className="font-semibold text-sm">Development Status</p>
              <p className="text-sm mt-0.5">
                Analysis is not built yet - this is the Phase 1 shell.
              </p>
            </div>
          </div>
        </div>

        {/* Explanation of What It Does and Does Not Do */}
        <section
          aria-labelledby="about-heading"
          className="mb-8 grid gap-4 sm:grid-cols-2"
        >
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2
              id="about-heading"
              className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
            >
              <span className="text-emerald-600 dark:text-emerald-400">✓</span>
              What this tool does
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Helps students review internship offers by highlighting
              questionable requests (such as training fees or equipment
              deposits), spotting missing or ambiguous terms, and drafting
              concrete verification questions before you pay money or share
              sensitive documents.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="text-rose-600 dark:text-rose-400">✕</span>
              What this tool does NOT do
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              This is <strong>not</strong> a scam detector, company
              authentication service, legal review, or safety guarantee. It
              cannot verify whether a sender legitimately represents a company
              or whether an opportunity is risk-free.
            </p>
          </div>
        </section>

        {/* Privacy Notice */}
        <aside
          id="privacy-notice"
          aria-label="Privacy advice before submitting text"
          className="mb-4 rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 text-base select-none"
              aria-hidden="true"
            >
              🔒
            </span>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Privacy Notice — Redact before pasting
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                Please remove personal details from the text before pasting:
                your full name, phone number, physical address, bank account or
                payment details, and government identity numbers (such as
                Aadhaar, PAN, or SSN). Do not submit passwords or sensitive
                personal credentials.
              </p>
            </div>
          </div>
        </aside>

        {/* Offer Input Area */}
        <section aria-labelledby="input-heading" className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              id="input-heading"
              htmlFor="offer-text"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Paste internship offer or communication text
            </label>
            <span
              aria-live="polite"
              aria-atomic="true"
              className={`text-xs font-medium tabular-nums ${
                isOverLimit
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : charsRemaining < 500
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}{" "}
              characters
            </span>
          </div>

          <textarea
            id="offer-text"
            name="offer-text"
            rows={10}
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            aria-describedby="privacy-notice char-count-status"
            aria-invalid={isOverLimit}
            placeholder="Paste the email, message, or written offer letter text here (without personal identity details)..."
            className={`w-full rounded-xl border p-3.5 text-sm font-mono leading-relaxed transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-zinc-900 ${
              isOverLimit
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950/50"
                : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-200 dark:border-zinc-700 dark:focus:border-zinc-300 dark:focus:ring-zinc-800"
            }`}
          />

          <div
            id="char-count-status"
            className="flex items-center justify-between text-xs"
          >
            {isOverLimit ? (
              <p
                role="alert"
                className="text-rose-600 dark:text-rose-400 font-medium"
              >
                Text exceeds the maximum limit by{" "}
                {(charCount - MAX_INPUT_CHARS).toLocaleString()} characters.
                Please shorten the text.
              </p>
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400">
                Plain-text review only. PDF, images, and external links are not
                processed.
              </p>
            )}
          </div>
        </section>

        {/* Limits of this Tool */}
        <section
          aria-labelledby="limits-heading"
          className="mt-10 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2
            id="limits-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
          >
            Limits of this tool
          </h2>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed list-disc list-inside">
            <li>
              <strong>Text-only review:</strong> Assessments are based solely
              on the words provided in the box above. Unmentioned terms are not
              evaluated.
            </li>
            <li>
              <strong>Cannot verify identity:</strong> This tool cannot confirm
              whether the sender genuinely represents the claimed company or
              organization.
            </li>
            <li>
              <strong>Absence of red flags is not proof of safety:</strong> An
              offer without identified warnings may still be questionable or
              inaccurate.
            </li>
            <li>
              <strong>Tone is not evidence:</strong> Polished language does not
              guarantee legitimacy, and minor grammatical mistakes do not
              inherently mean an offer is fraudulent.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-900 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center sm:text-left text-xs text-zinc-500 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>
            {APP_NAME} — Student hackathon prototype for No Hands: The Wispr
            Challenge.
          </p>
          <p>Phase 1 Deployable Shell</p>
        </div>
      </footer>
    </div>
  );
}
