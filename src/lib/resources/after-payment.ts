/**
 * Pure functions and data structures for the post-payment questionnaire
 * and deterministic checklist generation (Milestone Q3).
 *
 * Rules:
 * - Deterministic, no AI.
 * - Calm wording in our own words; every item tied to a verified fact or a general practical step.
 * - Groups shown ONLY when non-empty, in this exact order:
 *   1. "Do these now"
 *   2. "Keep as evidence"
 *   3. "Ask for in writing or check"
 *   4. "Report"
 *   5. "Protect your accounts and identity"
 * - BANNED WORDS: Never use scam, scammer, fraud, fraudulent, cheated, immediately, freeze or dispute.
 * - Do not promise recovery.
 */

export type Q1Option =
  | "internship_or_job"
  | "course_or_training"
  | "internship_plus_training"
  | "not_clear";

export type Q2Option =
  | "registration_fee"
  | "training_fee"
  | "security_deposit"
  | "laptop_or_software_fee"
  | "nothing_yet";

export type Q3Option =
  | "yes_in_writing"
  | "yes_verbal_or_whatsapp"
  | "no"
  | "not_sure";

export type Q4Option =
  | "nothing_sensitive"
  | "resume_only"
  | "aadhaar_pan_or_id"
  | "bank_details_or_cheque"
  | "otp_pin_card_or_remote_app";

