import { describe, it, expect } from "vitest";
import { matchCommand, cleanSpokenInput } from "@/lib/commands/match";

describe("cleanSpokenInput helper", () => {
  it("strips trailing punctuation and lowercases", () => {
    expect(cleanSpokenInput("  ANALYSE NOW!??  ")).toBe("analyse");
    expect(cleanSpokenInput("Step 3.")).toBe("step 3");
  });

  it("strips single and chained filler prefixes", () => {
    expect(cleanSpokenInput("please go to step 2")).toBe("step 2");
    expect(cleanSpokenInput("can you please open resources?")).toBe("resources");
    expect(cleanSpokenInput("hey take me to privacy!")).toBe("privacy");
    expect(cleanSpokenInput("could you please switch to dark mode?")).toBe("dark mode");
    expect(cleanSpokenInput("would you show me observations")).toBe("observations");
  });

  it("handles purely filler input gracefully", () => {
    expect(cleanSpokenInput("please")).toBe("");
    expect(cleanSpokenInput("hey")).toBe("");
    expect(cleanSpokenInput("can you please")).toBe("");
  });
});

describe("matchCommand - 80+ test cases", () => {
  // --- Group 1: Direct Wizard Step Navigation (15 tests) ---
  it("matches step 1 correctly across variants", () => {
    expect(matchCommand("step 1")).toEqual({ kind: "NAVIGATE_WIZARD", step: 1 });
    expect(matchCommand("STEP ONE")).toEqual({ kind: "NAVIGATE_WIZARD", step: 1 });
    expect(matchCommand("offer")).toEqual({ kind: "NAVIGATE_WIZARD", step: 1 });
    expect(matchCommand("offer step")).toEqual({ kind: "NAVIGATE_WIZARD", step: 1 });
    expect(matchCommand("first step")).toEqual({ kind: "NAVIGATE_WIZARD", step: 1 });
  });

  it("matches step 2 correctly across variants", () => {
    expect(matchCommand("step 2")).toEqual({ kind: "NAVIGATE_WIZARD", step: 2 });
    expect(matchCommand("please go to step 2")).toEqual({ kind: "NAVIGATE_WIZARD", step: 2 });
    expect(matchCommand("where did it come from?")).toEqual({ kind: "NAVIGATE_WIZARD", step: 2 });
    expect(matchCommand("source")).toEqual({ kind: "NAVIGATE_WIZARD", step: 2 });
    expect(matchCommand("source step")).toEqual({ kind: "NAVIGATE_WIZARD", step: 2 });
    expect(matchCommand("second step")).toEqual({ kind: "NAVIGATE_WIZARD", step: 2 });
  });

  it("matches step 3 correctly across variants", () => {
    expect(matchCommand("step 3")).toEqual({ kind: "NAVIGATE_WIZARD", step: 3 });
    expect(matchCommand("step three")).toEqual({ kind: "NAVIGATE_WIZARD", step: 3 });
    expect(matchCommand("conversation")).toEqual({ kind: "NAVIGATE_WIZARD", step: 3 });
    expect(matchCommand("what was said?")).toEqual({ kind: "NAVIGATE_WIZARD", step: 3 });
    expect(matchCommand("messages")).toEqual({ kind: "NAVIGATE_WIZARD", step: 3 });
    expect(matchCommand("third step")).toEqual({ kind: "NAVIGATE_WIZARD", step: 3 });
  });

  it("matches step 4 correctly across variants", () => {
    expect(matchCommand("step 4")).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
    expect(matchCommand("step four")).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
    expect(matchCommand("money")).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
    expect(matchCommand("payment")).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
    expect(matchCommand("money and documents")).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
    expect(matchCommand("fees")).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
    expect(matchCommand("fourth step")).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
  });

  it("matches step 5 correctly across variants", () => {
    expect(matchCommand("step 5")).toEqual({ kind: "NAVIGATE_WIZARD", step: 5 });
    expect(matchCommand("step five")).toEqual({ kind: "NAVIGATE_WIZARD", step: 5 });
    expect(matchCommand("review")).toEqual({ kind: "NAVIGATE_WIZARD", step: 5 });
    expect(matchCommand("review step")).toEqual({ kind: "NAVIGATE_WIZARD", step: 5 });
    expect(matchCommand("summary")).toEqual({ kind: "NAVIGATE_WIZARD", step: 5 });
    expect(matchCommand("final step")).toEqual({ kind: "NAVIGATE_WIZARD", step: 5 });
    expect(matchCommand("last step")).toEqual({ kind: "NAVIGATE_WIZARD", step: 5 });
  });

  // --- Group 2: Relative Step Navigation (8 tests) ---
  it("navigates next and back with context awareness", () => {
    expect(matchCommand("next", { currentStep: 1 })).toEqual({ kind: "NAVIGATE_WIZARD", step: 2 });
    expect(matchCommand("next step", { currentStep: 3 })).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
    expect(matchCommand("continue", { currentStep: 4 })).toEqual({ kind: "NAVIGATE_WIZARD", step: 5 });
    expect(matchCommand("proceed", { currentStep: 5 })).toEqual({ kind: "NAVIGATE_WIZARD", step: 5 });
    expect(matchCommand("back", { currentStep: 5 })).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
    expect(matchCommand("previous step", { currentStep: 2 })).toEqual({ kind: "NAVIGATE_WIZARD", step: 1 });
    expect(matchCommand("go back", { currentStep: 1 })).toEqual({ kind: "NAVIGATE_WIZARD", step: 1 });
    expect(matchCommand("next")).toEqual({ kind: "NAVIGATE_WIZARD", step: 2 }); // default when context missing
  });

  // --- Group 3: Route Navigation (12 tests) ---
  it("navigates to application routes", () => {
    expect(matchCommand("home")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/" });
    expect(matchCommand("landing")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/" });
    expect(matchCommand("homepage")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/" });
    expect(matchCommand("take me to main page")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/" });

    expect(matchCommand("check")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/check" });
    expect(matchCommand("tool")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/check" });
    expect(matchCommand("check tool")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/check" });
    expect(matchCommand("go to check page")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/check" });

    expect(matchCommand("resources")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/resources" });
    expect(matchCommand("helplines")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/resources" });
    expect(matchCommand("support")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/resources" });
    expect(matchCommand("privacy")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/privacy" });
    expect(matchCommand("privacy policy")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/privacy" });
    expect(matchCommand("data policy")).toEqual({ kind: "NAVIGATE_ROUTE", route: "/privacy" });
  });

  // --- Group 4: Primary Actions (14 tests) ---
  it("recognizes analyze action phrases", () => {
    expect(matchCommand("analyze")).toEqual({ kind: "ANALYSE" });
    expect(matchCommand("analyse")).toEqual({ kind: "ANALYSE" });
    expect(matchCommand("run review")).toEqual({ kind: "ANALYSE" });
    expect(matchCommand("review offer")).toEqual({ kind: "ANALYSE" });
    expect(matchCommand("start review")).toEqual({ kind: "ANALYSE" });
    expect(matchCommand("check it")).toEqual({ kind: "ANALYSE" });
    expect(matchCommand("please analyse offer!")).toEqual({ kind: "ANALYSE" });
  });

  it("recognizes clear and reset actions", () => {
    expect(matchCommand("clear")).toEqual({ kind: "CLEAR" });
    expect(matchCommand("clear all")).toEqual({ kind: "CLEAR" });
    expect(matchCommand("reset")).toEqual({ kind: "CLEAR" });
    expect(matchCommand("start over")).toEqual({ kind: "CLEAR" });
    expect(matchCommand("can you clear everything?")).toEqual({ kind: "CLEAR" });
  });

  it("recognizes PDF export and clipboard actions", () => {
    expect(matchCommand("save as pdf")).toEqual({ kind: "SAVE_PDF" });
    expect(matchCommand("print")).toEqual({ kind: "SAVE_PDF" });
    expect(matchCommand("download pdf")).toEqual({ kind: "SAVE_PDF" });
    expect(matchCommand("copy summary")).toEqual({ kind: "COPY_SUMMARY" });
    expect(matchCommand("copy to clipboard")).toEqual({ kind: "COPY_SUMMARY" });
  });

  // --- Group 5: Theme Toggling (6 tests) ---
  it("recognizes theme toggles", () => {
    expect(matchCommand("toggle theme")).toEqual({ kind: "TOGGLE_THEME" });
    expect(matchCommand("switch theme")).toEqual({ kind: "TOGGLE_THEME" });
    expect(matchCommand("dark mode")).toEqual({ kind: "TOGGLE_THEME" });
    expect(matchCommand("light mode")).toEqual({ kind: "TOGGLE_THEME" });
    expect(matchCommand("turn on dark mode")).toEqual({ kind: "TOGGLE_THEME" });
    expect(matchCommand("turn on light mode")).toEqual({ kind: "TOGGLE_THEME" });
  });

  // --- Group 6: Section Scrolling (12 tests) ---
  it("recognizes review sections", () => {
    expect(matchCommand("observations")).toEqual({ kind: "SCROLL_SECTION", sectionId: "observations" });
    expect(matchCommand("flags")).toEqual({ kind: "SCROLL_SECTION", sectionId: "observations" });
    expect(matchCommand("concerns")).toEqual({ kind: "SCROLL_SECTION", sectionId: "observations" });

    expect(matchCommand("missing details")).toEqual({ kind: "SCROLL_SECTION", sectionId: "missing-details" });
    expect(matchCommand("what's missing")).toEqual({ kind: "SCROLL_SECTION", sectionId: "missing-details" });
    expect(matchCommand("whats missing")).toEqual({ kind: "SCROLL_SECTION", sectionId: "missing-details" });

    expect(matchCommand("questions")).toEqual({ kind: "SCROLL_SECTION", sectionId: "questions-checks" });
    expect(matchCommand("checks")).toEqual({ kind: "SCROLL_SECTION", sectionId: "questions-checks" });
    expect(matchCommand("questions and checks")).toEqual({ kind: "SCROLL_SECTION", sectionId: "questions-checks" });

    expect(matchCommand("company research")).toEqual({ kind: "SCROLL_SECTION", sectionId: "company-research" });
    expect(matchCommand("company check")).toEqual({ kind: "SCROLL_SECTION", sectionId: "company-research" });

    expect(matchCommand("advisories")).toEqual({ kind: "SCROLL_SECTION", sectionId: "advisories" });
    expect(matchCommand("your text")).toEqual({ kind: "SCROLL_SECTION", sectionId: "your-text" });
  });

  // --- Group 7: Sample Loading (12 tests) ---
  it("recognizes sample loading commands", () => {
    expect(matchCommand("sample 1")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "example-1-ai-internship" });
    expect(matchCommand("load sample 1")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "example-1-ai-internship" });
    expect(matchCommand("sample 2")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "example-2-data-entry-deposit" });
    expect(matchCommand("sample 3")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "example-3-overseas-processing-fee" });
    expect(matchCommand("sample 4")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "example-4-legit-startup-internship" });
    expect(matchCommand("sample 5")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "example-5-phone-call-account" });
    expect(matchCommand("try phone call sample")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "example-5-phone-call-account" });
    expect(matchCommand("sample 6")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "example-6-skillcraft-helixbrattice" });
    expect(matchCommand("try helix sample")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "example-6-skillcraft-helixbrattice" });
    expect(matchCommand("sample a")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "full-sample-a" });
    expect(matchCommand("try course sample")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "full-sample-a" });
    expect(matchCommand("sample b")).toEqual({ kind: "LOAD_SAMPLE", sampleId: "full-sample-b" });
  });

  // --- Group 8: Spoken Filler Variations & Punctuation (10 tests) ---
  it("handles complex spoken sentences and punctuation gracefully", () => {
    expect(matchCommand("Could you please show me observations?")).toEqual({
      kind: "SCROLL_SECTION",
      sectionId: "observations",
    });
    expect(matchCommand("Can you please run review now!")).toEqual({ kind: "ANALYSE" });
    expect(matchCommand("Hey, take me to privacy policy")).toEqual({
      kind: "NAVIGATE_ROUTE",
      route: "/privacy",
    });
    expect(matchCommand("Would you please save as pdf?")).toEqual({ kind: "SAVE_PDF" });
    expect(matchCommand("Just copy summary.")).toEqual({ kind: "COPY_SUMMARY" });
    expect(matchCommand("Open up official resources")).toEqual({
      kind: "NAVIGATE_ROUTE",
      route: "/resources",
    });
    expect(matchCommand("Jump to step 4...")).toEqual({ kind: "NAVIGATE_WIZARD", step: 4 });
  });

  // --- Group 9: Unknown / Arbitrary Dictation (8 tests) ---
  it("returns UNKNOWN for arbitrary dictated offer text or unknown phrases", () => {
    const paragraph = "The recruiter called me on WhatsApp and said I have to deposit 5000 rupees today.";
    expect(matchCommand(paragraph)).toEqual({ kind: "UNKNOWN", rawText: paragraph });

    expect(matchCommand("")).toEqual({ kind: "UNKNOWN", rawText: "" });
    expect(matchCommand("   ")).toEqual({ kind: "UNKNOWN", rawText: "   " });
    expect(matchCommand("hello world")).toEqual({ kind: "UNKNOWN", rawText: "hello world" });
    expect(matchCommand("is this a legit internship")).toEqual({
      kind: "UNKNOWN",
      rawText: "is this a legit internship",
    });
    expect(matchCommand("please")).toEqual({ kind: "UNKNOWN", rawText: "please" });
    expect(matchCommand("random noise 12345")).toEqual({
      kind: "UNKNOWN",
      rawText: "random noise 12345",
    });
  });
});
