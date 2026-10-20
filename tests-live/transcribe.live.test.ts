import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { transcribeFiles } from "@/lib/upload";

// Load .env.local using Node's built-in process.loadEnvFile if it exists
if (fs.existsSync(".env.local")) {
  try {
    process.loadEnvFile(".env.local");
  } catch (err: unknown) {
    console.warn(
      "[OfferCheck Live Transcribe Tests] Could not parse .env.local:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

const apiKey = process.env.GEMINI_API_KEY?.trim();
const hasApiKey = Boolean(apiKey);

if (!hasApiKey) {
  console.warn(
    "\n[OfferCheck Live Transcribe Tests] SKIPPED: GEMINI_API_KEY is not set." +
      "\nNo live transcription requests to Gemini will be made. Tests are safely skipped and NOT faked.\n"
  );
}

describe.skipIf(!hasApiKey)("Live Gemini API Transcription Suite", () => {
  it("transcribes a test PDF or image buffer via live Gemini Interactions API", async () => {
    // Minimal 1x1 valid PNG with IHDR and IDAT
    const minimalPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );

    const files = [
      {
        name: "test-image.png",
        type: "image/png" as const,
        buffer: minimalPng,
      },
    ];

    const result = await transcribeFiles(files, { apiKey });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.transcript).toBe("string");
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.perFileReadable)).toBe(true);
      expect(result.modelUsed).toBeDefined();
    }
  }, 120000);
});
