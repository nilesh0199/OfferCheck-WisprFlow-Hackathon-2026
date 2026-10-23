import { MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "./config";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type SourceChannel =
  | "platform"
  | "messaging"
  | "email"
  | "social"
  | "college"
  | "person"
  | "call"
  | "other"
  | null;

export type AppliedStatus = "yes" | "no" | "unsure" | null;

export interface WizardSourceState {
  channel: SourceChannel;
  applied: AppliedStatus;
  note: string; // cap 200
}

export interface WizardConversationState {
  text: string; // cap 4000
}

export type PaymentAskedStatus = "no" | "yes_unpaid" | "yes_paid" | null;

export type PaymentPurpose =
  | "registration"
  | "training"
  | "equipment"
  | "deposit"
  | "verification"
  | "other";

export type DocumentType =
  | "identity"
  | "bank"
  | "photo"
  | "certificates"
  | "other"
  | "none";

export interface WizardPaymentState {
  asked: PaymentAskedStatus;
  purposes: PaymentPurpose[];
  amount: string; // cap 40
  deadline: string; // cap 100
  docsAsked: DocumentType[];
  docsShared: DocumentType[];
  note: string; // cap 200
}

export const INITIAL_WIZARD_SOURCE: WizardSourceState = {
  channel: null,
  applied: null,
  note: "",
};

export const INITIAL_WIZARD_CONVERSATION: WizardConversationState = {
  text: "",
};

export const INITIAL_WIZARD_PAYMENT: WizardPaymentState = {
  asked: null,
  purposes: [],
  amount: "",
  deadline: "",
  docsAsked: [],
  docsShared: [],
  note: "",
};

export const CHANNEL_LABELS: Record<NonNullable<SourceChannel>, string> = {
  platform: "A job or internship platform",
  messaging: "A WhatsApp or Telegram message",
  email: "An email",
  social: "A social media message",
  college: "A college notice or placement cell",
  person: "A friend or relative",
  call: "A phone call",
  other: "Something else",
};

export const APPLIED_LABELS: Record<NonNullable<AppliedStatus>, string> = {
  yes: "Yes",
  no: "No, they contacted me first",
  unsure: "Not sure",
};

export const ASKED_LABELS: Record<NonNullable<PaymentAskedStatus>, string> = {
  no: "No",
  yes_unpaid: "Yes, not paid",
  yes_paid: "Yes, and I paid",
};

export const PURPOSE_LABELS: Record<PaymentPurpose, string> = {
  registration: "Registration or application fee",
  training: "Training, course or certificate fee",
  equipment: "Equipment, kit or laptop",
  deposit: "Security or refundable deposit",
  verification: "Verification or document processing",
  other: "Something else",
};

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  identity: "Identity card",
  bank: "Bank details or passbook",
  photo: "Photo or selfie",
  certificates: "Certificates or marksheets",
  other: "Something else",
  none: "None",
};

export const SECTION_MARKER_LINES = [
  "---- Offer text ----",
  "---- How you received it (your answers) ----",
  "---- Call or conversation (your description) ----",
  "---- Money and documents (your answers) ----",
] as const;

/**
 * Checks whether a single line matches any of the four standard section headings.
 * Ignores optional trailing carriage return (\r).
 */
export function isSectionMarkerLine(line: string): boolean {
  if (!line || typeof line !== "string") return false;
  const clean = line.replace(/\r$/, "").trim();
  return (SECTION_MARKER_LINES as readonly string[]).includes(clean);
}

export interface CombinedTextStateInput {
  offerText?: string;
  source?: Partial<WizardSourceState> | null;
  conversation?: Partial<WizardConversationState> | null;
  payment?: Partial<WizardPaymentState> | null;
}

/**
 * Builds the combined text string according to the four labelled sections.
 *
 * Rules:
 * - If ONLY the offer text has content, the combined text equals the offer text exactly (no header).
 * - Otherwise each non-empty part becomes a labelled section, in this order, separated by one blank line:
 *   1. "---- Offer text ----" then the offer text (including any source-labelled file blocks)
 *   2. "---- How you received it (your answers) ----" with lines "Channel: <label>", "You applied: Yes|No, they contacted me first|Not sure", "Note: <note>" (only lines that have values)
 *   3. "---- Call or conversation (your description) ----" then the text
 *   4. "---- Money and documents (your answers) ----" with lines "Asked to pay: No|Yes, not paid|Yes, and I paid", "Reason given: <labels joined with ; >", "Amount: ...", "Deadline given: ...", "Documents asked for: ...", "Documents already shared: ...", "Note: ..."
 */
