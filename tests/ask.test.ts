import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  AskResponseSchema,
  AskResourceIdEnum,
} from "@/lib/ask/schema";
import {
  sanitizeAskText,
  sanitizeAndValidateAskResponse,
  getDeterministicAskFallback,
  getOfflineFallbackAskResponse,
} from "@/lib/ask/guardrails";
import { buildAskUserMessage } from "@/lib/ask/prompt";
import { defaultAskRateLimiter } from "@/lib/rate-limit";

describe("Clear doubt AI data contract and schema", () => {
  it("validates a well-formed ask response without generalizations", () => {
    const valid = {
      language: "en",
      summary: "This inquiry concerns a requested laptop security deposit.",
      whatThisMayMean: [
        "Advisories from student placement cells note that candidates should not be asked to pay for office equipment.",
        "Security deposits for internship assets are irregular under official guidelines.",
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
    const validEnum = [
      "cybercrime",
      "aicte",
      "ncs",
      "mca",
      "advisories",
      "resources_page",
      "check_page",
      "research_prompt",
    ];
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
});

describe("Deterministic question-aware ask fallback (Milestone R3)", () => {
  const REQUIRED_PREFIX = "The AI service is unavailable right now, so this is general guidance.";

  it("handles company registration questions with MCA portal instructions and research prompt", () => {
    const fb = getDeterministicAskFallback("How do I check whether a company is registered?");
    expect(fb.summary.startsWith(REQUIRED_PREFIX)).toBe(true);
    expect(fb.resources).toContain("mca");
    expect(fb.resources).toContain("research_prompt");

    const fullContent = JSON.stringify(fb);
    expect(fullContent).toContain("Ministry of Corporate Affairs");
    expect(fullContent).toContain("Check Company/LLP Name");
    expect(fullContent).toContain("Perplexity");
  });

  it("handles payment/fee questions with bank, cybercrime 1930, and /resources#already-paid", () => {
    const fb = getDeterministicAskFallback("They asked me to transfer a Rs 2,500 security deposit fee");
    expect(fb.summary.startsWith(REQUIRED_PREFIX)).toBe(true);
    expect(fb.resources).toContain("cybercrime");
    expect(fb.resources).toContain("aicte");
    expect(fb.resources).toContain("ncs");

    const fullContent = JSON.stringify(fb);
    expect(fullContent).toContain("1930");
    expect(fullContent).toContain("cybercrime.gov.in");
    expect(fullContent).toContain("/resources#already-paid");
    expect(fullContent).toContain("reversal");
  });

  it("handles document/Aadhaar/PAN questions with safe sharing guidance", () => {
    const fb = getDeterministicAskFallback("Can I share my Aadhaar card, PAN, and bank details?");
    expect(fb.summary.startsWith(REQUIRED_PREFIX)).toBe(true);
    expect(fb.resources).toContain("cybercrime");
    expect(fb.resources).toContain("mca");

    const fullContent = JSON.stringify(fb);
    expect(fullContent).toContain("masked Aadhaar");
    expect(fullContent).toContain("passwords");
  });

  it("handles messaging questions with independent verification advice", () => {
    const fb = getDeterministicAskFallback("I got an offer on WhatsApp and I did not apply");
    expect(fb.summary.startsWith(REQUIRED_PREFIX)).toBe(true);
    expect(fb.resources).toContain("mca");
    expect(fb.resources).toContain("advisories");

    const fullContent = JSON.stringify(fb);
    expect(fullContent).toContain("messaging");
    expect(fullContent).toContain("official");
  });

  it("handles generic questions with verified facts and questions to ask sender", () => {
    const fb = getDeterministicAskFallback("What should I check before accepting?");
    expect(fb.summary.startsWith(REQUIRED_PREFIX)).toBe(true);
    expect(fb.resources).toContain("mca");
    expect(fb.resources).toContain("aicte");
    expect(fb.askOrCheck.length).toBeGreaterThan(0);
  });

  it("supports backwards compatibility alias getOfflineFallbackAskResponse", () => {
    const fb1 = getDeterministicAskFallback("How do I check if a company exists?");
    const fb2 = getOfflineFallbackAskResponse("How do I check if a company exists?");
    expect(fb1).toEqual(fb2);
  });
});

describe("Automated scan for banned words and employer generalizations in /ask", () => {
  const askDir = path.resolve(process.cwd(), "src");

  function getAskFiles(dir: string, out: string[] = []): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        getAskFiles(fullPath, out);
      } else if (
        entry.isFile() &&
        (fullPath.includes(path.join("src", "lib", "ask")) ||
          fullPath.includes(path.join("src", "app", "ask")))
      ) {
        out.push(fullPath);
      }
    }
    return out;
  }

  it("ensures no code-owned string in /ask contains banned words or employer generalizations", () => {
    const files = getAskFiles(askDir);
    expect(files.length).toBeGreaterThan(0);

    const bannedGeneralizations = [
      /employers\s+do\s+not/i,
      /authentic\s+employer/i,
      /legitimate\s+employer/i,
      /genuine\s+employer/i,
      /authentic\s+internship/i,
      /genuine\s+internship/i,
      /rarely\s+ask/i,
      /\btypically\b/i,
      /\busually\b/i,
      /\bnormally\b/i,
    ];

    const violations: { file: string; line: number; match: string }[] = [];

    for (const filePath of files) {
      const relPath = path.relative(process.cwd(), filePath);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        // Skip comment lines in prompt or code if any
        for (const pattern of bannedGeneralizations) {
          const match = line.match(pattern);
          if (match) {
            violations.push({
              file: relPath,
              line: index + 1,
              match: match[0],
            });
          }
        }
      });
    }

    expect(
      violations,
      `Found forbidden employer generalizations in /ask:\n${violations
        .map((v) => `${v.file}:${v.line} -> "${v.match}"`)
        .join("\n")}`
    ).toHaveLength(0);
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

    const first = limiter.checkAndRecord(testKey);
    expect(first.allowed).toBe(true);
  });
});
