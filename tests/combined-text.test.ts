import { describe, it, expect } from "vitest";
import {
  buildCombinedText,
  isSectionMarkerLine,
  isReadyToAnalyse,
  SECTION_MARKER_LINES,
  CHANNEL_LABELS,
  APPLIED_LABELS,
  ASKED_LABELS,
  PURPOSE_LABELS,
  DOCUMENT_LABELS,
} from "@/lib/combined-text";
import { MIN_INPUT_CHARS, MAX_INPUT_CHARS } from "@/lib/config";

describe("buildCombinedText pure function", () => {
  it("returns offer text exactly without headers when ONLY offer text has content", () => {
    const state = {
      offerText: "Dear Student,\nCongratulations on your offer for Software Intern.",
      source: { channel: null, applied: null, note: "" },
      conversation: { text: "" },
      payment: {
        asked: null,
        purposes: [],
        amount: "",
        deadline: "",
        docsAsked: [],
        docsShared: [],
        note: "",
      },
    };

    const result = buildCombinedText(state);
    expect(result.text).toBe("Dear Student,\nCongratulations on your offer for Software Intern.");
    expect(result.text).not.toContain("---- Offer text ----");
  });

  it("returns empty string when all sections are empty", () => {
    const result = buildCombinedText({});
    expect(result.text).toBe("");
  });

  it("builds labelled sections separated by one blank line when other sections have content", () => {
    const state = {
      offerText: "Please accept our internship offer.",
      source: {
        channel: "messaging" as const,
        applied: "no" as const,
        note: "Received via WhatsApp group",
      },
      conversation: {
        text: "Recruiter called and asked to confirm today.",
      },
      payment: {
        asked: "yes_unpaid" as const,
        purposes: ["registration" as const, "training" as const],
        amount: "Rs 3,499",
        deadline: "Tonight by 10 pm",
        docsAsked: ["identity" as const, "bank" as const],
        docsShared: ["photo" as const],
        note: "Asked for UPI transfer",
      },
    };

    const result = buildCombinedText(state);

    // Section 1: Offer text
    expect(result.text).toContain("---- Offer text ----\nPlease accept our internship offer.");

    // Section 2: Source answers
    expect(result.text).toContain("---- How you received it (your answers) ----");
    expect(result.text).toContain("Channel: A WhatsApp or Telegram message");
    expect(result.text).toContain("You applied: No, they contacted me first");
    expect(result.text).toContain("Note: Received via WhatsApp group");

    // Section 3: Conversation
    expect(result.text).toContain(
      "---- Call or conversation (your description) ----\nRecruiter called and asked to confirm today."
    );

    // Section 4: Money and documents
    expect(result.text).toContain("---- Money and documents (your answers) ----");
    expect(result.text).toContain("Asked to pay: Yes, not paid");
    expect(result.text).toContain(
      "Reason given: Registration or application fee; Training, course or certificate fee"
    );
    expect(result.text).toContain("Amount: Rs 3,499");
    expect(result.text).toContain("Deadline given: Tonight by 10 pm");
    expect(result.text).toContain("Documents asked for: Identity card; Bank details or passbook");
    expect(result.text).toContain("Documents already shared: Photo or selfie");
    expect(result.text).toContain("Note: Asked for UPI transfer");

    // Verify sections separated by exactly one blank line (\n\n)
    const blocks = result.text.split("\n\n");
    expect(blocks).toHaveLength(4);
    expect(blocks[0].startsWith("---- Offer text ----")).toBe(true);
    expect(blocks[1].startsWith("---- How you received it (your answers) ----")).toBe(true);
    expect(blocks[2].startsWith("---- Call or conversation (your description) ----")).toBe(true);
    expect(blocks[3].startsWith("---- Money and documents (your answers) ----")).toBe(true);
  });

  it("omits empty fields inside answers sections", () => {
    const state = {
      offerText: "Offer content",
      source: {
        channel: "email" as const,
        applied: null,
        note: "",
      },
      payment: {
        asked: "no" as const,
        purposes: [],
        amount: "",
        deadline: "",
        docsAsked: [],
        docsShared: [],
        note: "",
      },
    };

    const result = buildCombinedText(state);
    expect(result.text).toContain("Channel: An email");
    expect(result.text).not.toContain("You applied:");
    expect(result.text).not.toContain("Reason given:");
    expect(result.text).not.toContain("Amount:");
    expect(result.text).toContain("Asked to pay: No");
  });

  it("verifies all human labels match specification exactly", () => {
    expect(CHANNEL_LABELS.platform).toBe("A job or internship platform");
    expect(CHANNEL_LABELS.messaging).toBe("A WhatsApp or Telegram message");
    expect(CHANNEL_LABELS.email).toBe("An email");
    expect(CHANNEL_LABELS.social).toBe("A social media message");
    expect(CHANNEL_LABELS.college).toBe("A college notice or placement cell");
    expect(CHANNEL_LABELS.person).toBe("A friend or relative");
    expect(CHANNEL_LABELS.call).toBe("A phone call");
    expect(CHANNEL_LABELS.other).toBe("Something else");

    expect(APPLIED_LABELS.yes).toBe("Yes");
    expect(APPLIED_LABELS.no).toBe("No, they contacted me first");
    expect(APPLIED_LABELS.unsure).toBe("Not sure");

    expect(ASKED_LABELS.no).toBe("No");
    expect(ASKED_LABELS.yes_unpaid).toBe("Yes, not paid");
    expect(ASKED_LABELS.yes_paid).toBe("Yes, and I paid");

    expect(PURPOSE_LABELS.registration).toBe("Registration or application fee");
    expect(PURPOSE_LABELS.training).toBe("Training, course or certificate fee");
    expect(PURPOSE_LABELS.equipment).toBe("Equipment, kit or laptop");
    expect(PURPOSE_LABELS.deposit).toBe("Security or refundable deposit");
    expect(PURPOSE_LABELS.verification).toBe("Verification or document processing");
    expect(PURPOSE_LABELS.other).toBe("Something else");

    expect(DOCUMENT_LABELS.identity).toBe("Identity card");
    expect(DOCUMENT_LABELS.bank).toBe("Bank details or passbook");
    expect(DOCUMENT_LABELS.photo).toBe("Photo or selfie");
    expect(DOCUMENT_LABELS.certificates).toBe("Certificates or marksheets");
    expect(DOCUMENT_LABELS.other).toBe("Something else");
    expect(DOCUMENT_LABELS.none).toBe("None");
  });
});

