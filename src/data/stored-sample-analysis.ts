import { ModelOutput, ValidatedAnalysis } from "@/lib/analysis/schema";
import { validateAnalysis } from "@/lib/analysis/validate-result";

/**
 * Pre-stored model output for synthetic Example 6 / full-sample-course-as-internship
 * ("Course sold as an internship" - HelixBrattice Skillcraft).
 */
export const HELIX_SAMPLE_MODEL_OUTPUT: ModelOutput = {
  concerns: [
    {
      id: "concern-1-paid-training",
      category: "paid_training_described",
      observation:
        "The message requires an upfront payment of Rs 3,499 described as a mandatory internship programme fee covering training modules and certification.",
      interpretation:
        "Internships provide compensation to candidates rather than charging them fees for training or placement support. Regulatory bodies such as AICTE advise students that arrangements requiring training fees are commercial training programs rather than employment.",
      quote: "mandatory internship programme fee of Rs 3,499",
    },
    {
      id: "concern-2-tight-deadline",
      category: "payment_urgency",
      observation:
        "A same-day deadline of 11:59 pm tonight is stated to pay the fee and confirm the slot before unconfirmed spots are reallocated tomorrow morning.",
      interpretation:
        "Short payment deadlines create urgency that discourages candidates from consulting mentors, family, or independent sources before sending funds.",
      quote:
        "registrations close tonight at 11:59 pm. Any unconfirmed slots will be allocated to waitlisted candidates immediately tomorrow morning.",
    },
    {
      id: "concern-3-off-platform-chat",
      category: "off_platform_communication",
      observation:
        "Orientation and candidate communication are directed to an external WhatsApp group link rather than official organizational communication infrastructure.",
      interpretation:
        "Directing applicants to external messaging links makes it harder to confirm whether the representatives are authorized personnel of the claimed organization.",
      quote:
        "Please join our official WhatsApp group for orientation using the link: https://chat.example.com/invite/HelixBatch2026.",
    },
  ],
  missingInfo: [
    {
      id: "missing-1-stipend",
      topic: "stipend_or_pay",
      note: "The communication does not state whether any regular stipend is paid to the intern during or after the program.",
    },
    {
      id: "missing-2-company-details",
      topic: "company_details",
      note: "No registered corporate office address, Corporate Identification Number (CIN), or official entity registration is provided in the text.",
    },
    {
      id: "missing-3-selection",
      topic: "selection_process",
      note: "Selection is claimed based on an academic profile without any formal technical interview or direct evaluation having occurred.",
    },
    {
      id: "missing-4-responsibilities",
      topic: "responsibilities",
      note: "Day-to-day engineering duties and reporting structures are not stated beyond general practice modules.",
    },
  ],
  verificationQuestions: [
    {
      id: "vq-1-fee-terms",
      question:
        "Can the coordinator confirm in writing whether any mandatory fee or purchase is required to participate in an internship?",
      relatedConcernId: "concern-1-paid-training",
    },
    {
      id: "vq-2-mca-check",
      question:
        "Is HelixBrattice Skillcraft registered on the Ministry of Corporate Affairs (MCA) company directory or National Career Service (NCS)?",
      relatedConcernId: "concern-2-tight-deadline",
    },
    {
      id: "vq-3-independent-contact",
      question:
        "Can you verify the contact details of the organization through official university placement records or an independent corporate directory?",
      relatedConcernId: "concern-3-off-platform-chat",
    },
  ],
  overallNote:
    "This communication describes a training program requiring an upfront fee of Rs 3,499 under the heading of an internship, alongside an urgent payment deadline and messaging links.",
  entities: {
    companyName: "HelixBrattice Skillcraft",
    roleTitle: "Web Development Internship Batch",
  },
};

/**
 * Pre-stored model output for synthetic Example 5 / full-sample-phone-call-account
 * ("A phone call described in my own words" - KiteSpindle Business Services).
 */
