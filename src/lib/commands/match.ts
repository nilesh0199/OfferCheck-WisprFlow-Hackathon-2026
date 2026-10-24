export type Command =
  | { kind: "OPEN_SIDEBAR" }
  | { kind: "CLOSE_SIDEBAR" }
  | { kind: "SHOW_HELP" }
  | { kind: "NAVIGATE"; target: string; label: string }
  | { kind: "WIZARD_NEXT" }
  | { kind: "WIZARD_BACK" }
  | { kind: "WIZARD_SKIP" }
  | { kind: "WIZARD_GOTO_STEP"; step: 1 | 2 | 3 | 4 | 5; label: string }
  | { kind: "ANALYSE" }
  | { kind: "JUMP_SECTION"; sectionId: string; label: string }
  | { kind: "EDIT_ANSWERS" }
  | { kind: "WRONG_CONTEXT"; hint: string }
  | { kind: "UNKNOWN"; rawText: string };

export interface CommandContext {
  page: string;
  step?: number;
  hasReview?: boolean;
}

const FILLER_PREFIXES = [
  "could you please",
  "can you please",
  "would you please",
  "can you",
  "could you",
  "would you",
  "please",
  "hey",
  "just",
  "now",
  "take me to the",
  "take me to",
  "navigate to the",
  "navigate to",
  "go to the",
  "go to",
  "show me the",
  "show me",
  "tell me the",
  "tell me",
  "open up the",
  "open up",
  "open the",
  "open",
  "jump to the",
  "jump to",
  "switch to the",
  "switch to",
];

const FILLER_SUFFIXES = [
  "please",
  "now",
  "for me",
  "page",
  "section",
];

export function cleanSpokenInput(raw: string): string {
  let cleaned = raw
    .toLowerCase()
    .replace(/[,;:.!?]+/g, " ")
    .replace(/\bside\s+bar\b/g, "sidebar")
    .replace(/\bmenu\s+bar\b/g, "menu")
    .replace(/\bhome\s+page\b/g, "homepage")
    .replace(/\s+/g, " ")
    .trim();

  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of FILLER_PREFIXES) {
      if (cleaned === prefix) {
        return "";
      }
      if (cleaned.startsWith(prefix + " ")) {
        cleaned = cleaned.slice(prefix.length + 1).trim();
        changed = true;
        break;
      }
    }
    for (const suffix of FILLER_SUFFIXES) {
      if (cleaned === suffix) {
        // Keep solitary "privacy", "about", etc. Don't erase if it's a command name
        break;
      }
      if (cleaned.endsWith(" " + suffix)) {
        cleaned = cleaned.slice(0, cleaned.length - suffix.length - 1).trim();
        changed = true;
        break;
      }
    }
  }

  return cleaned.replace(/\s+/g, " ").trim();
}

