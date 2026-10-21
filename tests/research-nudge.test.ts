import { describe, it, expect } from "vitest";
import { getResearchNudge } from "@/lib/research/nudge";
import { ValidatedAnalysis } from "@/lib/analysis/schema";

describe("getResearchNudge", () => {
  const baseAnalysis: ValidatedAnalysis = {
    concerns: [],
    missingInfo: [],
    verificationQuestions: [],
    limits: [],
    droppedCount: 0,
    entities: {
      companyName: "Acme Technologies Pvt Ltd",
      roleTitle: "Software Engineer",
    },
  };

  it("returns 'optional' with no reasons for fully documented offer", () => {
    const text =
      "Acme Technologies offers you the role of Software Engineer. Visit https://acme.example.com. Contact hr@acme.example.com. Your supervisor will be Jane Doe.";
    const result = getResearchNudge({
      analysis: baseAnalysis,
      sourceText: text,
    });

    expect(result.level).toBe("optional");
    expect(result.reasons).toEqual([]);
  });

  it("recommends research when company name is missing or blank", () => {
    const analysisWithoutCompany: ValidatedAnalysis = {
      ...baseAnalysis,
      entities: {
        companyName: "   ",
        roleTitle: "Consultant",
      },
    };

    const result = getResearchNudge({
      analysis: analysisWithoutCompany,
      sourceText: "Congratulations on your selection for the Consultant position.",
    });

    expect(result.level).toBe("recommended");
    expect(result.reasons).toContain(
      "The company or organisation is not named in the offer."
    );
  });

  it("recommends research when sender uses free email and no website is provided", () => {
    const result = getResearchNudge({
      analysis: baseAnalysis,
      sourceText:
        "Please send your confirmation to recruiter.team@gmail.com by tomorrow evening.",
    });

    expect(result.level).toBe("recommended");
    expect(result.reasons).toContain(
      "The sender uses a free personal email address and no company website was provided."
    );
  });

  it("does not trigger free email reason if a website is also provided", () => {
    const result = getResearchNudge({
      analysis: baseAnalysis,
      sourceText:
        "Visit our careers page at https://careers.example.com and reply to hr@gmail.com.",
    });

    expect(result.reasons).not.toContain(
      "The sender uses a free personal email address and no company website was provided."
    );
  });

  it("recommends research for an internship missing mentor or reporting contact", () => {
    const internshipAnalysis: ValidatedAnalysis = {
      ...baseAnalysis,
      entities: {
        companyName: "Tech Corp",
        roleTitle: "Frontend Engineering Intern",
      },
      missingInfo: [
        {
          id: "m-1",
          topic: "reporting_contact",
          note: "Reporting manager or supervisor is not stated in the message.",
        },
      ],
    };

    const result = getResearchNudge({
      analysis: internshipAnalysis,
      sourceText: "We are pleased to offer you a summer internship at Tech Corp.",
    });

    expect(result.level).toBe("recommended");
    expect(result.reasons).toContain(
      "This internship does not name a supervisor, mentor, or reporting manager."
    );
  });

  it("strict word boundary: words containing 'intern' like 'international' or 'internal' do NOT trigger the internship condition", () => {
    const internationalRoleAnalysis: ValidatedAnalysis = {
      ...baseAnalysis,
      entities: {
        companyName: "Global Trade Inc",
        roleTitle: "International Logistics Coordinator",
      },
      missingInfo: [
        {
          id: "m-1",
          topic: "reporting_contact",
          note: "Reporting manager not specified.",
        },
      ],
    };

    const text =
      "Offer for International Sales Executive. This is an internal transfer within our international division. Website: https://global.example.com. Email: careers@global.example.com.";

    const result = getResearchNudge({
      analysis: internationalRoleAnalysis,
      sourceText: text,
    });

    // Should NOT trigger the internship condition because "international" or "internal" is not "intern" or "internship"
    expect(result.reasons).not.toContain(
      "This internship does not name a supervisor, mentor, or reporting manager."
    );
  });

  it("accumulates multiple reasons when multiple conditions match", () => {
    const unnamedInternshipAnalysis: ValidatedAnalysis = {
      ...baseAnalysis,
      entities: {
        companyName: null,
        roleTitle: "Research Intern",
      },
      missingInfo: [
        {
          id: "m-1",
          topic: "reporting_contact",
          note: "No supervisor mentioned.",
        },
      ],
    };

    const text =
      "You have been selected for the Research Intern position. Contact coordinator@yahoo.com.";

    const result = getResearchNudge({
      analysis: unnamedInternshipAnalysis,
      sourceText: text,
    });

    expect(result.level).toBe("recommended");
    expect(result.reasons.length).toBe(3);
    expect(result.reasons).toContain(
      "The company or organisation is not named in the offer."
    );
    expect(result.reasons).toContain(
      "The sender uses a free personal email address and no company website was provided."
    );
    expect(result.reasons).toContain(
      "This internship does not name a supervisor, mentor, or reporting manager."
    );
  });
});
