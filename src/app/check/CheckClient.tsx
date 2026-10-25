"use client";

import { useState, useMemo, useEffect } from "react";
import { Container } from "@/components/Container";
import { WizardContainer } from "@/components/wizard/WizardContainer";
import { AnalysisResults } from "@/components/AnalysisResults";
import { OutdatedBanner } from "@/components/OutdatedBanner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { AboutTool } from "@/components/AboutTool";
import { YourOfferWorkspace } from "@/components/YourOfferWorkspace";
import { ResultsNav, ResultsNavItem } from "@/components/ResultsNav";
import { ResultsActionsBar } from "@/components/ResultsActionsBar";
import { ClearReviewDialog } from "@/components/ClearReviewDialog";
import { SpinnerIcon } from "@/components/Icons";
import { useOfferSession } from "@/components/SessionProvider";
import { FULL_WIZARD_SAMPLES } from "@/data/wizard-samples";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import Link from "next/link";

export function CheckClient() {
  const {
    analyzedSnapshotText,
    analysis,
    isLoading,
    elapsedSeconds,
    errorState,
    isResultOutdated,
    source,
    conversation,
    handleAnalyze,
    handleCancel,
    handleClear,
    loadWizardSample,
    setOfferText,
    setStep,
  } = useOfferSession();

  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [activeConcernId, setActiveConcernId] = useState<string | null>(null);
  const [mobileOfferExpanded, setMobileOfferExpanded] = useState(false);

  // Auto-load sample if ?sample= query parameter is present in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sampleId = params.get("sample");
      if (sampleId) {
        const full = FULL_WIZARD_SAMPLES.find(
          (s) =>
            s.id === sampleId ||
            (sampleId === "full-sample-a" && s.id === "full-sample-course-as-internship") ||
            (sampleId === "full-sample-b" && s.id === "full-sample-phone-call-account")
        );
        if (full) {
          loadWizardSample(full);
          setStep(5);
        } else {
          const single = SYNTHETIC_EXAMPLES.find((s) => s.id === sampleId);
          if (single) {
            setOfferText(single.text);
            setStep(5);
          }
        }
      }
    }
  }, [loadWizardSample, setStep, setOfferText]);

  // Compute sections dynamically for ResultsNav (left rail)
  const resultsNavItems = useMemo<ResultsNavItem[]>(() => {
    if (!analysis) return [];
    return [
      { id: "section-summary", label: "Overview" },
      { id: "section-observations", label: "Observations", badge: analysis.concerns.length },
      { id: "section-missing", label: "Missing details", badge: analysis.missingInfo.length },
      { id: "section-questions", label: "Questions & checks", badge: analysis.verificationQuestions.length },
      { id: "section-research", label: "Company research" },
      { id: "section-advisories", label: "Resources", badge: 3 },
      { id: "section-your-text", label: "Your text" },
    ];
  }, [analysis]);

  const isPostReviewWorkspace = !isLoading && !!analysis && !isEditingOffer;

  const handleRailWheel = (e: React.WheelEvent) => {
    const middle = document.getElementById("review-results-scroll-container");
    if (middle) {
      middle.scrollTop += e.deltaY;
    }
  };

  // Lock window scroll on desktop post-review workspace so only the center column moves
  useEffect(() => {
    if (!isPostReviewWorkspace || typeof window === "undefined") return;

    const checkAndLock = () => {
      if (window.innerWidth >= 1024) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    checkAndLock();
    window.addEventListener("resize", checkAndLock);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", checkAndLock);
    };
  }, [isPostReviewWorkspace]);

  return (
    <div
      className={`bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between transition-colors ${
        isPostReviewWorkspace
          ? "lg:h-[calc(100dvh-4rem)] lg:max-h-[calc(100dvh-4rem)] lg:overflow-hidden min-h-screen lg:min-h-0"
          : "min-h-screen"
      }`}
    >
      <ClearReviewDialog
        analysis={analysis}
        onClearSession={() => {
          setIsEditingOffer(false);
          handleClear();
        }}
      />

      {/* Page Title & Intro (shown before analysis or during editing) */}
      {!isPostReviewWorkspace && (
        <header className="w-full">
          <Container className="py-4 sm:py-6 text-left space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
              Check an offer
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
              Paste an offer letter, describe a call, or attach screenshots. OfferClara highlights requested fees, urgent deadlines and missing details, with direct quotes from your text.
            </p>
          </Container>
        </header>
      )}

      {isPostReviewWorkspace ? (
        /* ========================================================
            POST-REVIEW WORKSPACE: Locked Left & Right Rails, Middle Scroll Only
           ======================================================== */
        <div className="flex-1 lg:h-[calc(100dvh-4rem)] lg:max-h-[calc(100dvh-4rem)] lg:overflow-hidden flex flex-col">
          <Container as="main" className="h-full flex flex-col py-1.5 sm:py-2 flex-1 lg:overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_320px] xl:grid-cols-[240px_1fr_360px] gap-4 xl:gap-6 items-start h-full lg:overflow-hidden">
              {/* 1) Left Rail: Locked navigation sidebar */}
              <aside
                aria-label="Review on-page navigation"
                onWheel={handleRailWheel}
                className="hidden lg:flex lg:flex-col lg:w-[220px] xl:w-[240px] lg:shrink-0 lg:h-full lg:overflow-y-auto custom-scrollbar py-1 space-y-4"
              >
                <ResultsNav
                  items={resultsNavItems}
                  scrollContainerId="review-results-scroll-container"
                />
              </aside>

              {/* 2) Centre Fluid Column: Review results (the ONLY part that scrolls) */}
              <section
                id="review-results-scroll-container"
                aria-label="Review findings and observations"
                className="min-w-0 space-y-6 max-w-3xl w-full mx-auto lg:h-full lg:overflow-y-auto custom-scrollbar lg:px-3 xl:px-4 py-1 pb-24"
              >
                <div className="border-b border-[var(--border)] pb-2.5">
                  <h1 className="text-xl sm:text-2xl font-serif tracking-[-0.015em] text-[var(--text)] leading-tight">
                    Check an offer
                  </h1>
                </div>

                {isResultOutdated && <OutdatedBanner />}

                {/* Results Action Bar (Save as PDF, Copy summary, Share, Start new review) */}
                <ResultsActionsBar
                  analysis={analysis}
                  analyzedSnapshotText={analyzedSnapshotText}
                  sourceNote={source.note}
                  conversationText={conversation.text}
                  onClearSession={() => {
                    setIsEditingOffer(false);
                    handleClear();
                  }}
                />

                {/* Expandable 'Your text' panel for screens < 1024px (lg) */}
                <div className="lg:hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
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

                {/* About this tool details component */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <AboutTool />
                </div>

                {/* Footer links within desktop scroll container */}
                <div className="pt-6 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-3">
                  <p>Reviews pasted text only. Cannot confirm that a sender is genuine.</p>
                  <p>Built for the No Hands: Wispr Challenge.</p>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
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
                </div>
              </section>

              {/* 3) Right Rail: Locked 'Your text' document viewer */}
              <aside
                aria-label="Your text document viewer"
                onWheel={handleRailWheel}
                className="hidden lg:flex lg:flex-col lg:w-[320px] xl:w-[360px] lg:shrink-0 lg:h-full lg:overflow-y-auto custom-scrollbar py-1 space-y-4"
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
            </div>
          </Container>
        </div>
      ) : (
        /* Regular Layout for Wizard, Loading, Editing, Errors */
        <Container as="main" className="py-4 sm:py-6 pb-24 sm:pb-8 space-y-8 flex-1">
          {/* ========================================================
              PRE-REVIEW STATE (Initial Visit / Before Analysis)
             ======================================================== */}
          {!isLoading && !analysis && !errorState && (
            <WizardContainer
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              elapsedSeconds={elapsedSeconds}
            />
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
              EDITING OFFER STATE
             ======================================================== */}
          {!isLoading && analysis && isEditingOffer && (
            <div className="space-y-6">
              {isResultOutdated && <OutdatedBanner />}

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

              <div className="max-w-4xl mx-auto">
                <WizardContainer
                  onAnalyze={async () => {
                    setIsEditingOffer(false);
                    await handleAnalyze();
                  }}
                  isLoading={isLoading}
                  elapsedSeconds={elapsedSeconds}
                />
              </div>
            </div>
          )}

          {/* About this tool details component */}
          <div className="pt-4 border-t border-[var(--border)]">
            <AboutTool />
          </div>
        </Container>
      )}

      {/* Footer (hidden on desktop in post-review mode since it's inside the scroll container) */}
      <footer className={`w-full border-t border-[var(--border)] bg-[var(--surface)] py-6 mt-12 transition-colors print:hidden ${isPostReviewWorkspace ? "lg:hidden" : ""}`}>
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
