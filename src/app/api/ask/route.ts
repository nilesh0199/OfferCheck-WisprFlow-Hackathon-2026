import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deriveClientKey, defaultAskRateLimiter } from "@/lib/rate-limit";
import { callGroqChat, GROQ_DEFAULT_MODEL } from "@/lib/ai/groq";
import { defaultCircuitBreaker } from "@/lib/analysis/model-health";
import {
  DEFAULT_MODEL_CHAIN,
  PER_ATTEMPT_TIMEOUT_CAP_MS,
  OVERALL_DEADLINE_MS,
} from "@/lib/config";
import {
  cleanJsonSchemaForGemini,
  logSafeAttemptError,
  resolveThinkingLevel,
  isModelSpecific400,
} from "@/lib/analysis/gemini";
import {
  AskResponse,
  AskResponseSchema,
  AskReviewContext,
} from "@/lib/ask/schema";
import {
  ASK_SYSTEM_INSTRUCTION,
  buildAskUserMessage,
} from "@/lib/ask/prompt";
import {
  sanitizeAndValidateAskResponse,
  getDeterministicAskFallback,
} from "@/lib/ask/guardrails";

export const maxDuration = 60;

const MAX_BODY_BYTES = 32 * 1024; // 32 KB
const MAX_USER_MESSAGES = 6;
const MAX_MESSAGE_CHARS = 1500;
const GROQ_TIMEOUT_MS = 15000; // 15s per-attempt timeout for Groq

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

const ASK_RESPONSE_JSON_SCHEMA = cleanJsonSchemaForGemini(
  z.toJSONSchema(AskResponseSchema)
) as Record<string, unknown>;

export interface RequestMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AskAttemptDiagnostic {
  provider: "gemini" | "groq";
  code: string;
  httpStatus?: number;
  attemptNumber: number;
  elapsedMs: number;
}

export interface AskExecutionDiagnostics {
  fallbackUsed: boolean;
  attempts: AskAttemptDiagnostic[];
}

