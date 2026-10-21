"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Container } from "@/components/Container";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import { SCENE_STEPS, SCENE_CLOSING_LINE, getSceneState } from "@/lib/landing/scene";
import { MagnifyingLens } from "./MagnifyingLens";

export function ScrollSceneSection() {
  const exampleText = SYNTHETIC_EXAMPLES[0].text;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const letterRef = useRef<HTMLDivElement | null>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [lensT, setLensT] = useState<number>(0);
  const [isDesktopMotion, setIsDesktopMotion] = useState<boolean>(false);

  // Check capabilities: min-width: 1024px, min-height: 640px, and motion allowed
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(min-width: 1024px)");
    const heightQuery = window.matchMedia("(min-height: 640px)");

    const updateCapabilities = () => {
      const allowed =
        !motionQuery.matches && widthQuery.matches && heightQuery.matches;
      setIsDesktopMotion(allowed);
    };

    updateCapabilities();
    motionQuery.addEventListener("change", updateCapabilities);
    widthQuery.addEventListener("change", updateCapabilities);
    heightQuery.addEventListener("change", updateCapabilities);

    return () => {
      motionQuery.removeEventListener("change", updateCapabilities);
      widthQuery.removeEventListener("change", updateCapabilities);
      heightQuery.removeEventListener("change", updateCapabilities);
    };
  }, []);

  // Native rAF-throttled scroll handler active only when section is near viewport
  useEffect(() => {
    if (!isDesktopMotion) return;

    let isNearViewport = false;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!isNearViewport || !containerRef.current) return;

      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const containerHeight = containerRef.current.offsetHeight;
        const windowHeight = window.innerHeight;

        // How much has the container scrolled through the viewport
        const scrollDist = -rect.top;
        const maxScroll = containerHeight - windowHeight;

        if (maxScroll <= 0) return;

        const progress = Math.max(0, Math.min(1, scrollDist / maxScroll));
        const state = getSceneState(progress, SCENE_STEPS.length);

        setActiveStep(state.activeStep);
        setLensT(state.lensT);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isNearViewport = entry?.isIntersecting ?? false;
        if (isNearViewport) {
          handleScroll();
        }
      },
      { rootMargin: "250px 0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isDesktopMotion]);

  // Slices Example 1 text for the compact letter view in the desktop stage
  const renderCompactLetter = useCallback(() => {
    const s1 = SCENE_STEPS[0].phrase;
    const s2 = SCENE_STEPS[1].phrase;
    const s3 = SCENE_STEPS[2].phrase;

    const idx1 = exampleText.indexOf(s1);
    const idx2 = exampleText.indexOf(s2);
    const idx3 = exampleText.indexOf(s3);

    if (idx1 === -1 || idx2 === -1 || idx3 === -1) {
      return <span>{exampleText}</span>;
    }

    const part0 = exampleText.slice(0, idx1);
    const part1 = exampleText.slice(idx1, idx1 + s1.length);
    const part2 = exampleText.slice(idx1 + s1.length, idx2);
    const part3 = exampleText.slice(idx2, idx2 + s2.length);
    const part4 = exampleText.slice(idx2 + s2.length, idx3);
    const part5 = exampleText.slice(idx3, idx3 + s3.length);
    const part6 = exampleText.slice(idx3 + s3.length);

    return (
      <div className="font-mono text-2xs leading-relaxed text-[var(--text)] whitespace-pre-wrap select-text">
        <span>{part0}</span>
        <span
          className={`transition-all duration-200 px-0.5 rounded-xs ${
            activeStep === 0
              ? "bg-[var(--accent-highlighter)] text-[#17150F] font-semibold ring-1 ring-[#17150F]/20"
              : "bg-[var(--accent-highlighter)]/20 text-[var(--text)]"
          }`}
        >
          {part1}
        </span>
        <span>{part2}</span>
        <span
          className={`transition-all duration-200 px-0.5 rounded-xs ${
            activeStep === 1
              ? "bg-[var(--accent-highlighter)] text-[#17150F] font-semibold ring-1 ring-[#17150F]/20"
              : "bg-[var(--accent-highlighter)]/20 text-[var(--text)]"
          }`}
        >
          {part3}
        </span>
        <span>{part4}</span>
        <span
          className={`transition-all duration-200 px-0.5 rounded-xs ${
            activeStep === 2
              ? "bg-[var(--accent-highlighter)] text-[#17150F] font-semibold ring-1 ring-[#17150F]/20"
              : "bg-[var(--accent-highlighter)]/20 text-[var(--text)]"
          }`}
        >
          {part5}
        </span>
        <span>{part6}</span>
      </div>
    );
  }, [activeStep, exampleText]);

  // Position lens vertically along the left letter card according to activeStep / lensT
  const lensYPercent = 25 + lensT * 55;

  return (
    <section
      id="line-by-line"
      aria-label="A second look, line by line"
      ref={containerRef}
      className="relative w-full border-t border-[var(--border)] transition-colors"
      style={{
        minHeight: isDesktopMotion ? "260vh" : "auto",
      }}
    >
      {/* ========================================================
          DESKTOP STICKY STAGE (min-width >= 1024px & min-height >= 640px)
         ======================================================== */}
      {isDesktopMotion ? (
        <div className="sticky top-16 z-10 w-full flex flex-col justify-center py-6 min-h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden">
          <Container className="space-y-6">
            {/* Header */}
            <div className="max-w-2xl space-y-2">
              <span className="font-mono text-2xs uppercase tracking-wider text-[var(--primary-ledger)] font-semibold">
                Line-by-Line Inspection
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
                A second look, line by line
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                OfferCheck reviews the specific phrasing in an offer to isolate patterns that warrant independent confirmation.
              </p>
            </div>

            {/* Two-Column Interactive Stage */}
            <div className="grid grid-cols-12 gap-8 items-center">
              {/* Left Column: Synthetic Letter with Moving Magnifying Lens */}
              <div className="col-span-6 relative">
                <div
                  ref={letterRef}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs paper-pattern relative overflow-hidden max-h-[460px] overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)] text-xs">
                    <span className="font-mono text-2xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      Sample Letter Excerpt
                    </span>
                    <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-[var(--tint-attention-bg)] text-[var(--tint-attention-text)] border border-[var(--tint-attention-border)]">
                      Synthetic example, not a real offer
                    </span>
                  </div>

                  {renderCompactLetter()}

                  {/* Lens overlay tracking active phrase */}
                  <div
                    aria-hidden="true"
                    className="absolute right-4 pointer-events-none transition-all duration-300 ease-out z-20"
                    style={{
                      top: `${lensYPercent}%`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    <MagnifyingLens />
                  </div>
                </div>
              </div>

              {/* Right Column: Step Cards & Progress Indicators */}
              <div className="col-span-6 space-y-4">
                <ol className="space-y-3.5 list-none p-0 m-0">
                  {SCENE_STEPS.map((step, idx) => {
                    const isActive = activeStep === idx;

                    return (
                      <li
                        key={step.id}
                        className={`rounded-xl border p-4 transition-all duration-200 ${
                          isActive
                            ? "border-[var(--tint-attention-border)] bg-[var(--surface)] shadow-sm opacity-100 ring-1 ring-[var(--tint-attention-border)]"
                            : "border-[var(--border)] bg-[var(--surface-muted)]/40 opacity-55"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-[var(--border)]/60 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex items-center justify-center w-5 h-5 rounded-full font-mono text-2xs font-bold ${
                                isActive
                                  ? "bg-[var(--accent-highlighter)] text-[#17150F]"
                                  : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]"
                              }`}
                            >
                              {step.stepNumber}
                            </span>
                            <span className="font-sans font-bold text-xs text-[var(--text)]">
                              {step.title}
                            </span>
                          </div>
                          <span className="font-mono text-2xs uppercase text-[var(--text-muted)] font-medium">
                            {step.label}
                          </span>
                        </div>

                        <p className="text-2xs sm:text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                          {step.note}
                        </p>
                      </li>
                    );
                  })}
                </ol>

                {/* Progress Indicator Track */}
                <div className="flex items-center gap-2 pt-1 text-2xs font-mono text-[var(--text-muted)]">
                  <span>Step {activeStep + 1} of {SCENE_STEPS.length}</span>
                  <div className="flex items-center gap-1.5 ml-2">
                    {SCENE_STEPS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          activeStep === idx
                            ? "w-6 bg-[var(--primary-ledger)]"
                            : "w-2 bg-[var(--border)]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Closing Line */}
            <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)] max-w-3xl leading-relaxed">
              {SCENE_CLOSING_LINE}
            </p>
          </Container>
        </div>
      ) : (
        /* ========================================================
            MOBILE / SHORT VIEWPORT / REDUCED MOTION: STACKED CARDS
           ======================================================== */
        <div className="py-16 sm:py-24">
          <Container className="space-y-10">
            <div className="max-w-2xl space-y-3">
              <span className="font-mono text-2xs uppercase tracking-wider text-[var(--primary-ledger)] font-semibold">
                Line-by-Line Inspection
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif tracking-[-0.015em] text-[var(--text)] leading-[1.08]">
                A second look, line by line
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                OfferCheck reviews specific phrasing in an offer to isolate patterns that warrant independent confirmation.
              </p>
            </div>

            {/* Stacked Cards in Normal Document Flow */}
            <ol className="space-y-6 list-none p-0 m-0 max-w-3xl">
              {SCENE_STEPS.map((step) => (
                <li
                  key={step.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-3 paper-pattern"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent-highlighter)] text-[#17150F] font-mono text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <h3 className="font-sans font-bold text-sm sm:text-base text-[var(--text)]">
                        {step.title}
                      </h3>
                    </div>
                    <span className="font-mono text-2xs uppercase text-[var(--text-muted)] font-medium">
                      {step.label}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--surface-muted)]/60 border border-[var(--border)]/60 font-mono text-xs leading-relaxed text-[var(--text)]">
                    <span className="text-[var(--text-muted)] text-2xs block mb-1">
                      Target phrase from synthetic Example 1:
                    </span>
                    <span className="bg-[var(--accent-highlighter)] text-[#17150F] px-1 py-0.5 rounded font-semibold inline">
                      &quot;{step.phrase}&quot;
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-sans">
                    {step.note}
                  </p>
                </li>
              ))}
            </ol>

            {/* Closing Line */}
            <p className="text-xs sm:text-sm text-[var(--text-muted)] pt-4 border-t border-[var(--border)] max-w-3xl leading-relaxed">
              {SCENE_CLOSING_LINE}
            </p>
          </Container>
        </div>
      )}
    </section>
  );
}
