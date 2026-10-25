import { AskResponse, AskResponseSchema, AskResourceId } from "./schema";

const FORBIDDEN_WORDS_REGEX = /\b(scam|scammer|scammers|fraud|fraudulent|frauds)\b/gi;
const VERDICT_PHRASES_REGEX = /\b(verified safe|guaranteed legit|definitely a scam|categorically fraud|100% genuine)\b/gi;
const EMPLOYER_GENERALIZATIONS_REGEX = /\b(legitimate|authentic|genuine)\s+(employers?|organizations?|organisations?|companies|internships?)\b/gi;
const NORMATIVE_CLAIMS_REGEX = /\b(typically|normally|usually|rarely)\b/gi;
const PROHIBITED_ADVICE_WORDS_REGEX = /\b(immediately|immediate)\b/gi;
const PROHIBITED_REVERSAL_REGEX = /\b(payment\s+reversal|account\s+freeze|reversal|freeze|frozen)\b/gi;
const PROHIBITED_MASKED_REGEX = /\bmasked\s+aadhaar\b/gi;
const PROHIBITED_SAFELY_REGEX = /\b(safely|safe\s+sharing)\b/gi;

const VALID_RESOURCES: Set<AskResourceId> = new Set([
  "cybercrime",
  "aicte",
  "ncs",
  "mca",
  "advisories",
  "resources_page",
  "check_page",
  "research_prompt",
]);

/**
 * Sanitizes any stray verdict language, employer generalizations, or prohibited words from model output.
 */
export function sanitizeAskText(text: string): string {
  if (!text) return "";
  let clean = text.replace(VERDICT_PHRASES_REGEX, "irregular pattern");
  clean = clean.replace(EMPLOYER_GENERALIZATIONS_REGEX, "registered organizations");
  clean = clean.replace(/\bemployers\s+(?:do\s+not|never|rarely)\s+ask\b/gi, "advisories recommend confirming before sharing");
  clean = clean.replace(/\bemployers\s+(?:do\s+not|never|rarely)\b/gi, "official guidelines caution against");
  clean = clean.replace(FORBIDDEN_WORDS_REGEX, (match) => {
    const lower = match.toLowerCase();
    if (lower === "scam" || lower === "fraud") return "paid or unauthorised scheme";
    if (lower === "scammer" || lower === "scammers") return "unauthorised sender";
    if (lower === "fraudulent") return "unauthorised";
    return "unauthorised scheme";
  });
  clean = clean.replace(NORMATIVE_CLAIMS_REGEX, "often");
  clean = clean.replace(PROHIBITED_ADVICE_WORDS_REGEX, "as soon as you can");
  clean = clean.replace(PROHIBITED_REVERSAL_REGEX, "reporting the transaction");
  clean = clean.replace(PROHIBITED_MASKED_REGEX, "Aadhaar with the first eight digits concealed");
  clean = clean.replace(PROHIBITED_SAFELY_REGEX, "independently");
  return clean;
}

/**
 * Validates, filters, and sanitizes model output for /ask responses.
 */
export function sanitizeAndValidateAskResponse(data: unknown): AskResponse | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;
  const language = raw.language === "hi" || raw.language === "en" ? raw.language : "other";

  const rawResources = Array.isArray(raw.resources) ? raw.resources : [];
  const validResources = rawResources.filter((r): r is AskResourceId =>
    typeof r === "string" && VALID_RESOURCES.has(r as AskResourceId)
  );

  const sanitized = {
    language,
    summary: typeof raw.summary === "string" ? sanitizeAskText(raw.summary) : "",
    whatThisMayMean: Array.isArray(raw.whatThisMayMean)
      ? raw.whatThisMayMean
          .filter((i): i is string => typeof i === "string")
          .slice(0, 4)
          .map(sanitizeAskText)
      : [],
    doNow: Array.isArray(raw.doNow)
      ? raw.doNow
          .filter((i): i is string => typeof i === "string")
          .slice(0, 4)
          .map(sanitizeAskText)
      : [],
    askOrCheck: Array.isArray(raw.askOrCheck)
      ? raw.askOrCheck
          .filter((i): i is string => typeof i === "string")
          .slice(0, 4)
          .map(sanitizeAskText)
      : [],
    resources: validResources.length > 0 ? validResources.slice(0, 5) : ["resources_page"],
    clarifyingQuestion:
      typeof raw.clarifyingQuestion === "string"
        ? sanitizeAskText(raw.clarifyingQuestion)
        : null,
  };

  const parsed = AskResponseSchema.safeParse(sanitized);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

