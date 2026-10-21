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
import { ModelOutput, ModelOutputSchema, ValidatedAnalysis } from "./schema";
import { parseModelOutput } from "./validate-result";
import { validateAnalysis } from "./validate-result";
import { SYSTEM_INSTRUCTION, buildUserContent } from "./prompt";
import { ModelCircuitBreaker, defaultCircuitBreaker } from "./model-health";

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
      input: string | unknown[];
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
  circuitBreaker?: ModelCircuitBreaker;
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
 * NEVER logs user text, file names, bytes, transcripts, model output, or credentials.
 * For upstream 4xx errors, includes upstream error text truncated to 120 chars only when NODE_ENV !== "production".
 */
export function logSafeAttemptError(
  code: AnalyzeErrorCode,
  httpStatus: number,
  attemptNumber: number,
  modelId: string,
  elapsedMs: number,
  upstreamStatusText?: string
): void {
  let extra = "";
  if (
    process.env.NODE_ENV !== "production" &&
    httpStatus >= 400 &&
    httpStatus < 500 &&
    upstreamStatusText
  ) {
    const clean = upstreamStatusText.replace(/[\r\n\t]+/g, " ").trim().slice(0, 120);
    extra = `, upstream=${clean}`;
  }
  console.error(
    `[OfferCheck] Analysis attempt failed: code=${code}, httpStatus=${httpStatus}, attempt=${attemptNumber}, model=${modelId}, elapsedMs=${elapsedMs}${extra}`
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

/**
 * Determines whether a 400 response from Gemini is model-specific (e.g. unsupported modality,
 * unsupported MIME type, unsupported thinking level or schema for that specific model).
 * Model-specific 400s fall through to the next model in the fallback chain.
 * Malformed requests caused by our own invalid request syntax or encoding do not loop.
 */
export function isModelSpecific400(err: unknown): boolean {
  if (!err) return false;
  const msg = (
    typeof err === "object" && err !== null
      ? String((err as Record<string, unknown>).message || "") +
        " " +
        JSON.stringify((err as Record<string, unknown>).error || "") +
        " " +
        JSON.stringify((err as Record<string, unknown>).body || "")
      : String(err)
  ).toLowerCase();

  return (
    msg.includes("not supported") ||
    msg.includes("unsupported") ||
    msg.includes("modality") ||
    msg.includes("mime type") ||
    msg.includes("mime_type") ||
    msg.includes("document") ||
    msg.includes("image") ||
    msg.includes("thinking") ||
    msg.includes("generation_config") ||
    msg.includes("response_format") ||
    msg.includes("schema") ||
    msg.includes("model")
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
  deadlineExhausted: boolean,
  actionNoun = "review"
): { code: AnalyzeErrorCode; httpStatus: number; message: string } {
  if (deadlineExhausted) {
    return {
      code: "TIMEOUT",
      httpStatus: 504,
      message:
        actionNoun === "review"
          ? "The review request timed out. Please try again with a shorter excerpt or check your connection."
          : "The transcription request timed out. Please try again with fewer or smaller files, or paste the text directly.",
    };
  }

  const outcomes = attempts.map((a) => a.outcome);

  if (outcomes.length > 0 && outcomes.every((o) => o === "RATE_LIMITED")) {
    return {
      code: "RATE_LIMITED",
      httpStatus: 429,
      message:
        actionNoun === "review"
          ? "The review service is currently busy. Please wait a moment and try again."
          : "The transcription service is currently busy. Please wait a moment and try again.",
    };
  }

  if (outcomes.length > 0 && outcomes.every((o) => o === "INVALID_MODEL_OUTPUT")) {
    return {
      code: "INVALID_MODEL_OUTPUT",
      httpStatus: 502,
      message:
        actionNoun === "review"
          ? "Unable to process the offer review due to an invalid model response. Please try again."
          : "Unable to process the files due to an invalid model response. Please try again.",
    };
  }

  if (outcomes.length > 0 && outcomes.every((o) => o === "TIMEOUT")) {
    return {
      code: "TIMEOUT",
      httpStatus: 504,
      message:
        actionNoun === "review"
          ? "The review request timed out. Please try again with a shorter excerpt or check your connection."
          : "The transcription request timed out. Please try again with fewer or smaller files, or paste the text directly.",
    };
  }

  return {
    code: "UPSTREAM_ERROR",
    httpStatus: 502,
    message:
      actionNoun === "review"
        ? "An upstream service error occurred while analyzing the offer. Please try again shortly."
        : "An upstream service error occurred while transcribing the files. Please try again shortly.",
  };
}

export interface FallbackChainParams<T> {
  client: GeminiModelClient;
  models: string[];
  overallDeadlineMs: number;
  perAttemptTimeoutCap: number;
  thinkingLevelEnv?: string;
  circuitBreaker: ModelCircuitBreaker;
  maxOutputTokens: number;
  systemInstruction?: string;
  responseSchema?: unknown;
  buildInput: (model: string) => unknown;
  parseOutput: (rawOutput: string | null | undefined) => { ok: true; data: T } | { ok: false; error: string };
  actionNoun?: string;
}

export type FallbackChainResult<T> =
  | {
      ok: true;
      data: T;
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

/**
 * Shared fallback chain loop for Gemini model calls.
 * Enforces overall deadline, per-attempt timeout, cancellation via AbortSignal,
 * circuit breaker integration, immediate exit on 400/401/403, and fallback on 429/5xx/timeout.
 */
export async function runModelFallbackChain<T>({
  client,
  models,
  overallDeadlineMs,
  perAttemptTimeoutCap,
  thinkingLevelEnv,
  circuitBreaker,
  maxOutputTokens,
  systemInstruction,
  responseSchema,
  buildInput,
  parseOutput,
  actionNoun = "review",
}: FallbackChainParams<T>): Promise<FallbackChainResult<T>> {
  const startTime = Date.now();
  const deadlineTimestamp = startTime + overallDeadlineMs;
  const attempts: ModelAttemptRecord[] = [];
  let deadlineExhausted = false;

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
      max_output_tokens: maxOutputTokens,
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

      const input = buildInput(currentModel);

      const interactionPromise = createFn(
        {
          model: currentModel,
          input: input as string | unknown[],
          system_instruction: systemInstruction,
          response_format: responseSchema
            ? {
                type: "text",
                mime_type: "application/json",
                schema: responseSchema,
              }
            : undefined,
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

      // 400, 401, 403: Configuration or request errors
      if (isNonRetryableStatus(status)) {
        const isAuth = status === 401 || status === 403;
        const errMessage = (err as Error)?.message || String(err);

        // If 400 is model-specific (e.g. unsupported modality, thinking level, schema for this specific model),
        // fall through to the next model in the fallback chain.
        // A 400 caused by our own malformed request syntax or invalid encoding must NOT loop.
        if (status === 400 && isModelSpecific400(err)) {
          const outcomeCode: AnalyzeErrorCode = "UPSTREAM_ERROR";
          logSafeAttemptError(
            outcomeCode,
            400,
            attempts.length + 1,
            currentModel,
            elapsedMs,
            errMessage
          );
          circuitBreaker.recordFailure(currentModel, outcomeCode, 400);
          attempts.push({
            model: currentModel,
            outcome: outcomeCode,
            httpStatus: 400,
            elapsedMs,
            error: errMessage,
          });
          continue;
        }

        const code: AnalyzeErrorCode = isAuth ? "NOT_CONFIGURED" : "UPSTREAM_ERROR";
        const finalStatus = isAuth ? 500 : 400;
        const message = isAuth
          ? "Offer review service is currently unavailable. Please try again later."
          : actionNoun === "transcription"
          ? "Unable to transcribe files due to an invalid request format."
          : "Unable to process the offer review due to an invalid request format.";

        logSafeAttemptError(
          code,
          status ?? finalStatus,
          attempts.length + 1,
          currentModel,
          elapsedMs,
          errMessage
        );
        attempts.push({
          model: currentModel,
          outcome: code,
          httpStatus: status ?? finalStatus,
          elapsedMs,
          error: errMessage,
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
      const errMessage = (err as Error)?.message || String(err);

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
        elapsedMs,
        errMessage
      );
      circuitBreaker.recordFailure(currentModel, outcomeCode, httpStatus);
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

    // Parse model output into structured schema
    const parseResult = parseOutput(rawOutput);
    if (!parseResult.ok) {
      logSafeAttemptError(
        "INVALID_MODEL_OUTPUT",
        502,
        attempts.length + 1,
        currentModel,
        elapsedMs
      );
      circuitBreaker.recordFailure(currentModel, "INVALID_MODEL_OUTPUT", 502);
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

    // Success
    circuitBreaker.recordSuccess(currentModel);
    attempts.push({
      model: currentModel,
      outcome: "SUCCESS",
      httpStatus: 200,
      elapsedMs,
    });

    return {
      ok: true,
      data: parseResult.data,
      modelUsed: currentModel,
      attempts,
      rawOutputForDebug: rawOutput,
    };
  }

  // All attempts failed or deadline was exhausted
  const finalError = determineFinalErrorCode(attempts, deadlineExhausted, actionNoun);
  return {
    ok: false,
    code: finalError.code,
    message: finalError.message,
    httpStatus: finalError.httpStatus,
    attempts,
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
      message: "Please provide offer text to review.",
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
  const rawModels =
    deps?.modelChain && deps.modelChain.length > 0
      ? deps.modelChain
          .map((m) => m.trim())
          .filter(Boolean)
          .slice(0, MAX_MODEL_ATTEMPTS)
      : deps?.modelName
        ? [deps.modelName.trim()]
        : parseModelChain(process.env.GEMINI_MODELS, process.env.GEMINI_MODEL);

  const breaker = deps?.circuitBreaker ?? defaultCircuitBreaker;
  const { modelsToTry } = breaker.filterModels(rawModels);
  const models = modelsToTry.slice(0, MAX_MODEL_ATTEMPTS);

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
    client = ai as unknown as GeminiModelClient;
  }

  const chainResult = await runModelFallbackChain<ModelOutput>({
    client,
    models,
    overallDeadlineMs,
    perAttemptTimeoutCap,
    thinkingLevelEnv,
    circuitBreaker: breaker,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    systemInstruction: SYSTEM_INSTRUCTION,
    responseSchema: GEMINI_RESPONSE_SCHEMA,
    buildInput: () => buildUserContent(trimmed),
    parseOutput: parseModelOutput,
    actionNoun: "review",
  });

  if (!chainResult.ok) {
    return chainResult;
  }

  const analysis = validateAnalysis(chainResult.data, text);
  return {
    ok: true,
    analysis,
    modelUsed: chainResult.modelUsed,
    attempts: chainResult.attempts,
    rawOutputForDebug: chainResult.rawOutputForDebug,
  };
}
