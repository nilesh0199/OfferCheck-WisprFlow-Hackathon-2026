"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import {
  findLandingAnnotations,
  buildLandingDocumentSegments,
  LandingAnnotation,
} from "@/lib/landing-annotations";
import {
  computeLensPath,
  computeEntranceState,
  LensPath,
  TargetRect,
} from "@/lib/landing/entrance";
import { MagnifyingLens } from "./MagnifyingLens";
import { InfoCircleIcon } from "@/components/Icons";

export function HeroInteractiveDocument() {
  const exampleText = SYNTHETIC_EXAMPLES[0].text;

  // Pure annotation parsing and segmentation
  const annotations = useMemo(() => findLandingAnnotations(exampleText), [exampleText]);
  const segments = useMemo(
    () => buildLandingDocumentSegments(exampleText, annotations),
    [exampleText, annotations]
  );

  // Animation and interaction state
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string>(
    annotations[0]?.id ?? ""
  );
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState<boolean>(false);

  // Debug motion logging (development only, logs once)
  const hasLoggedMotionPathRef = useRef<boolean>(false);
  const logMotionPath = useCallback(
    (path: "entrance: playing" | "entrance: reduced-motion (finished state)" | "entrance: failsafe") => {
      if (process.env.NODE_ENV !== "production" && !hasLoggedMotionPathRef.current) {
        hasLoggedMotionPathRef.current = true;
        console.log(path);
      }
    },
    []
  );

  // Refs for animation loop and measurement
  const cardRef = useRef<HTMLDivElement | null>(null);
  const lensContainerRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<LensPath | null>(null);
  const animRafRef = useRef<number | null>(null);
  const isReducedMotionRef = useRef<boolean>(false);
  const isAnimatingRef = useRef<boolean>(true);

  // Tilt & Parallax via requestAnimationFrame
  const tiltRafRef = useRef<number | null>(null);

  const activeAnnotation = useMemo(
    () => annotations.find((a) => a.id === activeAnnotationId) || annotations[0],
    [annotations, activeAnnotationId]
  );

  // Complete animation instantly to end state
  const completeAnimation = useCallback(
    (markPlayed: boolean = false) => {
      if (animRafRef.current) {
        cancelAnimationFrame(animRafRef.current);
        animRafRef.current = null;
      }
      const wasAnimating = isAnimatingRef.current;
      isAnimatingRef.current = false;
      setIsAnimating(false);
      setRevealedCount(annotations.length);
      if (wasAnimating || markPlayed) {
        setHasPlayedOnce(true);
      }
      if (lensContainerRef.current) {
        lensContainerRef.current.style.opacity = "0";
        lensContainerRef.current.style.display = "none";
      }
    },
    [annotations.length]
  );

  // Measure targets and construct path
  const measurePath = useCallback(() => {
    if (!cardRef.current) return null;
    try {
      const cardRect = cardRef.current.getBoundingClientRect();
      const rects: TargetRect[] = [];

      for (const ann of annotations) {
        const el = cardRef.current.querySelector(`#ann-trigger-${ann.id}`);
        if (el) {
          const r = el.getBoundingClientRect();
          rects.push({
            x: r.left - cardRect.left,
            y: r.top - cardRect.top,
            width: r.width,
            height: r.height,
          });
        }
      }

      const path = computeLensPath(rects, {
        width: cardRect.width,
        height: cardRect.height,
      });
      pathRef.current = path;
      return path;
    } catch {
      logMotionPath("entrance: failsafe");
      completeAnimation(true);
      return null;
    }
  }, [annotations, completeAnimation, logMotionPath]);

  // Run the entrance animation loop
  const startEntranceAnimation = useCallback(
    (userInitiated: boolean = false) => {
      if (isReducedMotionRef.current && !userInitiated) {
        completeAnimation(false);
        logMotionPath("entrance: reduced-motion (finished state)");
        return;
      }

      const path = measurePath();
      if (!path || path.waypoints.length === 0) {
        completeAnimation(true);
        logMotionPath("entrance: failsafe");
        return;
      }

      logMotionPath("entrance: playing");

      setIsAnimating(true);
      isAnimatingRef.current = true;
      setRevealedCount(0);
      setActiveAnnotationId(annotations[0]?.id ?? "");

      if (lensContainerRef.current) {
        lensContainerRef.current.style.display = "block";
        lensContainerRef.current.style.opacity = "0";
        lensContainerRef.current.style.transform = `translate3d(${path.startPoint.x}px, ${path.startPoint.y}px, 0) translate(-40%, -40%) rotate(-12deg)`;
      }

      let startTime: number | null = null;
      let lastRevealed = 0;
      let lastObsIndex = 0;

      const tick = (now: number) => {
        if (!isAnimatingRef.current) return;
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;

        const state = computeEntranceState(elapsed, path);

        // Update lens transform & opacity directly on DOM
        if (lensContainerRef.current) {
          lensContainerRef.current.style.transform = `translate3d(${state.lens.x}px, ${state.lens.y}px, 0) translate(-40%, -40%) rotate(${state.lens.rotation.toFixed(
            1
          )}deg)`;
          lensContainerRef.current.style.opacity = state.lens.opacity.toFixed(3);
        }

        // Update trail position
        if (trailRef.current) {
          trailRef.current.style.transform = `translate3d(${state.lens.x - 8}px, ${
            state.lens.y - 8
          }px, 0) scale(${Math.min(1, state.lens.opacity * 1.2)})`;
          trailRef.current.style.opacity = (state.lens.opacity * 0.4).toFixed(3);
        }

        // Update revealed count and active observation if stepped
        if (state.revealedCount !== lastRevealed) {
          lastRevealed = state.revealedCount;
          setRevealedCount(state.revealedCount);
        }

        if (state.observationIndex !== lastObsIndex && annotations[state.observationIndex]) {
          lastObsIndex = state.observationIndex;
          setActiveAnnotationId(annotations[state.observationIndex].id);
        }

        if (state.done) {
          completeAnimation(true);
        } else {
          animRafRef.current = requestAnimationFrame(tick);
        }
      };

      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      animRafRef.current = requestAnimationFrame(tick);
    },
    [annotations, completeAnimation, logMotionPath, measurePath]
  );

  // Capabilities & Skip Listeners setup
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: coarse)");

    const updateCapabilities = () => {
      const reduced = motionQuery.matches;
      isReducedMotionRef.current = reduced;
      setIsReducedMotion(reduced);
      if (reduced) {
        completeAnimation(false);
        logMotionPath("entrance: reduced-motion (finished state)");
      }
    };

    updateCapabilities();
    motionQuery.addEventListener("change", updateCapabilities);
    pointerQuery.addEventListener("change", updateCapabilities);

    // Initial measurement after fonts/render settle
    let timerId: NodeJS.Timeout | null = null;
    if (!isReducedMotionRef.current) {
      timerId = setTimeout(() => {
        startEntranceAnimation(false);
      }, 60);
    } else {
      completeAnimation(false);
      logMotionPath("entrance: reduced-motion (finished state)");
    }

    // Failsafe timer (3800 ms): if animation was supposed to play but got stuck or never finished
    const failsafeTimer = setTimeout(() => {
      if (isAnimatingRef.current) {
        logMotionPath("entrance: failsafe");
        completeAnimation(true);
      }
    }, 3800);

    // Skip on user interaction (pointerdown, keydown, scroll > 10px, or visibilitychange)
    const initialScrollY = window.scrollY;

    const handleSkipPointer = () => {
      if (isAnimatingRef.current) completeAnimation(true);
    };

    const handleSkipKey = () => {
      if (isAnimatingRef.current) completeAnimation(true);
    };

    const handleSkipScroll = () => {
      if (isAnimatingRef.current && Math.abs(window.scrollY - initialScrollY) > 10) {
        completeAnimation(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isAnimatingRef.current) {
        completeAnimation(true);
      }
    };

    // Debounced resize to re-measure path if still animating
    let resizeTimer: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isAnimatingRef.current) {
          measurePath();
        }
      }, 150);
    };

    window.addEventListener("pointerdown", handleSkipPointer, { passive: true });
    window.addEventListener("keydown", handleSkipKey, { passive: true });
    window.addEventListener("scroll", handleSkipScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerId) clearTimeout(timerId);
      if (failsafeTimer) clearTimeout(failsafeTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      motionQuery.removeEventListener("change", updateCapabilities);
      pointerQuery.removeEventListener("change", updateCapabilities);
      window.removeEventListener("pointerdown", handleSkipPointer);
      window.removeEventListener("keydown", handleSkipKey);
      window.removeEventListener("scroll", handleSkipScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    };
  }, [completeAnimation, logMotionPath, measurePath, startEntranceAnimation]);

  // Tilt & Parallax when entrance is complete or idle
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isReducedMotionRef.current || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    const rotateY = normX * 3;
    const rotateX = -normY * 3;

    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    tiltRafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(
          2
        )}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(0)`;
      }
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (isReducedMotionRef.current || !cardRef.current) return;

    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    tiltRafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      }
    });
  }, []);

  const handlePhraseSelect = (ann: LandingAnnotation) => {
    if (isAnimatingRef.current) {
      completeAnimation();
    }
    setActiveAnnotationId(ann.id);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* CSS Failsafe: reveals highlights after 4s if JS is delayed or never finishes */}
      <style>{`
        @keyframes revealFallback {
          to { opacity: 1; }
        }
        .hero-doc-highlight-fallback {
          animation: revealFallback 0.3s ease forwards;
          animation-delay: 3.8s;
        }
      `}</style>
      <noscript>
        <style>{`
          .hero-doc-highlight-span {
            background-color: var(--accent-highlighter) !important;
            color: #17150F !important;
          }
          .hero-lens-layer {
            display: none !important;
          }
        `}</style>
      </noscript>

      {/* Document Card with 3D Tilt Wrapper */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 shadow-md transition-[transform,box-shadow] duration-200 ease-out paper-pattern relative overflow-hidden"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Animated Magnifying Lens & Trail Layer */}
        <div
          ref={trailRef}
          aria-hidden="true"
          className="hero-lens-layer absolute top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-10 blur-xs transition-opacity duration-150"
          style={{
            backgroundColor: "var(--accent-highlighter)",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />

        <div
          ref={lensContainerRef}
          aria-hidden="true"
          className="hero-lens-layer absolute top-0 left-0 pointer-events-none z-20"
          style={{
            opacity: 0,
            willChange: "transform, opacity",
          }}
        >
          <MagnifyingLens />
        </div>

        {/* Document Header / Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[var(--border)] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-highlighter)] ring-2 ring-[var(--border)]" />
            <span className="font-mono text-2xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Offer Document
            </span>
          </div>

          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-[var(--tint-attention-bg)] text-[var(--tint-attention-text)] border border-[var(--tint-attention-border)]">
            Synthetic example, not a real offer
          </span>
        </div>

        {/* Document Content with Interactive Annotated Segments */}
        <div className="font-mono text-xs sm:text-[13px] leading-relaxed text-[var(--text)] whitespace-pre-wrap select-text">
          {segments.map((seg, idx) => {
            if (!seg.annotation) {
              return <span key={idx}>{seg.text}</span>;
            }

            const ann = seg.annotation;
            const annIndex = annotations.findIndex((a) => a.id === ann.id);
            const isRevealed = annIndex < revealedCount || !isAnimating;
            const isSelected = activeAnnotation?.id === ann.id;

            return (
              <button
                key={idx}
                type="button"
                id={`ann-trigger-${ann.id}`}
                aria-describedby={`ann-note-${ann.id}`}
                aria-expanded={isSelected}
                onClick={() => handlePhraseSelect(ann)}
                onMouseEnter={() => {
                  if (!isAnimating) setActiveAnnotationId(ann.id);
                }}
                onFocus={() => {
                  if (!isAnimating) setActiveAnnotationId(ann.id);
                }}
                className={`hero-doc-highlight-span inline text-left cursor-pointer rounded-xs px-0.5 -mx-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] transition-all duration-200 ${
                  isRevealed
                    ? isSelected
                      ? "bg-[var(--accent-highlighter)] text-[#17150F] shadow-xs font-semibold ring-1 ring-[#17150F]/20"
                      : "bg-[var(--accent-highlighter)]/25 text-[var(--text)] hover:bg-[var(--accent-highlighter)]/50 border-b-2 border-[var(--accent-highlighter)]"
                    : "bg-transparent text-[var(--text)] border-b-2 border-transparent"
                }`}
              >
                {seg.text}
              </button>
            );
          })}
        </div>

        {/* Margin Note Card (Slide-in Callout) */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <div className="flex items-start gap-3 rounded-xl border border-[var(--tint-attention-border)] bg-[var(--tint-attention-bg)] p-3.5 shadow-xs transition-all duration-200 min-h-[76px]">
            <div className="w-5 h-5 rounded-full bg-[var(--accent-highlighter)] text-[#17150F] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              !
            </div>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-[var(--text)] font-sans">
                  {activeAnnotation?.title}
                </h4>
                <span className="text-2xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Observation
                </span>
              </div>
              <p
                id={`ann-note-${activeAnnotation?.id}`}
                className="text-xs text-[var(--text-muted)] leading-relaxed font-sans"
              >
                {activeAnnotation?.note}
              </p>
            </div>
          </div>
        </div>

        {/* Screen Reader DOM storage for all notes to satisfy aria-describedby for every button */}
        <div className="sr-only" aria-hidden="false">
          {annotations.map((ann) => (
            <div key={ann.id} id={`ann-note-${ann.id}`}>
              {ann.title}: {ann.note}
            </div>
          ))}
        </div>

        {/* Interactive Helper Hint & Replay Button */}
        <div className="mt-3 flex items-center justify-between text-2xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <InfoCircleIcon className="w-3.5 h-3.5 opacity-70" />
            <span>Hover or tap highlighted phrases to see observations</span>
          </div>

          <button
            type="button"
            onClick={() => startEntranceAnimation(true)}
            className="text-2xs font-mono underline hover:text-[var(--text)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] rounded px-1 transition-colors"
            aria-label={
              isReducedMotion && !hasPlayedOnce
                ? "Play hero document entrance animation"
                : "Replay hero document entrance animation"
            }
          >
            {isReducedMotion && !hasPlayedOnce ? "Play animation" : "Replay animation"}
          </button>
        </div>
      </div>
    </div>
  );
}
