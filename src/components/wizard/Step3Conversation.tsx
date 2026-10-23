"use client";

import React, { useMemo } from "react";
import {
  detectSensitiveIdentifiers,
  SENSITIVE_IDENTIFIER_WARNING,
} from "@/lib/sensitive-identifiers";
import { useOfferSession } from "../SessionProvider";
import { WizardStep } from "@/lib/combined-text";

interface Step3ConversationProps {
  onGoToStep: (step: WizardStep) => void;
}

export function Step3Conversation({ onGoToStep }: Step3ConversationProps) {
  const { conversation, setConversationText } = useOfferSession();

  const sensitiveKinds = useMemo(() => {
    return detectSensitiveIdentifiers(conversation.text);
  }, [conversation.text]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Left Form Card (8/12 on desktop) */}
      <div className="lg:col-span-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">
              Call or conversation (optional)
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              If someone contacted you by phone, video, or in person, describe what was said.
            </p>
          </div>

          <span
            aria-live="polite"
            className="font-mono text-xs tabular-nums text-[var(--text-muted)]"
          >
            {conversation.text.length.toLocaleString()} / 4,000 characters
          </span>
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <label htmlFor="conversation-text" className="sr-only">
            Call or conversation narrative
          </label>
          <textarea
            id="conversation-text"
            rows={7}
            maxLength={4000}
            value={conversation.text}
            onChange={(e) => setConversationText(e.target.value)}
            placeholder="Describe what happened in your own words. You can type or dictate it. Include who contacted you, how, what they asked for, and any deadlines. Leave out names, phone numbers and ID numbers."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-xs sm:text-sm font-mono text-[var(--text)] leading-relaxed placeholder:text-[var(--text-muted)] placeholder:font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:border-[var(--color-primary)] transition-colors resize-y custom-scrollbar"
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

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-[var(--text-muted)]">
            You can skip this step if your offer is entirely contained in written documents.
          </p>
          <button
            type="button"
            onClick={() => onGoToStep(4)}
            className="text-xs text-[var(--color-primary)] hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-2 min-h-[44px]"
          >
            Skip this step
          </button>
        </div>
      </div>

      {/* Right Aside (4/12 on desktop) */}
      <aside className="lg:col-span-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
          How this is reviewed
        </h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          If you describe a verbal interaction, the review reflects your description, not an audio
          recording or original contract document.
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Any observation citing your account is phrased as &ldquo;You describe&rdquo; and evaluates
          the terms you recalled without treating informal phrasing or transcription mistakes as
          evidence.
        </p>
      </aside>
    </div>
  );
}
