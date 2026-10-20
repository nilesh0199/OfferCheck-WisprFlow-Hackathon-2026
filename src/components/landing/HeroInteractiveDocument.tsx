"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import {
  findLandingAnnotations,
  buildLandingDocumentSegments,
} from "@/lib/landing-annotations";
import { InfoCircleIcon } from "@/components/Icons";

export function HeroInteractiveDocument() {
  const exampleText = SYNTHETIC_EXAMPLES[0].text;

  // Pure annotation parsing and segmentation
  const annotations = useMemo(() => findLandingAnnotations(exampleText), [exampleText]);
  const segments = useMemo(
    () => buildLandingDocumentSegments(exampleText, annotations),
    [exampleText, annotations]
  );

  // Active annotation state (defaults to the first for immediate visual demonstration)
  const [activeAnnotationId, setActiveAnnotationId] = useState<string>(
    annotations[0]?.id ?? ""
  );

  const activeAnnotation = useMemo(
    () => annotations.find((a) => a.id === activeAnnotationId) || annotations[0],
    [annotations, activeAnnotationId]
  );

  // Tilt & Parallax via requestAnimationFrame (no React re-renders on move)
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isReducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: coarse)");

    const updateCapabilities = () => {
      isReducedMotionRef.current = motionQuery.matches || pointerQuery.matches;
    };

    updateCapabilities();
    motionQuery.addEventListener("change", updateCapabilities);
    pointerQuery.addEventListener("change", updateCapabilities);

    return () => {
      motionQuery.removeEventListener("change", updateCapabilities);
      pointerQuery.removeEventListener("change", updateCapabilities);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isReducedMotionRef.current || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    // Maximum 3 degrees tilt
    const rotateY = normX * 3;
    const rotateX = -normY * 3;

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(
          2
        )}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(0)`;
      }
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (isReducedMotionRef.current || !cardRef.current) return;

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      }
    });
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Document Card with 3D Tilt Wrapper */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 shadow-md transition-[transform,box-shadow] duration-200 ease-out paper-pattern relative"
        style={{ transformStyle: "preserve-3d" }}
      >
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
            const isSelected = activeAnnotation?.id === ann.id;

            return (
              <button
                key={idx}
                type="button"
                id={`ann-trigger-${ann.id}`}
                aria-describedby={`ann-note-${ann.id}`}
                aria-expanded={isSelected}
                onClick={() => setActiveAnnotationId(ann.id)}
                onMouseEnter={() => setActiveAnnotationId(ann.id)}
                onFocus={() => setActiveAnnotationId(ann.id)}
                className={`inline text-left transition-colors duration-150 cursor-pointer rounded-xs px-0.5 -mx-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  isSelected
                    ? "bg-[var(--accent-highlighter)] text-[#17150F] shadow-xs font-semibold ring-1 ring-[#17150F]/20"
                    : "bg-[var(--accent-highlighter)]/25 text-[var(--text)] hover:bg-[var(--accent-highlighter)]/50 border-b-2 border-[var(--accent-highlighter)]"
                }`}
              >
                {seg.text}
              </button>
            );
          })}
        </div>

        {/* Margin Note Card (Slide-in Callout) */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <div className="flex items-start gap-3 rounded-xl border border-[var(--tint-attention-border)] bg-[var(--tint-attention-bg)] p-3.5 shadow-xs transition-all duration-200">
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

        {/* Interactive Helper Hint */}
        <div className="mt-3 flex items-center justify-between text-2xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <InfoCircleIcon className="w-3.5 h-3.5 opacity-70" />
            <span>Hover or tap highlighted phrases to see observations</span>
          </div>
          <span className="hidden sm:inline">IBM Plex Mono</span>
        </div>
      </div>
    </div>
  );
}
