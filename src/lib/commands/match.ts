import { WizardStep } from "@/lib/combined-text";

export type Command =
  | { kind: "NAVIGATE_WIZARD"; step: WizardStep }
  | { kind: "NAVIGATE_ROUTE"; route: "/" | "/check" | "/resources" | "/privacy" }
  | { kind: "ANALYSE" }
  | { kind: "CLEAR" }
  | { kind: "SAVE_PDF" }
  | { kind: "COPY_SUMMARY" }
  | { kind: "TOGGLE_THEME" }
  | { kind: "SCROLL_SECTION"; sectionId: string }
  | { kind: "LOAD_SAMPLE"; sampleId: string }
  | { kind: "UNKNOWN"; rawText: string };

export interface CommandContext {
  route?: string;
  currentStep?: WizardStep;
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
  "take me to",
  "navigate to",
  "switch to",
  "show me",
  "go to",
  "open up",
  "open",
  "jump to",
];

const FILLER_SUFFIXES = [
  "please",
  "now",
  "for me",
];

export function cleanSpokenInput(raw: string): string {
  // Replace internal commas or punctuation that might separate words (e.g. "Hey, take me to")
  let cleaned = raw
    .toLowerCase()
    .replace(/[,;:.!?]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Iteratively strip leading & trailing fillers
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of FILLER_PREFIXES) {
      if (cleaned === prefix) {
        // entire string is just the filler
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
        return "";
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
  context?: CommandContext
): Command {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { kind: "UNKNOWN", rawText: raw };
  }

  const cleaned = cleanSpokenInput(raw);
  if (!cleaned) {
    return { kind: "UNKNOWN", rawText: raw };
  }

  // 1. Wizard relative navigation: Next / Back
  if (
    cleaned === "next" ||
    cleaned === "next step" ||
    cleaned === "go next" ||
    cleaned === "continue" ||
    cleaned === "proceed"
  ) {
    const cur = context?.currentStep ?? 1;
    const nextStep = Math.min(5, cur + 1) as WizardStep;
    return { kind: "NAVIGATE_WIZARD", step: nextStep };
  }

  if (
    cleaned === "back" ||
    cleaned === "previous" ||
    cleaned === "previous step" ||
    cleaned === "go back"
  ) {
    const cur = context?.currentStep ?? 2;
    const prevStep = Math.max(1, cur - 1) as WizardStep;
    return { kind: "NAVIGATE_WIZARD", step: prevStep };
  }

  // 2. Wizard direct step navigation
  if (
    cleaned === "step 1" ||
    cleaned === "step one" ||
    cleaned === "offer" ||
    cleaned === "offer step" ||
    cleaned === "offer text" ||
    cleaned === "paste offer" ||
    cleaned === "first step"
  ) {
    return { kind: "NAVIGATE_WIZARD", step: 1 };
  }

  if (
    cleaned === "step 2" ||
    cleaned === "step two" ||
    cleaned === "source" ||
    cleaned === "source step" ||
    cleaned === "where did it come from" ||
    cleaned === "channel" ||
    cleaned === "second step"
  ) {
    return { kind: "NAVIGATE_WIZARD", step: 2 };
  }

  if (
    cleaned === "step 3" ||
    cleaned === "step three" ||
    cleaned === "conversation" ||
    cleaned === "conversation step" ||
    cleaned === "what was said" ||
    cleaned === "messages" ||
    cleaned === "third step"
  ) {
    return { kind: "NAVIGATE_WIZARD", step: 3 };
  }

  if (
    cleaned === "step 4" ||
    cleaned === "step four" ||
    cleaned === "money" ||
    cleaned === "payment" ||
    cleaned === "money and documents" ||
    cleaned === "fees" ||
    cleaned === "fourth step"
  ) {
    return { kind: "NAVIGATE_WIZARD", step: 4 };
  }

  if (
    cleaned === "step 5" ||
    cleaned === "step five" ||
    cleaned === "review" ||
    cleaned === "review step" ||
    cleaned === "summary" ||
    cleaned === "final step" ||
    cleaned === "last step"
  ) {
    return { kind: "NAVIGATE_WIZARD", step: 5 };
  }

  // 3. App routes
  if (
    cleaned === "home" ||
    cleaned === "landing" ||
    cleaned === "homepage" ||
    cleaned === "main page" ||
    cleaned === "welcome page"
  ) {
    return { kind: "NAVIGATE_ROUTE", route: "/" };
  }

  if (
    cleaned === "check" ||
    cleaned === "check tool" ||
    cleaned === "tool" ||
    cleaned === "tool page" ||
    cleaned === "check page" ||
    cleaned === "wizard" ||
    cleaned === "start check"
  ) {
    return { kind: "NAVIGATE_ROUTE", route: "/check" };
  }

  if (
    cleaned === "resources" ||
    cleaned === "helplines" ||
    cleaned === "support" ||
    cleaned === "help" ||
    cleaned === "resources page" ||
    cleaned === "official resources" ||
    cleaned === "guides"
  ) {
    return { kind: "NAVIGATE_ROUTE", route: "/resources" };
  }

  if (
    cleaned === "privacy" ||
    cleaned === "privacy policy" ||
    cleaned === "privacy page" ||
    cleaned === "about data" ||
    cleaned === "data policy"
  ) {
    return { kind: "NAVIGATE_ROUTE", route: "/privacy" };
  }

  // 4. Primary Actions
  if (
    cleaned === "analyze" ||
    cleaned === "analyse" ||
    cleaned === "run review" ||
    cleaned === "review offer" ||
    cleaned === "start review" ||
    cleaned === "check it" ||
    cleaned === "analyze offer" ||
    cleaned === "analyse offer" ||
    cleaned === "run analysis"
  ) {
    return { kind: "ANALYSE" };
  }

  if (
    cleaned === "clear" ||
    cleaned === "clear all" ||
    cleaned === "reset" ||
    cleaned === "start over" ||
    cleaned === "clear everything" ||
    cleaned === "clear session" ||
    cleaned === "new review"
  ) {
    return { kind: "CLEAR" };
  }

  if (
    cleaned === "save as pdf" ||
    cleaned === "save pdf" ||
    cleaned === "print" ||
    cleaned === "print pdf" ||
    cleaned === "print review" ||
    cleaned === "download pdf" ||
    cleaned === "export pdf"
  ) {
    return { kind: "SAVE_PDF" };
  }

  if (
    cleaned === "copy summary" ||
    cleaned === "copy to clipboard" ||
    cleaned === "copy text" ||
    cleaned === "copy review summary" ||
    cleaned === "copy"
  ) {
    return { kind: "COPY_SUMMARY" };
  }

  if (
    cleaned === "toggle theme" ||
    cleaned === "switch theme" ||
    cleaned === "dark mode" ||
    cleaned === "light mode" ||
    cleaned === "turn on dark mode" ||
    cleaned === "turn on light mode" ||
    cleaned === "change theme"
  ) {
    return { kind: "TOGGLE_THEME" };
  }

  // 5. Sections on review page
  if (
    cleaned === "observations" ||
    cleaned === "flags" ||
    cleaned === "concerns" ||
    cleaned === "show observations" ||
    cleaned === "findings"
  ) {
    return { kind: "SCROLL_SECTION", sectionId: "observations" };
  }

  if (
    cleaned === "missing details" ||
    cleaned === "what's missing" ||
    cleaned === "whats missing" ||
    cleaned === "missing info" ||
    cleaned === "gaps"
  ) {
    return { kind: "SCROLL_SECTION", sectionId: "missing-details" };
  }

  if (
    cleaned === "questions" ||
    cleaned === "checks" ||
    cleaned === "questions and checks" ||
    cleaned === "verification questions" ||
    cleaned === "self checks"
  ) {
    return { kind: "SCROLL_SECTION", sectionId: "questions-checks" };
  }

  if (
    cleaned === "company research" ||
    cleaned === "company check" ||
    cleaned === "research" ||
    cleaned === "company lookup"
  ) {
    return { kind: "SCROLL_SECTION", sectionId: "company-research" };
  }

  if (
    cleaned === "advisories" ||
    cleaned === "verified advisories" ||
    cleaned === "official advisories" ||
    cleaned === "alerts"
  ) {
    return { kind: "SCROLL_SECTION", sectionId: "advisories" };
  }

  if (
    cleaned === "your text" ||
    cleaned === "original text" ||
    cleaned === "offer snapshot" ||
    cleaned === "snapshot text"
  ) {
    return { kind: "SCROLL_SECTION", sectionId: "your-text" };
  }

  // 6. Samples
  if (
    cleaned === "load sample 1" ||
    cleaned === "sample 1" ||
    cleaned === "example 1"
  ) {
    return { kind: "LOAD_SAMPLE", sampleId: "example-1-ai-internship" };
  }

  if (
    cleaned === "load sample 2" ||
    cleaned === "sample 2" ||
    cleaned === "example 2"
  ) {
    return { kind: "LOAD_SAMPLE", sampleId: "example-2-data-entry-deposit" };
  }

  if (
    cleaned === "load sample 3" ||
    cleaned === "sample 3" ||
    cleaned === "example 3"
  ) {
    return { kind: "LOAD_SAMPLE", sampleId: "example-3-overseas-processing-fee" };
  }

  if (
    cleaned === "load sample 4" ||
    cleaned === "sample 4" ||
    cleaned === "example 4"
  ) {
    return { kind: "LOAD_SAMPLE", sampleId: "example-4-legit-startup-internship" };
  }

  if (
    cleaned === "load sample 5" ||
    cleaned === "sample 5" ||
    cleaned === "example 5" ||
    cleaned === "try phone call sample" ||
    cleaned === "phone call sample"
  ) {
    return { kind: "LOAD_SAMPLE", sampleId: "example-5-phone-call-account" };
  }

  if (
    cleaned === "load sample 6" ||
    cleaned === "sample 6" ||
    cleaned === "example 6" ||
    cleaned === "try helix sample" ||
    cleaned === "helix sample"
  ) {
    return { kind: "LOAD_SAMPLE", sampleId: "example-6-skillcraft-helixbrattice" };
  }

  if (
    cleaned === "sample a" ||
    cleaned === "full sample a" ||
    cleaned === "try course sample" ||
    cleaned === "course sample"
  ) {
    return { kind: "LOAD_SAMPLE", sampleId: "full-sample-a" };
  }

  if (
    cleaned === "sample b" ||
    cleaned === "full sample b"
  ) {
    return { kind: "LOAD_SAMPLE", sampleId: "full-sample-b" };
  }

  return { kind: "UNKNOWN", rawText: raw };
}