export interface AskTestHooks {
  onDiagnostics?: (diagnostics: AskExecutionDiagnostics) => void;
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

export function formatAskConversationForGemini(
  messages: RequestMessage[],
  reviewContext?: AskReviewContext
): string {
  if (messages.length === 1 && messages[0].role === "user") {
    return buildAskUserMessage(messages[0].content, reviewContext);
  }
  return messages
    .map((m, idx) => {
      const isLastUser = idx === messages.length - 1 && m.role === "user";
      const text = isLastUser ? buildAskUserMessage(m.content, reviewContext) : m.content;
      return `${m.role === "user" ? "Student" : "Assistant"}: ${text}`;
    })
    .join("\n\n");
}

export async function POST(
  req: NextRequest,
  testHooks?: AskTestHooks | unknown
) {
  const attemptsDiagnostics: AskAttemptDiagnostic[] = [];
  const onDiagnosticsCallback =
    (testHooks as AskTestHooks)?.onDiagnostics ||
    (req as unknown as { __onDiagnostics?: (d: AskExecutionDiagnostics) => void }).__onDiagnostics;

  const reportDiagnostics = (fallbackUsed: boolean) => {
    if (onDiagnosticsCallback) {
      try {
        onDiagnosticsCallback({
          fallbackUsed,
          attempts: [...attemptsDiagnostics],
        });
      } catch {}
    }
  };
  // 1. Content-Length header guard
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TOO_LONG",
          message: "Request payload exceeds maximum allowed size of 32 KB.",
        },
      },
      { status: 413, headers: NO_STORE_HEADERS }
    );
  }

  // 2. Read body
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Failed to read request body.",
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TOO_LONG",
          message: "Request payload exceeds maximum allowed size of 32 KB.",
        },
      },
      { status: 413, headers: NO_STORE_HEADERS }
    );
  }

  // 3. Parse JSON body
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  if (!parsed || typeof parsed !== "object" || !("messages" in parsed)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Field 'messages' is required.",
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const rawMessages = (parsed as { messages: unknown }).messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "EMPTY_INPUT",
          message: "At least one message is required.",
        },
      },
      { status: 422, headers: NO_STORE_HEADERS }
    );
  }

  // Validate message count and lengths
  const userMessages: RequestMessage[] = [];
  const conversationMessages: RequestMessage[] = [];

  for (const m of rawMessages) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role: unknown }).role;
    const content = (m as { content: unknown }).content;

    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;

    if (content.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "TOO_LONG",
            message: `Message exceeds maximum allowed length of ${MAX_MESSAGE_CHARS} characters.`,
          },
        },
        { status: 413, headers: NO_STORE_HEADERS }
      );
    }

    const item: RequestMessage = { role, content: content.trim() };
    conversationMessages.push(item);
    if (role === "user") {
      userMessages.push(item);
    }
  }

  if (userMessages.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "EMPTY_INPUT",
          message: "Please provide a question or inquiry.",
        },
      },
      { status: 422, headers: NO_STORE_HEADERS }
    );
  }

  if (userMessages.length > MAX_USER_MESSAGES) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TOO_MANY_MESSAGES",
          message: `Conversation thread exceeds maximum limit of ${MAX_USER_MESSAGES} questions. Please clear thread to start a new inquiry.`,
        },
      },
      { status: 422, headers: NO_STORE_HEADERS }
    );
  }

  const lastUserMessage = userMessages[userMessages.length - 1].content;
  const reviewContext = (parsed as { reviewContext?: AskReviewContext }).reviewContext;

  // 4. Rate Limiting
  const clientKey = deriveClientKey(req.headers);
  const rateLimit = defaultAskRateLimiter.checkAndRecord(clientKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "RATE_LIMITED_CLIENT",
          message: rateLimit.message,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
      },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  // 5. Construct prompt messages and execute fallback chain
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL;
  const groqModelId = `groq:${groqModel}`;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  let validatedResponse: AskResponse | null = null;
  let attemptIdx = 0;
  const startTime = Date.now();
  const overallDeadlineMs = OVERALL_DEADLINE_MS;

  // PRIORITY 1: Groq Chat Completion
  if (groqApiKey && groqApiKey.trim() && defaultCircuitBreaker.isModelAvailable(groqModelId)) {
    attemptIdx++;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => {
      try { controller.abort(); } catch {}
    }, GROQ_TIMEOUT_MS);

    const start = Date.now();
    try {
      const formattedMessages = conversationMessages.map((m, idx) => {
        if (idx === conversationMessages.length - 1 && m.role === "user") {
          return {
            role: "user" as const,
            content: buildAskUserMessage(m.content, reviewContext),
          };
        }
        return { role: m.role, content: m.content };
      });

      const res = await callGroqChat({
        messages: formattedMessages,
        systemPrompt: ASK_SYSTEM_INSTRUCTION,
        jsonSchema: ASK_RESPONSE_JSON_SCHEMA,
        model: groqModel,
        apiKey: groqApiKey,
        maxOutputTokens: 1500,
        reasoningEffort: "low",
        signal: controller.signal,
      });

      clearTimeout(timeoutHandle);
      const elapsedMs = Date.now() - start;

      if (res.ok && res.content) {
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(res.content);
        } catch {
          parsedJson = null;
        }

        if (parsedJson) {
          validatedResponse = sanitizeAndValidateAskResponse(parsedJson);
        }

        if (validatedResponse) {
          defaultCircuitBreaker.recordSuccess(groqModelId);
          attemptsDiagnostics.push({
            provider: "groq",
            code: "SUCCESS",
            httpStatus: 200,
            attemptNumber: attemptIdx,
            elapsedMs,
          });
          reportDiagnostics(false);
          return NextResponse.json(
            { ok: true, data: validatedResponse },
            { status: 200, headers: NO_STORE_HEADERS }
          );
        }
      }

      const groqCode = res.code === "RATE_LIMITED" ? "RATE_LIMITED" : "UPSTREAM_ERROR";
      const groqStatus = res.httpStatus ?? (res.code === "RATE_LIMITED" ? 429 : 502);
      logSafeAttemptError(
        groqCode,
        groqStatus,
        attemptIdx,
        groqModelId,
        elapsedMs,
        res.message
      );
      if (res.code === "RATE_LIMITED") {
        defaultCircuitBreaker.recordFailure(
          groqModelId,
          "RATE_LIMITED",
          429,
          undefined,
          (res.retryAfterSeconds ?? 60) * 1000
        );
      } else {
        defaultCircuitBreaker.recordFailure(groqModelId, "UPSTREAM_ERROR", groqStatus);
      }
      attemptsDiagnostics.push({
        provider: "groq",
        code: groqCode,
        httpStatus: groqStatus,
        attemptNumber: attemptIdx,
        elapsedMs,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutHandle);
      const elapsedMs = Date.now() - start;
      logSafeAttemptError("UPSTREAM_ERROR", 502, attemptIdx, groqModelId, elapsedMs, (err as Error)?.message);
      defaultCircuitBreaker.recordFailure(groqModelId, "UPSTREAM_ERROR", 502);
      attemptsDiagnostics.push({
        provider: "groq",
        code: "UPSTREAM_ERROR",
        httpStatus: 502,
        attemptNumber: attemptIdx,
        elapsedMs,
      });
    }
  }

  // PRIORITY 2: Gemini Fallback Chain
  if (geminiApiKey && geminiApiKey.trim()) {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const models = [...DEFAULT_MODEL_CHAIN];
    for (const model of models) {
      const timeRemaining = overallDeadlineMs - (Date.now() - startTime);
      if (timeRemaining <= 3000) {
        break;
      }

      if (!defaultCircuitBreaker.isModelAvailable(model)) {
        continue;
      }

      attemptIdx++;
      const start = Date.now();
      const perAttemptTimeout = Math.min(
        PER_ATTEMPT_TIMEOUT_CAP_MS,
        Math.max(1000, timeRemaining - 1500)
      );

      const controller = new AbortController();
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          try { controller.abort(); } catch {}
          const err = new Error("Request timed out");
          err.name = "TimeoutError";
          reject(err);
        }, perAttemptTimeout);
      });

      try {
        if (!ai.interactions?.create) break;

        const inputString = formatAskConversationForGemini(conversationMessages, reviewContext);
        const thinkingLevel = resolveThinkingLevel(model, process.env.GEMINI_THINKING_LEVEL);
        const generationConfig: Record<string, unknown> = {
          max_output_tokens: 1500,
        };
        if (thinkingLevel) {
          generationConfig.thinking_level = thinkingLevel;
        }

        const interactionPromise = ai.interactions.create({
          model,
          input: inputString,
          system_instruction: ASK_SYSTEM_INSTRUCTION,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: ASK_RESPONSE_JSON_SCHEMA,
          },
          generation_config: generationConfig,
        }, {
          signal: controller.signal,
          timeout_ms: perAttemptTimeout,
        });

        const interaction = await Promise.race([
          interactionPromise,
          timeoutPromise,
        ]);

        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
        const elapsedMs = Date.now() - start;

        if (interaction?.output_text) {
          let parsedJson: unknown;
          try {
            parsedJson = JSON.parse(interaction.output_text);
          } catch {
            parsedJson = null;
          }

          if (parsedJson) {
            validatedResponse = sanitizeAndValidateAskResponse(parsedJson);
          }

          if (validatedResponse) {
            defaultCircuitBreaker.recordSuccess(model);
            attemptsDiagnostics.push({
              provider: "gemini",
              code: "SUCCESS",
              httpStatus: 200,
              attemptNumber: attemptIdx,
              elapsedMs,
            });
            reportDiagnostics(false);
            return NextResponse.json(
              { ok: true, data: validatedResponse },
              { status: 200, headers: NO_STORE_HEADERS }
            );
          }
        }

        logSafeAttemptError("INVALID_MODEL_OUTPUT", 502, attemptIdx, model, elapsedMs);
        defaultCircuitBreaker.recordFailure(model, "INVALID_MODEL_OUTPUT", 502);
        attemptsDiagnostics.push({
          provider: "gemini",
          code: "INVALID_MODEL_OUTPUT",
          httpStatus: 502,
          attemptNumber: attemptIdx,
          elapsedMs,
        });
      } catch (err: unknown) {
        clearTimeout(timeoutHandle);
        const elapsedMs = Date.now() - start;
        const status = getErrorStatus(err);
        const errMessage = (err as Error)?.message || String(err);

        let safeCode: string;
        let httpStatus = status ?? 502;

        if (status === 400 && !isModelSpecific400(err)) {
          // Malformed request caused by syntax on our side: do NOT loop!
          safeCode = "INVALID_REQUEST";
          httpStatus = 400;
          logSafeAttemptError("UPSTREAM_ERROR", 400, attemptIdx, model, elapsedMs, errMessage);
          attemptsDiagnostics.push({
            provider: "gemini",
            code: safeCode,
            httpStatus: 400,
            attemptNumber: attemptIdx,
            elapsedMs,
          });
          break;
        } else if (status === 400 && isModelSpecific400(err)) {
          safeCode = "UPSTREAM_ERROR";
          httpStatus = 400;
          logSafeAttemptError("UPSTREAM_ERROR", 400, attemptIdx, model, elapsedMs, errMessage);
          defaultCircuitBreaker.recordFailure(model, "UPSTREAM_ERROR", 400);
          attemptsDiagnostics.push({
            provider: "gemini",
            code: safeCode,
            httpStatus: 400,
            attemptNumber: attemptIdx,
            elapsedMs,
          });
          continue;
        } else if (isRateLimitError(err, status)) {
          safeCode = "RATE_LIMITED";
          httpStatus = 429;
          logSafeAttemptError("RATE_LIMITED", 429, attemptIdx, model, elapsedMs, errMessage);
          defaultCircuitBreaker.recordFailure(model, "RATE_LIMITED", 429);
          attemptsDiagnostics.push({
            provider: "gemini",
            code: safeCode,
            httpStatus: 429,
            attemptNumber: attemptIdx,
            elapsedMs,
          });
          continue;
        } else if (isTimeoutError(err)) {
          safeCode = "TIMEOUT";
          httpStatus = 504;
          logSafeAttemptError("TIMEOUT", 504, attemptIdx, model, elapsedMs, errMessage);
          defaultCircuitBreaker.recordFailure(model, "TIMEOUT", 504);
          attemptsDiagnostics.push({
            provider: "gemini",
            code: safeCode,
            httpStatus: 504,
            attemptNumber: attemptIdx,
            elapsedMs,
          });
          continue;
        } else {
          safeCode = "UPSTREAM_ERROR";
          httpStatus = status ?? 502;
          logSafeAttemptError("UPSTREAM_ERROR", httpStatus, attemptIdx, model, elapsedMs, errMessage);
          defaultCircuitBreaker.recordFailure(model, "UPSTREAM_ERROR", httpStatus);
          attemptsDiagnostics.push({
            provider: "gemini",
            code: safeCode,
            httpStatus,
            attemptNumber: attemptIdx,
            elapsedMs,
          });
          continue;
        }
      }
    }
  }

  // PRIORITY 3: Deterministic Offline Fallback Response
  reportDiagnostics(true);
  const fallback = getDeterministicAskFallback(lastUserMessage);
  return NextResponse.json(
    { ok: true, data: fallback },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export async function GET() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST", ...NO_STORE_HEADERS },
  });
}

export async function PUT() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST", ...NO_STORE_HEADERS },
  });
}

export async function DELETE() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST", ...NO_STORE_HEADERS },
  });
}
