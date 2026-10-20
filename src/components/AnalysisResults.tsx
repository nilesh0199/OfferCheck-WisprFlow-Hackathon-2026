import React, { useRef, useState, useEffect } from "react";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { buildReviewSummary } from "@/lib/analysis/summary";
import { ConcernsSection } from "./ConcernsSection";
import { MissingInfoSection } from "./MissingInfoSection";
import { QuestionsSection } from "./QuestionsSection";
import { LimitsSection } from "./LimitsSection";
import { HighlightedTextViewer } from "./HighlightedTextViewer";

interface AnalysisResultsProps {
  analysis: ValidatedAnalysis;
  analyzedSnapshotText: string;
}

export function AnalysisResults({
  analysis,
  analyzedSnapshotText,
}: AnalysisResultsProps) {
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const [activeConcernId, setActiveConcernId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showClipboardFallback, setShowClipboardFallback] = useState(false);

  // Focus the results heading when results are mounted or updated
  useEffect(() => {
    resultsHeadingRef.current?.focus();
  }, [analysis]);

  const handleShowInText = (concernId: string) => {
    setActiveConcernId(concernId);
    const element = document.getElementById(`highlight-concern-${concernId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCopySummary = async () => {
    const summaryText = buildReviewSummary(analysis);
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setShowClipboardFallback(false);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // Show fallback area if clipboard API fails
      setShowClipboardFallback(true);
    }
  };

  return (
    <div className="space-y-8 pt-4">
      {/* Results Header and Focus Target */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <h2
            ref={resultsHeadingRef}
            tabIndex={-1}
            className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-600 rounded-md"
          >
            Offer Review Results
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            This is a review of the text you pasted. It is not a safety
            assessment.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-zinc-900 shadow-2xs hover:bg-zinc-50 active:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 min-h-[44px] shrink-0"
          aria-label="Copy review summary to clipboard"
        >
          <span>{copiedSummary ? "✓ Copied summary!" : "📋 Copy review summary"}</span>
        </button>
      </div>

      {/* Clipboard Fallback Modal / Area if clipboard fails */}
      {showClipboardFallback && (
        <div
          role="region"
          aria-label="Manual copy review summary area"
          className="rounded-xl border border-zinc-300 bg-zinc-50 p-4 space-y-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Select and copy the review summary below:
            </p>
            <button
              type="button"
              onClick={() => setShowClipboardFallback(false)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Close
            </button>
          </div>
          <textarea
            readOnly
            rows={6}
            value={buildReviewSummary(analysis)}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-lg border border-zinc-300 bg-white p-2.5 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      )}

      {/* Summary Area */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Review summary
        </h3>

        {analysis.overallNote && (
          <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
            {analysis.overallNote}
          </p>
        )}

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {analysis.concerns.length === 0
            ? "No specific concerns were identified in the text provided. This is not a safety assessment."
            : "Review the potential concerns and questions below before proceeding with this offer."}
        </p>

        {analysis.droppedCount > 0 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            Notice: {analysis.droppedCount} item(s) were removed because their
            supporting quotes could not be matched character-for-character to
            your text.
          </p>
        )}
      </div>

      {/* Section A: Potential concerns */}
      <ConcernsSection
        concerns={analysis.concerns}
        onShowInText={handleShowInText}
      />

      {/* Section B: Missing or unclear information */}
      <MissingInfoSection missingInfo={analysis.missingInfo} />

      {/* Section C: Questions to verify */}
      <QuestionsSection
        questions={analysis.verificationQuestions}
        concerns={analysis.concerns}
      />

      {/* Section D: Limits of this review */}
      <LimitsSection limits={analysis.limits} />

      {/* "Your text, with quotes highlighted" */}
      <HighlightedTextViewer
        text={analyzedSnapshotText}
        concerns={analysis.concerns}
        activeConcernId={activeConcernId}
      />
    </div>
  );
}
