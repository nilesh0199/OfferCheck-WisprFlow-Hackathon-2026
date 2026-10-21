/**
 * Verified, calm guidance for users who have already transferred funds
 * or shared sensitive documents.
 *
 * Restricted strictly to verified facts:
 * - National Cyber Crime Reporting Portal (cybercrime.gov.in)
 * - 1930 national helpline
 * - Preserving screenshots, messages, and payment proofs
 * - Stopping further transfers until independently confirmed
 */

export interface PostPaymentStep {
  readonly step: number;
  readonly text: string;
}

export const POST_PAYMENT_STEPS: readonly PostPaymentStep[] = [
  {
    step: 1,
    text: "Contact your bank or payment provider as soon as you can.",
  },
  {
    step: 2,
    text: "Report the incident on the National Cyber Crime Reporting Portal (cybercrime.gov.in) or call the 1930 helpline.",
  },
  {
    step: 3,
    text: "Keep screenshots, messages and payment proofs.",
  },
  {
    step: 4,
    text: "Avoid sending more money or documents until you have confirmed the offer independently.",
  },
];
