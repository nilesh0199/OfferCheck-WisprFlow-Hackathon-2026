import { describe, it, expect } from "vitest";
import { FEATURES, isFeatureEnabled } from "@/lib/features";

describe("Feature Flags", () => {
  it("reflects today's live capabilities truthfully", () => {
    expect(FEATURES.textAnalysis).toBe(true);
    expect(FEATURES.officialResources).toBe(true);
    expect(FEATURES.companyResearchPrompt).toBe(true);
  });

  it("disables future features so the landing page cannot advertise what does not exist", () => {
    expect(FEATURES.documentUpload).toBe(false);
    expect(FEATURES.companyResearch).toBe(false);
  });

  it("isFeatureEnabled returns expected boolean for valid flags", () => {
    expect(isFeatureEnabled("textAnalysis")).toBe(true);
    expect(isFeatureEnabled("documentUpload")).toBe(false);
    expect(isFeatureEnabled("companyResearch")).toBe(false);
    expect(isFeatureEnabled("companyResearchPrompt")).toBe(true);
    expect(isFeatureEnabled("officialResources")).toBe(true);
  });
});
