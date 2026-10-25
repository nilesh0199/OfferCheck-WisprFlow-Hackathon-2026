import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ask/route";

// Load .env.local if present
if (fs.existsSync(".env.local")) {
  try {
    process.loadEnvFile(".env.local");
  } catch (err: unknown) {
    console.warn(
      "[Ask Live Tests] Could not parse .env.local:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

const hasGroqKey = Boolean(process.env.GROQ_API_KEY?.trim());

const EXAMPLE_QUESTIONS = [
  "I paid Rs 2,000 for a course that was sold as an internship. What should I do now?",
  "They asked for my Aadhaar and bank details before giving an offer letter. What should I check first?",
  "How do I check whether a company is registered?",
  "I got an offer on WhatsApp and I did not apply. What should I check?",
];

const BANNED_WORDS_REGEX = /\b(scam|scammer|scammers|fraud|fraudulent|frauds)\b/i;
const BANNED_GENERALIZATIONS_REGEX =
  /\b(employers\s+do\s+not|authentic\s+employers?|legitimate\s+employers?|genuine\s+employers?|rarely\s+ask)\b/i;

describe("Ask live route evaluations (Milestone R5)", () => {
  for (const question of EXAMPLE_QUESTIONS) {
    it(`evaluates live /api/ask handler for: "${question.slice(0, 30)}..."`, async () => {
      const startTime = Date.now();

      const req = new NextRequest("http://localhost:3000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
        }),
      });

      const res = await POST(req);
      const elapsedMs = Date.now() - startTime;
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(json.data).toBeDefined();

      const data = json.data;
      const dataString = JSON.stringify(data);

      // Verify zero banned verdict words
      expect(dataString).not.toMatch(BANNED_WORDS_REGEX);
      // Verify zero employer generalizations
      expect(dataString).not.toMatch(BANNED_GENERALIZATIONS_REGEX);

      // Identify code path taken
      const isFallback =
        typeof data.summary === "string" &&
        data.summary.startsWith(
          "The AI service is unavailable right now, so this is general guidance."
        );
      const codePath = isFallback
        ? "Deterministic Fallback (getDeterministicAskFallback)"
        : hasGroqKey
        ? "Live Groq Chat Completion"
        : "Live Gemini Model Chain";

      console.log(`[Ask Live Test] Question: "${question}"`);
      console.log(`  -> Code path: ${codePath}`);
      console.log(`  -> Elapsed: ${elapsedMs} ms`);
      console.log(`  -> Resources returned: [${data.resources?.join(", ")}]`);
      console.log(`  -> Summary: "${data.summary.slice(0, 80)}..."`);
    }, 30000);
  }
});
