import { ConcernCategory } from "@/lib/analysis/schema";

export interface SelfCheckItem {
  readonly id: string;
  readonly text: string;
  readonly appliesTo: readonly ConcernCategory[] | "always";
}

export const SELF_CHECKS: readonly SelfCheckItem[] = [
  {
    id: "official_website",
    text: "Find the organisation's official website yourself, without using links from the message, and look for its careers or contact page.",
    appliesTo: "always",
  },
  {
    id: "independent_contact",
    text: "Contact the organisation using details you found independently, not contact details that appear only in the message, and ask them to confirm the offer.",
    appliesTo: ["off_platform_communication"],
  },
  {
    id: "domain_comparison",
    text: "Compare the sender's email domain with the organisation's official domain; a mismatch or a free personal email address is a reason to ask more questions, not proof of anything.",
    appliesTo: ["off_platform_communication"],
  },
  {
    id: "pause_before_paying",
    text: "Pause before paying anything and confirm independently first.",
    appliesTo: ["upfront_payment", "refundable_deposit", "payment_urgency"],
  },
  {
    id: "pause_before_sharing_docs",
    text: "Share identity or bank documents only after you have confirmed the offer independently.",
    appliesTo: ["sensitive_information_request"],
  },
  {
    id: "search_reviews",
    text: "Search the exact organisation name with words like 'internship scam' or 'complaint' and read the results critically.",
    appliesTo: "always",
  },
];

/**
 * Pure function that orders self-checks by contextual relevance to the offer's identified concerns:
 * - Payment categories (upfront_payment, refundable_deposit, payment_urgency) -> check 4 first.
 * - sensitive_information_request -> check 5 first.
 * - off_platform_communication -> checks 2 and 3 first.
 * - Remaining checks stay in default order without duplicates.
 */
export function selectSelfChecks(
  categories: readonly ConcernCategory[]
): SelfCheckItem[] {
  const byId = new Map(SELF_CHECKS.map((item) => [item.id, item]));

  const hasPayment = categories.some((c) =>
    ["upfront_payment", "refundable_deposit", "payment_urgency"].includes(c)
  );
  const hasSensitive = categories.includes("sensitive_information_request");
  const hasOffPlatform = categories.includes("off_platform_communication");

  const prioritizedIds: string[] = [];

  if (hasPayment) {
    prioritizedIds.push("pause_before_paying"); // Check 4
  }
  if (hasSensitive) {
    prioritizedIds.push("pause_before_sharing_docs"); // Check 5
  }
  if (hasOffPlatform) {
    prioritizedIds.push("independent_contact"); // Check 2
    prioritizedIds.push("domain_comparison"); // Check 3
  }

  const seen = new Set(prioritizedIds);
  const finalIds = [...prioritizedIds];

  for (const item of SELF_CHECKS) {
    if (!seen.has(item.id)) {
      finalIds.push(item.id);
      seen.add(item.id);
    }
  }

  return finalIds.map((id) => byId.get(id)!);
}
