import React, { useRef, useState, useEffect, useMemo } from "react";
import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { sentenceCase } from "@/lib/analysis/sentence-case";
import { sortConcernsByPriority } from "@/lib/analysis/priorities";
import { getResearchNudge } from "@/lib/research/nudge";
import { ConcernsSection } from "./ConcernsSection";
import { MissingInfoSection } from "./MissingInfoSection";
import { QuestionsSection } from "./QuestionsSection";
import { CompanyResearchCard } from "./CompanyResearchCard";
import { OfficialResourcesSection } from "./OfficialResourcesSection";
import { OfficialAdvisoriesSection } from "./OfficialAdvisoriesSection";
import { LimitsSection } from "./LimitsSection";
import { HighlightedTextViewer } from "./HighlightedTextViewer";
import { selectAdvisories } from "@/data/advisories";

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

  const isRecommended = nudge.level === "recommended";

  return (
    <div className="space-y-6 pt-1">
      {/* Results Header and Focus Target */}
      <div className="border-b border-[var(--border)] pb-4">
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

      {/* Summary Card with Neutral Count Chips */}
      <div
        id="section-summary"
        className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-2xs space-y-3 transition-colors"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 p-3.5 sm:px-5 rounded-t bg-[var(--tint-info-bg)]">
          <h3 className="text-xs font-sans font-semibold text-[var(--text-muted)]">
            Review summary
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs tabular-nums">
            <span className="inline-flex items-center rounded-xs bg-[var(--surface)] px-2 py-0.5 font-medium text-[var(--color-primary)] border border-[var(--border)]">
              {sortedConcerns.length} observations
            </span>
            <span className="inline-flex items-center rounded-xs bg-[var(--surface)] px-2 py-0.5 font-medium text-[var(--color-primary)] border border-[var(--border)]">
              {analysis.missingInfo.length} missing details
            </span>
            <span className="inline-flex items-center rounded-xs bg-[var(--surface)] px-2 py-0.5 font-medium text-[var(--color-primary)] border border-[var(--border)]">
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

      {/* Mobile-Only Horizontal Jump Navigation (Hidden on desktop where Left Panel has ResultsNav) */}
      <nav
        aria-label="Results sections jump navigation"
        className="sticky top-14 z-10 lg:hidden flex items-center gap-2 overflow-x-auto py-2 px-1 bg-[var(--surface)]/95 border-y border-[var(--border)] text-xs font-medium custom-scrollbar"
      >
        <span className="text-[var(--text-muted)] shrink-0 font-sans text-xs">Jump:</span>
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

      {/* Section: Institutional Advisories & Public Alerts */}
      <OfficialAdvisoriesSection
        advisories={selectAdvisories({
          offerText: analyzedSnapshotText,
          categoryKeys: sortedConcerns.map((c) => c.category),
        })}
      />

      {/* Section D: Limits of this review */}
      <LimitsSection limits={analysis.limits} />

      {/* "Your text, with quotes highlighted" (collapsible, hidden if 0 concerns) */}
      <div id="section-your-text">
        <HighlightedTextViewer
          text={analyzedSnapshotText}
          concerns={sortedConcerns}
          activeConcernId={activeConcernId}
          isOpen={isViewerOpen}
          onToggle={setIsViewerOpen}
        />
      </div>
    </div>
  );
}
