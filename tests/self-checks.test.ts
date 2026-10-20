import { describe, it, expect } from "vitest";
import { selectSelfChecks, SELF_CHECKS } from "@/data/self-checks";

describe("selectSelfChecks", () => {
  it("contains exactly six static self-checks", () => {
    expect(SELF_CHECKS.length).toBe(6);
  });

  it("returns default order [1, 2, 3, 4, 5, 6] when no categories are provided", () => {
    const checks = selectSelfChecks([]);
    expect(checks.map((c) => c.id)).toEqual([
      "official_website",
      "independent_contact",
      "domain_comparison",
      "pause_before_paying",
      "pause_before_sharing_docs",
      "search_reviews",
    ]);
  });

  it("prioritizes check 4 (pause_before_paying) first when upfront_payment is present", () => {
    const checks = selectSelfChecks(["upfront_payment"]);
    expect(checks[0].id).toBe("pause_before_paying");
    expect(checks.length).toBe(6);
    expect(new Set(checks.map((c) => c.id)).size).toBe(6);
  });

  it("prioritizes check 4 (pause_before_paying) first when refundable_deposit is present", () => {
    const checks = selectSelfChecks(["refundable_deposit"]);
    expect(checks[0].id).toBe("pause_before_paying");
  });

  it("prioritizes check 4 (pause_before_paying) first when payment_urgency is present", () => {
    const checks = selectSelfChecks(["payment_urgency"]);
    expect(checks[0].id).toBe("pause_before_paying");
  });

  it("prioritizes check 5 (pause_before_sharing_docs) first when sensitive_information_request is present", () => {
    const checks = selectSelfChecks(["sensitive_information_request"]);
    expect(checks[0].id).toBe("pause_before_sharing_docs");
    expect(checks.length).toBe(6);
    expect(new Set(checks.map((c) => c.id)).size).toBe(6);
  });

  it("prioritizes checks 2 and 3 first when off_platform_communication is present", () => {
    const checks = selectSelfChecks(["off_platform_communication"]);
    expect(checks[0].id).toBe("independent_contact");
    expect(checks[1].id).toBe("domain_comparison");
    expect(checks.length).toBe(6);
  });

  it("handles payment and sensitive categories simultaneously without duplicating items", () => {
    const checks = selectSelfChecks([
      "upfront_payment",
      "sensitive_information_request",
    ]);
    expect(checks[0].id).toBe("pause_before_paying");
    expect(checks[1].id).toBe("pause_before_sharing_docs");
    expect(checks.length).toBe(6);
    expect(new Set(checks.map((c) => c.id)).size).toBe(6);
  });

  it("returns default order for 'other' category", () => {
    const checks = selectSelfChecks(["other"]);
    expect(checks.map((c) => c.id)).toEqual([
      "official_website",
      "independent_contact",
      "domain_comparison",
      "pause_before_paying",
      "pause_before_sharing_docs",
      "search_reviews",
    ]);
  });
});
