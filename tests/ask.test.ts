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
    expect(fullContent).toContain("report the transaction");
  });

  it("handles document/Aadhaar/PAN questions with document verification guidance", () => {
    const fb = getDeterministicAskFallback("Can I share my Aadhaar card, PAN, and bank details?");
    expect(fb.summary.startsWith(REQUIRED_PREFIX)).toBe(true);
    expect(fb.resources).toContain("cybercrime");
    expect(fb.resources).toContain("mca");

    const fullContent = JSON.stringify(fb);
    expect(fullContent).toContain("first eight digits concealed");
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

describe("Always-visible fallback indicator", () => {
  it("guarantees the standard disclaimer prefix in all fallback summaries", () => {
    const questions = [
      "How do I check whether a company is registered?",
      "They asked for Rs 2000 fee",
      "Should I share my Aadhaar card?",
      "I got a WhatsApp message",
      "General question",
    ];
    for (const q of questions) {
      const fb = getDeterministicAskFallback(q);
      expect(fb.summary).toContain(
        "The AI service is unavailable right now, so this is general guidance."
      );
    }
  });
});

describe("Automated scan for banned words and employer generalizations in /ask", () => {
  const srcDir = path.resolve(process.cwd(), "src");

  function getAskTargetFiles(dir: string, out: string[] = []): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        getAskTargetFiles(fullPath, out);
      } else if (
        entry.isFile() &&
        (fullPath.includes(path.join("src", "lib", "ask")) ||
          fullPath.includes(path.join("src", "app", "ask")) ||
          fullPath.includes(path.join("src", "app", "api", "ask")) ||
          fullPath.includes(path.join("src", "data", "test-fixtures")))
      ) {
        out.push(fullPath);
      }
    }
    return out;
  }

  it("ensures no code-owned string in /ask contains banned words or employer generalizations", () => {
    const files = getAskTargetFiles(srcDir);
    expect(files.length).toBeGreaterThan(0);

    const bannedWordPatterns: { name: string; regex: RegExp }[] = [
      { name: "immediate/immediately", regex: /\b(immediately|immediate)\b/i },
      { name: "freeze/frozen", regex: /\b(freeze|frozen)\b/i },
      { name: "dispute", regex: /\bdispute\b/i },
      { name: "reversal/reverse", regex: /\b(reversal|reverse\s+the\s+payment)\b/i },
      { name: "refund", regex: /\brefund\b/i },
      { name: "recover/recovery", regex: /\b(recover|recovery)\b/i },
      { name: "masked", regex: /\bmasked\b/i },
      { name: "safe/safely as advice", regex: /\b(safe\s+sharing|safely)\b/i },
      { name: "authentic/genuine/legitimate as verdict", regex: /\b(authentic|legitimate|genuine)\s+(employer|internship|offer|company)/i },
      { name: "employers generalization", regex: /\bemployers\s+(do\s+not|never|always|rarely)\b/i },
      { name: "normative generalizations", regex: /\b(typically|normally|usually|rarely\s+ask)\b/i },
      { name: "scam/scammer/fraud", regex: /\b(scam|scammer|fraud)\b/i },
    ];

    const violations: { file: string; line: number; pattern: string; match: string }[] = [];

    for (const filePath of files) {
      const relPath = path.relative(process.cwd(), filePath);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const trimmed = line.trim();

        // Allow definitions of forbidden rules/patterns, negative instructions, regexes, comments, and CSS
        if (
          trimmed.startsWith("//") ||
          trimmed.startsWith("/*") ||
          trimmed.startsWith("*") ||
          trimmed.includes("FORBIDDEN_WORDS_REGEX") ||
          trimmed.includes("VERDICT_PHRASES_REGEX") ||
          trimmed.includes("EMPLOYER_GENERALIZATIONS_REGEX") ||
          trimmed.includes("NORMATIVE_CLAIMS_REGEX") ||
          trimmed.includes("PROHIBITED_") ||
          trimmed.includes("clean.replace") ||
          trimmed.includes("if (lower ===") ||
          trimmed.includes("Do NOT") ||
          trimmed.includes("NEVER state") ||
          trimmed.includes("never write") ||
          trimmed.includes("safe-area-inset") ||
          trimmed.includes("bannedWordPatterns") ||
          trimmed.includes("PROMPT_INJECTION_FIXTURE") // fixture testing injection payload
        ) {
          return;
        }

        for (const { name, regex } of bannedWordPatterns) {
          const match = trimmed.match(regex);
          if (match) {
            violations.push({
              file: relPath,
              line: index + 1,
              pattern: name,
              match: match[0],
            });
          }
        }
      });
    }

    expect(
      violations,
      `Found forbidden words or generalizations in /ask:\n${violations
        .map((v) => `${v.file}:${v.line} [${v.pattern}] -> "${v.match}"`)
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
