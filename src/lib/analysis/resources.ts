import { ConcernCategory } from "./schema";
import {
  VerificationResource,
  VERIFICATION_RESOURCES,
} from "@/data/verification-resources";

export interface SelectedResource {
  readonly resource: VerificationResource;
  readonly expanded?: boolean;
  readonly matchedTerm?: string;
}

const EXPANDED_CATEGORIES: ReadonlySet<ConcernCategory> = new Set([
  "upfront_payment",
  "refundable_deposit",
  "payment_urgency",
  "sensitive_information_request",
]);

const AICTE_PATTERN = /\bAICTE\b/i;
const NCS_PATTERN = /\bNCS\b|National Career Service/i;

/**
 * Pure selection function that determines which official verification resources to display.
 *
 * Rules:
 * - 'mca' is always shown.
 * - 'cybercrime' is always shown; flagged expanded=true when high-risk payment or sensitive
 *   document requests are identified in the concerns.
 * - 'aicte' is shown when the offer text references the AICTE portal (\bAICTE\b),
 *   returning the exact matched text as matchedTerm.
 * - 'ncs' is shown when the offer text references the National Career Service (\bNCS\b or 'National Career Service'),
 *   returning the exact matched text as matchedTerm.
 * - Preserves a stable order: cybercrime, aicte, ncs, mca.
 */
export function selectResources(
  categories: readonly ConcernCategory[],
  sourceText: string
): SelectedResource[] {
  const byId = new Map(VERIFICATION_RESOURCES.map((r) => [r.id, r]));
  const result: SelectedResource[] = [];

  // 1. cybercrime: always included, expanded on payment or sensitive document categories
  const cyberResource = byId.get("cybercrime");
  if (cyberResource) {
    const isExpanded = categories.some((c) => EXPANDED_CATEGORIES.has(c));
    result.push({
      resource: cyberResource,
      expanded: isExpanded,
    });
  }

  // 2. aicte: included if sourceText explicitly matches \bAICTE\b (case-insensitive)
  if (sourceText) {
    const aicteMatch = sourceText.match(AICTE_PATTERN);
    if (aicteMatch) {
      const aicteResource = byId.get("aicte");
      if (aicteResource) {
        result.push({
          resource: aicteResource,
          matchedTerm: aicteMatch[0],
        });
      }
    }
  }

  // 3. ncs: included if sourceText matches \bNCS\b or 'National Career Service'
  if (sourceText) {
    const ncsMatch = sourceText.match(NCS_PATTERN);
    if (ncsMatch) {
      const ncsResource = byId.get("ncs");
      if (ncsResource) {
        result.push({
          resource: ncsResource,
          matchedTerm: ncsMatch[0],
        });
      }
    }
  }

  // 4. mca: always included
  const mcaResource = byId.get("mca");
  if (mcaResource) {
    result.push({ resource: mcaResource });
  }

  return result;
}
