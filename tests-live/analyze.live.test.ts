import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { SYNTHETIC_EXAMPLES } from "@/data/examples";
import { PROMPT_INJECTION_FIXTURE } from "@/data/test-fixtures";
import {
  analyzeOfferText,
  AnalyzeOfferResult,
  resolveThinkingLevel,
} from "@/lib/analysis/gemini";
import { MAX_OUTPUT_TOKENS, DEFAULT_MODEL_CHAIN } from "@/lib/config";
import { detectOverclaiming } from "@/lib/analysis/guardrails";
import { validateQuote } from "@/lib/analysis/quote-validator";
import { ValidatedAnalysis } from "@/lib/analysis/schema";

import { containsSourceMarkerLine } from "@/lib/upload";

// 1. Load .env.local using Node's built-in process.loadEnvFile if it exists
if (fs.existsSync(".env.local")) {
  try {
    process.loadEnvFile(".env.local");
  } catch (err: unknown) {
    console.warn(
      "[OfferClara Live Tests] Could not parse .env.local:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

const apiKey = process.env.GEMINI_API_KEY?.trim();
const hasApiKey = Boolean(apiKey);
const liveBaseUrl = process.env.LIVE_BASE_URL?.trim();

if (!hasApiKey) {
  console.warn(
    "\n[OfferClara Live Tests] SKIPPED: GEMINI_API_KEY is not set in the environment or .env.local." +
      "\nNo live requests to Gemini will be made. Tests are safely skipped and NOT faked.\n"
  );
}

const testCases = [
  ...SYNTHETIC_EXAMPLES.map((ex) => ({
    name: `Synthetic Example: ${ex.id} (${ex.title})`,
    text: ex.text,
  })),
  {
    name: "Combined Input: Notes + Labelled File Block",
    text: "I was contacted about a remote data evaluation role.\n\n---- Text from Screenshot 1 ----\nCongratulations on your selection for the Data Associate role at VertexNest Solutions. To confirm your equipment shipment, please transfer a refundable fee of ₹1,500 via UPI today within 24 hours.",
  },
  {
    name: `Prompt Injection Fixture: ${PROMPT_INJECTION_FIXTURE.id}`,
    text: PROMPT_INJECTION_FIXTURE.text,
  },
];

// Helper to normalize whitespace for string comparison
const normalizeWs = (s: string) => s.normalize("NFC").replace(/\s+/g, " ").trim();

// Free-tier friendly sequential pause between calls
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe.skipIf(!hasApiKey)("Live Gemini API Analysis Suite", () => {
  for (const tc of testCases) {
    it(
      `analyzes '${tc.name}' against Gemini`,
      async () => {
        // Sequential pause to respect free-tier rate limits
        await pause(2500);

        let analysis: ValidatedAnalysis;
        let rawOutputForDebug: string | null | undefined;
        let result: AnalyzeOfferResult | undefined;

        console.log(`\n======================================================`);
        console.log(`[LIVE TEST RUN] Case: ${tc.name}`);
        console.log(`Configured Models & Speed Settings:`);
        for (const model of DEFAULT_MODEL_CHAIN) {
          const thinkingLevel = resolveThinkingLevel(
            model,
            process.env.GEMINI_THINKING_LEVEL
          );
          console.log(
            `  - Model: ${model} | thinking_level: "${thinkingLevel ?? "none"}" | max_output_tokens: ${MAX_OUTPUT_TOKENS}`
          );
        }

        if (liveBaseUrl) {
          // If LIVE_BASE_URL is set, POST to LIVE_BASE_URL + "/api/analyze"
          const endpoint = `${liveBaseUrl.replace(/\/+$/, "")}/api/analyze`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: tc.text }),
          });

          const data = await response.json();
          expect(response.status).toBe(200);
          expect(data.ok).toBe(true);
          analysis = data.analysis;
        } else {
          // Direct call to analyzeOfferText
          result = await analyzeOfferText(tc.text);

          console.log(`Attempts History:`);
          for (const [idx, att] of result.attempts.entries()) {
            console.log(
              `  [Attempt ${idx + 1}] Model: ${att.model} | Outcome: ${att.outcome} | Status: ${att.httpStatus ?? "N/A"} | Elapsed: ${att.elapsedMs}ms${att.error ? ` | Error: ${att.error}` : ""}`
            );
          }

          expect(result.ok).toBe(true);
          if (!result.ok) {
            throw new Error(
              `Analysis failed with code ${result.code}: ${result.message}`
            );
          }
          analysis = result.analysis;
          rawOutputForDebug = result.rawOutputForDebug;
          console.log(`Successful Model Used: ${result.modelUsed}`);
        }

        // Print breakdown for each case
        console.log(`Counts:`);
        console.log(`  - Concerns: ${analysis.concerns.length}`);
        console.log(`  - Missing Info: ${analysis.missingInfo.length}`);
        console.log(
          `  - Verification Questions: ${analysis.verificationQuestions.length}`
        );
        console.log(`  - Dropped Count: ${analysis.droppedCount}`);

        console.log(`Concerns Breakdown:`);
        for (const [idx, concern] of analysis.concerns.entries()) {
          const sliceText = tc.text.slice(concern.span.start, concern.span.end);
          const normalizedSlice = normalizeWs(sliceText);
          const normalizedQuote = normalizeWs(concern.quote);
          const slicesMatch = normalizedSlice === normalizedQuote;

          console.log(`  [${idx + 1}] Category: ${concern.category}`);
          console.log(`      Quote: "${concern.quote}"`);
          console.log(`      Offsets: [${concern.span.start}, ${concern.span.end}]`);
          console.log(`      Source slice matches quote: ${slicesMatch ? "YES" : "NO"}`);

          // Assert offset slice matches quote after whitespace normalization
          expect(slicesMatch).toBe(true);

          // Assert quote validates against original text
          const qVal = validateQuote(concern.quote, tc.text);
          expect(qVal.valid).toBe(true);

          // Assert quote contains NO source marker lines
          expect(containsSourceMarkerLine(concern.quote)).toBe(false);
        }

        console.log(`Missing Info Breakdown:`);
        for (const [idx, missing] of analysis.missingInfo.entries()) {
          console.log(`  [${idx + 1}] Topic: ${missing.topic}`);
          console.log(`      Note: "${missing.note}"`);
          if (missing.relatedQuote) {
            console.log(`      Related Quote: "${missing.relatedQuote}"`);
            expect(containsSourceMarkerLine(missing.relatedQuote)).toBe(false);
          }
        }

        // Assert: ok is true, every quote verified
        for (const concern of analysis.concerns) {
          expect(concern.span.start).toBeGreaterThanOrEqual(0);
          expect(concern.span.end).toBeGreaterThan(concern.span.start);
          const quoteCheck = validateQuote(concern.quote, tc.text);
          expect(quoteCheck.valid).toBe(true);
        }

        // Assert: no overclaiming language in validated output
        for (const concern of analysis.concerns) {
          expect(detectOverclaiming(concern.observation).flagged).toBe(false);
          expect(detectOverclaiming(concern.interpretation).flagged).toBe(false);
        }
        for (const missing of analysis.missingInfo) {
          expect(detectOverclaiming(missing.note).flagged).toBe(false);
        }
        for (const q of analysis.verificationQuestions) {
          expect(detectOverclaiming(q.question).flagged).toBe(false);
        }
        if (analysis.overallNote) {
          expect(detectOverclaiming(analysis.overallNote).flagged).toBe(false);
        }

        // Print as information only (not a failure) whether raw model output tripped guardrails when running directly
        if (rawOutputForDebug) {
          const rawCheck = detectOverclaiming(rawOutputForDebug);
          if (rawCheck.flagged) {
            console.log(
              `  [INFO ONLY] Raw model output tripped guardrails: ${rawCheck.reason} ("${rawCheck.matchedPhrase}")`
            );
          } else {
            console.log(
              `  [INFO ONLY] Raw model output did NOT trip guardrails.`
            );
          }
        }
        console.log(`======================================================\n`);
      },
      150000 // 150s per-case timeout (FIX 5)
    );
  }
});
