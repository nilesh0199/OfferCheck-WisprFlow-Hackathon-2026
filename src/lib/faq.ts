/**
 * Pure function to split items into two independent columns.
 * The first ceil(n/2) items go into the left column, and the rest into the right column.
 */
export function splitIntoColumns<T>(items: readonly T[]): [T[], T[]] {
  const midpoint = Math.ceil(items.length / 2);
  const left = items.slice(0, midpoint);
  const right = items.slice(midpoint);
  return [left, right];
}
