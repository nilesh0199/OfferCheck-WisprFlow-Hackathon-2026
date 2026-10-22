"use client";

import { useState, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { Container } from "@/components/Container";
import { OfferInputForm } from "@/components/OfferInputForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { OutdatedBanner } from "@/components/OutdatedBanner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { AboutTool } from "@/components/AboutTool";
import { YourOfferWorkspace } from "@/components/YourOfferWorkspace";
import { OnThisPageNav, PageSectionItem } from "@/components/OnThisPageNav";
import { SpinnerIcon, LockIcon } from "@/components/Icons";
import { useOfferSession } from "@/components/SessionProvider";
import { getResearchNudge } from "@/lib/research/nudge";
import { buildReviewSummary } from "@/lib/analysis/summary";
import { SampleCards } from "@/components/SampleCards";
import Link from "next/link";

export function CheckClient() {
  const {
    offerText,
    analyzedSnapshotText,
    analysis,
    isLoading,
    elapsedSeconds,
    errorState,
    isResultOutdated,
    selectedFiles,
    addedFileCount,
    setOfferText,
    handleAnalyze,
    handleCancel,
    handleClear,
  } = useOfferSession();

  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [activeConcernId, setActiveConcernId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [mobileOfferExpanded, setMobileOfferExpanded] = useState(false);

  const hasInput = offerText.trim().length > 0 || (selectedFiles && selectedFiles.length > 0);
  const charCount = offerText.length;
  const filesCount = selectedFiles ? selectedFiles.length : 0;
  const filesSummary =
    filesCount > 0
      ? `${filesCount} attached, ${filesCount} waiting to be added`
      : addedFileCount > 0
      ? `${addedFileCount} added`
      : "none";

  // Compute sections dynamically for OnThisPageNav
  const navSections = useMemo<PageSectionItem[]>(() => {
    if (!analysis) return [];
    const nudge = getResearchNudge({
      analysis,
      sourceText: analyzedSnapshotText,
    });
    const isRecommended = nudge.level === "recommended";

    const sections: PageSectionItem[] = [
      { id: "section-summary", label: "Review summary" },
    ];

    if (isRecommended) {
      sections.push({ id: "section-research", label: "Recommended research" });
    }

    sections.push(
      {
        id: "section-observations",
        label: "Potential concerns",
        count: analysis.concerns.length,
      },
      {
        id: "section-missing",
        label: "Missing details",
        count: analysis.missingInfo.length,
      },
      {
        id: "section-questions",
        label: "Questions to verify",
        count: analysis.verificationQuestions.length,
      }
    );

    if (!isRecommended) {
      sections.push({
        id: "section-research",
        label: "Company research (optional)",
      });
    }

    sections.push(
      { id: "section-resources", label: "Official resources" },
      { id: "section-limits", label: "Review limits" }
    );

    return sections;
  }, [analysis, analyzedSnapshotText]);

  const handleCopySummary = useCallback(async () => {
    if (!analysis) return;
    const summaryText = buildReviewSummary(analysis, analyzedSnapshotText);
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Fallback handled in results component
    }
  }, [analysis, analyzedSnapshotText]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between transition-colors">
      <Header />

      <Container as="main" className="py-6 sm:py-8 pb-24 sm:pb-8 space-y-8 flex-1">
        {/* ========================================================
            PRE-REVIEW STATE (Initial Visit / Before Analysis)
           ======================================================== */}
        {!isLoading && !analysis && !errorState && (
          <div>
            {/* Below 1280px (< xl): Single column with samples disclosure above input card */}
            <div className="xl:hidden mb-6">
              <details
                open={!hasInput}
                className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-2xs space-y-3 transition-colors"
              >
                <summary className="flex items-center justify-between font-semibold text-xs sm:text-sm text-[var(--text)] cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <span>Try a sample offer</span>
                    <span className="text-xs font-normal text-[var(--text-muted)]">
                      {!hasInput ? "(click to load)" : "(collapsed)"}
                    </span>
                  </div>
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-[var(--text-muted)] group-open:rotate-180 transition-transform duration-200 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="pt-3 border-t border-[var(--border)]">
                  <SampleCards
                    currentText={offerText}
                    onSelectSample={setOfferText}
                    disabled={isLoading}
                  />
                </div>
              </details>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left Column (7/12 on xl): Input card with file upload & shortcut */}
              <div className="w-full xl:col-span-7 space-y-4">
                <OfferInputForm
                  offerText={offerText}
                  setOfferText={setOfferText}
                  onAnalyze={async () => {
                    setIsEditingOffer(false);
                    await handleAnalyze();
                  }}
                  onCancel={handleCancel}
                  onClear={() => {
                    setIsEditingOffer(false);
                    handleClear();
                  }}
                  isLoading={isLoading}
                  elapsedSeconds={elapsedSeconds}
                />
              </div>

              {/* Right Column (5/12 on xl, visible on desktop >= 1280px) */}
              <div className="hidden xl:block xl:col-span-5 space-y-6">
                {!hasInput ? (
                  /* BEFORE any input: Sample cards and What you will get */
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-3.5 transition-colors">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                      <h3 className="text-xs font-sans font-semibold text-[var(--text-muted)]">
                        Try a sample offer
                      </h3>
                      <span className="text-xs font-sans text-[var(--text-muted)]">
                        Click to load
                      </span>
                    </div>

                    <SampleCards
                      currentText={offerText}
                      onSelectSample={setOfferText}
                      disabled={isLoading}
                    />
                  </div>
                ) : (
                  /* AFTER text or files exist: "Before you review" panel */
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-4 transition-colors">
                    <h3 className="text-xs font-sans font-semibold text-[var(--text)] border-b border-[var(--border)] pb-2.5">
                      Before you review
                    </h3>

                    {/* Source summary */}
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs text-[var(--text)] space-y-1">
                      <span className="font-semibold block text-[var(--text)]">Source summary:</span>
                      <p className="font-mono text-xs text-[var(--text-muted)]">
                        text: {charCount.toLocaleString()} characters; files: {filesSummary}
                      </p>
                    </div>

                    {/* Reminder to remove personal details */}
                    <div className="flex items-start gap-2.5 text-xs text-[var(--text-muted)] leading-relaxed">
                      <LockIcon className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                      <p>
                        Remove names, phone numbers, email addresses, bank details, government IDs, and passwords before analyzing.
                      </p>
                    </div>

                    {/* Collapsed disclosure to try a sample instead */}
                    <details className="group rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/60 p-3 text-xs">
                      <summary className="flex items-center justify-between font-semibold text-[var(--text)] cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]">
                        <span>Try a sample instead</span>
                        <svg
                          aria-hidden="true"
                          className="w-3.5 h-3.5 text-[var(--text-muted)] group-open:rotate-180 transition-transform duration-200 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="pt-3 border-t border-[var(--border)] mt-2">
                        <SampleCards
                          currentText={offerText}
                          onSelectSample={setOfferText}
                          disabled={isLoading}
                        />
                      </div>
                    </details>
                  </div>
                )}

                {/* What you will get card */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-3 transition-colors">
                  <h3 className="text-xs font-sans font-semibold text-[var(--text-muted)] border-b border-[var(--border)] pb-2">
                    What you will get
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0" />
                      <span>
                        <strong>Potential concerns:</strong> Quote-linked observations on upfront deposits, pressure tactics, and irregular channels.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0" />
                      <span>
                        <strong>Missing details:</strong> Essential terms absent from the offer (stipend amount, dates, responsibilities).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0" />
                      <span>
                        <strong>Questions to verify:</strong> Specific, non-accusatory questions to clarify directly with the employer.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0" />
                      <span>
                        <strong>Independent research:</strong> Neutral guidance and prompts to verify the entity before committing.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            LOADING STATE
           ======================================================== */}
        {isLoading && (
          <div
            role="status"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xs space-y-6 transition-colors max-w-4xl mx-auto"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <SpinnerIcon className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[var(--text)]">
                    Reviewing offer ({elapsedSeconds}s)
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]" aria-live="polite">
                    This can take up to a minute.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px]"
              >
                Cancel review
              </button>
            </div>

            {/* Shimmer skeleton placeholders */}
            <div className="space-y-4 animate-pulse" aria-hidden="true">
              <div className="h-20 rounded-lg bg-[var(--surface-muted)] p-4 space-y-2 border border-[var(--border)]">
                <div className="h-3 w-1/4 rounded bg-[var(--border)]" />
                <div className="h-3 w-3/4 rounded bg-[var(--border)]" />
              </div>
              <div className="h-28 rounded-lg bg-[var(--surface-muted)] p-4 space-y-2.5 border border-[var(--border)]">
                <div className="h-3 w-1/3 rounded bg-[var(--border)]" />
                <div className="h-3 w-full rounded bg-[var(--border)]" />
                <div className="h-3 w-2/3 rounded bg-[var(--border)]" />
              </div>
              <div className="h-24 rounded-lg bg-[var(--surface-muted)] p-4 space-y-2.5 border border-[var(--border)]">
                <div className="h-3 w-1/4 rounded bg-[var(--border)]" />
                <div className="h-3 w-5/6 rounded bg-[var(--border)]" />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ERROR STATE
           ======================================================== */}
        {!isLoading && errorState && (
          <div className="max-w-3xl mx-auto">
            <ErrorAlert
              errorType={errorState.type}
              customMessage={errorState.message}
              onTryAgain={handleAnalyze}
            />
          </div>
        )}

        {/* ========================================================
            POST-REVIEW STATE (3-Zone Responsive Workspace)
           ======================================================== */}
        {!isLoading && analysis && (
          <div className="space-y-6">
            {isResultOutdated && <OutdatedBanner />}

            {/* Editing mode banner */}
            {isEditingOffer && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm">
                <span className="font-semibold text-[var(--text)]">
                  Editing text
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingOffer(false)}
                  className="text-xs text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded px-2 py-1 font-medium min-h-[44px] inline-flex items-center"
                >
                  Back to review snapshot
                </button>
              </div>
            )}

            {isEditingOffer ? (
              <div className="max-w-4xl mx-auto">
                <OfferInputForm
                  offerText={offerText}
                  setOfferText={setOfferText}
                  onAnalyze={async () => {
                    setIsEditingOffer(false);
                    await handleAnalyze();
                  }}
                  onCancel={handleCancel}
                  onClear={() => {
                    setIsEditingOffer(false);
                    handleClear();
                  }}
                  isLoading={isLoading}
                  elapsedSeconds={elapsedSeconds}
                />
              </div>
            ) : (
              /* Post-review 3-Zone Desktop Layout (>= 1280px), 2-Zone (1024-1279px), 1-Zone (< 1024px) */
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] xl:grid-cols-[400px_1fr_260px] gap-8 items-start">
                {/* 1) Left Rail (~400px, desktop only >= 1280px, sticky): 'Your text' document viewer */}
                <aside
                  aria-label="Your text document viewer"
                  className="hidden xl:block xl:sticky xl:top-20 space-y-4"
                >
                  <YourOfferWorkspace
                    text={analyzedSnapshotText}
                    concerns={analysis.concerns}
                    onEditText={() => setIsEditingOffer(true)}
                    onNewReview={() => {
                      setIsEditingOffer(false);
                      handleClear();
                    }}
                    activeConcernId={activeConcernId}
                    onSelectConcern={setActiveConcernId}
                  />
                </aside>

                {/* 2) Centre Fluid Column: Review results (prose <= 70ch) */}
                <section
                  aria-label="Review findings and observations"
                  className="min-w-0 space-y-6"
                >
                  {/* Expandable 'Your text' panel for screens < 1280px (medium and mobile) */}
                  <div className="xl:hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    <button
                      type="button"
                      onClick={() => setMobileOfferExpanded(!mobileOfferExpanded)}
                      className="w-full flex items-center justify-between text-left text-xs font-semibold text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]"
                      aria-expanded={mobileOfferExpanded}
                    >
                      <span>
                        Your text ({analyzedSnapshotText.length.toLocaleString()} characters)
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[var(--color-primary)] text-xs font-medium">
                        <span>{mobileOfferExpanded ? "Collapse" : "View text"}</span>
                        <svg
                          aria-hidden="true"
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            mobileOfferExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    {mobileOfferExpanded && (
                      <div className="pt-3 border-t border-[var(--border)] mt-2">
                        <YourOfferWorkspace
                          text={analyzedSnapshotText}
                          concerns={analysis.concerns}
                          onEditText={() => setIsEditingOffer(true)}
                          onNewReview={() => {
                            setIsEditingOffer(false);
                            handleClear();
                          }}
                          activeConcernId={activeConcernId}
                          onSelectConcern={setActiveConcernId}
                        />
                      </div>
                    )}
                  </div>

                  {/* Results components with evidence linking */}
                  <AnalysisResults
                    analysis={analysis}
                    analyzedSnapshotText={analyzedSnapshotText}
                    activeConcernId={activeConcernId}
                    onHoverConcern={setActiveConcernId}
                  />
                </section>

                {/* 3) Right Rail (~260px, sticky on lg >= 1024px): On this page nav + Quick actions */}
                <aside
                  aria-label="Review page navigation and actions"
                  className="hidden lg:block lg:sticky lg:top-20 space-y-4"
                >
                  <OnThisPageNav
                    sections={navSections}
                    onCopySummary={handleCopySummary}
                    copiedSummary={copiedSummary}
                  />
                </aside>
              </div>
            )}
          </div>
        )}

        {/* About this tool details component */}
        <div className="pt-4 border-t border-[var(--border)]">
          <AboutTool />
        </div>
      </Container>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] py-6 mt-12 transition-colors">
        <Container className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="space-y-1">
            <p>
              Reviews pasted text only. Cannot confirm that a sender is genuine.
            </p>
            <p>Built for the No Hands: Wispr Challenge.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Home
            </Link>
            <Link
              href="/resources"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Official resources
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              Privacy
            </Link>
            <a
              href="#about-this-tool"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1.5 min-h-[44px] inline-flex items-center"
            >
              About this tool
            </a>
          </div>
        </Container>
      </footer>
    </div>
  );
}
