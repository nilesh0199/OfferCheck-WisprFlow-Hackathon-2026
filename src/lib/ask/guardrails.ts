import { AskResponse, AskResponseSchema, AskResourceId } from "./schema";

const FORBIDDEN_WORDS_REGEX = /\b(scam|scammer|scammers|fraud|fraudulent|frauds)\b/gi;
const VERDICT_PHRASES_REGEX = /\b(verified safe|guaranteed legit|definitely a scam|categorically fraud|100% genuine)\b/gi;

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
 * Sanitizes any stray verdict language or forbidden scam/fraud words from model output.
 */
export function sanitizeAskText(text: string): string {
  if (!text) return "";
  let clean = text.replace(VERDICT_PHRASES_REGEX, "irregular pattern");
  clean = clean.replace(FORBIDDEN_WORDS_REGEX, (match) => {
    const lower = match.toLowerCase();
    if (lower === "scam" || lower === "fraud") return "paid or unauthorised scheme";
    if (lower === "scammer" || lower === "scammers") return "unauthorised sender";
    if (lower === "fraudulent") return "unauthorised";
    return "unauthorised scheme";
  });
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
 * Deterministic offline fallback response returned if all AI calls fail.
 * Uses official Indian verification facts without verdict language.
 */
export function getOfflineFallbackAskResponse(userQuestion: string): AskResponse {
  const isHindi = /[\u0900-\u097F]/.test(userQuestion);

  if (isHindi) {
    return {
      language: "hi",
      summary:
        "इंटर्नशिप से जुड़े संदेह के लिए बुनियादी सुरक्षा दिशानिर्देश। किसी भी इंटर्नशिप के लिए अग्रिम शुल्क न दें।",
      whatThisMayMean: [
        "प्रामाणिक कंपनियां सामान्यतः इंटर्नशिप आवेदन, प्रशिक्षण या चयन के लिए पैसे नहीं मांगती हैं।",
        "यदि आपसे सुरक्षा जमा या लैपटॉप शुल्क मांगा जा रहा है, तो यह अनधिकृत योजना हो सकती है।",
        "व्हाट्सएप या टेलीग्राम पर व्यक्तिगत नंबरों से संपर्क की पुष्टि कंपनी के आधिकारिक ईमेल से करें।",
      ],
      doNow: [
        "किसी भी खाते या यूपीआई आईडी पर पैसे न भेजें।",
        "यदि आपने पैसे भेजे हैं, तो तुरंत 1930 पर कॉल करें या cybercrime.gov.in पर रिपोर्ट करें।",
        "सभी संदेशों, ईमेल और भुगतान रसीदों के स्क्रीनशॉट सुरक्षित रखें।",
      ],
      askOrCheck: [
        "कंपनी की आधिकारिक वेबसाइट और डोमेन ईमेल पते की जांच करें।",
        "कॉर्पोरेट मामलों के मंत्रालय (MCA) पोर्टल पर कंपनी का पंजीकरण नाम जांचें।",
        "क्या कॉलेज प्लेसमेंट सेल के पास इस संगठन का कोई आधिकारिक रिकॉर्ड है?",
      ],
      resources: ["cybercrime", "mca", "aicte", "resources_page"],
      clarifyingQuestion: null,
    };
  }

  return {
    language: "en",
    summary:
      "General verification guidance for internship inquiries. Employers do not demand upfront fees from students.",
    whatThisMayMean: [
      "Authentic internship providers rarely ask candidates to pay for training, security deposits, or software licenses.",
      "Unsolicited recruitment offers via messaging apps without an official corporate email domain warrant careful checking.",
      "Authentic employers do not issue legal threats or police complaints to students who decline an offer.",
    ],
    doNow: [
      "Do not send payments, bank details, or copies of government IDs.",
      "If you have already transferred money, report immediately via the 1930 national helpline or cybercrime.gov.in.",
      "Preserve all communications, transaction IDs, and screenshots in a secure folder.",
    ],
    askOrCheck: [
      "Check whether communications originate from an official domain email address.",
      "Verify the legal entity name on the Ministry of Corporate Affairs (mca.gov.in) portal.",
      "Consult your college training and placement cell to see if the organisation is known or registered.",
    ],
    resources: ["cybercrime", "mca", "aicte", "resources_page"],
    clarifyingQuestion: null,
  };
}
