"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ensures window scrolls to top on client-side route transitions,
 * while respecting prefers-reduced-motion.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}
