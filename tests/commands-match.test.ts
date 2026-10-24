import { describe, it, expect } from "vitest";
import { matchCommand, cleanSpokenInput } from "@/lib/commands/match";

describe("cleanSpokenInput helper", () => {
  it("strips trailing punctuation and lowercases", () => {
    expect(cleanSpokenInput("  ANALYSE NOW!??  ")).toBe("analyse");
    expect(cleanSpokenInput("Step 3.")).toBe("step 3");
    expect(cleanSpokenInput("Check an offer, please!")).toBe("check an offer");
  });

  it("strips leading filler prefixes", () => {
    expect(cleanSpokenInput("please go to step 2")).toBe("step 2");
    expect(cleanSpokenInput("can you please open help and reporting?")).toBe("help and reporting");
    expect(cleanSpokenInput("hey take me to privacy!")).toBe("privacy");
    expect(cleanSpokenInput("could you please show me observations")).toBe("observations");
    expect(cleanSpokenInput("would you please open sidebar")).toBe("sidebar");
    expect(cleanSpokenInput("just jump to what you get")).toBe("what you get");
  });

  it("handles empty or purely filler input gracefully", () => {
    expect(cleanSpokenInput("please")).toBe("");
    expect(cleanSpokenInput("hey")).toBe("");
    expect(cleanSpokenInput("can you please")).toBe("");
    expect(cleanSpokenInput("   ")).toBe("");
  });
});

