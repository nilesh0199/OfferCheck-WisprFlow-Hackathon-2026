import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { AI_DATA_NOTICE, AI_FILE_NOTICE } from "@/lib/config";

describe("/privacy page contract and compliance", () => {
  const privacyPath = path.resolve(process.cwd(), "src/app/privacy/page.tsx");
  const privacyContent = fs.readFileSync(privacyPath, "utf-8");

  it("exists as a static server component file", () => {
    expect(fs.existsSync(privacyPath)).toBe(true);
    expect(privacyContent.includes('"use client"')).toBe(false);
  });

  it("includes AI_DATA_NOTICE verbatim", () => {
    expect(privacyContent.includes("{AI_DATA_NOTICE}") || privacyContent.includes(AI_DATA_NOTICE)).toBe(true);
  });

  it("includes AI_FILE_NOTICE verbatim", () => {
    expect(privacyContent.includes("{AI_FILE_NOTICE}") || privacyContent.includes(AI_FILE_NOTICE)).toBe(true);
  });

  it("includes all required sections in sentence case", () => {
    const requiredHeadings = [
      "What is sent to other services",
      "What OfferClara does not store",
      "What stays in your browser",
      "Requests and limits",
      "Uploads",
      "What OfferClara cannot do",
      "Report a problem",
    ];

    for (const heading of requiredHeadings) {
      expect(
        privacyContent.includes(heading),
        `Missing required sentence case section heading: "${heading}"`
      ).toBe(true);
    }
  });

  it("includes the 'Last updated 22 Oct 2026' string", () => {
    expect(privacyContent.includes("Last updated 22 Oct 2026")).toBe(true);
  });

  it("contains no banned verdict words used as verdicts", () => {
    // Only allow safe mentions in disclaimers if any, but ensure no scam/fraud/safe verdicts
    const bannedVerdictRegex = /\b(verified safe|definitely a scam|categorically fraud|guaranteed legit)\b/i;
    expect(privacyContent).not.toMatch(bannedVerdictRegex);
  });

  it("includes a link to the GitHub repository issues", () => {
    expect(
      privacyContent.includes("https://github.com/nilesh0199/OfferCheck-WisprFlow-Hackathon-2026/issues")
    ).toBe(true);
  });
});
