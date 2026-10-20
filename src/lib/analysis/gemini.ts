import { z } from "zod";
import {
  MAX_INPUT_CHARS,
  MIN_INPUT_CHARS,
  REQUEST_TIMEOUT_MS,
  GEMINI_DEFAULT_MODEL,
} from "@/lib/config";
import { ModelOutputSchema, ValidatedAnalysis } from "./schema";
import { parseModelOutput } from "./validate-result";
import { validateAnalysis } from "./validate-result";
import { SYSTEM_INSTRUCTION, buildUserContent } from "./prompt";

export type AnalyzeErrorCode =
  | "EMPTY_INPUT"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "UPSTREAM_ERROR"
  | "INVALID_MODEL_OUTPUT";

export type AnalyzeOfferResult =
  | { ok: true; analysis: ValidatedAnalysis; rawOutputForDebug?: string | null }
  | {
      ok: false;
      code: AnalyzeErrorCode;
      message: string;
      httpStatus: number;
    };

export interface GeminiInteractionClient {
  create: (
    params: {
      model: string;
      input: string;
      system_instruction?: string;
      response_format?: {
        type?: string;
        mime_type?: string;
        schema?: unknown;
      };
      [key: string]: unknown;
    },
    options?: {
      signal?: AbortSignal;
      timeout_ms?: number;
      [key: string]: unknown;
    }
  ) => Promise<{ output_text?: string | null }>;
}

export interface GeminiModelClient {
  interactions?: GeminiInteractionClient;
  create?: GeminiInteractionClient["create"];
}

export interface AnalyzeOfferDeps {
  apiKey?: string;
  modelName?: string;
  client?: GeminiModelClient;
  timeoutMs?: number;
}

/**
 * Strips JSON schema keywords unsupported by Gemini Structured Outputs.
 * Gemini supports $defs, $ref, type, title, description, enum, items, prefixItems,
 * minItems, maxItems, minimum, maximum, anyOf, oneOf, properties, additionalProperties, required.
 * Unsupported keywords (e.g. $schema, minLength, maxLength, pattern, format, default) are stripped.
 */
export function cleanJsonSchemaForGemini(schema: unknown): unknown {
  if (!schema || typeof schema !== "object") return schema;
  if (Array.isArray(schema)) return schema.map(cleanJsonSchemaForGemini);

  const unsupportedKeys = new Set([
    "$schema",
    "minLength",
    "maxLength",
    "pattern",
    "format",
    "default",
  ]);

  const record = schema as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (unsupportedKeys.has(key)) continue;
    result[key] = cleanJsonSchemaForGemini(value);
  }

  return result;
}

export const GEMINI_RESPONSE_SCHEMA = cleanJsonSchemaForGemini(
  z.toJSONSchema(ModelOutputSchema)
);

/**
 * Safe logging helper that outputs only metadata (code, HTTP status, attempts).
 * NEVER logs user text, model output, or credentials.
 */
function logSafeError(
  code: AnalyzeErrorCode,
  httpStatus: number,
  attemptCount: number
): void {
  console.error(
    `[OfferCheck] Analysis failed: code=${code}, httpStatus=${httpStatus}, attempts=${attemptCount}`
  );
}

function isTimeoutError(err: unknown): boolean {
  if (err instanceof Error) {
    if (
      err.name === "AbortError" ||
      err.name === "TimeoutError" ||
      err.name === "APIUserAbortError" ||
      err.name === "RequestTimeoutError" ||
      err.message.toLowerCase().includes("timeout") ||
      err.message.toLowerCase().includes("aborted")
    ) {
      return true;
    }
  }
  return false;
}

function isRateLimitError(err: unknown): boolean {
  if (typeof err === "object" && err !== null) {
    const errorRecord = err as Record<string, unknown>;
    const status = errorRecord.status ?? errorRecord.statusCode ?? errorRecord.code;
    if (status === 429) return true;
    const msg = String(errorRecord.message || "");
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      return true;
    }
  }
  return false;
}

/**
 * Analyzes offer text by sending it to Gemini via the Interactions API and validating the response.
 */
