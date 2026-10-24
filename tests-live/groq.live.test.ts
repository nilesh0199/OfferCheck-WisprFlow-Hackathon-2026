import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { callGroqChat, GROQ_DEFAULT_MODEL } from "@/lib/ai/groq";

// 1. Load .env.local using Node's built-in process.loadEnvFile if it exists
if (fs.existsSync(".env.local")) {
  try {
    process.loadEnvFile(".env.local");
  } catch (err: unknown) {
    console.warn(
      "[Groq Live Tests] Could not parse .env.local:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

const groqApiKey = process.env.GROQ_API_KEY?.trim();
const hasGroqKey = Boolean(groqApiKey);

if (!hasGroqKey) {
  console.warn(
    "\n[Groq Live Tests] SKIPPED: GROQ_API_KEY is not set in the environment or .env.local." +
      "\nNo live requests to Groq will be made. Tests are safely skipped and NOT faked.\n"
  );
}

describe("Groq live API evaluations", () => {
  it.skipIf(!hasGroqKey)("executes live chat completion with structured json schema", async () => {
    const start = Date.now();
    const res = await callGroqChat({
      messages: [
        {
          role: "user",
          content: "Return a JSON object with 'status' set to 'ok' and 'testedAt' set to '2026-10-24'.",
        },
      ],
      systemPrompt: "You are a concise JSON assistant.",
      jsonSchema: {
        type: "object",
        properties: {
          status: { type: "string" },
          testedAt: { type: "string" },
        },
        required: ["status", "testedAt"],
      },
      model: process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL,
      apiKey: groqApiKey,
      maxOutputTokens: 100,
    });

    const elapsed = Date.now() - start;
    console.log(`[Groq Live] Elapsed: ${elapsed}ms, ok: ${res.ok}, model: ${res.model}`);

    expect(res.ok).toBe(true);
    expect(res.content).toBeDefined();

    if (res.content) {
      const parsed = JSON.parse(res.content);
      expect(parsed.status).toBe("ok");
    }
  });
});
