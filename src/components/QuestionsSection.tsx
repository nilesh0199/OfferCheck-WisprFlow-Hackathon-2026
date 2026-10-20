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
    <section id="section-questions" aria-labelledby="questions-heading" className="space-y-4">
      {/* Live announcement region for copy status */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3
            id="questions-heading"
            className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"
          >
            <span>Section C: Questions to verify</span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {questions.length} {questions.length === 1 ? "question" : "questions"}
            </span>
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Professional verification questions specific to this offer that you
            can copy and ask the recruiter before taking further action.
          </p>
        </div>

        {questions.length > 0 && (
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-xs hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 min-h-[44px]"
            aria-label="Copy all verification questions to clipboard"
          >
            {copiedAll ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Copy all questions</span>
              </>
            )}
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <p className="font-medium text-slate-800 dark:text-slate-200">
            No specific verification questions were drafted.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      #{idx + 1}
                    </span>
                    {relatedCategory && (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Relates to: {relatedCategory}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                    {sentenceCase(q.question)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySingle(q.id, sentenceCase(q.question))}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs hover:bg-slate-100 active:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 min-h-[44px] shrink-0"
                  aria-label={`Copy question ${idx + 1}`}
                >
                  {isCopied ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-block: Check these yourself */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-3 transition-colors">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Check these yourself
          </h4>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Independent steps you can take yourself before replying, paying, or sharing documents.
          </p>
        </div>

        <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-none">
          {selfChecks.map((item, idx) => (
            <li key={item.id} className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-2xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