export function buildCombinedText(state: CombinedTextStateInput): { text: string } {
  const offerText = state?.offerText ?? "";
  const hasOfferText = offerText.trim().length > 0;

  const source = state?.source;
  const hasSourceChannel = Boolean(source?.channel && CHANNEL_LABELS[source.channel]);
  const hasSourceApplied = Boolean(source?.applied && APPLIED_LABELS[source.applied]);
  const hasSourceNote = Boolean(source?.note && source.note.trim().length > 0);
  const hasSource = hasSourceChannel || hasSourceApplied || hasSourceNote;

  const conversation = state?.conversation;
  const convText = conversation?.text?.trim() ?? "";
  const hasConversation = convText.length > 0;

  const payment = state?.payment;
  const hasPaymentAsked = Boolean(payment?.asked && ASKED_LABELS[payment.asked]);
  const hasPaymentPurposes = Boolean(payment?.purposes && payment.purposes.length > 0);
  const hasPaymentAmount = Boolean(payment?.amount && payment.amount.trim().length > 0);
  const hasPaymentDeadline = Boolean(payment?.deadline && payment.deadline.trim().length > 0);
  const hasDocsAsked = Boolean(payment?.docsAsked && payment.docsAsked.length > 0);
  const hasDocsShared = Boolean(payment?.docsShared && payment.docsShared.length > 0);
  const hasPaymentNote = Boolean(payment?.note && payment.note.trim().length > 0);
  const hasPayment =
    hasPaymentAsked ||
    hasPaymentPurposes ||
    hasPaymentAmount ||
    hasPaymentDeadline ||
    hasDocsAsked ||
    hasDocsShared ||
    hasPaymentNote;

  // If ONLY the offer text has content, combined text equals offer text exactly
  if (hasOfferText && !hasSource && !hasConversation && !hasPayment) {
    return { text: offerText };
  }

  // If completely empty across all sections
  if (!hasOfferText && !hasSource && !hasConversation && !hasPayment) {
    return { text: "" };
  }

  const sections: string[] = [];

  // Section 1: Offer text
  if (hasOfferText) {
    sections.push(`---- Offer text ----\n${offerText.trim()}`);
  }

  // Section 2: Source answers
  if (hasSource) {
    const lines: string[] = ["---- How you received it (your answers) ----"];
    if (source?.channel && CHANNEL_LABELS[source.channel]) {
      lines.push(`Channel: ${CHANNEL_LABELS[source.channel]}`);
    }
    if (source?.applied && APPLIED_LABELS[source.applied]) {
      lines.push(`You applied: ${APPLIED_LABELS[source.applied]}`);
    }
    if (source?.note && source.note.trim().length > 0) {
      lines.push(`Note: ${source.note.trim()}`);
    }
    sections.push(lines.join("\n"));
  }

  // Section 3: Call or conversation
  if (hasConversation) {
    sections.push(`---- Call or conversation (your description) ----\n${convText}`);
  }

  // Section 4: Money and documents answers
  if (hasPayment) {
    const lines: string[] = ["---- Money and documents (your answers) ----"];
    if (payment?.asked && ASKED_LABELS[payment.asked]) {
      lines.push(`Asked to pay: ${ASKED_LABELS[payment.asked]}`);
    }
    if (payment?.purposes && payment.purposes.length > 0) {
      const labels = payment.purposes
        .map((p) => PURPOSE_LABELS[p] ?? p)
        .filter(Boolean);
      if (labels.length > 0) {
        lines.push(`Reason given: ${labels.join("; ")}`);
      }
    }
    if (payment?.amount && payment.amount.trim().length > 0) {
      lines.push(`Amount: ${payment.amount.trim()}`);
    }
    if (payment?.deadline && payment.deadline.trim().length > 0) {
      lines.push(`Deadline given: ${payment.deadline.trim()}`);
    }
    if (payment?.docsAsked && payment.docsAsked.length > 0) {
      const labels = payment.docsAsked
        .map((d) => DOCUMENT_LABELS[d] ?? d)
        .filter(Boolean);
      if (labels.length > 0) {
        lines.push(`Documents asked for: ${labels.join("; ")}`);
      }
    }
    if (payment?.docsShared && payment.docsShared.length > 0) {
      const labels = payment.docsShared
        .map((d) => DOCUMENT_LABELS[d] ?? d)
        .filter(Boolean);
      if (labels.length > 0) {
        lines.push(`Documents already shared: ${labels.join("; ")}`);
      }
    }
    if (payment?.note && payment.note.trim().length > 0) {
      lines.push(`Note: ${payment.note.trim()}`);
    }
    sections.push(lines.join("\n"));
  }

  return { text: sections.join("\n\n") };
}

export interface ReadyToAnalyseResult {
  ready: boolean;
  reason?: string;
  combinedText: string;
}

/**
 * Determines whether the user's current session input is sufficient and valid to analyze.
 *
 * Requirements:
 * - True when there are at least MIN_INPUT_CHARS characters of user free text across offer text,
 *   conversation, and notes, OR payment.asked is "yes_unpaid"/"yes_paid" with at least one purpose.
 * - False otherwise (with a helpful reason string).
 * - Combined text must not exceed MAX_INPUT_CHARS.
 */
export function isReadyToAnalyse(state: CombinedTextStateInput): ReadyToAnalyseResult {
  const { text: combinedText } = buildCombinedText(state);

  if (combinedText.length > MAX_INPUT_CHARS) {
    return {
      ready: false,
      reason: `Combined text exceeds the maximum limit of ${MAX_INPUT_CHARS.toLocaleString()} characters.`,
      combinedText,
    };
  }

  const offerFreeChars = state?.offerText?.trim().length ?? 0;
  const convFreeChars = state?.conversation?.text?.trim().length ?? 0;
  const sourceNoteChars = state?.source?.note?.trim().length ?? 0;
  const paymentNoteChars = state?.payment?.note?.trim().length ?? 0;
  const totalFreeText = offerFreeChars + convFreeChars + sourceNoteChars + paymentNoteChars;

  const paymentAsked = state?.payment?.asked;
  const hasPaymentPurposes = (state?.payment?.purposes?.length ?? 0) > 0;
  const paymentCriteriaMet =
    (paymentAsked === "yes_unpaid" || paymentAsked === "yes_paid") && hasPaymentPurposes;

  const hasSufficientInput = totalFreeText >= MIN_INPUT_CHARS || paymentCriteriaMet;

  if (!hasSufficientInput) {
    return {
      ready: false,
      reason: `Add at least ${MIN_INPUT_CHARS} characters of offer details or conversation, or select payment details to analyze.`,
      combinedText,
    };
  }

  return {
    ready: true,
    combinedText,
  };
}
