import React, { useRef, useState, useEffect, useMemo } from "react";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { buildReviewSummary } from "@/lib/analysis/summary";
import { sentenceCase } from "@/lib/analysis/sentence-case";
import { sortConcernsByPriority } from "@/lib/analysis/priorities";
import { ConcernsSection } from "./ConcernsSection";
import { MissingInfoSection } from "./MissingInfoSection";
import { QuestionsSection } from "./QuestionsSection";
import { CompanyResearchCard } from "./CompanyResearchCard";
import { OfficialResourcesSection } from "./OfficialResourcesSection";
import { LimitsSection } from "./LimitsSection";
import { HighlightedTextViewer } from "./HighlightedTextViewer";
import { CopyIcon, CheckIcon } from "./Icons";

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
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showClipboardFallback, setShowClipboardFallback] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // Sort concerns stably by specified category priority before display
  const sortedConcerns = useMemo(
    () => sortConcernsByPriority(analysis.concerns),
    [analysis.concerns]
  );

  // Focus the results heading programmatically when results are mounted or updated
  useEffect(() => {
    resultsHeadingRef.current?.focus();
  }, [analysis]);

  const handleShowInText = (concernId: string) => {
    setActiveConcernId(concernId);
    setIsViewerOpen(true);
    setTimeout(() => {
      const element = document.getElementById(`highlight-concern-${concernId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const handleCopySummary = async () => {
    const summaryText = buildReviewSummary(analysis, analyzedSnapshotText);
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setShowClipboardFallback(false);
      setLiveAnnouncement("Review summary copied to clipboard");
      setTimeout(() => {
        setCopiedSummary(false);
        setLiveAnnouncement("");
      }, 2000);
    } catch {
      setShowClipboardFallback(true);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Live announcement region for copy status */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      {/* Results Header and Focus Target */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2
            ref={resultsHeadingRef}
            tabIndex={-1}
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 outline-none focus:outline-none"
          >
            Offer review results
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            This is a review of the text you pasted. It is not a safety assessment.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 shadow-xs hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 min-h-[44px] shrink-0"
          aria-label="Copy review summary to clipboard"
        >
          {copiedSummary ? (
            <>
              <CheckIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Copy review summary</span>
            </>
          )}
        </button>
      </div>

      {/* Clipboard Fallback Area if navigator.clipboard fails */}
      {showClipboardFallback && (
        <div
          role="region"
          aria-label="Manual copy review summary area"
          className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-2 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Select and copy the review summary below:
            </p>
            <button
              type="button"
              onClick={() => setShowClipboardFallback(false)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded p-1"
            >
              Close
            </button>
          </div>
          <textarea
            readOnly
            rows={6}
            value={buildReviewSummary(analysis, analyzedSnapshotText)}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 custom-scrollbar"
          />
        </div>
      )}

      {/* Summary Card with Neutral Count Chips */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3.5 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Review summary
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {sortedConcerns.length} observations
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {analysis.missingInfo.length} missing details
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {analysis.verificationQuestions.length} questions
            </span>
          </div>
        </div>

        {analysis.overallNote && (
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {sentenceCase(analysis.overallNote)}
          </p>
        )}

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {sortedConcerns.length === 0
            ? "No specific concerns were identified in the text provided. This is not a safety assessment."
            : "Review the potential concerns and questions below before proceeding with this offer."}
        </p>

        {analysis.droppedCount > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Notice: {analysis.droppedCount} item(s) were removed because their
            supporting quotes could not be matched character-for-character to
            your text.
          </p>
        )}
      </div>

      {/* Sticky Jump Navigation */}
      <nav
        aria-label="Results sections jump navigation"
        className="sticky top-16 z-10 flex items-center gap-2 overflow-x-auto py-2 px-1 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xs border-y border-slate-200/80 dark:border-slate-800 text-xs font-medium custom-scrollbar"
      >
        <span className="text-slate-400 dark:text-slate-500 shrink-0">Jump to:</span>
        <a
          href="#section-observations"
          className="rounded-md px-2.5 py-1 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 shrink-0"
        >
          Observations ({sortedConcerns.length})
        </a>
        <a
          href="#section-missing"
          className="rounded-md px-2.5 py-1 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 shrink-0"
        >
          Missing details ({analysis.missingInfo.length})
        </a>
        <a
          href="#section-questions"
          className="rounded-md px-2.5 py-1 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 shrink-0"
        >
          Questions ({analysis.verificationQuestions.length})
        </a>
        <a
          href="#section-research"
          className="rounded-md px-2.5 py-1 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 shrink-0"
        >
          Research
        </a>
        <a
          href="#section-resources"
          className="rounded-md px-2.5 py-1 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 shrink-0"
        >
          Resources
        </a>
        <a
          href="#section-limits"
          className="rounded-md px-2.5 py-1 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 shrink-0"
        >
          Limits
        </a>
      </nav>

      {/* Section A: Potential concerns (sorted by category priority) */}
      <ConcernsSection
        concerns={sortedConcerns}
        onShowInText={handleShowInText}
      />

      {/* Section B: Missing or unclear information */}
      <MissingInfoSection missingInfo={analysis.missingInfo} />

      {/* Section C: Questions to verify & Check these yourself */}
      <QuestionsSection
        questions={analysis.verificationQuestions}
        concerns={sortedConcerns}
      />

      {/* Optional: Company research prompt handoff */}
      <CompanyResearchCard
        offerText={analyzedSnapshotText}
        entities={analysis.entities}
        defaultCollapsed={false}
      />

      {/* Section: Next steps and official resources */}
      <OfficialResourcesSection
        categories={sortedConcerns.map((c) => c.category)}
        sourceText={analyzedSnapshotText}
      />

      {/* Section D: Limits of this review */}
      <LimitsSection limits={analysis.limits} />

      {/* "Your text, with quotes highlighted" (collapsible, hidden if 0 concerns) */}
      <HighlightedTextViewer
        text={analyzedSnapshotText}
        concerns={sortedConcerns}
        activeConcernId={activeConcernId}
        isOpen={isViewerOpen}
        onToggle={setIsViewerOpen}
      />
    </div>
  );
}