/**
 * Question-aware deterministic offline fallback response returned if all AI calls fail.
 * Inspects question keywords and returns targeted, high-utility, calm advice
 * using official Indian verification facts without verdict language or employer generalizations.
 */
export function getDeterministicAskFallback(userQuestion: string): AskResponse {
  const isHindi = /[\u0900-\u097F]/.test(userQuestion);
  const q = userQuestion.toLowerCase();

  // 1. Company registration / checking if exists / CIN / MCA
  const isRegistration = /\b(register|registered|registration|cin|mca|exist|exists|existence|legal entity|company name)\b/i.test(q);

  // 2. Payment / paid / asked to pay / UPI / bank transfer / fee / deposit / registration charges
  const isPayment = /\b(paid|pay|payment|upi|transfer|transferred|fee|fees|deposit|charge|charges|money|cost)\b/i.test(q);

  // 3. Documents / Aadhaar / PAN / bank details
  const isDocuments = /\b(aadhaar|pan|bank details|document|documents|id proof|passport|otp|voter id)\b/i.test(q);

  // 4. WhatsApp / Telegram / text interview
  const isMessaging = /\b(whatsapp|telegram|chat|message|messaging|sms|unsolicited|text)\b/i.test(q);

  const fallbackPrefix = "The AI service is unavailable right now, so this is general guidance.";

  if (isRegistration) {
    return {
      language: isHindi ? "hi" : "en",
      summary: `${fallbackPrefix} You can check entity records directly on the Ministry of Corporate Affairs (MCA) portal.`,
      whatThisMayMean: [
        "Registration on the Ministry of Corporate Affairs portal confirms that a company or LLP exists as a legal entity under that exact name.",
        "An MCA registration confirms corporate incorporation only and does not verify whether an individual recruiter is authorized to represent that organization.",
        "Unsolicited messages sometimes borrow names of registered entities while operating through separate, unofficial communication channels.",
      ],
      doNow: [
        "Visit the Ministry of Corporate Affairs portal at mca.gov.in and use the Check Company/LLP Name tool to search for the exact legal entity name.",
        "Review the registered office address, date of incorporation, and Corporate Identification Number (CIN) on public MCA records.",
        "Use the OfferClara research prompt with Perplexity to find official company domains, corporate office contact numbers, and public announcements.",
      ],
      askOrCheck: [
        "Does the email sender domain match the official domain of the registered company?",
        "Can you reach the registered corporate office telephone number listed on MCA records to confirm the opening?",
        "Is the Corporate Identification Number (CIN) quoted on the offer verifiable in MCA records?",
      ],
      resources: ["mca", "research_prompt", "resources_page"],
      clarifyingQuestion: null,
    };
  }

  if (isPayment) {
    return {
      language: isHindi ? "hi" : "en",
      summary: `${fallbackPrefix} Official guidelines state that internship registration and government portals do not charge candidates fees.`,
      whatThisMayMean: [
        "The AICTE National Internship Portal states that registration and internship applications are completely free for students.",
        "The National Career Service (NCS) guidelines state that candidates should never pay employers or intermediaries for job opportunities.",
        "Advisories from leading universities (including IITs and NITs) advise students that internships do not require upfront deposits, training charges, or processing fees.",
      ],
      doNow: [
        "If you have already transferred money, contact your bank or payment provider as soon as you can to report the transaction.",
        "Call the National Cyber Crime Helpline at 1930 or submit a formal report at cybercrime.gov.in with all transaction reference IDs.",
        "Preserve all transaction records, chat transcripts, payment slips, and email messages, following the guidance in /resources#already-paid.",
        "Do not make any additional or follow-up payments under any circumstances.",
      ],
      askOrCheck: [
        "Does any public advisory or official institutional placement guideline permit this payment requirement?",
        "Can the sender provide an official corporate GST invoice with the registered company PAN for the requested amount?",
        "Has your college training and placement cell recorded any prior relationship with this organisation?",
      ],
      resources: ["cybercrime", "aicte", "ncs", "resources_page"],
      clarifyingQuestion: null,
    };
  }

  if (isDocuments) {
    return {
      language: isHindi ? "hi" : "en",
      summary: `${fallbackPrefix} Identity and banking documents should only be shared after independent verification of the recipient.`,
      whatThisMayMean: [
        "Identity records such as Aadhaar, PAN cards, and bank account numbers can be misused if transmitted across unverified channels.",
        "Official employment processes collect bank details for payroll processing after formal onboarding, not during preliminary inquiry.",
        "Unverified intermediaries sometimes request government documents before providing verifiable organizational details.",
      ],
      doNow: [
        "Never share one-time passwords (OTPs), PINs, or net banking passwords with anyone.",
        "Use an Aadhaar copy with the first eight digits concealed if proof of identity is requested for initial evaluation.",
        "Confirm the recipient's corporate email domain and official entity standing before providing any official documentation.",
      ],
      askOrCheck: [
        "Why are bank account details or government identity records requested prior to a formal contract or joining date?",
        "Is there a secure corporate HR portal to upload documents rather than transmitting them through personal messaging channels?",
        "Can you verify the request directly through the company HR office listed on their official website?",
      ],
      resources: ["cybercrime", "mca", "resources_page"],
      clarifyingQuestion: null,
    };
  }

  if (isMessaging) {
    return {
      language: isHindi ? "hi" : "en",
      summary: `${fallbackPrefix} Offers and interviews conducted solely through personal messaging apps require independent verification.`,
      whatThisMayMean: [
        "Unsolicited messages on WhatsApp, Telegram, or SMS frequently use borrowed organization names without authorization.",
        "Recruitment conducted solely through text chats without verified video or in-person evaluation is irregular.",
        "Senders communicating through personal messaging handles lack verifiable links to the claimed corporate entity.",
      ],
      doNow: [
        "Do not transmit identity proofs, bank credentials, or payments through messaging applications.",
        "Look up the organization's official website independently to check their verified recruitment channels.",
        "Save screenshots and exported chat transcripts of all messages for your records.",
      ],
      askOrCheck: [
        "Can the recruiter correspond from an official corporate email domain instead of a personal messaging handle?",
        "Is the position listed in the career opportunities section on the company's official corporate website?",
        "Can you confirm the contact through the organization's official telephone switchboard?",
      ],
      resources: ["mca", "advisories", "resources_page"],
      clarifyingQuestion: null,
    };
  }

  // General / Other questions
  return {
    language: isHindi ? "hi" : "en",
    summary: `${fallbackPrefix} Review the terms of the offer carefully and verify facts through independent official sources.`,
    whatThisMayMean: [
      "Official government portals through AICTE and NCS provide public directories to verify employment and internship listings without charges.",
      "Independent institutional advisories recommend confirming offer terms directly with registered corporate headquarters.",
      "Offers containing unclear compensation, vague project scopes, or urgent deadlines warrant independent verification before commitment.",
    ],
    doNow: [
      "Check the entity registration on the Ministry of Corporate Affairs (MCA) portal at mca.gov.in using the Check Company/LLP Name tool.",
      "Consult your college training and placement cell to check whether the opportunity is recognized.",
      "Review the verification steps on the OfferClara resources page before sharing documents or accepting terms.",
    ],
    askOrCheck: [
      "What are the specific working hours, duration, and performance expectations in writing?",
      "Is the stipend amount and payment schedule explicitly documented in the offer letter?",
      "Does the contact email match the registered corporate domain of the organization?",
    ],
    resources: ["mca", "aicte", "ncs", "resources_page"],
    clarifyingQuestion: null,
  };
}

/**
 * Backwards compatibility alias for getDeterministicAskFallback.
 */
export const getOfflineFallbackAskResponse = getDeterministicAskFallback;
