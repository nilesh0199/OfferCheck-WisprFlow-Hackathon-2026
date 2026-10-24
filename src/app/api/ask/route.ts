import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deriveClientKey, defaultAskRateLimiter } from "@/lib/rate-limit";
import { callGroqChat, GROQ_DEFAULT_MODEL } from "@/lib/ai/groq";
import { defaultCircuitBreaker } from "@/lib/analysis/model-health";
import {
  DEFAULT_MODEL_CHAIN,
  PER_ATTEMPT_TIMEOUT_CAP_MS,
} from "@/lib/config";
import { cleanJsonSchemaForGemini, logSafeAttemptError } from "@/lib/analysis/gemini";
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
  getOfflineFallbackAskResponse,
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

interface RequestMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
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

  // 5. Construct prompt messages
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL;
  const groqModelId = `groq:${groqModel}`;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  let validatedResponse: AskResponse | null = null;
  let attemptIdx = 0;

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
          return NextResponse.json(
            { ok: true, data: validatedResponse },
            { status: 200, headers: NO_STORE_HEADERS }
          );
        }
      }

      if (!res.ok) {
        logSafeAttemptError(
          res.code === "RATE_LIMITED" ? "RATE_LIMITED" : "UPSTREAM_ERROR",
          res.httpStatus ?? 502,
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
          defaultCircuitBreaker.recordFailure(groqModelId, "UPSTREAM_ERROR", res.httpStatus);
        }
      }
    } catch (err: unknown) {
      clearTimeout(timeoutHandle);
      const elapsedMs = Date.now() - start;
      logSafeAttemptError("UPSTREAM_ERROR", 502, attemptIdx, groqModelId, elapsedMs, (err as Error)?.message);
      defaultCircuitBreaker.recordFailure(groqModelId, "UPSTREAM_ERROR", 502);
    }
  }

  // PRIORITY 2: Gemini Fallback Chain
  if (geminiApiKey && geminiApiKey.trim()) {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const models = [...DEFAULT_MODEL_CHAIN];
    for (const model of models) {
      if (!defaultCircuitBreaker.isModelAvailable(model)) continue;

      attemptIdx++;
      const start = Date.now();
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => {
        try { controller.abort(); } catch {}
      }, PER_ATTEMPT_TIMEOUT_CAP_MS);

      try {
        const createFn = (ai as unknown as { interactions?: { create: (...args: unknown[]) => Promise<{ output_text?: string | null }> } })
          .interactions?.create;

        if (!createFn) break;

        const formattedInput = conversationMessages.map((m, idx) => {
          if (idx === conversationMessages.length - 1 && m.role === "user") {
            return {
              role: "user",
              content: buildAskUserMessage(m.content, reviewContext),
            };
          }
          return { role: m.role, content: m.content };
        });

        const interaction = await createFn({
          model,
          input: formattedInput,
          system_instruction: ASK_SYSTEM_INSTRUCTION,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: ASK_RESPONSE_JSON_SCHEMA,
          },
          generation_config: {
            max_output_tokens: 1500,
          },
        }, {
          signal: controller.signal,
          timeout_ms: PER_ATTEMPT_TIMEOUT_CAP_MS,
        });

        clearTimeout(timeoutHandle);
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
            return NextResponse.json(
              { ok: true, data: validatedResponse },
              { status: 200, headers: NO_STORE_HEADERS }
            );
          }
        }

        logSafeAttemptError("INVALID_MODEL_OUTPUT", 502, attemptIdx, model, elapsedMs);
        defaultCircuitBreaker.recordFailure(model, "INVALID_MODEL_OUTPUT", 502);
      } catch (err: unknown) {
        clearTimeout(timeoutHandle);
        const elapsedMs = Date.now() - start;
        logSafeAttemptError("UPSTREAM_ERROR", 502, attemptIdx, model, elapsedMs, (err as Error)?.message);
        defaultCircuitBreaker.recordFailure(model, "UPSTREAM_ERROR", 502);
      }
    }
  }

  // PRIORITY 3: Deterministic Offline Fallback Response
  const fallback = getOfflineFallbackAskResponse(lastUserMessage);
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
