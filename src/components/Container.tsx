import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Shared layout container that standardizes horizontal gutters and maximum width
 * across all top-level sections (navigation, hero, main workspace, footer).
 *
 * Gutters:
 * - Mobile: 1rem (px-4)
 * - Tablet / sm: 1.5rem (sm:px-6)
 * - Desktop / lg+: 2rem (lg:px-8)
 * Max width: 72rem / 1152px (max-w-6xl), horizontally centered (mx-auto).
 */
export function Container({
  children,
  className = "",
  as: Component = "div",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
