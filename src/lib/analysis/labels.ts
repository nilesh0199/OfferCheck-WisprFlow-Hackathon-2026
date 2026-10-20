import {
  ConcernCategory,
  MissingInfoTopic,
} from "./schema";

/**
 * Human-readable labels for concern categories.
 * Strict neutral, objective wording without alarmist or verdict terminology.
 */
export const CONCERN_CATEGORY_LABELS: Record<ConcernCategory, string> = {
  upfront_payment: "Upfront Payment Requested",
  refundable_deposit: "Refundable Deposit Requested",
  payment_urgency: "Urgent Payment Deadline",
  sensitive_information_request: "Sensitive Information Requested",
  off_platform_communication: "Off-Platform Communication Channel",
  other: "Other Term Requiring Verification",
};

/**
 * Human-readable labels for missing information topics.
 */
export const MISSING_INFO_TOPIC_LABELS: Record<MissingInfoTopic, string> = {
  stipend_or_pay: "Stipend or Compensation",
  working_hours: "Working Hours and Schedule",
  duration: "Internship Duration",
  start_date: "Start Date",
  responsibilities: "Job Responsibilities and Scope",
  work_mode_or_location: "Work Mode or Location",
  reporting_contact: "Reporting Manager or Mentor",
  company_details: "Company Information or Office Address",
  selection_process: "Selection and Onboarding Process",
  other: "Other Standard Term",
};

/**
 * Returns a human-readable label for a concern category, with fallback for unexpected values.
 */
export function getConcernCategoryLabel(category: string): string {
  if (category in CONCERN_CATEGORY_LABELS) {
    return CONCERN_CATEGORY_LABELS[category as ConcernCategory];
  }
  return "Term Requiring Verification";
}

/**
 * Returns a human-readable label for a missing info topic, with fallback for unexpected values.
 */
export function getMissingInfoTopicLabel(topic: string): string {
  if (topic in MISSING_INFO_TOPIC_LABELS) {
    return MISSING_INFO_TOPIC_LABELS[topic as MissingInfoTopic];
  }
  return "Standard Term";
}
