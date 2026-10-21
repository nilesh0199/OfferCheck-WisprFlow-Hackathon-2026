/**
 * Pure evaluation utility for company research prompts.
 * Determines whether researching the company is "recommended" or "optional"
 * based on verified cues in the analysis and source text.
 */

import { ValidatedAnalysis } from "@/lib/analysis/schema";
import { extractContactDetails, isFreeEmailDomain } from "./extract";

export interface ResearchNudgeInput {
  readonly analysis: ValidatedAnalysis;
  readonly sourceText?: string;
}

export interface ResearchNudgeResult {
  readonly level: "recommended" | "optional";
  readonly reasons: readonly string[];
}

/**
 * Pure function: Evaluates an offer analysis to decide if independent research is recommended.
 *
 * Reasons triggering a recommendation:
 * 1. Unnamed company or employer.
 * 2. No website provided and only personal/free email domains used.
 * 3. Internship offer with missing reporting contact, mentor, or supervisor details
 *    (word-boundary checked: "international" or "internal" must NOT match).
 */
export function getResearchNudge({
  analysis,
  sourceText = "",
}: ResearchNudgeInput): ResearchNudgeResult {
  const reasons: string[] = [];

  // 1. Unnamed company
  const companyName = analysis.entities?.companyName?.trim();
  const isUnnamed = !companyName;
  if (isUnnamed) {
    reasons.push("The company or organisation is not named in the offer.");
  }

  // 2. No website & free email only
  const contacts = extractContactDetails(sourceText);
  const hasNoWebsite = contacts.urls.length === 0;
  const hasSenderDomains = contacts.senderDomains.length > 0;
  const allFreeEmails =
    hasSenderDomains && contacts.senderDomains.every((d) => isFreeEmailDomain(d));

  if (hasNoWebsite && allFreeEmails) {
    reasons.push(
      "The sender uses a free personal email address and no company website was provided."
    );
  }

  // 3. Internship with missing mentor/reporting contact (or company details if unnamed)
  // Strict word-boundary regex to prevent false positives like "international" or "internal"
  const internshipRegex = /\binterns?(?:hip)?\b/i;
  const isInternship =
    Boolean(analysis.entities?.roleTitle && internshipRegex.test(analysis.entities.roleTitle)) ||
    Boolean(sourceText && internshipRegex.test(sourceText));

  if (isInternship) {
    const hasMissingReporting = analysis.missingInfo.some(
      (item) =>
        item.topic === "reporting_contact" ||
        /\b(?:mentor|supervisor|reporting|manager)\b/i.test(item.note)
    );
    const hasMissingCompany = analysis.missingInfo.some(
      (item) => item.topic === "company_details"
    );

    if (hasMissingReporting || (isUnnamed && hasMissingCompany)) {
      reasons.push(
        "This internship does not name a supervisor, mentor, or reporting manager."
      );
    }
  }

  if (reasons.length > 0) {
    return {
      level: "recommended",
      reasons,
    };
  }

  return {
    level: "optional",
    reasons: [],
  };
}
