import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * OfferClara official logo component.
 * Features an authoritative primary blue rounded square, folded document,
 * light blue text line, and evidence yellow highlight bar with dark text.
 * Scalable and legible down to 16px.
 */
export function Logo({
  size = 48,
  className = "",
  "aria-hidden": ariaHidden = true,
  ...props
}: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      className={className}
      {...props}
    >
      {/* Primary blue rounded container */}
      <rect x="0" y="0" width="48" height="48" rx="11" fill="#1D5FA8" />

      {/* White page body with folded corner */}
      <path
        d="M15 10h14l8 8v20a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z"
        fill="#FFFFFF"
      />

      {/* Page fold */}
      <path d="M29 10l8 8h-6a2 2 0 0 1-2-2z" fill="#CFD8E3" />

      {/* Short light-blue text line */}
      <rect x="17" y="22" width="14" height="2.4" rx="1.2" fill="#9DBDE3" />

      {/* Yellow highlight bar */}
      <rect x="16" y="27.5" width="17" height="6" rx="1.5" fill="#FFE27A" />

      {/* Dark text line over yellow highlight */}
      <rect x="17.5" y="29.4" width="13" height="2.4" rx="1.2" fill="#14202E" />
    </svg>
  );
}

export default Logo;
