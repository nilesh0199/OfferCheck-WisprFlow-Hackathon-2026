/**
 * Pure heuristic detector for sensitive identifiers (UPI addresses, Aadhaar numbers,
 * PAN cards, and bank account numbers / long digit runs) in user-entered free text.
 *
 * Rules & Epistemic Boundaries:
 * - Conservative and documented: only flags clear indicators of sensitive numbers/addresses.
 * - Non-blocking: used solely to show a calm advisory under free-text fields.
 * - False-positive resilience:
 *   - Amounts (e.g. "Rs 25,000", "₹4,500", "22000", "3499") are NOT flagged.
 *   - Dates (e.g. "2026-10-23", "23/10/2026", "Nov 10, 2026") are NOT flagged.
 *   - Phone numbers formatted with spaces or country codes (e.g. "+91 98000 00000", "098000 00000")
 *     are NOT flagged unless they form a continuous 12+ digit run without spaces.
 *   - Normal email addresses with dotted domains (e.g. "recruiter@example.com", "name@company.co.in")
 *     are NOT flagged as UPI.
 */

export type SensitiveIdentifierKind =
  | "upi"
  | "aadhaar"
  | "pan"
  | "account_or_id";

export const SENSITIVE_IDENTIFIER_WARNING =
  "This looks like an account, UPI or ID number. Remove it before you continue; OfferClara does not need it.";

/**
 * Checks a string of free text for sensitive identifiers.
 * Returns an array of detected identifier categories (empty if clean).
 */
export function detectSensitiveIdentifiers(text: string): SensitiveIdentifierKind[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const kinds = new Set<SensitiveIdentifierKind>();

  // 1. UPI-style address: name@bank pattern
  // Handles like: user@okaxis, payment@okhdfcbank, student@ybl, name@paytm, 9876543210@upi
  // Excludes email addresses where domain contains dots (e.g. @example.com, @gmail.com)
  const upiRegex = /\b[a-zA-Z0-9.\-_]{2,}@([a-zA-Z0-9.-]+)\b/g;
  let upiMatch: RegExpExecArray | null;
  while ((upiMatch = upiRegex.exec(text)) !== null) {
    const domainPart = upiMatch[1];
    // If the domain token does not contain a dot, it's a UPI VPA, not an email
    if (domainPart && !domainPart.includes(".")) {
      kinds.add("upi");
      break;
    }
  }

  // 2. 12-digit Aadhaar-like number:
  // Typically 12 digits, often formatted as 4-4-4: "XXXX XXXX XXXX" or "XXXX-XXXX-XXXX"
  const aadhaarFormattedRegex = /\b\d{4}[ -]\d{4}[ -]\d{4}\b/g;
  if (aadhaarFormattedRegex.test(text)) {
    kinds.add("aadhaar");
  }

  // 3. Indian PAN pattern: exactly 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
  const panRegex = /\b[A-Za-z]{5}\d{4}[A-Za-z]\b/g;
  if (panRegex.test(text)) {
    kinds.add("pan");
  }

  // 4. Long digit runs of 10 or more (bank account numbers, unspaced 12-digit Aadhaar, etc.):
  // Exclude phone numbers when formatted normally or matching standard mobile phone patterns.
  const digitRunRegex = /\b\d{10,}\b/g;
  let runMatch: RegExpExecArray | null;
  while ((runMatch = digitRunRegex.exec(text)) !== null) {
    const digits = runMatch[0];

    // If 12 or more continuous digits, always flag
    if (digits.length >= 12) {
      if (digits.length === 12 && !kinds.has("aadhaar")) {
        kinds.add("aadhaar");
      }
      kinds.add("account_or_id");
      break;
    }

    // If 10 or 11 digits:
    // Check if it's a standard Indian mobile number (10 digits starting with 6, 7, 8, or 9)
    // or if it appears in a clear phone/call context.
    const isIndianMobileNumber = digits.length === 10 && /^[6-9]/.test(digits);
    const startIdx = runMatch.index;
    const precedingContext = text
      .slice(Math.max(0, startIdx - 25), startIdx)
      .toLowerCase();

    const hasPhonePrefix =
      precedingContext.includes("+91") ||
      precedingContext.includes("call") ||
      precedingContext.includes("phone") ||
      precedingContext.includes("tel") ||
      precedingContext.includes("mobile") ||
      precedingContext.includes("whatsapp");

    // If it's not clearly a mobile phone number, treat as potential account or ID number
    if (!isIndianMobileNumber || !hasPhonePrefix) {
      kinds.add("account_or_id");
      break;
    }
  }

  return Array.from(kinds);
}
