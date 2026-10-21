import React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Shared layout container that provides a full-width responsive canvas:
 * width: min(100% - 2 * gutter, 2000px) where gutter = clamp(16px, 2.5vw, 48px).
 *
 * Horizontally centered via mx-auto. Replaces legacy rigid 1152px / max-w-6xl wrappers.
 */
export function Container({
  children,
  className = "",
  as: Component = "div",
  style,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto ${className}`}
      style={{
        width: "min(100% - 2 * clamp(16px, 2.5vw, 48px), 2000px)",
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
