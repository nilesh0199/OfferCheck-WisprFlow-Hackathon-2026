import React, { useRef, useState, useEffect, useMemo } from "react";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { buildReviewSummary } from "@/lib/analysis/summary";
import { sentenceCase } from "@/lib/analysis/sentence-case";
import { sortConcernsByPriority } from "@/lib/analysis/priorities";
import { getResearchNudge } from "@/lib/research/nudge";
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
  activeConcernId?: string | null;
  onHoverConcern?: (id: string | null) => void;
}

export function AnalysisResults({
  analysis,
  analyzedSnapshotText,
  activeConcernId: externalActiveConcernId,
  onHoverConcern,
}: AnalysisResultsProps) {
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const [internalActiveConcernId, setInternalActiveConcernId] = useState<string | null>(null);
  const activeConcernId = externalActiveConcernId ?? internalActiveConcernId;

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showClipboardFallback, setShowClipboardFallback] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  // Sort concerns stably by specified category priority before display
  const sortedConcerns = useMemo(
    () => sortConcernsByPriority(analysis.concerns),
    [analysis.concerns]
  );

  // Compute contextual research nudge pure function
  const nudge = useMemo(
    () => getResearchNudge({ analysis, sourceText: analyzedSnapshotText }),
    [analysis, analyzedSnapshotText]
  );

  // Focus the results heading programmatically when results are mounted or updated
  useEffect(() => {
    resultsHeadingRef.current?.focus();
  }, [analysis]);

  const handleShowInText = (concernId: string) => {
    setInternalActiveConcernId(concernId);
    onHoverConcern?.(concernId);
    // Try scrolling desktop rail element into view
    const railElement = document.getElementById(`rail-highlight-${concernId}`);
    if (railElement) {
      railElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // Also open bottom drawer for mobile/tablet
    setIsViewerOpen(true);
    setTimeout(() => {
      const element = document.getElementById(`highlight-concern-${concernId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

  const isRecommended = nudge.level === "recommended";

  return (
    <div className="space-y-6 pt-1">
      {/* Live announcement region for copy status */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      {/* Results Header and Focus Target */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2
            ref={resultsHeadingRef}
            tabIndex={-1}
            className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text)] outline-none focus:outline-none"
          >
            Offer review results
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            This is a review of the text provided. It is not a safety assessment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[34px] shrink-0 no-print"
            aria-label="Export review to PDF"
          >
            <span>Export review (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center justify-center gap-1.5 rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[34px] shrink-0 no-print"
            aria-label="Copy review summary to clipboard"
          >
            {copiedSummary ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-[var(--primary-ledger)]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Copy review summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Clipboard Fallback Area if navigator.clipboard fails */}
      {showClipboardFallback && (
        <div
          role="region"
          aria-label="Manual copy review summary area"
          className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--text)]">
              Select and copy the review summary below:
            </p>
            <button
              type="button"
              onClick={() => setShowClipboardFallback(false)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded p-1"
            >
              Close
            </button>
          </div>
          <textarea
            readOnly
            rows={5}
            value={buildReviewSummary(analysis, analyzedSnapshotText)}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-xs border border-[var(--border)] bg-[var(--surface)] p-2 font-mono text-xs text-[var(--text)] custom-scrollbar"
          />
        </div>
      )}

      {/* Summary Card with Neutral Count Chips */}
      <div
        id="section-summary"
        className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-2xs space-y-3 transition-colors"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Review summary
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs tabular-nums">
            <span className="inline-flex items-center rounded-xs bg-[var(--surface-muted)] px-2 py-0.5 font-medium text-[var(--text-muted)] border border-[var(--border)]">
              {sortedConcerns.length} observations
            </span>
            <span className="inline-flex items-center rounded-xs bg-[var(--surface-muted)] px-2 py-0.5 font-medium text-[var(--text-muted)] border border-[var(--border)]">
              {analysis.missingInfo.length} missing details
            </span>
            <span className="inline-flex items-center rounded-xs bg-[var(--surface-muted)] px-2 py-0.5 font-medium text-[var(--text-muted)] border border-[var(--border)]">
              {analysis.verificationQuestions.length} questions
            </span>
          </div>
        </div>

        {analysis.overallNote && (
          <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed font-medium">
            {sentenceCase(analysis.overallNote)}
          </p>
        )}

        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {sortedConcerns.length === 0
            ? "No specific concerns were identified in the text provided. This is not a safety assessment."
            : "Review the potential concerns and questions below before proceeding with this offer."}
        </p>

        {analysis.droppedCount > 0 && (
          <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
            Notice: {analysis.droppedCount} item(s) were removed because their
            supporting quotes could not be matched character-for-character to
            your text.
          </p>
        )}
      </div>

      {/* Recommended Placement: Top under summary */}
      {isRecommended && (
        <CompanyResearchCard
          offerText={analyzedSnapshotText}
          entities={analysis.entities}
          level="recommended"
          reasons={nudge.reasons}
          defaultCollapsed={false}
        />
      )}

      {/* Mobile-Only Horizontal Jump Navigation (Hidden on desktop where Left Panel has OnThisPageNav) */}
      <nav
        aria-label="Results sections jump navigation"
        className="sticky top-14 z-10 lg:hidden flex items-center gap-2 overflow-x-auto py-2 px-1 bg-[var(--surface)]/95 backdrop-blur-xs border-y border-[var(--border)] text-xs font-medium custom-scrollbar"
      >
        <span className="text-[var(--text-muted)] shrink-0 font-mono text-xs uppercase">Jump:</span>
        <a
          href="#section-summary"
          className="rounded-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shrink-0"
        >
          Summary
        </a>
        {isRecommended && (
          <a
            href="#section-research"
            className="rounded-xs px-2 py-1 text-[var(--text)] font-semibold bg-[var(--tint-attention-bg)] border border-[var(--tint-attention-border)] shrink-0"
          >
            Research
          </a>
        )}
        <a
          href="#section-observations"
          className="rounded-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shrink-0"
        >
          Observations ({sortedConcerns.length})
        </a>
        <a
          href="#section-missing"
          className="rounded-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shrink-0"
        >
          Missing ({analysis.missingInfo.length})
        </a>
        <a
          href="#section-questions"
          className="rounded-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shrink-0"
        >
          Questions ({analysis.verificationQuestions.length})
        </a>
        {!isRecommended && (
          <a
            href="#section-research"
            className="rounded-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shrink-0"
          >
            Research
          </a>
        )}
        <a
          href="#section-resources"
          className="rounded-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shrink-0"
        >
          Resources
        </a>
        <a
          href="#section-limits"
          className="rounded-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shrink-0"
        >
          Limits
        </a>
      </nav>

      {/* Section A: Potential concerns (sorted by category priority) */}
      <ConcernsSection
        concerns={sortedConcerns}
        onShowInText={handleShowInText}
        activeConcernId={activeConcernId}
        onHoverConcern={onHoverConcern}
      />

      {/* Section B: Missing or unclear information */}
      <MissingInfoSection missingInfo={analysis.missingInfo} />

      {/* Section C: Questions to verify & Check these yourself */}
      <QuestionsSection
        questions={analysis.verificationQuestions}
        concerns={sortedConcerns}
      />

      {/* Optional Placement: After questions if not recommended */}
      {!isRecommended && (
        <CompanyResearchCard
          offerText={analyzedSnapshotText}
          entities={analysis.entities}
          level="optional"
          reasons={[]}
          defaultCollapsed={false}
        />
      )}

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
