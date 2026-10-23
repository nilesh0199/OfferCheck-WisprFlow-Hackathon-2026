/**
 * Verified institutional advisories and public notices regarding internship offers,
 * upfront fees, and institutional name misuse.
 * All entries are based on confirmed public notices and investigative reports.
 */

export interface InstitutionalAdvisory {
  id: string;
  institution: string;
  issuingAuthority: string;
  date: string;
  summary: string;
  keyTakeaway: string;
  sourceUrl: string;
  tags: readonly string[];
}

export const INSTITUTIONAL_ADVISORIES: readonly InstitutionalAdvisory[] = [
  {
    id: "iit-bhubaneswar-may-2024",
    institution: "Indian Institute of Technology (IIT) Bhubaneswar",
    issuingAuthority: "Registrar / Dean of Academic Affairs",
    date: "May 2024",
    summary:
      "Public notice cautioning students and parents against fraudulent internship schemes, fake appointment letters, and unauthorized entities using the IIT Bhubaneswar logo and name to solicit fees.",
    keyTakeaway:
      "IIT Bhubaneswar explicitly reiterated that legitimate institutional internships never charge application, registration, or training fees.",
    sourceUrl: "https://www.iitbbs.ac.in",
    tags: ["upfront_fee", "institute_name_misuse", "training_fee", "iit"],
  },
  {
    id: "st-xaviers-jaipur-placement-cell",
    institution: "St. Xavier's College, Jaipur",
    issuingAuthority: "Training and Placement Cell",
    date: "December 2023",
    summary:
      "Student advisory warning that genuine corporate recruiters and research institutions do not ask candidates to transfer money for onboarding, document verification, laptop security deposits, or background checks.",
    keyTakeaway:
      "Any demand for monetary payment before or during an internship is a primary indicator to pause and verify through the college placement cell.",
    sourceUrl: "https://stxaviersjaipur.org",
    tags: ["security_deposit", "document_verification", "placement_cell", "college"],
  },
  {
    id: "iit-roorkee-media-investigation-careers360",
    institution: "IIT Roorkee & Premier Institutions (Careers360 Investigation)",
    issuingAuthority: "Careers360 National Investigation / Institute Placement Alerts",
    date: "July 2023",
    summary:
      "Investigative report on widespread fake summer internship offers circulated on WhatsApp, Telegram, and LinkedIn falsely claiming affiliation with IIT Roorkee and demanding fees for course certification or processing.",
    keyTakeaway:
      "Premier academic institutions conduct all internship selections through official institutional portals (.ac.in domains) and never issue offers via unverified messaging groups.",
    sourceUrl: "https://www.careers360.com",
    tags: ["messaging_apps", "whatsapp", "telegram", "course_fee", "iit"],
  },
];

export interface AdvisoryContext {
  offerText?: string;
  categoryKeys?: string[];
  hasPayment?: boolean;
  channel?: string;
}

/**
 * Pure matcher function selecting relevant advisories for an offer context.
 * Returns up to `limit` relevant advisories.
 */
export function selectAdvisories(
  context: AdvisoryContext = {},
  limit: number = 3
): InstitutionalAdvisory[] {
  const text = (context.offerText || "").toLowerCase();
  const cats = context.categoryKeys || [];
  const hasPayment =
    context.hasPayment ||
    cats.includes("upfront_payment") ||
    cats.includes("refundable_deposit") ||
    cats.includes("paid_training_described");

  const isInstituteMentioned =
    text.includes("iit") ||
    text.includes("institute") ||
    text.includes("college") ||
    text.includes("university") ||
    text.includes("campus");

  const isMessagingMentioned =
    text.includes("whatsapp") ||
    text.includes("telegram") ||
    context.channel === "whatsapp" ||
    context.channel === "telegram";

  const scored = INSTITUTIONAL_ADVISORIES.map((advisory) => {
    let score = 0;
    if (hasPayment && advisory.tags.some((t) => t.includes("fee") || t.includes("deposit"))) {
      score += 3;
    }
    if (isInstituteMentioned && advisory.tags.includes("iit")) {
      score += 2;
    }
    if (isMessagingMentioned && (advisory.tags.includes("whatsapp") || advisory.tags.includes("telegram"))) {
      score += 2;
    }
    return { advisory, score };
  });

  // Sort by score descending, retaining stable order
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.advisory);
}
