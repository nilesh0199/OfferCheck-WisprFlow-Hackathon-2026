"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Container } from "@/components/Container";
import { OfferInputForm } from "@/components/OfferInputForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { OutdatedBanner } from "@/components/OutdatedBanner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { AboutTool } from "@/components/AboutTool";
import { CompanyResearchCard } from "@/components/CompanyResearchCard";
import { YourOfferWorkspace } from "@/components/YourOfferWorkspace";
import { OnThisPageNav, PageSectionItem } from "@/components/OnThisPageNav";
import { FileTextIcon, SpinnerIcon } from "@/components/Icons";
import { useOfferSession } from "@/components/SessionProvider";
import { getResearchNudge } from "@/lib/research/nudge";
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

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between overflow-x-hidden transition-colors">
      <Header />

      <Container as="main" className="py-6 sm:py-8 space-y-8 flex-1">
        {/* Two-column workspace on screens >= 1024px; stacked below */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sticky Workspace Panel (Input or Your Offer Snapshot) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            {!isLoading && analysis && !isEditingOffer ? (
              <>
                <YourOfferWorkspace
                  text={analyzedSnapshotText}
                  concerns={analysis.concerns}
                  onEditText={() => setIsEditingOffer(true)}
                  onNewReview={() => {
                    setIsEditingOffer(false);
                    handleClear();
                  }}
                />
                <div className="hidden lg:block">
                  <OnThisPageNav sections={navSections} />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {analysis && isEditingOffer && (
                  <div className="flex items-center justify-between p-2.5 rounded border border-[var(--border)] bg-[var(--surface)] text-xs">
                    <span className="font-semibold text-[var(--text)]">Editing offer text</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingOffer(false)}
                      className="text-xs text-[var(--primary-ledger)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded px-1.5 py-0.5 font-medium"
                    >
                      Back to review snapshot
                    </button>
                  </div>
                )}
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
            )}
          </div>

          {/* Right Column: Multi-state Results Workspace */}
          <div className="lg:col-span-7 space-y-6">
            {/* State B: Loading State */}
            {isLoading && (
              <div
                role="status"
                className="rounded border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-2xs space-y-6 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                  <div className="flex items-center gap-3">
                    <SpinnerIcon className="w-5 h-5 text-[var(--accent)] animate-spin" />
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">
                        Reviewing offer ({elapsedSeconds}s)
                      </h3>
                      <p
                        className="text-xs text-[var(--text-muted)]"
                        aria-live="polite"
                      >
                        This can take up to a minute.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center rounded-xs border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-2xs hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] min-h-[36px]"
                  >
                    Cancel review
                  </button>
                </div>

                {/* Shimmer skeleton placeholders matching design system */}
                <div className="space-y-4 animate-pulse" aria-hidden="true">
                  <div className="h-20 rounded bg-[var(--surface-muted)] p-4 space-y-2 border border-[var(--border)]">
                    <div className="h-3 w-1/4 rounded bg-[var(--border)]" />
                    <div className="h-3 w-3/4 rounded bg-[var(--border)]" />
                  </div>
                  <div className="h-28 rounded bg-[var(--surface-muted)] p-4 space-y-2.5 border border-[var(--border)]">
                    <div className="h-3 w-1/3 rounded bg-[var(--border)]" />
                    <div className="h-3 w-full rounded bg-[var(--border)]" />
                    <div className="h-3 w-2/3 rounded bg-[var(--border)]" />
                  </div>
                  <div className="h-24 rounded bg-[var(--surface-muted)] p-4 space-y-2.5 border border-[var(--border)]">
                    <div className="h-3 w-1/4 rounded bg-[var(--border)]" />
                    <div className="h-3 w-5/6 rounded bg-[var(--border)]" />
                  </div>
                </div>
              </div>
            )}

            {/* State C: Error State (when not loading) */}
            {!isLoading && errorState && (
              <ErrorAlert
                errorType={errorState.type}
                customMessage={errorState.message}
                onTryAgain={handleAnalyze}
              />
            )}

            {/* State D: Results State */}
            {!isLoading && analysis && (
              <div className="space-y-4">
                {isResultOutdated && <OutdatedBanner />}
                <AnalysisResults
                  analysis={analysis}
                  analyzedSnapshotText={analyzedSnapshotText}
                />
              </div>
            )}

            {/* State A: Empty State (no results, not loading, no error) */}
            {!isLoading && !analysis && !errorState && (
              <div className="space-y-6">
                <div className="rounded border border-dashed border-[var(--border)] bg-[var(--surface)]/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[300px] transition-colors">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
                    <FileTextIcon className="w-6 h-6" size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    Paste an offer or try a sample to see a review
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed">
                    OfferCheck reviews the offer text for potential concerns, missing terms, and drafts specific verification questions.
                  </p>
                </div>

                {/* Collapsed research card available before running an analysis */}
                <CompanyResearchCard
                  offerText={offerText}
                  defaultCollapsed={true}
                />
              </div>
            )}
          </div>
        </div>

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
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1"
            >
              Home
            </Link>
            <Link
              href="/resources"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1"
            >
              Official resources
            </Link>
            <a
              href="#about-this-tool"
              className="hover:text-[var(--text)] underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1"
            >
              About this tool
            </a>
          </div>
        </Container>
      </footer>
    </div>
  );
}
