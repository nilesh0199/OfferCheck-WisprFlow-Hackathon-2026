import { describe, it, expect } from "vitest";
import { sortConcernsByPriority } from "@/lib/analysis/priorities";
import { ConcernCategory } from "@/lib/analysis/schema";

describe("sortConcernsByPriority", () => {
  it("sorts concerns according to specified category priority", () => {
    const input: Array<{ id: string; category: ConcernCategory }> = [
      { id: "c1", category: "other" },
      { id: "c2", category: "payment_urgency" },
      { id: "c3", category: "upfront_payment" },
      { id: "c3b", category: "paid_training_described" },
      { id: "c4", category: "off_platform_communication" },
      { id: "c5", category: "refundable_deposit" },
      { id: "c6", category: "sensitive_information_request" },
    ];

    const sorted = sortConcernsByPriority(input);
    expect(sorted.map((c) => c.category)).toEqual([
      "upfront_payment",
      "paid_training_described",
      "refundable_deposit",
      "payment_urgency",
      "sensitive_information_request",
      "off_platform_communication",
      "other",
    ]);
  });

  it("maintains stable original order for multiple concerns within the same category", () => {
    const input: Array<{ id: string; category: ConcernCategory }> = [
      { id: "pay-1", category: "upfront_payment" },
      { id: "other-1", category: "other" },
      { id: "pay-2", category: "upfront_payment" },
      { id: "other-2", category: "other" },
      { id: "pay-3", category: "upfront_payment" },
    ];

    const sorted = sortConcernsByPriority(input);
    expect(sorted.map((c) => c.id)).toEqual([
      "pay-1",
      "pay-2",
      "pay-3",
      "other-1",
      "other-2",
    ]);
  });

  it("handles empty arrays cleanly", () => {
    expect(sortConcernsByPriority([])).toEqual([]);
  });
});