describe("matchCommand - Navigation-Only Matcher (60+ tests)", () => {
  // =========================================================================
  // GROUP 1: Anywhere Commands (20+ tests)
  // =========================================================================
  describe("Anywhere commands", () => {
    it("matches open sidebar variants", () => {
      expect(matchCommand("open sidebar")).toEqual({ kind: "OPEN_SIDEBAR" });
      expect(matchCommand("open side bar")).toEqual({ kind: "OPEN_SIDEBAR" });
      expect(matchCommand("side bar")).toEqual({ kind: "OPEN_SIDEBAR" });
      expect(matchCommand("open menu")).toEqual({ kind: "OPEN_SIDEBAR" });
      expect(matchCommand("show sidebar")).toEqual({ kind: "OPEN_SIDEBAR" });
      expect(matchCommand("show side bar")).toEqual({ kind: "OPEN_SIDEBAR" });
      expect(matchCommand("show menu")).toEqual({ kind: "OPEN_SIDEBAR" });
      expect(matchCommand("please open sidebar")).toEqual({ kind: "OPEN_SIDEBAR" });
      expect(matchCommand("please open side bar")).toEqual({ kind: "OPEN_SIDEBAR" });
    });

    it("matches close sidebar variants", () => {
      expect(matchCommand("close sidebar")).toEqual({ kind: "CLOSE_SIDEBAR" });
      expect(matchCommand("close side bar")).toEqual({ kind: "CLOSE_SIDEBAR" });
      expect(matchCommand("close menu")).toEqual({ kind: "CLOSE_SIDEBAR" });
      expect(matchCommand("hide sidebar")).toEqual({ kind: "CLOSE_SIDEBAR" });
      expect(matchCommand("hide side bar")).toEqual({ kind: "CLOSE_SIDEBAR" });
      expect(matchCommand("dismiss sidebar")).toEqual({ kind: "CLOSE_SIDEBAR" });
      expect(matchCommand("dismiss side bar")).toEqual({ kind: "CLOSE_SIDEBAR" });
    });

    it("matches home page navigation variants", () => {
      expect(matchCommand("home")).toEqual({ kind: "NAVIGATE", target: "/", label: "Home" });
      expect(matchCommand("go to home")).toEqual({ kind: "NAVIGATE", target: "/", label: "Home" });
      expect(matchCommand("homepage")).toEqual({ kind: "NAVIGATE", target: "/", label: "Home" });
      expect(matchCommand("landing")).toEqual({ kind: "NAVIGATE", target: "/", label: "Home" });
      expect(matchCommand("welcome")).toEqual({ kind: "NAVIGATE", target: "/", label: "Home" });
    });

    it("matches check an offer navigation variants", () => {
      expect(matchCommand("check an offer")).toEqual({ kind: "NAVIGATE", target: "/check", label: "Check an offer" });
      expect(matchCommand("check offer")).toEqual({ kind: "NAVIGATE", target: "/check", label: "Check an offer" });
      expect(matchCommand("check")).toEqual({ kind: "NAVIGATE", target: "/check", label: "Check an offer" });
      expect(matchCommand("start check")).toEqual({ kind: "NAVIGATE", target: "/check", label: "Check an offer" });
      expect(matchCommand("check tool")).toEqual({ kind: "NAVIGATE", target: "/check", label: "Check an offer" });
      expect(matchCommand("please check an offer")).toEqual({ kind: "NAVIGATE", target: "/check", label: "Check an offer" });
    });

    it("matches help and reporting navigation variants", () => {
      expect(matchCommand("help and reporting")).toEqual({ kind: "NAVIGATE", target: "/resources", label: "Help and reporting" });
      expect(matchCommand("help")).toEqual({ kind: "NAVIGATE", target: "/resources", label: "Help and reporting" });
      expect(matchCommand("reporting")).toEqual({ kind: "NAVIGATE", target: "/resources", label: "Help and reporting" });
      expect(matchCommand("official resources")).toEqual({ kind: "NAVIGATE", target: "/resources", label: "Help and reporting" });
      expect(matchCommand("resources", { page: "/" })).toEqual({ kind: "NAVIGATE", target: "/resources", label: "Help and reporting" });
    });

    it("matches about and privacy page navigation", () => {
      expect(matchCommand("about")).toEqual({ kind: "NAVIGATE", target: "/about", label: "About" });
      expect(matchCommand("who made this")).toEqual({ kind: "NAVIGATE", target: "/about", label: "About" });
      expect(matchCommand("about offerclara")).toEqual({ kind: "NAVIGATE", target: "/about", label: "About" });
      expect(matchCommand("privacy")).toEqual({ kind: "NAVIGATE", target: "/privacy", label: "Privacy" });
      expect(matchCommand("privacy policy")).toEqual({ kind: "NAVIGATE", target: "/privacy", label: "Privacy" });
      expect(matchCommand("data privacy")).toEqual({ kind: "NAVIGATE", target: "/privacy", label: "Privacy" });
    });

    it("matches clear doubt navigation variants", () => {
      expect(matchCommand("ask")).toEqual({ kind: "NAVIGATE", target: "/ask", label: "Clear doubt with AI" });
      expect(matchCommand("ask a doubt")).toEqual({ kind: "NAVIGATE", target: "/ask", label: "Clear doubt with AI" });
      expect(matchCommand("clear doubt")).toEqual({ kind: "NAVIGATE", target: "/ask", label: "Clear doubt with AI" });
      expect(matchCommand("clear my doubt")).toEqual({ kind: "NAVIGATE", target: "/ask", label: "Clear doubt with AI" });
      expect(matchCommand("ask ai")).toEqual({ kind: "NAVIGATE", target: "/ask", label: "Clear doubt with AI" });
    });

    it("matches landing section anchor targets", () => {
      expect(matchCommand("how it works")).toEqual({ kind: "NAVIGATE", target: "/#how-it-works", label: "How it works" });
      expect(matchCommand("what you get")).toEqual({ kind: "NAVIGATE", target: "/#what-you-get", label: "What you get" });
      expect(matchCommand("faq")).toEqual({ kind: "NAVIGATE", target: "/#faq", label: "FAQ" });
      expect(matchCommand("frequently asked questions")).toEqual({ kind: "NAVIGATE", target: "/#faq", label: "FAQ" });
      expect(matchCommand("questions and answers")).toEqual({ kind: "NAVIGATE", target: "/#faq", label: "FAQ" });
    });

    it("matches already paid emergency navigation", () => {
      expect(matchCommand("i paid")).toEqual({ kind: "NAVIGATE", target: "/resources#already-paid", label: "If you have already paid" });
      expect(matchCommand("i already paid")).toEqual({ kind: "NAVIGATE", target: "/resources#already-paid", label: "If you have already paid" });
      expect(matchCommand("already paid")).toEqual({ kind: "NAVIGATE", target: "/resources#already-paid", label: "If you have already paid" });
      expect(matchCommand("i have paid")).toEqual({ kind: "NAVIGATE", target: "/resources#already-paid", label: "If you have already paid" });
      expect(matchCommand("i paid money")).toEqual({ kind: "NAVIGATE", target: "/resources#already-paid", label: "If you have already paid" });
    });
  });

  // =========================================================================
  // GROUP 2: On Check Page Commands (25+ tests)
  // =========================================================================
  describe("On check page commands", () => {
    const ctx = { page: "/check", step: 1 };

    it("matches stepper relative navigation", () => {
      expect(matchCommand("next", ctx)).toEqual({ kind: "WIZARD_NEXT" });
      expect(matchCommand("next step", ctx)).toEqual({ kind: "WIZARD_NEXT" });
      expect(matchCommand("go next", ctx)).toEqual({ kind: "WIZARD_NEXT" });
      expect(matchCommand("continue", ctx)).toEqual({ kind: "WIZARD_NEXT" });
      expect(matchCommand("proceed", ctx)).toEqual({ kind: "WIZARD_NEXT" });

      expect(matchCommand("back", ctx)).toEqual({ kind: "WIZARD_BACK" });
      expect(matchCommand("previous", ctx)).toEqual({ kind: "WIZARD_BACK" });
      expect(matchCommand("previous step", ctx)).toEqual({ kind: "WIZARD_BACK" });
      expect(matchCommand("go back", ctx)).toEqual({ kind: "WIZARD_BACK" });

      expect(matchCommand("skip", ctx)).toEqual({ kind: "WIZARD_SKIP" });
      expect(matchCommand("skip step", ctx)).toEqual({ kind: "WIZARD_SKIP" });
      expect(matchCommand("skip this step", ctx)).toEqual({ kind: "WIZARD_SKIP" });
    });

    it("matches direct step navigation", () => {
      expect(matchCommand("step 1", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 1, label: "Offer" });
      expect(matchCommand("offer", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 1, label: "Offer" });
      expect(matchCommand("offer step", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 1, label: "Offer" });

      expect(matchCommand("step 2", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 2, label: "Source" });
      expect(matchCommand("source", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 2, label: "Source" });
      expect(matchCommand("channel", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 2, label: "Source" });

      expect(matchCommand("step 3", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 3, label: "Conversation" });
      expect(matchCommand("conversation", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 3, label: "Conversation" });
      expect(matchCommand("what was said", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 3, label: "Conversation" });

      expect(matchCommand("step 4", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 4, label: "Money and documents" });
      expect(matchCommand("money and documents", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 4, label: "Money and documents" });
      expect(matchCommand("payment", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 4, label: "Money and documents" });
      expect(matchCommand("documents", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 4, label: "Money and documents" });

      expect(matchCommand("step 5", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 5, label: "Review" });
      expect(matchCommand("review step", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 5, label: "Review" });
      expect(matchCommand("final step", ctx)).toEqual({ kind: "WIZARD_GOTO_STEP", step: 5, label: "Review" });
    });

    it("matches analyse action command", () => {
      expect(matchCommand("analyse", ctx)).toEqual({ kind: "ANALYSE" });
      expect(matchCommand("analyze", ctx)).toEqual({ kind: "ANALYSE" });
      expect(matchCommand("run review", ctx)).toEqual({ kind: "ANALYSE" });
      expect(matchCommand("review offer", ctx)).toEqual({ kind: "ANALYSE" });
      expect(matchCommand("start review", ctx)).toEqual({ kind: "ANALYSE" });
      expect(matchCommand("check it", ctx)).toEqual({ kind: "ANALYSE" });
      expect(matchCommand("run analysis", ctx)).toEqual({ kind: "ANALYSE" });
    });

    it("matches post-review section jumps on check page", () => {
      expect(matchCommand("overview", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-summary", label: "Overview" });
      expect(matchCommand("observations", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-observations", label: "Observations" });
      expect(matchCommand("flags", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-observations", label: "Observations" });
      expect(matchCommand("concerns", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-observations", label: "Observations" });
      expect(matchCommand("missing details", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-missing", label: "Missing details" });
      expect(matchCommand("questions", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-questions", label: "Questions and checks" });
      expect(matchCommand("company research", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-research", label: "Company research" });
      expect(matchCommand("research the company", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-research", label: "Company research" });
      expect(matchCommand("resources", { page: "/check", hasReview: true })).toEqual({
        kind: "JUMP_SECTION",
        sectionId: "section-advisories",
        label: "Resources",
      });
      expect(matchCommand("your text", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-your-text", label: "Your text" });
      expect(matchCommand("my text", ctx)).toEqual({ kind: "JUMP_SECTION", sectionId: "section-your-text", label: "Your text" });
      expect(matchCommand("edit my answers", ctx)).toEqual({ kind: "EDIT_ANSWERS" });
    });
  });

  // =========================================================================
  // GROUP 3: Wrong Context Rules (12+ tests)
  // =========================================================================
  describe("Wrong Context handling", () => {
    it("returns WRONG_CONTEXT when check-page commands are used on landing page", () => {
      const homeCtx = { page: "/" };
      expect(matchCommand("next", homeCtx)).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("back", homeCtx)).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("skip", homeCtx)).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("step 3", homeCtx)).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("analyse", homeCtx)).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("observations", homeCtx)).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("missing details", homeCtx)).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("questions", homeCtx)).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("edit my answers", homeCtx)).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
    });

    it("returns WRONG_CONTEXT when check-page commands are used on resources or about", () => {
      expect(matchCommand("next", { page: "/resources" })).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("step 2", { page: "/about" })).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
      expect(matchCommand("analyse", { page: "/privacy" })).toEqual({ kind: "WRONG_CONTEXT", hint: "That command works on the check page." });
    });
  });

  // =========================================================================
  // GROUP 4: Negatives, Removed Features & Unknown Input (15+ tests)
  // =========================================================================
  describe("Removed features and arbitrary text return UNKNOWN", () => {
    it("returns UNKNOWN for removed answer-setting commands", () => {
      expect(matchCommand("telegram")).toEqual({ kind: "UNKNOWN", rawText: "telegram" });
      expect(matchCommand("whatsapp")).toEqual({ kind: "UNKNOWN", rawText: "whatsapp" });
      expect(matchCommand("yes i applied")).toEqual({ kind: "UNKNOWN", rawText: "yes i applied" });
      expect(matchCommand("no i did not apply")).toEqual({ kind: "UNKNOWN", rawText: "no i did not apply" });
      expect(matchCommand("they asked for 5000")).toEqual({ kind: "UNKNOWN", rawText: "they asked for 5000" });
      expect(matchCommand("aadhaar card")).toEqual({ kind: "UNKNOWN", rawText: "aadhaar card" });
    });

    it("returns UNKNOWN for removed utility commands (PDF, summary, clear, theme, samples)", () => {
      expect(matchCommand("save as pdf")).toEqual({ kind: "UNKNOWN", rawText: "save as pdf" });
      expect(matchCommand("copy summary")).toEqual({ kind: "UNKNOWN", rawText: "copy summary" });
      expect(matchCommand("clear")).toEqual({ kind: "UNKNOWN", rawText: "clear" });
      expect(matchCommand("clear all")).toEqual({ kind: "UNKNOWN", rawText: "clear all" });
      expect(matchCommand("start over")).toEqual({ kind: "UNKNOWN", rawText: "start over" });
      expect(matchCommand("toggle theme")).toEqual({ kind: "UNKNOWN", rawText: "toggle theme" });
      expect(matchCommand("dark mode")).toEqual({ kind: "UNKNOWN", rawText: "dark mode" });
      expect(matchCommand("sample 1")).toEqual({ kind: "UNKNOWN", rawText: "sample 1" });
      expect(matchCommand("load sample")).toEqual({ kind: "UNKNOWN", rawText: "load sample" });
    });

    it("returns UNKNOWN for arbitrary dictated offer text or questions", () => {
      const paragraph = "The HR emailed me from gmail.com and asked for an upfront security deposit of 2000 rupees.";
      expect(matchCommand(paragraph)).toEqual({ kind: "UNKNOWN", rawText: paragraph });
      expect(matchCommand("Is this company real?")).toEqual({ kind: "UNKNOWN", rawText: "Is this company real?" });
      expect(matchCommand("Hello world")).toEqual({ kind: "UNKNOWN", rawText: "Hello world" });
      expect(matchCommand("")).toEqual({ kind: "UNKNOWN", rawText: "" });
      expect(matchCommand("   ")).toEqual({ kind: "UNKNOWN", rawText: "   " });
    });
  });
});