export function matchCommand(
  raw: string,
  context: CommandContext = { page: "/" }
): Command {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { kind: "UNKNOWN", rawText: raw };
  }

  const cleaned = cleanSpokenInput(raw);
  if (!cleaned) {
    return { kind: "UNKNOWN", rawText: raw };
  }

  // Reject long dictated paragraphs (> 6 words) from triggering commands
  const words = cleaned.split(" ").filter(Boolean);
  if (words.length > 6) {
    return { kind: "UNKNOWN", rawText: raw };
  }

  // =========================================================================
  // 1. ANYWHERE COMMANDS (Work on every page)
  // =========================================================================

  // Sidebar controls
  if (
    cleaned === "close" ||
    cleaned === "close it" ||
    cleaned === "close please" ||
    cleaned === "dismiss" ||
    cleaned === "hide" ||
    cleaned === "shut" ||
    cleaned === "exit" ||
    cleaned === "close sidebar" ||
    cleaned === "close menu" ||
    cleaned === "hide sidebar" ||
    cleaned === "hide menu" ||
    cleaned === "dismiss sidebar" ||
    cleaned === "dismiss menu" ||
    cleaned === "exit sidebar" ||
    cleaned === "exit menu" ||
    cleaned === "shut sidebar" ||
    cleaned === "shut menu" ||
    (words.length <= 4 &&
      /\b(close|hide|dismiss|exit|shut)\b/.test(cleaned) &&
      /\b(sidebar|menu)\b/.test(cleaned))
  ) {
    return { kind: "CLOSE_SIDEBAR" };
  }

  if (
    cleaned === "open sidebar" ||
    cleaned === "open menu" ||
    cleaned === "show sidebar" ||
    cleaned === "show menu" ||
    cleaned === "toggle sidebar" ||
    cleaned === "toggle menu" ||
    cleaned === "menu" ||
    cleaned === "sidebar" ||
    cleaned === "navigation" ||
    cleaned === "open navigation" ||
    (words.length <= 4 &&
      /\b(open|show|toggle|view)\b/.test(cleaned) &&
      /\b(sidebar|menu|navigation)\b/.test(cleaned)) ||
    (words.length <= 2 && /\b(sidebar|menu)\b/.test(cleaned))
  ) {
    return { kind: "OPEN_SIDEBAR" };
  }

  // Help / What can I say dialog
  if (
    cleaned === "what can i say" ||
    cleaned === "what can i do" ||
    cleaned === "what commands can i say" ||
    cleaned === "commands" ||
    cleaned === "show commands" ||
    cleaned === "list commands" ||
    cleaned === "help with commands" ||
    cleaned === "command help" ||
    cleaned === "voice commands" ||
    cleaned === "command list" ||
    (words.length <= 6 &&
      /\b(what can i say|what can i do|show commands|list commands|voice commands|command help)\b/.test(
        cleaned
      ))
  ) {
    return { kind: "SHOW_HELP" };
  }

  // Home
  if (
    cleaned === "home" ||
    cleaned === "homepage" ||
    cleaned === "landing" ||
    cleaned === "main" ||
    cleaned === "welcome" ||
    cleaned === "go home" ||
    cleaned === "go to home" ||
    cleaned === "back to home" ||
    cleaned === "take me home"
  ) {
    return { kind: "NAVIGATE", target: "/", label: "Home" };
  }

  // Check an offer
  if (
    cleaned === "check an offer" ||
    cleaned === "check offer" ||
    cleaned === "check" ||
    cleaned === "start check" ||
    cleaned === "check tool" ||
    cleaned === "go to check" ||
    cleaned === "check my offer" ||
    cleaned === "check this offer" ||
    cleaned === "verify offer" ||
    cleaned === "verify an offer" ||
    cleaned === "verify my offer" ||
    cleaned === "verify internship" ||
    (words.length <= 4 &&
      /\b(check|verify)\b/.test(cleaned) &&
      /\b(offer|internship|job|letter)\b/.test(cleaned))
  ) {
    return { kind: "NAVIGATE", target: "/check", label: "Check an offer" };
  }

  // Help and reporting / Resources
  if (
    cleaned === "help and reporting" ||
    cleaned === "reporting" ||
    cleaned === "official resources" ||
    cleaned === "help" ||
    cleaned === "report" ||
    cleaned === "report scam" ||
    cleaned === "report fake offer" ||
    cleaned === "official portals" ||
    cleaned === "complaint" ||
    (words.length <= 4 && /\b(report|reporting|helpline)\b/.test(cleaned))
  ) {
    return { kind: "NAVIGATE", target: "/resources", label: "Help and reporting" };
  }

  // Clear doubt with AI
  if (
    cleaned === "ask" ||
    cleaned === "ask ai" ||
    cleaned === "clear doubt" ||
    cleaned === "clear my doubt" ||
    cleaned === "clear doubts" ||
    cleaned === "ask a doubt" ||
    cleaned === "ask doubt" ||
    cleaned === "doubt" ||
    cleaned === "doubts" ||
    cleaned === "ask question" ||
    cleaned === "ask a question" ||
    cleaned === "clear my doubts" ||
    cleaned === "have a doubt" ||
    (words.length <= 4 && /\b(doubt|doubts)\b/.test(cleaned)) ||
    (words.length <= 4 && /\bask\b/.test(cleaned) && /\b(ai|question|clara|doubt)\b/.test(cleaned))
  ) {
    return { kind: "NAVIGATE", target: "/ask", label: "Clear doubt with AI" };
  }

  // If user says "resources":
  // On check page with a review, jumps to Resources section; otherwise navigates to /resources
  if (cleaned === "resources") {
    if (context.page === "/check" && context.hasReview) {
      return { kind: "JUMP_SECTION", sectionId: "section-advisories", label: "Resources" };
    }
    return { kind: "NAVIGATE", target: "/resources", label: "Help and reporting" };
  }

  // About
  if (
    cleaned === "about" ||
    cleaned === "who made this" ||
    cleaned === "who made offerclara" ||
    cleaned === "about offerclara" ||
    cleaned === "about tool" ||
    cleaned === "who built this" ||
    cleaned === "about us"
  ) {
    return { kind: "NAVIGATE", target: "/about", label: "About" };
  }

  // Privacy
  if (
    cleaned === "privacy" ||
    cleaned === "privacy policy" ||
    cleaned === "data privacy" ||
    cleaned === "data policy"
  ) {
    return { kind: "NAVIGATE", target: "/privacy", label: "Privacy" };
  }

  // Landing anchor jumps
  if (
    cleaned === "how it works" ||
    cleaned === "how does it work" ||
    cleaned === "how this works" ||
    cleaned === "how does this work" ||
    cleaned === "how work" ||
    (words.length <= 4 && /\b(how)\b/.test(cleaned) && /\b(work|works)\b/.test(cleaned))
  ) {
    return { kind: "NAVIGATE", target: "/#how-it-works", label: "How it works" };
  }

  if (
    cleaned === "what you get" ||
    cleaned === "what do i get" ||
    cleaned === "what i get" ||
    cleaned === "what we get" ||
    cleaned === "features" ||
    (words.length <= 4 && /\b(what)\b/.test(cleaned) && /\b(get)\b/.test(cleaned))
  ) {
    return { kind: "NAVIGATE", target: "/#what-you-get", label: "What you get" };
  }

  if (
    cleaned === "faq" ||
    cleaned === "faqs" ||
    cleaned === "frequently asked questions" ||
    cleaned === "frequently asked question" ||
    cleaned === "questions and answers" ||
    cleaned === "question and answer" ||
    cleaned === "frequently asked" ||
    cleaned === "q and a" ||
    cleaned === "q&a" ||
    cleaned === "faq section" ||
    (words.length <= 4 && /\b(faq|faqs)\b/.test(cleaned))
  ) {
    return { kind: "NAVIGATE", target: "/#faq", label: "FAQ" };
  }

  // Already paid
  if (
    cleaned === "i paid" ||
    cleaned === "i already paid" ||
    cleaned === "already paid" ||
    cleaned === "i have paid" ||
    cleaned === "i paid money" ||
    cleaned === "paid money" ||
    cleaned === "paid fee" ||
    cleaned === "sent money"
  ) {
    return { kind: "NAVIGATE", target: "/resources#already-paid", label: "If you have already paid" };
  }

  // =========================================================================
  // 2. CHECK PAGE ONLY COMMANDS
  // =========================================================================
  const isCheckPage = context.page === "/check";

  // Stepper relative: Next
  if (
    cleaned === "next" ||
    cleaned === "next step" ||
    cleaned === "go next" ||
    cleaned === "continue" ||
    cleaned === "proceed"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "WIZARD_NEXT" };
  }

  // Stepper relative: Back
  if (
    cleaned === "back" ||
    cleaned === "previous" ||
    cleaned === "previous step" ||
    cleaned === "go back"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "WIZARD_BACK" };
  }

  // Stepper relative: Skip
  if (
    cleaned === "skip" ||
    cleaned === "skip step" ||
    cleaned === "skip this step"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "WIZARD_SKIP" };
  }

  // Step 1: Offer
  if (
    cleaned === "step 1" ||
    cleaned === "step one" ||
    cleaned === "offer" ||
    cleaned === "offer step" ||
    cleaned === "offer text" ||
    cleaned === "first step"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "WIZARD_GOTO_STEP", step: 1, label: "Offer" };
  }

  // Step 2: Source
  if (
    cleaned === "step 2" ||
    cleaned === "step two" ||
    cleaned === "source" ||
    cleaned === "source step" ||
    cleaned === "channel" ||
    cleaned === "second step"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "WIZARD_GOTO_STEP", step: 2, label: "Source" };
  }

  // Step 3: Conversation
  if (
    cleaned === "step 3" ||
    cleaned === "step three" ||
    cleaned === "conversation" ||
    cleaned === "conversation step" ||
    cleaned === "what was said" ||
    cleaned === "third step"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "WIZARD_GOTO_STEP", step: 3, label: "Conversation" };
  }

  // Step 4: Money and documents
  if (
    cleaned === "step 4" ||
    cleaned === "step four" ||
    cleaned === "money and documents" ||
    cleaned === "money" ||
    cleaned === "payment" ||
    cleaned === "documents" ||
    cleaned === "fees" ||
    cleaned === "fourth step"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "WIZARD_GOTO_STEP", step: 4, label: "Money and documents" };
  }

  // Step 5: Review
  if (
    cleaned === "step 5" ||
    cleaned === "step five" ||
    cleaned === "review step" ||
    cleaned === "final step" ||
    cleaned === "last step"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "WIZARD_GOTO_STEP", step: 5, label: "Review" };
  }

  // Action: Analyse
  if (
    cleaned === "analyse" ||
    cleaned === "analyze" ||
    cleaned === "run review" ||
    cleaned === "review offer" ||
    cleaned === "start review" ||
    cleaned === "check it" ||
    cleaned === "analyze offer" ||
    cleaned === "analyse offer" ||
    cleaned === "run analysis"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "ANALYSE" };
  }

  // Post-review section jumps: Overview
  if (cleaned === "overview") {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "JUMP_SECTION", sectionId: "section-summary", label: "Overview" };
  }

  // Post-review section jumps: Observations
  if (
    cleaned === "observations" ||
    cleaned === "flags" ||
    cleaned === "concerns" ||
    cleaned === "findings"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "JUMP_SECTION", sectionId: "section-observations", label: "Observations" };
  }

  // Post-review section jumps: Missing details
  if (
    cleaned === "missing details" ||
    cleaned === "what's missing" ||
    cleaned === "whats missing" ||
    cleaned === "missing info" ||
    cleaned === "gaps"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "JUMP_SECTION", sectionId: "section-missing", label: "Missing details" };
  }

  // Post-review section jumps: Questions & checks
  if (
    cleaned === "questions" ||
    cleaned === "checks" ||
    cleaned === "questions and checks" ||
    cleaned === "verification questions" ||
    cleaned === "self checks"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "JUMP_SECTION", sectionId: "section-questions", label: "Questions and checks" };
  }

  // Post-review section jumps: Company research
  if (
    cleaned === "company research" ||
    cleaned === "company check" ||
    cleaned === "research" ||
    cleaned === "research the company"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "JUMP_SECTION", sectionId: "section-research", label: "Company research" };
  }

  // Post-review section jumps: Advisories / Resources
  if (
    cleaned === "advisories" ||
    cleaned === "official advisories"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "JUMP_SECTION", sectionId: "section-advisories", label: "Resources" };
  }

  // Post-review section jumps: Your text / My text
  if (
    cleaned === "your text" ||
    cleaned === "my text" ||
    cleaned === "original text" ||
    cleaned === "offer snapshot"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "JUMP_SECTION", sectionId: "section-your-text", label: "Your text" };
  }

  // Post-review: Edit answers
  if (
    cleaned === "edit my answers" ||
    cleaned === "edit answers" ||
    cleaned === "edit text" ||
    cleaned === "edit offer"
  ) {
    if (!isCheckPage) {
      return { kind: "WRONG_CONTEXT", hint: "That command works on the check page." };
    }
    return { kind: "EDIT_ANSWERS" };
  }

  // Any other input is unrecognised
  return { kind: "UNKNOWN", rawText: raw };
}
