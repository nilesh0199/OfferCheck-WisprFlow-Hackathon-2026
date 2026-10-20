import { ConcernCategory } from "./schema";

export const CONCERN_CATEGORY_PRIORITY_ORDER: readonly ConcernCategory[] = [
  "upfront_payment",
  "refundable_deposit",
  "payment_urgency",
  "sensitive_information_request",
  "off_platform_communication",
  "other",
];

const PRIORITY_MAP: Record<ConcernCategory, number> = {
  upfront_payment: 1,
  refundable_deposit: 2,
  payment_urgency: 3,
  sensitive_information_request: 4,
  off_platform_communication: 5,
  other: 6,
};

/**
 * Pure stable sort function that orders concerns by category priority:
 * 1. upfront_payment
 * 2. refundable_deposit
 * 3. payment_urgency
 * 4. sensitive_information_request
 * 5. off_platform_communication
 * 6. other
 *
 * Preserves the original model order for items within the same category.
 */
export function sortConcernsByPriority<T extends { category: ConcernCategory }>(
  concerns: readonly T[]
): T[] {
  return concerns
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const priorityA = PRIORITY_MAP[a.item.category] ?? 99;
      const priorityB = PRIORITY_MAP[b.item.category] ?? 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.originalIndex - b.originalIndex;
    })
    .map(({ item }) => item);
}
