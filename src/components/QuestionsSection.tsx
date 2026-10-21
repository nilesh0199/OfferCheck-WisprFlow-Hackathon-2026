import React, { useState } from "react";
import {
  ValidatedVerificationQuestion,
  ValidatedConcern,
} from "@/lib/analysis/schema";
import { getConcernCategoryLabel } from "@/lib/analysis/labels";
import { sentenceCase } from "@/lib/analysis/sentence-case";
import { selectSelfChecks } from "@/data/self-checks";
import { CopyIcon, CheckIcon } from "./Icons";

interface QuestionsSectionProps {
  questions: readonly ValidatedVerificationQuestion[];
  concerns: readonly ValidatedConcern[];
}

export function QuestionsSection({
  questions,
  concerns,
}: QuestionsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // Map concern id to concern category label for easy reference
  const concernMap = new Map<string, string>();
  for (const c of concerns) {
    concernMap.set(c.id, getConcernCategoryLabel(c.category));
  }

  // Select contextual self-checks based on categories identified
  const categories = concerns.map((c) => c.category);
  const selfChecks = selectSelfChecks(categories);

  const handleCopySingle = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setLiveAnnouncement("Question copied to clipboard");
      setTimeout(() => {
        setCopiedId(null);
        setLiveAnnouncement("");
      }, 2000);
    } catch {
      prompt("Copy question:", text);
    }
  };

  const handleCopyAll = async () => {
    if (questions.length === 0) return;
    const allText = questions
      .map((q, idx) => `${idx + 1}. ${sentenceCase(q.question)}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setLiveAnnouncement("All questions copied to clipboard");
      setTimeout(() => {
        setCopiedAll(false);
        setLiveAnnouncement("");
      }, 2000);
    } catch {
      prompt("Copy all questions:", allText);
    }
  };

  return (
    <section id="section-questions" aria-labelledby="questions-heading" className="space-y-3.5">
      {/* Live announcement region for copy status */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3
            id="questions-heading"
            className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2"
          >
            <span>Section C: Questions to verify</span>
            <span className="inline-flex items-center rounded-xs bg-[var(--surface-muted)] px-2 py-0.5 text-2xs font-mono font-medium text-[var(--text-muted)] border border-[var(--border)]">
              {questions.length} {questions.length === 1 ? "question" : "questions"}
            </span>
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Specific verification questions you can copy and ask the recruiter before taking further action.
          </p>
        </div>

        {questions.length > 0 && (
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[34px]"
            aria-label="Copy all verification questions to clipboard"
          >
            {copiedAll ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-[var(--primary-ledger)]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Copy all questions</span>
              </>
            )}
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--text-muted)] shadow-2xs">
          <p className="font-medium text-[var(--text)]">
            No specific verification questions were drafted.
          </p>
          <p className="mt-1 text-2xs text-[var(--text-muted)]">
            Review the limits and missing information sections for general verification areas.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {questions.map((q, idx) => {
            const relatedCategory = q.relatedConcernId
              ? concernMap.get(q.relatedConcernId)
              : undefined;
            const isCopied = copiedId === q.id;

            return (
              <div
                key={q.id}
                className="rounded border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-mono font-bold text-[var(--text-muted)]">
                      #{idx + 1}
                    </span>
                    {relatedCategory && (
                      <span className="inline-flex items-center rounded-xs bg-[var(--surface-muted)] px-1.5 py-0.5 text-2xs font-medium text-[var(--text-muted)] border border-[var(--border)]">
                        Relates to: {relatedCategory}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed font-medium">
                    {sentenceCase(q.question)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySingle(q.id, q.question)}
                  className="inline-flex items-center gap-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[32px] shrink-0 self-start sm:self-center"
                  aria-label={`Copy question ${idx + 1} to clipboard`}
                >
                  {isCopied ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-[var(--primary-ledger)]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>Copy question</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Contextual Self-Checks Checklist */}
      <div className="mt-4 rounded border border-[var(--border)] bg-[var(--surface-muted)] p-4 space-y-2.5 transition-colors">
        <div>
          <h4 className="text-xs font-bold text-[var(--text)]">
            Check these yourself (prioritised checklist)
          </h4>
          <p className="mt-0.5 text-2xs text-[var(--text-muted)]">
            Independent checks you can do right now using official public channels.
          </p>
        </div>

        <ol className="space-y-2 text-xs text-[var(--text)] leading-relaxed list-none">
          {selfChecks.map((check, idx) => (
            <li key={check.id} className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-2xs font-mono font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{check.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