export async function analyzeOfferText(
  text: string,
  deps?: AnalyzeOfferDeps
): Promise<AnalyzeOfferResult> {
  // 1. Input validation (must NOT call the model)
  if (!text || typeof text !== "string" || !text.trim()) {
    return {
      ok: false,
      code: "EMPTY_INPUT",
      message: "Please provide internship offer text to review.",
      httpStatus: 422,
    };
  }

  const trimmed = text.trim();
  if (trimmed.length < MIN_INPUT_CHARS) {
    return {
      ok: false,
      code: "TOO_SHORT",
      message: `Offer text is too short (minimum ${MIN_INPUT_CHARS} characters). Please include more complete context from the offer.`,
      httpStatus: 422,
    };
  }

  if (text.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      code: "TOO_LONG",
      message: `Offer text exceeds the maximum allowed length of ${MAX_INPUT_CHARS.toLocaleString()} characters. Please shorten the text and try again.`,
      httpStatus: 413,
    };
  }

  // 2. API Key and configuration check
  const apiKey = deps?.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message:
        "Offer review service is currently unavailable. Please try again later.",
      httpStatus: 500,
    };
  }

  const modelName =
    deps?.modelName ?? process.env.GEMINI_MODEL ?? GEMINI_DEFAULT_MODEL;
  const timeoutMs = deps?.timeoutMs ?? REQUEST_TIMEOUT_MS;

  // Set up model client using Google GenAI SDK Interactions API
  let client: GeminiModelClient;
  if (deps?.client) {
    client = deps.client;
  } else {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    client = ai;
  }

  // 3. Call model with timeout and retry once if output is unparseable
  let attemptCount = 0;
  const maxAttempts = 2;

  while (attemptCount < maxAttempts) {
    attemptCount++;
    let rawOutput: string | null | undefined;

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const createFn =
        client.interactions?.create?.bind(client.interactions) ??
        client.create?.bind(client);

      if (!createFn) {
        throw new Error("Client does not provide an interactions.create method.");
      }

      const interaction = await createFn(
        {
          model: modelName,
          input: buildUserContent(trimmed),
          system_instruction: SYSTEM_INSTRUCTION,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: GEMINI_RESPONSE_SCHEMA,
          },
        },
        {
          signal: controller.signal,
          timeout_ms: timeoutMs,
        }
      );
      rawOutput = interaction.output_text;
    } catch (err: unknown) {
      clearTimeout(timeoutHandle);
      if (isTimeoutError(err)) {
        logSafeError("TIMEOUT", 504, attemptCount);
        return {
          ok: false,
          code: "TIMEOUT",
          message:
            "The review request timed out. Please try again with a shorter excerpt or check your connection.",
          httpStatus: 504,
        };
      }
      if (isRateLimitError(err)) {
        logSafeError("RATE_LIMITED", 429, attemptCount);
        return {
          ok: false,
          code: "RATE_LIMITED",
          message:
            "The review service is currently busy. Please wait a moment and try again.",
          httpStatus: 429,
        };
      }
      logSafeError("UPSTREAM_ERROR", 502, attemptCount);
      return {
        ok: false,
        code: "UPSTREAM_ERROR",
        message:
          "An upstream service error occurred while analyzing the offer. Please try again shortly.",
        httpStatus: 502,
      };
    } finally {
      clearTimeout(timeoutHandle);
    }

    // 4. Parse model output; retry once if invalid
    const parseResult = parseModelOutput(rawOutput);
    if (parseResult.ok) {
      // 5. Validate analysis against original source text
      const analysis = validateAnalysis(parseResult.data, text);
      return { ok: true, analysis, rawOutputForDebug: rawOutput };
    }

    if (attemptCount < maxAttempts) {
      // Retry once
      continue;
    }
  }

  logSafeError("INVALID_MODEL_OUTPUT", 502, attemptCount);
  return {
    ok: false,
    code: "INVALID_MODEL_OUTPUT",
    message:
      "Unable to process the offer review due to an invalid model response. Please try again.",
    httpStatus: 502,
  };
}