export const KITESPINDLE_SAMPLE_MODEL_OUTPUT: ModelOutput = {
  concerns: [
    {
      id: "concern-1-upfront-payment",
      category: "upfront_payment",
      observation:
        "The caller requested a refundable registration fee of Rs 2,000 via UPI today before issuing formal paperwork.",
      interpretation:
        "Upfront registration or processing fees demanded via UPI before formal documents are shared warrant careful verification through official channels.",
      quote: "pay a refundable registration fee of Rs 2,000 through UPI today",
    },
    {
      id: "concern-2-payment-urgency",
      category: "payment_urgency",
      observation:
        "A same-day deadline of 6 pm was given, stating the slot would otherwise be given to another candidate.",
      interpretation:
        "Imposing pressure to pay within hours prevents candidates from seeking counsel or verifying the organization independently.",
      quote:
        "if I do not pay the fee by 6 pm today, the slot will be given to another candidate",
    },
    {
      id: "concern-3-sensitive-docs",
      category: "sensitive_information_request",
      observation:
        "Photos of Aadhaar card and the front page of a bank passbook were requested over WhatsApp.",
      interpretation:
        "Sharing banking records and national identity documents through mobile messaging without verified onboarding infrastructure carries risk.",
      quote:
        "send photos of my Aadhaar card and the front page of my bank passbook on WhatsApp",
    },
  ],
  missingInfo: [
    {
      id: "missing-1-official-documentation",
      topic: "selection_process",
      note: "No formal written job offer or documented interview process was provided before requesting payment.",
    },
    {
      id: "missing-2-company-details",
      topic: "company_details",
      note: "The caller provided an employer name over the phone without verifiable corporate credentials, address, or official email domain.",
    },
  ],
  verificationQuestions: [
    {
      id: "vq-1-official-letter",
      question:
        "Can the employer email an official offer letter from a registered corporate domain before requesting any personal documents or fees?",
      relatedConcernId: "concern-1-upfront-payment",
    },
    {
      id: "vq-2-independent-contact",
      question:
        "Can you verify the firm's existence on the MCA portal and contact their listed switchboard independently?",
      relatedConcernId: "concern-2-payment-urgency",
    },
  ],
  overallNote:
    "This account describes an unsolicited call offering a remote job with an upfront UPI payment request, same-day urgency, and requests for identity documents over WhatsApp.",
  entities: {
    companyName: "KiteSpindle Business Services",
    roleTitle: "Remote Data Entry Job",
  },
};

/**
 * Pre-stored model output for synthetic Example 1
 * ("Payment request with urgency" - AetherFlume Cloud Technologies).
 */
export const AETHERFLUME_SAMPLE_MODEL_OUTPUT: ModelOutput = {
  concerns: [
    {
      id: "concern-1-deposit",
      category: "refundable_deposit",
      observation:
        "The letter requests a refundable equipment deposit of ₹4,500 to secure the internship slot.",
      interpretation:
        "Employers provide necessary equipment and work tools directly without charging security deposits to interns.",
      quote: "refundable equipment deposit of ₹4,500",
    },
    {
      id: "concern-2-urgency",
      category: "payment_urgency",
      observation:
        "A 24-hour payment deadline is stated, warning that the slot will otherwise be given to waitlisted applicants.",
      interpretation:
        "Tight payment deadlines create pressure to send funds before conducting independent background verification.",
      quote: "within 24 hours to secure your internship slot",
    },
    {
      id: "concern-3-off-platform",
      category: "off_platform_communication",
      observation:
        "Communication is directed to a WhatsApp number alongside the email address.",
      interpretation:
        "Directing candidates to messaging apps makes it harder to confirm authorization through official company directories.",
      quote: "reach out via WhatsApp at +91 98000 00000",
    },
  ],
  missingInfo: [
    {
      id: "missing-1-work-details",
      topic: "work_mode_or_location",
      note: "Office location, working hours, and mentorship reporting lines are not stated in the text.",
    },
  ],
  verificationQuestions: [
    {
      id: "vq-1-deposit-policy",
      question:
        "Can the company confirm whether equipment is provided without security deposits, and provide official terms in writing?",
      relatedConcernId: "concern-1-deposit",
    },
  ],
  overallNote:
    "This offer asks for a refundable equipment deposit with a 24-hour payment deadline.",
  entities: {
    companyName: "AetherFlume Cloud Technologies Pvt. Ltd.",
    roleTitle: "Cloud Engineering Internship",
  },
};

/**
 * Check if the input text matches any of our synthetic examples.
 * If matched, runs validateAnalysis against the exact submitted text so that
 * quote offsets (spans) match the user's current text representation precisely.
 */
export function getStoredSampleAnalysis(text: string): ValidatedAnalysis | null {
  if (!text || typeof text !== "string") {
    return null;
  }

  if (text.includes("HelixBrattice Skillcraft")) {
    return validateAnalysis(HELIX_SAMPLE_MODEL_OUTPUT, text);
  }

  if (text.includes("KiteSpindle Business Services")) {
    return validateAnalysis(KITESPINDLE_SAMPLE_MODEL_OUTPUT, text);
  }

  if (text.includes("AetherFlume Cloud Technologies")) {
    return validateAnalysis(AETHERFLUME_SAMPLE_MODEL_OUTPUT, text);
  }

  return null;
}
