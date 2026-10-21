import React from "react";

interface MagnifyingLensProps {
  className?: string;
}

/**
 * Editorial inline SVG magnifying lens graphic.
 * Meets docs/design-system.md rules:
 * - Paper-white rim
 * - Ink handle
 * - Soft shadow
 * - Pure SVG, aria-hidden, no neon / gradient blobs
 */
export function MagnifyingLens({ className = "" }: MagnifyingLensProps) {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 pointer-events-none ${className}`}
      style={{
        filter: "drop-shadow(0 6px 8px rgba(23, 21, 15, 0.18))",
      }}
    >
      {/* Handle - Ink color, angled diagonally */}
      <path
        d="M31 31L45 45"
        stroke="var(--text)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Handle ferrule/collar */}
      <path
        d="M29.5 29.5L33.5 33.5"
        stroke="var(--border)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Lens Glass Fill - Subtle highlighter tint */}
      <circle
        cx="21"
        cy="21"
        r="14"
        fill="var(--accent-highlighter)"
        fillOpacity="0.12"
      />

      {/* Lens Inner Glass Reflection Accent */}
      <path
        d="M13 17C14.5 13 18 10.5 22 10.5"
        stroke="var(--surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Main Rim - Paper-white with Graphite outline */}
      <circle
        cx="21"
        cy="21"
        r="14"
        stroke="var(--surface)"
        strokeWidth="3.5"
      />
      <circle
        cx="21"
        cy="21"
        r="15.75"
        stroke="var(--border)"
        strokeWidth="1.25"
      />
    </svg>
  );
}
