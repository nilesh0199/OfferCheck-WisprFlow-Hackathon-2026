/**
 * Contact detail extraction utilities for company research handoff.
 * Pure, deterministic functions extracting emails, sender domains, and URLs from offer text.
 */

/**
 * Documented list of personal, free, and disposable webmail service domains.
 * A recruitment email coming from one of these is an observation to prompt verification questions,
 * not proof of fraud or wrongdoing.
 */
export const FREE_EMAIL_DOMAINS: readonly string[] = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "proton.me",
  "protonmail.com",
  "icloud.com",
  "rediffmail.com",
];

export interface ExtractedContactDetails {
  readonly emails: string[];
  readonly senderDomains: string[];
  readonly urls: string[];
}

/**
 * Pure check to determine if a domain belongs to a known free email provider.
 */
export function isFreeEmailDomain(domain: string | null | undefined): boolean {
  if (!domain || typeof domain !== "string") return false;
  const clean = domain.trim().toLowerCase().replace(/^@/, "");
  return FREE_EMAIL_DOMAINS.includes(clean);
}

/**
 * Extracts email addresses, sender domains, and URLs from offer text.
 *
 * Rules:
 * - Emails are deduplicated and domains are lowercased.
 * - Sender domains are isolated, lowercased, and deduplicated.
 * - URLs start with http://, https://, or www.
 * - Trailing punctuation (.,!?:;) and prose wrapping parentheses are trimmed.
 * - Returns empty arrays for text without matches.
 */
export function extractContactDetails(text: string): ExtractedContactDetails {
  if (!text || typeof text !== "string") {
    return { emails: [], senderDomains: [], urls: [] };
  }

  // 1. Extract emails
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
  const emails: string[] = [];
  const senderDomains: string[] = [];
  const seenEmails = new Set<string>();
  const seenDomains = new Set<string>();

  let emailMatch: RegExpExecArray | null;
  while ((emailMatch = emailRegex.exec(text)) !== null) {
    const rawEmail = emailMatch[0];
    const rawDomain = emailMatch[1];

    // Standardize domain to lowercase
    const normalizedEmail = rawEmail.toLowerCase();
    const normalizedDomain = rawDomain.toLowerCase();

    if (!seenEmails.has(normalizedEmail)) {
      seenEmails.add(normalizedEmail);
      emails.push(normalizedEmail);
    }

    if (!seenDomains.has(normalizedDomain)) {
      seenDomains.add(normalizedDomain);
      senderDomains.push(normalizedDomain);
    }
  }

  // 2. Extract URLs starting with http://, https://, or www.
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`[\]]+/gi;
  const urls: string[] = [];
  const seenUrls = new Set<string>();

  let urlMatch: RegExpExecArray | null;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    let candidate = urlMatch[0];

    // Strip trailing punctuation common in English sentences
    candidate = candidate.replace(/[.,!?:;]+$/, "");

    // If URL ends with closing parenthesis and does not contain an opening parenthesis, trim it
    if (candidate.endsWith(")") && !candidate.includes("(")) {
      candidate = candidate.slice(0, -1);
    }
    // Second pass for punctuation immediately before a stripped closing parenthesis
    candidate = candidate.replace(/[.,!?:;]+$/, "");

    if (candidate && !seenUrls.has(candidate.toLowerCase())) {
      seenUrls.add(candidate.toLowerCase());
      urls.push(candidate);
    }
  }

  return {
    emails,
    senderDomains,
    urls,
  };
}
