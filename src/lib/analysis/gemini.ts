import { z } from "zod";
import {
  MAX_INPUT_CHARS,
  MIN_INPUT_CHARS,
  DEFAULT_MODEL_CHAIN,
  MAX_MODEL_ATTEMPTS,
  OVERALL_DEADLINE_MS,
  PER_ATTEMPT_TIMEOUT_CAP_MS,
  MIN_REMAINING_TIME_FOR_ATTEMPT_MS,
  MAX_OUTPUT_TOKENS,
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

export type ModelAttemptOutcome = "SUCCESS" | AnalyzeErrorCode;

export interface ModelAttemptRecord {
  model: string;
  outcome: ModelAttemptOutcome;
  httpStatus?: number;
  elapsedMs: number;
  error?: string;
}

export type AnalyzeOfferResult =
  | {
      ok: true;
      analysis: ValidatedAnalysis;
      modelUsed: string;
      attempts: ModelAttemptRecord[];
      rawOutputForDebug?: string | null;
    }
  | {
      ok: false;
      code: AnalyzeErrorCode;
      message: string;
      httpStatus: number;
      attempts: ModelAttemptRecord[];
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
      generation_config?: {
        thinking_level?: string;
        max_output_tokens?: number;
        [key: string]: unknown;
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
  modelChain?: string[];
  modelName?: string; // legacy single-model override
  client?: GeminiModelClient;
  overallDeadlineMs?: number;
  perAttemptTimeoutMs?: number;
  thinkingLevel?: string;
}

export interface ModelThinkingSpec {
  allowedLevels: readonly string[];
  lowestLevel: string;
}

/**
 * Official thinking level specifications per model from https://ai.google.dev/gemini-api/docs/thinking.
 * Gemini 3.8 Flash supports "low", "medium", "high" (default "medium", lowest "low").
 * Gemini 3.6 Flash supports "minimal", "low", "medium", "high" (default "medium", lowest "minimal").
 * Gemini 3.5 Flash-Lite supports "minimal", "low", "medium", "high" (default "minimal", lowest "minimal").
 */
export const MODEL_THINKING_SPECS: Record<string, ModelThinkingSpec> = {
  "gemini-3.8-flash": {
    allowedLevels: ["low", "medium", "high"],
    lowestLevel: "low",
  },
  "gemini-3.6-flash": {
    allowedLevels: ["minimal", "low", "medium", "high"],
    lowestLevel: "minimal",
  },
  "gemini-3.5-flash-lite": {
    allowedLevels: ["minimal", "low", "medium", "high"],
    lowestLevel: "minimal",
  },
};

/**
 * Resolves the thinking_level for a model according to official documentation.
 * If user specifies GEMINI_THINKING_LEVEL and it is supported by the model, use it;
 * otherwise use the lowest documented level for that model.
 * If the model has no documented thinking specs, returns undefined (do not send).
 */
export function resolveThinkingLevel(
  modelName: string,
  envOverride?: string
): string | undefined {
  const spec = MODEL_THINKING_SPECS[modelName];
  if (!spec) return undefined;

  const override = envOverride?.trim().toLowerCase();
  if (override && spec.allowedLevels.includes(override)) {
    return override;
  }
  return spec.lowestLevel;
}

/**
 * Parses the ordered model fallback chain from environment variables.
 * Prioritizes GEMINI_MODELS (comma-separated), then legacy GEMINI_MODEL (single model),
 * falling back to DEFAULT_MODEL_CHAIN. Capped at MAX_MODEL_ATTEMPTS (3).
 */
export function parseModelChain(
  modelsEnv?: string,
  legacyModelEnv?: string
): string[] {
  if (modelsEnv && modelsEnv.trim()) {
    const parsed = modelsEnv
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
    if (parsed.length > 0) {
      return parsed.slice(0, MAX_MODEL_ATTEMPTS);
    }
  }
  if (legacyModelEnv && legacyModelEnv.trim()) {
    return [legacyModelEnv.trim()];
  }
  return [...DEFAULT_MODEL_CHAIN];
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
 * Safe logging helper that outputs metadata only (code, status, attempt number, model id, elapsedMs).
 * NEVER logs user text, model output, or credentials.
 */
function logSafeAttemptError(
  code: AnalyzeErrorCode,
  httpStatus: number,
  attemptNumber: number,
  modelId: string,
  elapsedMs: number
): void {
  console.error(
    `[OfferCheck] Analysis attempt failed: code=${code}, httpStatus=${httpStatus}, attempt=${attemptNumber}, model=${modelId}, elapsedMs=${elapsedMs}`
  );
}

function getErrorStatus(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null) {
    const r = err as Record<string, unknown>;
    if (typeof r.status === "number") return r.status;
    if (typeof r.statusCode === "number") return r.statusCode;
    if (typeof r.code === "number") return r.code;
    const msg = String(r.message || "");
    const match = msg.match(/\b(400|401|403|429|500|502|503|504)\b/);
    if (match) return parseInt(match[1], 10);
  }
  return undefined;
}

function isNonRetryableStatus(status?: number): boolean {
  return status === 400 || status === 401 || status === 403;
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

function isRateLimitError(err: unknown, status?: number): boolean {
  if (status === 429) return true;
  if (typeof err === "object" && err !== null) {
    const msg = String((err as Record<string, unknown>).message || "");
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      return true;
    }
  }
  return false;
}

function determineFinalErrorCode(
  attempts: ModelAttemptRecord[],
  deadlineExhausted: boolean
): { code: AnalyzeErrorCode; httpStatus: number; message: string } {
  if (deadlineExhausted) {
    return {
      code: "TIMEOUT",
      httpStatus: 504,
      message:
        "The review request timed out. Please try again with a shorter excerpt or check your connection.",
    };
  }

  const outcomes = attempts.map((a) => a.outcome);

  if (outcomes.length > 0 && outcomes.every((o) => o === "RATE_LIMITED")) {
    return {
      code: "RATE_LIMITED",
      httpStatus: 429,
      message:
        "The review service is currently busy. Please wait a moment and try again.",
    };
  }

  if (outcomes.length > 0 && outcomes.every((o) => o === "INVALID_MODEL_OUTPUT")) {
    return {
      code: "INVALID_MODEL_OUTPUT",
      httpStatus: 502,
      message:
        "Unable to process the offer review due to an invalid model response. Please try again.",
    };
  }

  if (outcomes.length > 0 && outcomes.every((o) => o === "TIMEOUT")) {
    return {
      code: "TIMEOUT",
      httpStatus: 504,
      message:
        "The review request timed out. Please try again with a shorter excerpt or check your connection.",
    };
  }

  return {
    code: "UPSTREAM_ERROR",
    httpStatus: 502,
    message:
      "An upstream service error occurred while analyzing the offer. Please try again shortly.",
  };
}

/**
 * Analyzes offer text by sending it to Gemini models via the Interactions API
 * with automatic fallback, strict time budgeting, and quotation validation.
 */
export async function analyzeOfferText(
  text: string,
  deps?: AnalyzeOfferDeps
): Promise<AnalyzeOfferResult> {
  // 1. Input validation (must NOT call any model)
  if (!text || typeof text !== "string" || !text.trim()) {
    return {
      ok: false,
      code: "EMPTY_INPUT",
      message: "Please provide internship offer text to review.",
      httpStatus: 422,
      attempts: [],
    };
  }

  const trimmed = text.trim();
  if (trimmed.length < MIN_INPUT_CHARS) {
    return {
      ok: false,
      code: "TOO_SHORT",
      message: `Offer text is too short (minimum ${MIN_INPUT_CHARS} characters). Please include more complete context from the offer.`,
      httpStatus: 422,
      attempts: [],
    };
  }

  if (text.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      code: "TOO_LONG",
      message: `Offer text exceeds the maximum allowed length of ${MAX_INPUT_CHARS.toLocaleString()} characters. Please shorten the text and try again.`,
      httpStatus: 413,
      attempts: [],
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
      attempts: [],
    };
  }

  // Model chain parsing
  const models =
    deps?.modelChain && deps.modelChain.length > 0
      ? deps.modelChain
          .map((m) => m.trim())
          .filter(Boolean)
          .slice(0, MAX_MODEL_ATTEMPTS)
      : deps?.modelName
        ? [deps.modelName.trim()]
        : parseModelChain(process.env.GEMINI_MODELS, process.env.GEMINI_MODEL);

  const overallDeadlineMs = deps?.overallDeadlineMs ?? OVERALL_DEADLINE_MS;
  const perAttemptTimeoutCap =
    deps?.perAttemptTimeoutMs ?? PER_ATTEMPT_TIMEOUT_CAP_MS;
  const thinkingLevelEnv =
    deps?.thinkingLevel ?? process.env.GEMINI_THINKING_LEVEL;

  // Set up model client using Google GenAI SDK Interactions API
  let client: GeminiModelClient;
  if (deps?.client) {
    client = deps.client;
  } else {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    client = ai;
  }

  const startTime = Date.now();
  const deadlineTimestamp = startTime + overallDeadlineMs;
  const attempts: ModelAttemptRecord[] = [];
  let deadlineExhausted = false;

  // 3. Fallback execution loop (up to MAX_MODEL_ATTEMPTS models)
  for (let i = 0; i < models.length; i++) {
    if (attempts.length >= MAX_MODEL_ATTEMPTS) {
      break;
    }

    const currentModel = models[i];
    const now = Date.now();
    const timeRemaining = deadlineTimestamp - now;

    // Check shared deadline before launching attempt
    if (timeRemaining <= MIN_REMAINING_TIME_FOR_ATTEMPT_MS) {
      deadlineExhausted = true;
      break;
    }

    // Per-attempt timeout = min(cap, time remaining minus safety margin)
    const perAttemptTimeout = Math.min(
      perAttemptTimeoutCap,
      Math.max(0, timeRemaining - 1500)
    );

    if (perAttemptTimeout < 1000) {
      deadlineExhausted = true;
      break;
    }

    const controller = new AbortController();
    const attemptStart = Date.now();
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        try {
          controller.abort();
        } catch {
          // Ignore if controller already aborted
        }
        const err = new Error("Request timed out");
        err.name = "TimeoutError";
        reject(err);
      }, perAttemptTimeout);
    });

    const thinkingLevel = resolveThinkingLevel(currentModel, thinkingLevelEnv);
    const generationConfig: Record<string, unknown> = {
      max_output_tokens: MAX_OUTPUT_TOKENS,
    };
    if (thinkingLevel) {
      generationConfig.thinking_level = thinkingLevel;
    }

    let rawOutput: string | null | undefined;

    try {
      const createFn =
        client.interactions?.create?.bind(client.interactions) ??
        client.create?.bind(client);

      if (!createFn) {
        throw new Error("Client does not provide an interactions.create method.");
      }

      const interactionPromise = createFn(
        {
          model: currentModel,
          input: buildUserContent(trimmed),
          system_instruction: SYSTEM_INSTRUCTION,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: GEMINI_RESPONSE_SCHEMA,
          },
          generation_config: generationConfig,
        },
        {
          signal: controller.signal,
          timeout_ms: perAttemptTimeout,
          maxRetries: 0,
        }
      );

      const interaction = await Promise.race([
        interactionPromise,
        timeoutPromise,
      ]);
      rawOutput = interaction.output_text;
    } catch (err: unknown) {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      const elapsedMs = Date.now() - attemptStart;
      const status = getErrorStatus(err);

      // 400, 401, 403: Configuration or request errors; FAIL IMMEDIATELY (no fallback)
      if (isNonRetryableStatus(status)) {
        const isAuth = status === 401 || status === 403;
        const code: AnalyzeErrorCode = isAuth ? "NOT_CONFIGURED" : "UPSTREAM_ERROR";
        const finalStatus = isAuth ? 500 : 400;
        const message = isAuth
          ? "Offer review service is currently unavailable. Please try again later."
          : "Unable to process the offer review due to an invalid request format.";

        logSafeAttemptError(
          code,
          status ?? finalStatus,
          attempts.length + 1,
          currentModel,
          elapsedMs
        );
        attempts.push({
          model: currentModel,
          outcome: code,
          httpStatus: status ?? finalStatus,
          elapsedMs,
          error: String((err as Error)?.message || err),
        });

        return {
          ok: false,
          code,
          message,
          httpStatus: finalStatus,
          attempts,
        };
      }

      // Retryable errors: Rate limits (429), timeouts, 503, or upstream network errors
      let outcomeCode: AnalyzeErrorCode;
      let httpStatus = status ?? 502;

      if (isTimeoutError(err)) {
        outcomeCode = "TIMEOUT";
        httpStatus = 504;
      } else if (isRateLimitError(err, status)) {
        outcomeCode = "RATE_LIMITED";
        httpStatus = 429;
      } else {
        outcomeCode = "UPSTREAM_ERROR";
        httpStatus = status ?? 502;
      }

      logSafeAttemptError(
        outcomeCode,
        httpStatus,
        attempts.length + 1,
        currentModel,
        elapsedMs
      );
      attempts.push({
        model: currentModel,
        outcome: outcomeCode,
        httpStatus,
        elapsedMs,
        error: String((err as Error)?.message || err),
      });

      // Fall back to next model in the chain
      continue;
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }

    const elapsedMs = Date.now() - attemptStart;

    // 4. Parse model output into structured schema
    const parseResult = parseModelOutput(rawOutput);
    if (!parseResult.ok) {
      logSafeAttemptError(
        "INVALID_MODEL_OUTPUT",
        502,
        attempts.length + 1,
        currentModel,
        elapsedMs
      );
      attempts.push({
        model: currentModel,
        outcome: "INVALID_MODEL_OUTPUT",
        httpStatus: 502,
        elapsedMs,
        error: parseResult.error,
      });
      // Fall back to next model in the chain
      continue;
    }

    // 5. Success: Validate analysis quotes against original source text
    attempts.push({
      model: currentModel,
      outcome: "SUCCESS",
      httpStatus: 200,
      elapsedMs,
    });

    const analysis = validateAnalysis(parseResult.data, text);
    return {
      ok: true,
      analysis,
      modelUsed: currentModel,
      attempts,
      rawOutputForDebug: rawOutput,
    };
  }

  // All attempts failed or deadline was exhausted
  const finalError = determineFinalErrorCode(attempts, deadlineExhausted);
  return {
    ok: false,
    code: finalError.code,
    message: finalError.message,
    httpStatus: finalError.httpStatus,
    attempts,
  };
}