describe("isSectionMarkerLine pure function", () => {
  it("matches all four exact section headings", () => {
    for (const heading of SECTION_MARKER_LINES) {
      expect(isSectionMarkerLine(heading)).toBe(true);
      expect(isSectionMarkerLine(`${heading}\r`)).toBe(true);
    }
  });

  it("rejects non-heading text or partial headings", () => {
    expect(isSectionMarkerLine("Offer text")).toBe(false);
    expect(isSectionMarkerLine("---- Offer text")).toBe(false);
    expect(isSectionMarkerLine("---- How you received it ----")).toBe(false);
    expect(isSectionMarkerLine("")).toBe(false);
    expect(isSectionMarkerLine(null as unknown as string)).toBe(false);
  });
});

describe("isReadyToAnalyse pure function", () => {
  it("returns true when offer text alone has at least MIN_INPUT_CHARS characters", () => {
    const text = "A".repeat(MIN_INPUT_CHARS);
    const result = isReadyToAnalyse({ offerText: text });
    expect(result.ready).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("returns true when free text across conversation and notes meets MIN_INPUT_CHARS", () => {
    const result = isReadyToAnalyse({
      conversation: { text: "A".repeat(25) },
      source: { note: "B".repeat(20) }, // 25 + 20 = 45 >= 40
    });
    expect(result.ready).toBe(true);
  });

  it("returns true when free text is below MIN_INPUT_CHARS but payment.asked is yes_unpaid with at least one purpose", () => {
    const result = isReadyToAnalyse({
      offerText: "Short text", // 10 chars < 40
      payment: {
        asked: "yes_unpaid",
        purposes: ["registration"],
      },
    });
    expect(result.ready).toBe(true);
  });

  it("returns true when payment.asked is yes_paid with at least one purpose", () => {
    const result = isReadyToAnalyse({
      offerText: "Tiny",
      payment: {
        asked: "yes_paid",
        purposes: ["training"],
      },
    });
    expect(result.ready).toBe(true);
  });

  it("returns false with helpful reason when neither free text nor payment criteria are met", () => {
    const result = isReadyToAnalyse({
      offerText: "Too short",
      payment: {
        asked: "no",
      },
    });
    expect(result.ready).toBe(false);
    expect(result.reason).toContain(String(MIN_INPUT_CHARS));
  });

  it("returns false when combined text exceeds MAX_INPUT_CHARS (12000)", () => {
    const hugeText = "X".repeat(MAX_INPUT_CHARS + 10);
    const result = isReadyToAnalyse({ offerText: hugeText });
    expect(result.ready).toBe(false);
    expect(result.reason).toContain("12,000");
  });
});
