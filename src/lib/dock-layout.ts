/**
 * Pure dock layout calculations for OfferClara.
 *
 * Defines the --dock-offset CSS custom property value used to prevent the docked
 * command bar from overlapping hero elements, action bars, or page content.
 */

export const DOCK_BAR_DEFAULT_HEIGHT_PX = 56;
export const DOCK_BAR_GAP_PX = 16;

/**
 * Computes the dock offset in pixels.
 * When the command bar is rendered, the offset is barHeight + 16px.
 * When the command bar is hidden or not rendered, the offset is 0px.
 */
export function computeDockOffset(isRendered: boolean, barHeight: number = DOCK_BAR_DEFAULT_HEIGHT_PX): number {
  if (!isRendered || barHeight <= 0) {
    return 0;
  }
  return Math.round(barHeight + DOCK_BAR_GAP_PX);
}

/**
 * Formats the dock offset into a CSS pixel string.
 */
export function formatDockOffset(offsetPx: number): string {
  return `${offsetPx}px`;
}
