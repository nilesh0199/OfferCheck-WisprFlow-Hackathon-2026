import { describe, it, expect } from "vitest";
import { ConcernCategoryEnum, MissingInfoTopicEnum } from "@/lib/analysis/schema";
import {
  CONCERN_CATEGORY_LABELS,
  MISSING_INFO_TOPIC_LABELS,
  getConcernCategoryLabel,
  getMissingInfoTopicLabel,
} from "@/lib/analysis/labels";

describe("labels mapping", () => {
  it("covers every concern category in ConcernCategoryEnum", () => {
    const categories = ConcernCategoryEnum.options;
    for (const category of categories) {
      expect(
        CONCERN_CATEGORY_LABELS[category],
        `Missing human-readable label for concern category: "${category}"`
      ).toBeDefined();
      expect(typeof CONCERN_CATEGORY_LABELS[category]).toBe("string");
      expect(CONCERN_CATEGORY_LABELS[category].trim().length).toBeGreaterThan(0);
    }
  });

  it("covers every topic in MissingInfoTopicEnum", () => {
    const topics = MissingInfoTopicEnum.options;
    for (const topic of topics) {
      expect(
        MISSING_INFO_TOPIC_LABELS[topic],
        `Missing human-readable label for missing info topic: "${topic}"`
      ).toBeDefined();
      expect(typeof MISSING_INFO_TOPIC_LABELS[topic]).toBe("string");
      expect(MISSING_INFO_TOPIC_LABELS[topic].trim().length).toBeGreaterThan(0);
    }
  });

  it("getConcernCategoryLabel returns mapped label or fallback", () => {
    expect(getConcernCategoryLabel("upfront_payment")).toBe(
      "Upfront Payment Requested"
    );
    expect(getConcernCategoryLabel("unknown_value")).toBe(
      "Term Requiring Verification"
    );
  });

  it("getMissingInfoTopicLabel returns mapped label or fallback", () => {
    expect(getMissingInfoTopicLabel("stipend_or_pay")).toBe(
      "Stipend or Compensation"
    );
    expect(getMissingInfoTopicLabel("unknown_topic")).toBe("Standard Term");
  });
});
