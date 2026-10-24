/**
 * Plain fetch client for Groq Chat Completions API.
 * Uses zero third-party SDKs, frameworks, or runtime dependencies.
 */

export const GROQ_CHAT_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_DEFAULT_MODEL = "openai/gpt-oss-120b";
export const GROQ_TOKEN_BUDGET_CAP = 7000;
export const GROQ_DEADLINE_RESERVE_MS = 12000;

export interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqChatParams {
  messages: GroqChatMessage[];
  systemPrompt?: string;
  userPrompt?: string;
  jsonSchema?: Record<string, unknown>;
  maxOutputTokens?: number;
  reasoningEffort?: "low" | "medium" | "high";
  model?: string;
  apiKey?: string;
  signal?: AbortSignal;
  fetchFn?: typeof fetch;
}

export interface GroqChatResult {
  ok: boolean;
  content?: string;
  code?: string;
  message?: string;
  httpStatus?: number;
  retryAfterSeconds?: number;
  elapsedMs: number;
  model: string;
  tokensUsed?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Estimates token count as (system characters + user characters) / 3.5 + output cap.
 */
export function estimateGroqTokens(
  systemText: string,
  userText: string,
  outputCap: number = 2500
): number {
  const chars = (systemText?.length ?? 0) + (userText?.length ?? 0);
  return Math.ceil(chars / 3.5) + outputCap;
}

/**
 * Calls Groq's Chat Completions endpoint using native fetch.
 * Never logs prompts, outputs, or API keys.
 */
export async function callGroqChat({
  messages,
  systemPrompt,
  userPrompt,
  jsonSchema,
  maxOutputTokens = 2500,
  reasoningEffort = "low",
  model = process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL,
  apiKey = process.env.GROQ_API_KEY,
  signal,
  fetchFn = fetch,
}: GroqChatParams): Promise<GroqChatResult> {
  const startTime = Date.now();
  const effectiveModel = model || GROQ_DEFAULT_MODEL;

  if (!apiKey || !apiKey.trim()) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "Groq API key is not configured.",
      httpStatus: 500,
      elapsedMs: 0,
      model: effectiveModel,
    };
  }

  // Construct message payload
  const formattedMessages: GroqChatMessage[] = messages
    ? [...messages]
    : [];

  if (systemPrompt && !formattedMessages.some((m) => m.role === "system")) {
    formattedMessages.unshift({ role: "system", content: systemPrompt });
  }

  if (userPrompt) {
    formattedMessages.push({ role: "user", content: userPrompt });
  }

  const payload: Record<string, unknown> = {
    model: effectiveModel,
    messages: formattedMessages,
    max_completion_tokens: maxOutputTokens,
    reasoning_effort: reasoningEffort,
    reasoning_format: "hidden",
  };

  if (jsonSchema) {
    payload.response_format = {
      type: "json_schema",
      json_schema: {
        name: "structured_output",
        schema: jsonSchema,
      },
    };
  }

  try {
    const res = await fetchFn(GROQ_CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    const elapsedMs = Date.now() - startTime;

    // Handle Rate Limiting (429)
    if (res.status === 429) {
      const retryAfterHeader = res.headers.get("retry-after");
      let retryAfterSeconds = 60; // default to 60s
      if (retryAfterHeader) {
        const parsed = parseInt(retryAfterHeader, 10);
        if (!isNaN(parsed) && parsed > 0) {
          // Cap cooldown at 15 minutes (900 seconds)
          retryAfterSeconds = Math.min(900, parsed);
        }
      }

      return {
        ok: false,
        code: "RATE_LIMITED",
        message: "Groq rate limit exceeded.",
        httpStatus: 429,
        retryAfterSeconds,
        elapsedMs,
        model: effectiveModel,
      };
    }

    // Handle Authentication & Client Configuration Errors (401, 403, 400)
    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        code: "NOT_CONFIGURED",
        message: "Groq authentication failed or invalid API key.",
        httpStatus: res.status,
        elapsedMs,
        model: effectiveModel,
      };
    }

    if (res.status === 400) {
      return {
        ok: false,
        code: "UPSTREAM_ERROR",
        message: "Invalid request to Groq API.",
        httpStatus: 400,
        elapsedMs,
        model: effectiveModel,
      };
    }

    // Handle Upstream Server Errors (5xx)
    if (!res.ok) {
      return {
        ok: false,
        code: "UPSTREAM_ERROR",
        message: `Groq service error (HTTP ${res.status}).`,
        httpStatus: res.status,
        elapsedMs,
        model: effectiveModel,
      };
    }

    // Parse Successful Response
    const data = await res.json();
    const choice = data?.choices?.[0];
    const content = choice?.message?.content;

    if (typeof content !== "string") {
      return {
        ok: false,
        code: "INVALID_MODEL_OUTPUT",
        message: "Groq response did not contain text content.",
        httpStatus: 502,
        elapsedMs,
        model: effectiveModel,
      };
    }

    return {
      ok: true,
      content,
      httpStatus: 200,
      elapsedMs,
      model: effectiveModel,
      tokensUsed: {
        promptTokens: data?.usage?.prompt_tokens,
        completionTokens: data?.usage?.completion_tokens,
        totalTokens: data?.usage?.total_tokens,
      },
    };
  } catch (err: unknown) {
    const elapsedMs = Date.now() - startTime;
    const isTimeout =
      (err as Error)?.name === "TimeoutError" ||
      (err as Error)?.name === "AbortError";

    return {
      ok: false,
      code: isTimeout ? "TIMEOUT" : "UPSTREAM_ERROR",
      message: isTimeout ? "Groq request timed out." : "Network error contacting Groq.",
      httpStatus: isTimeout ? 504 : 502,
      elapsedMs,
      model: effectiveModel,
    };
  }
}