export interface QuestionnaireAnswers {
  q1: Q1Option;
  q2: Q2Option[];
  q3: Q3Option;
  q4: Q4Option[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  sourceLabel?: string;
  sourceUrl?: string;
  checkedDate?: string;
}

export interface AfterPaymentChecklist {
  doNow: ChecklistItem[];
  keepEvidence: ChecklistItem[];
  askOrCheck: ChecklistItem[];
  report: ChecklistItem[];
  protectAccounts: ChecklistItem[];
}

/**
 * Normalizes questionnaire answers to guarantee mutual exclusivity:
 * - In Q2, "nothing_yet" is mutually exclusive with any payment option.
 * - In Q4, "nothing_sensitive" is mutually exclusive with any sensitive option.
 */
export function normalizeQuestionnaireAnswers(
  answers: QuestionnaireAnswers
): QuestionnaireAnswers {
  let q2 = [...answers.q2];
  if (q2.includes("nothing_yet") && q2.length > 1) {
    q2 = q2.filter((opt) => opt !== "nothing_yet");
  }
  if (q2.length === 0) {
    q2 = ["nothing_yet"];
  }

  let q4 = [...answers.q4];
  if (q4.includes("nothing_sensitive") && q4.length > 1) {
    q4 = q4.filter((opt) => opt !== "nothing_sensitive");
  }
  if (q4.length === 0) {
    q4 = ["nothing_sensitive"];
  }

  return {
    ...answers,
    q2,
    q4,
  };
}

/**
 * Pure deterministic checklist generator based on the 4 questionnaire answers.
 * Adheres strictly to the order and logic specified in Milestone Q3.
 */
export function buildAfterPaymentChecklist(
  rawAnswers: QuestionnaireAnswers
): AfterPaymentChecklist {
  const answers = normalizeQuestionnaireAnswers(rawAnswers);

  const doNow: ChecklistItem[] = [];
  const keepEvidence: ChecklistItem[] = [];
  const askOrCheck: ChecklistItem[] = [];
  const report: ChecklistItem[] = [];
  const protectAccounts: ChecklistItem[] = [];

  const hasPaid = !answers.q2.includes("nothing_yet") && answers.q2.length > 0;
  const hasSharedOtpOrCard = answers.q4.includes("otp_pin_card_or_remote_app");
  const hasSharedId = answers.q4.includes("aadhaar_pan_or_id");
  const hasSharedBank = answers.q4.includes("bank_details_or_cheque");
  const hasSharedSensitive = hasSharedOtpOrCard || hasSharedId || hasSharedBank;
  const hasSharedAnything = hasSharedSensitive || answers.q4.includes("resume_only");

  // --- 1. DO THESE NOW ---
  // Rule: if Q4 includes OTP, UPI PIN, card details or a remote-access app,
  // the first item is "Contact your bank or payment provider as soon as you can and tell them what you shared"
  if (hasSharedOtpOrCard) {
    doNow.push({
      id: "do-contact-bank-shared-credentials",
      title: "Contact your bank or payment provider as soon as you can and tell them what you shared",
      description:
        "Notify your bank or payment app support that payment credentials or an authentication code were shared. Request temporary blocking of the card or payment account to prevent further unauthorized transactions.",
      sourceLabel: "Reserve Bank of India (RBI) Unauthorized Transaction Advisory",
      sourceUrl: "https://rbi.org.in",
      checkedDate: "Checked 23 Oct 2026",
    });
  } else if (hasPaid) {
    // Rule: any payment in Q2: "Contact your bank or payment provider as soon as you can"
    doNow.push({
      id: "do-contact-bank-payment",
      title: "Contact your bank or payment provider as soon as you can",
      description:
        "Inform your bank or payment app support about the unauthorized fee demand and share the transaction reference details so they can initiate an inquiry.",
      sourceLabel: "Reserve Bank of India (RBI) Unauthorized Transaction Advisory",
      sourceUrl: "https://rbi.org.in",
      checkedDate: "Checked 23 Oct 2026",
    });
  }

  // Rule: any payment in Q2: "Avoid sending more money or documents until you have confirmed the offer independently"
  if (hasPaid) {
    doNow.push({
      id: "do-avoid-more-payments",
      title: "Avoid sending more money or documents until you have confirmed the offer independently",
      description:
        "Do not transfer additional processing charges, refundable deposits, or training fees regardless of any stated deadline or cancellation warning.",
    });
  }

  // If nothing paid and nothing sensitive shared:
  // Rule: if Q4 is "Nothing sensitive" or "Resume only" and nothing was paid:
  // "No payment or sensitive document was shared in your answers. It may still be worth confirming the offer independently before the next step."
  if (!hasPaid && (answers.q4.includes("nothing_sensitive") || (answers.q4.length === 1 && answers.q4[0] === "resume_only"))) {
    doNow.push({
      id: "do-confirm-independently",
      title: "No payment or sensitive document was shared in your answers. It may still be worth confirming the offer independently before the next step.",
      description:
        "You can run the full offer text through our review tool or verify the company details directly on official portals before taking any further action.",
    });
  }

  // --- 2. KEEP AS EVIDENCE ---
  // Rule: anything paid or shared: "Keep screenshots, messages and payment proofs"
  if (hasPaid || hasSharedAnything) {
    keepEvidence.push({
      id: "ev-keep-screenshots",
      title: "Keep screenshots, messages and payment proofs",
      description:
        "Preserve chat transcripts, email headers, payment receipts with transaction IDs (UTR), and registration links in an unedited folder.",
    });
  }

  // Rule: Q3 "Yes, clearly in writing": "Keep the written document together with the payment proof."
  if (answers.q3 === "yes_in_writing") {
    keepEvidence.push({
      id: "ev-written-promise",
      title: "Keep the written document together with the payment proof",
      description:
        "Save the written offer or brochure stating that an internship or stipend was guaranteed, and store it alongside your transaction receipt.",
    });
  }

  // --- 3. ASK FOR IN WRITING OR CHECK ---
  // Rule: Q1 is a course or internship plus training, or Q2 includes training or certificate fees:
  // "A paid course is a different thing from an internship or job. It is worth checking what the course includes, the refund terms and who the employer is." plus a link to the advisories block
  const isCourseOrTraining =
    answers.q1 === "course_or_training" ||
    answers.q1 === "internship_plus_training" ||
    answers.q2.includes("training_fee") ||
    answers.q2.includes("laptop_or_software_fee");

  if (isCourseOrTraining) {
    askOrCheck.push({
      id: "ask-course-vs-internship",
      title: "A paid course is a different thing from an internship or job. It is worth checking what the course includes, the refund terms and who the employer is.",
      description:
        "Educational institutions like IITs and universities have noted schemes where paid training is presented as an internship. Review official institutional advisories for examples.",
      sourceLabel: "Institutional Advisories",
      sourceUrl: "https://internship.aicte-india.org",
      checkedDate: "Checked 23 Oct 2026",
    });
  }

  // Rule: Q3 "Yes, but only verbally or on WhatsApp" or "Not sure":
  // "Ask for the promise in writing and save the messages where it was made. Do not rely on a verbal promise."
  if (answers.q3 === "yes_verbal_or_whatsapp" || answers.q3 === "not_sure") {
    askOrCheck.push({
      id: "ask-written-promise",
      title: "Ask for the promise in writing and save the messages where it was made. Do not rely on a verbal promise.",
      description:
        "Request formal terms on an official company letterhead signed by an authorized representative before making any decisions.",
    });
  }

  // Rule: Q2 includes a security deposit:
  // "Ask for the refund terms in writing and note the date and amount."
  if (answers.q2.includes("security_deposit")) {
    askOrCheck.push({
      id: "ask-deposit-refund-terms",
      title: "Ask for the refund terms in writing and note the date and amount.",
      description:
        "Record the exact refund conditions, processing timeframe, and payment mode in a formal written agreement.",
    });
  }

  // --- 4. REPORT ---
  // Rule: any payment, bank details, ID or OTP/PIN/remote-access item:
  // "Report the incident on cybercrime.gov.in or call 1930"
  if (hasPaid || hasSharedSensitive) {
    report.push({
      id: "rep-cybercrime",
      title: "Report the incident on cybercrime.gov.in or call 1930",
      description:
        "National Cyber Crime Reporting Portal handles unauthorized transaction reports and suspicious financial schemes. You can file an incident report online or call the national helpline 1930.",
      sourceLabel: "National Cyber Crime Reporting Portal",
      sourceUrl: "https://cybercrime.gov.in",
      checkedDate: "Checked 23 Oct 2026",
    });
  }

  // --- 5. PROTECT YOUR ACCOUNTS AND IDENTITY ---
  // Rule: Q4 includes Aadhaar, PAN or ID:
  // "Avoid sharing more identity documents and keep a note of exactly which ones you shared" plus identity-protection steps ONLY if confirmed on an official page
  if (hasSharedId) {
    protectAccounts.push({
      id: "prot-avoid-more-docs",
      title: "Avoid sharing more identity documents and keep a note of exactly which ones you shared",
      description:
        "Maintain a record of the specific ID numbers and files provided, and decline requests for additional identity cards.",
    });

    protectAccounts.push({
      id: "prot-aadhaar-biometric-lock",
      title: "Lock your Aadhaar biometrics using the mAadhaar app or UIDAI portal",
      description:
        "UIDAI provides a biometric lock feature that prevents unauthorized biometric authentication using your Aadhaar number. You can unlock it anytime when required.",
      sourceLabel: "UIDAI Aadhaar Lock and Unlock Guidelines",
      sourceUrl: "https://resident.uidai.gov.in/aadhaar-lockunlock",
      checkedDate: "Checked 23 Oct 2026",
    });
  }

  // Extra confirmed tip: if OTP, UPI PIN, or remote app shared
  if (hasSharedOtpOrCard) {
    protectAccounts.push({
      id: "prot-upi-pin-notice",
      title: "Remember that UPI PIN is only required to send money, never to receive money or refunds",
      description:
        "If anyone asks you to enter your UPI PIN, scan a QR code, or accept a collect request to receive a refund or stipend, decline the request. Official guidelines confirm PIN is solely for debits.",
      sourceLabel: "National Payments Corporation of India (NPCI) Safety Tips",
      sourceUrl: "https://www.npci.org.in",
      checkedDate: "Checked 23 Oct 2026",
    });
  }

  return {
    doNow,
    keepEvidence,
    askOrCheck,
    report,
    protectAccounts,
  };
}
