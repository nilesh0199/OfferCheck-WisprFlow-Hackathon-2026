import React, { useState } from "react";
import {
  ValidatedVerificationQuestion,
  ValidatedConcern,
} from "@/lib/analysis/schema";
import { getConcernCategoryLabel } from "@/lib/analysis/labels";

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

  // Map concern id to concern category label for easy reference
  const concernMap = new Map<string, string>();
  for (const c of concerns) {
    concernMap.set(c.id, getConcernCategoryLabel(c.category));
  }

  const handleCopySingle = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback: clipboard permission denied
      prompt("Copy question:", text);
    }
  };

  const handleCopyAll = async () => {
    if (questions.length === 0) return;
    const allText = questions
      .map((q, idx) => `${idx + 1}. ${q.question}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      prompt("Copy all questions:", allText);
    }
  };

  return (
    <section aria-labelledby="questions-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3
            id="questions-heading"
            className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
          >
            <span>Section C: Questions to verify</span>
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              ({questions.length} {questions.length === 1 ? "question" : "questions"})
            </span>
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Professional verification questions specific to this offer that you
            can copy and ask the recruiter before taking further action.
          </p>
        </div>

        {questions.length > 0 && (
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 active:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 min-h-[44px]"
            aria-label="Copy all verification questions to clipboard"
          >
            <span>{copiedAll ? "✓ Copied all!" : "📋 Copy all questions"}</span>
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            No specific verification questions were drafted.
          </p>
          <p className="mt-1 text-xs">
            Review the limits and missing information sections for general
            verification areas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const relatedCategory = q.relatedConcernId
              ? concernMap.get(q.relatedConcernId)
              : undefined;
            const isCopied = copiedId === q.id;

            return (
              <div
                key={q.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                      #{idx + 1}
                    </span>
                    {relatedCategory && (
                      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-2xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        Relates to: {relatedCategory}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed font-medium">
                    {q.question}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySingle(q.id, q.question)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-100 active:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 min-h-[44px] shrink-0"
                  aria-label={`Copy question ${idx + 1}`}
                >
                  <span>{isCopied ? "✓ Copied" : "Copy"}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
