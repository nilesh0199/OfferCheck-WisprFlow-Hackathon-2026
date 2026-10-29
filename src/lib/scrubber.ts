/**
 * Client-Side Sensitive Data Scrubber
 *
 * Runs 100% locally in the browser with zero AI and zero network calls.
 * Detects personal and sensitive identifiers (phone numbers, email addresses,
 * Aadhaar numbers, PAN cards, UPI IDs, bank accounts, and candidate names in greetings)
 * and replaces them with semantic placeholders so LLMs can analyze offer context
 * without retaining or exposing personal candidate identity.
 */

export type SensitiveEntityType =
  | "phone"
  | "email"
  | "aadhaar"
  | "pan"
  | "upi"
  | "account"
  | "name";

export interface SensitiveEntity {
  id: string;
  type: SensitiveEntityType;
  original: string;
  placeholder: string;
  startIndex: number;
  endIndex: number;
  label: string;
}

export const ENTITY_PLACEHOLDERS: Record<SensitiveEntityType, string> = {
  phone: "[PHONE_REDACTED]",
  email: "[EMAIL_REDACTED]",
  aadhaar: "[AADHAAR_REDACTED]",
  pan: "[PAN_REDACTED]",
  upi: "[UPI_REDACTED]",
  account: "[ACCOUNT_REDACTED]",
  name: "[CANDIDATE_NAME]",
};

export const ENTITY_LABELS: Record<SensitiveEntityType, string> = {
  phone: "Phone number",
  email: "Email address",
  aadhaar: "Aadhaar number",
  pan: "PAN card",
  upi: "UPI address",
  account: "Account number",
  name: "Candidate name",
};

/**
 * Detects all sensitive entities in the given text.
 * Returns non-overlapping entities sorted by their appearance in the text.
 */
export function detectSensitiveEntities(text: string, prefix = "entity"): SensitiveEntity[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const rawMatches: Array<{
    type: SensitiveEntityType;
    original: string;
    startIndex: number;
    endIndex: number;
  }> = [];

  // 1. Candidate Name greetings (e.g., "Dear John Doe,", "Candidate: Priya Sharma")
  const greetingRegex =
    /\b(?:Dear|To|Candidate|Attention)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g;
  let match: RegExpExecArray | null;
  while ((match = greetingRegex.exec(text)) !== null) {
    const fullName = match[1];
    const startIndex = match.index + match[0].indexOf(fullName);
    const endIndex = startIndex + fullName.length;
    rawMatches.push({
      type: "name",
      original: fullName,
      startIndex,
      endIndex,
    });
  }

  // 2. Email addresses (e.g., student@gmail.com, candidate.intern@domain.co.in)
  const emailRegex =
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((match = emailRegex.exec(text)) !== null) {
    rawMatches.push({
      type: "email",
      original: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // 3. UPI addresses: name@bank (domain has no dots, e.g. user@okaxis, 9876543210@upi)
  const upiRegex = /\b[a-zA-Z0-9.\-_]{2,}@([a-zA-Z0-9]+)\b/g;
  while ((match = upiRegex.exec(text)) !== null) {
    // Only flag if it wasn't already caught as an email with dots
    const domain = match[1];
    if (domain && !domain.includes(".")) {
      rawMatches.push({
        type: "upi",
        original: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  // 4. Phone numbers:
  // Handles +91 98765 43210, +919876543210, 09876543210, 98765 43210, 9876543210, or standard (123) 456-7890
  const phoneRegex =
    /(?:\+91[\s\-]?)?(?:\(?0\d{1,4}\)?[\s\-]?)?[6-9]\d{4}[\s\-]?\d{5}\b|(?:\+?1[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    // Avoid matching if preceded by currency symbols (e.g. Rs 98000, ₹98000)
    const before = text.slice(Math.max(0, match.index - 5), match.index);
    if (!/(?:rs\.?|inr|₹|\$|€|£)\s*$/i.test(before)) {
      rawMatches.push({
        type: "phone",
        original: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  // 5. PAN card (5 uppercase letters, 4 digits, 1 uppercase letter)
  const panRegex = /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g;
  while ((match = panRegex.exec(text)) !== null) {
    rawMatches.push({
      type: "pan",
      original: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // 6. Aadhaar numbers (12 digits, spaced, hyphenated, or continuous)
  const aadhaarRegex = /\b(?:\d{4}[\s\-]\d{4}[\s\-]\d{4})\b/g;
  while ((match = aadhaarRegex.exec(text)) !== null) {
    rawMatches.push({
      type: "aadhaar",
      original: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // 7. Long Account / ID numbers (12-18 digits continuous)
  const accountRegex = /\b\d{12,18}\b/g;
  while ((match = accountRegex.exec(text)) !== null) {
    rawMatches.push({
      type: "account",
      original: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Sort by startIndex
  rawMatches.sort((a, b) => a.startIndex - b.startIndex);

  // Filter overlapping ranges (first match wins)
  const nonOverlapping: SensitiveEntity[] = [];
  let lastEnd = -1;

  for (let i = 0; i < rawMatches.length; i++) {
    const item = rawMatches[i];
    if (item.startIndex >= lastEnd) {
      nonOverlapping.push({
        id: `${prefix}-${i}-${item.startIndex}`,
        type: item.type,
        original: item.original,
        placeholder: ENTITY_PLACEHOLDERS[item.type],
        startIndex: item.startIndex,
        endIndex: item.endIndex,
        label: ENTITY_LABELS[item.type],
      });
      lastEnd = item.endIndex;
    }
  }

  return nonOverlapping;
}

/**
 * Text segment for rendering in the interactive visual preview.
 */
export type PreviewSegment =
  | { type: "text"; text: string }
  | { type: "entity"; entity: SensitiveEntity; isRedacted: boolean };

/**
 * Builds segments for visual preview display based on active redaction selections.
 */
export function buildPreviewSegments(
  text: string,
  entities: SensitiveEntity[],
  redactionState: Record<string, boolean>
): PreviewSegment[] {
  if (!text) return [];
  if (!entities.length) return [{ type: "text", text }];

  const segments: PreviewSegment[] = [];
  let cursor = 0;

  for (const entity of entities) {
    if (entity.startIndex > cursor) {
      segments.push({
        type: "text",
        text: text.slice(cursor, entity.startIndex),
      });
    }

    const isRedacted =
      redactionState[entity.id] !== undefined ? redactionState[entity.id] : true;

    segments.push({
      type: "entity",
      entity,
      isRedacted,
    });

    cursor = entity.endIndex;
  }

  if (cursor < text.length) {
    segments.push({
      type: "text",
      text: text.slice(cursor),
    });
  }

  return segments;
}

/**
 * Generates the final scrubbed text for submission based on active redactions.
 */
export function applyRedactions(
  text: string,
  entities: SensitiveEntity[],
  redactionState: Record<string, boolean>
): string {
  const segments = buildPreviewSegments(text, entities, redactionState);
  return segments
    .map((seg) => {
      if (seg.type === "text") return seg.text;
      return seg.isRedacted ? seg.entity.placeholder : seg.entity.original;
    })
    .join("");
}
