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
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
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
    setOfferText,
    handleAnalyze,
    handleCancel,
    handleClear,
  } = useOfferSession();

  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [activeConcernId, setActiveConcernId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [mobileOfferExpanded, setMobileOfferExpanded] = useState(false);

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

      <Container as="main" className="py-6 sm:py-8 space-y-8 flex-1">
        {/* ========================================================
            PRE-REVIEW STATE (Initial Visit / Before Analysis)
           ======================================================== */}
        {!isLoading && !analysis && !errorState && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 7/12 Left: Input card with file upload & shortcut */}
            <div className="lg:col-span-7 space-y-4">
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

            {/* 5/12 Right: Try a sample, What you get, Privacy notice */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1) Try a sample cards */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-3.5 transition-colors">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Try a sample offer
                  </h3>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    Click to load
                  </span>
                </div>

                <div className="space-y-2.5">
                  {SYNTHETIC_EXAMPLES.slice(0, 3).map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => setOfferText(sample.text)}
                      className="w-full text-left p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/60 hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[44px] group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-[var(--text)] group-hover:text-[var(--color-primary)]">
                          {sample.title}
                        </span>
                        <span className="text-xs font-mono text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          Use sample &rarr;
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {sample.text.slice(0, 140)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2) What you will get card */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xs space-y-3 transition-colors">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] pb-2">
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

              {/* 3) Privacy notice reminder */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-xs text-[var(--text-muted)] space-y-2 text-left">
                <div className="flex items-center gap-2 text-[var(--text)] font-semibold">
                  <LockIcon className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <span>Privacy reminder</span>
                </div>
                <p className="leading-relaxed">
                  Pasted text stays in your browser memory and is sent only to the Gemini API for analysis. It is never logged to disks, saved to databases, or stored across sessions.
                </p>
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
                  Editing offer text
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingOffer(false)}
                  className="text-xs text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded px-2 py-1 font-medium min-h-[36px]"
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
                {/* 1) Left Rail (~400px, desktop only >= 1280px, sticky): 'Your offer' document viewer */}
                <aside
                  aria-label="Your offer document viewer"
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
                  {/* Expandable 'Your offer' panel for screens < 1280px (medium and mobile) */}
                  <div className="xl:hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    <button
                      type="button"
                      onClick={() => setMobileOfferExpanded(!mobileOfferExpanded)}
                      className="w-full flex items-center justify-between text-left text-xs font-semibold text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[44px]"
                      aria-expanded={mobileOfferExpanded}
                    >
                      <span>
                        Your offer text ({analyzedSnapshotText.length.toLocaleString()} characters)
                      </span>
                      <span className="text-[var(--color-primary)] font-mono text-xs">
                        {mobileOfferExpanded ? "Collapse ▲" : "View offer ▼"}
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
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[36px] inline-flex items-center"
            >
              Home
            </Link>
            <Link
              href="/resources"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[36px] inline-flex items-center"
            >
              Official resources
            </Link>
            <a
              href="#about-this-tool"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 min-h-[36px] inline-flex items-center"
            >
              About this tool
            </a>
          </div>
        </Container>
      </footer>
    </div>
  );
}
