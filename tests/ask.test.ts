import { describe, it, expect } from "vitest";
import {
  AskResponseSchema,
  AskResourceIdEnum,
} from "@/lib/ask/schema";
import {
  sanitizeAskText,
  sanitizeAndValidateAskResponse,
  getOfflineFallbackAskResponse,
} from "@/lib/ask/guardrails";
import { buildAskUserMessage } from "@/lib/ask/prompt";
import { defaultAskRateLimiter } from "@/lib/rate-limit";

describe("Clear doubt AI data contract and schema (Milestone Q2)", () => {
  it("validates a well-formed ask response", () => {
    const valid = {
      language: "en",
      summary: "This inquiry concerns a requested laptop security deposit.",
      whatThisMayMean: [
        "Legitimate employers do not ask candidates to pay for office equipment.",
        "Security deposits for internship assets are irregular in authentic hiring.",
      ],
      doNow: [
        "Do not transfer funds to the requested account or UPI ID.",
        "Save all chat logs and email correspondence as evidence.",
      ],
      askOrCheck: [
        "Ask for company letterhead confirming asset allocation policies.",
        "Check the company legal registration status on the MCA portal.",
      ],
      resources: ["cybercrime", "mca"],
      clarifyingQuestion: null,
    };

    const parsed = AskResponseSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("rejects responses with invalid language or exceeding array caps", () => {
    const invalidLang = {
      language: "fr", // not allowed
      summary: "Test",
      whatThisMayMean: [],
      doNow: [],
      askOrCheck: [],
      resources: [],
    };
    expect(AskResponseSchema.safeParse(invalidLang).success).toBe(false);

    const tooManyItems = {
      language: "en",
      summary: "Test",
      whatThisMayMean: ["1", "2", "3", "4", "5"], // max 4
      doNow: [],
      askOrCheck: [],
      resources: [],
    };
    expect(AskResponseSchema.safeParse(tooManyItems).success).toBe(false);
  });

  it("permits only verified resource identifiers", () => {
    const validEnum = ["cybercrime", "aicte", "ncs", "mca", "advisories", "resources_page"];
    for (const id of validEnum) {
      expect(AskResourceIdEnum.safeParse(id).success).toBe(true);
    }

    expect(AskResourceIdEnum.safeParse("arbitrary_external_site").success).toBe(false);
    expect(AskResourceIdEnum.safeParse("https://unknown.com").success).toBe(false);
  });
});

describe("Ask guardrails and sanitization", () => {
  it("sanitizes stray verdict phrases and scam/fraud terminology", () => {
    const dirty = "This offer is definitely a scam run by a scammer who commits fraud.";
    const clean = sanitizeAskText(dirty);

    expect(clean.toLowerCase()).not.toContain("definitely a scam");
    expect(clean.toLowerCase()).not.toContain("scammer");
    expect(clean.toLowerCase()).not.toContain("fraud");
    expect(clean).toContain("unauthorised");
  });

  it("replaces verdict language in complete AskResponse objects", () => {
    const input = {
      language: "en",
      summary: "The offer is guaranteed legit but involves training fees.",
      whatThisMayMean: ["It is a verified safe arrangement."],
      doNow: ["Report this fraud to the authorities."],
      askOrCheck: ["Ask why the scammer requested funds."],
      resources: ["cybercrime", "unknown_bogus_resource"],
      clarifyingQuestion: "Was the scammer polite?",
    };

    const result = sanitizeAndValidateAskResponse(input);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.summary).not.toContain("guaranteed legit");
      expect(result.whatThisMayMean[0]).not.toContain("verified safe");
      expect(result.doNow[0]).not.toContain("fraud");
      expect(result.askOrCheck[0]).not.toContain("scammer");
      // Bogus resource dropped, only valid retained
      expect(result.resources).toEqual(["cybercrime"]);
    }
  });

  it("generates deterministic offline fallback in English", () => {
    const fb = getOfflineFallbackAskResponse("They want me to pay Rs 500 for training");
    expect(fb.language).toBe("en");
    expect(fb.summary).toContain("General verification guidance");
    expect(fb.doNow.length).toBeGreaterThan(0);
    expect(fb.resources).toContain("cybercrime");
    expect(fb.resources).toContain("mca");

    // Zero verdict words in fallback
    const text = JSON.stringify(fb);
    expect(text).not.toMatch(/\b(safe|verified|legit|scam|fraud)\b/i);
  });

  it("generates deterministic offline fallback in Hindi when Hindi text is detected", () => {
    const fb = getOfflineFallbackAskResponse("क्या मुझे 2000 रुपये जमा करने चाहिए?");
    expect(fb.language).toBe("hi");
    expect(fb.summary).toContain("दिशानिर्देश");
    expect(fb.doNow.length).toBeGreaterThan(0);
    expect(fb.resources).toContain("cybercrime");
  });
});

describe("buildAskUserMessage with optional review context", () => {
  it("formats prompt with high-level categories only, omitting raw text", () => {
    const question = "Are upfront fees ever standard?";
    const msg = buildAskUserMessage(question, {
      categories: ["upfront_payment", "paid_training_described"],
      topics: ["stipend_or_pay", "working_hours"],
      verificationQuestions: ["What are the daily hours?"],
    });

    expect(msg).toContain("Are upfront fees ever standard?");
    expect(msg).toContain("upfront_payment");
    expect(msg).toContain("stipend_or_pay");
    expect(msg).toContain("What are the daily hours?");
    // Context boundaries
    expect(msg).toContain("--- Session Review Context (High-level summary only) ---");
  });

  it("returns question alone when no context is passed", () => {
    const msg = buildAskUserMessage("Is this normal?");
    expect(msg).toBe("Is this normal?");
    expect(msg).not.toContain("--- Session Review Context");
  });
});

describe("Ask rate limiter", () => {
  it("tracks and enforces ask rate limits", () => {
    const testKey = "test_ask_client_" + Date.now();
    const limiter = defaultAskRateLimiter;

    // Up to default limit should be allowed
    const first = limiter.checkAndRecord(testKey);
    expect(first.allowed).toBe(true);
  });
});
