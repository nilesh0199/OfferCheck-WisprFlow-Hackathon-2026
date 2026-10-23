import { describe, it, expect } from "vitest";
import {
  INSTITUTIONAL_ADVISORIES,
  selectAdvisories,
} from "@/data/advisories";

describe("INSTITUTIONAL_ADVISORIES facts", () => {
  it("contains 3 verified institutional advisories", () => {
    expect(INSTITUTIONAL_ADVISORIES.length).toBe(3);
  });

  it("has non-empty required fields and verified sources", () => {
    for (const advisory of INSTITUTIONAL_ADVISORIES) {
      expect(advisory.id).toBeTruthy();
      expect(advisory.institution).toBeTruthy();
      expect(advisory.issuingAuthority).toBeTruthy();
      expect(advisory.date).toBeTruthy();
      expect(advisory.summary).toBeTruthy();
      expect(advisory.keyTakeaway).toBeTruthy();
      expect(advisory.sourceUrl.startsWith("http")).toBe(true);
      expect(advisory.tags.length).toBeGreaterThan(0);
    }
  });
});

describe("selectAdvisories matcher", () => {
  it("returns default list when context is empty", () => {
    const res = selectAdvisories({});
    expect(res.length).toBe(3);
  });

  it("prioritizes fee and deposit advisories when payment is present", () => {
    const res = selectAdvisories({ hasPayment: true });
    expect(res.length).toBeGreaterThan(0);
    expect(
      res.some(
        (a) =>
          a.tags.includes("upfront_fee") || a.tags.includes("security_deposit")
      )
    ).toBe(true);
  });

  it("prioritizes messaging alerts when WhatsApp or Telegram is used", () => {
    const res = selectAdvisories({ channel: "whatsapp" });
    expect(res[0].id).toBe("iit-roorkee-media-investigation-careers360");
  });

  it("respects the limit argument", () => {
    const res = selectAdvisories({}, 2);
    expect(res.length).toBe(2);
  });
});
