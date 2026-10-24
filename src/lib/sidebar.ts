/**
 * Sidebar item height calculator for a zero-scroll 100dvh drawer.
 *
 * Arithmetic:
 * - Total available vertical space: availableHeightPx (from window.innerHeight or 100dvh).
 * - Fixed chrome:
 *   - Header (Logo, title, tagline, close button): ~64px (in compact < 560px: ~48px without tagline).
 *   - Footer (Theme toggle control): ~56px (in compact: ~48px).
 *   - Vertical padding and item gaps: ~16px.
 * - Available budget for items = availableHeightPx - chromePx.
 * - Raw height per item in px = budget / itemCount.
 * - Rem conversion (1rem = 16px):
 *   - At >= 720px tall: 2.75rem (~44px, full touch target).
 *   - From 560px to 720px tall: linearly interpolated between 2.25rem (36px) and 2.75rem (44px).
 *   - Below 560px tall: compact size of 2.25rem (tagline and divider hidden to fit all items).
 */
export function itemHeightRem(availableHeightPx: number, itemCount: number): number {
  if (itemCount <= 0) return 2.75;
  if (availableHeightPx <= 0) return 2.25;

  // Below 560px, compact mode is active (tagline and divider are hidden)
  if (availableHeightPx < 560) {
    return 2.25;
  }

  // At or above 720px, standard comfortable 2.75rem target
  if (availableHeightPx >= 720) {
    return 2.75;
  }

  // Between 560px and 720px, interpolate smoothly from 2.25 to 2.75rem
  const ratio = (availableHeightPx - 560) / (720 - 560);
  const interpolated = 2.25 + ratio * (2.75 - 2.25);
  return Math.round(interpolated * 100) / 100;
}
