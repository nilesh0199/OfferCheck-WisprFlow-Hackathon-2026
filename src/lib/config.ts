export const APP_NAME = "OfferCheck";
export const TAGLINE = "Understand the offer. Know what to verify.";
export const MAX_INPUT_CHARS = 8000;
export const MIN_INPUT_CHARS = 40;
export const MIN_QUOTE_CHARS = 4;
export const MAX_QUOTE_CHARS = 300;

/** Default ordered fallback model chain (free-tier eligible, active, non-deprecated). */
export const DEFAULT_MODEL_CHAIN: readonly string[] = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
];

export const MAX_MODEL_ATTEMPTS = 3;
export const OVERALL_DEADLINE_MS = 55000; // 55s shared request deadline (below Vercel maxDuration 60s)
export const PER_ATTEMPT_TIMEOUT_CAP_MS = 20000; // 20s per-attempt timeout cap
export const MIN_REMAINING_TIME_FOR_ATTEMPT_MS = 3000; // 3s safety margin: skip attempt if less time remains
export const MAX_OUTPUT_TOKENS = 2500; // Token limit for structured output response

// Kept for backward compatibility
export const REQUEST_TIMEOUT_MS = PER_ATTEMPT_TIMEOUT_CAP_MS;
export const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";

/** Rate limiting defaults (best-effort sliding window per hashed client key) */
export const DEFAULT_RATE_LIMIT_PER_WINDOW = 8; // 8 analyses per 15 minutes
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const DEFAULT_RATE_LIMIT_PER_DAY = 30; // 30 analyses per 24 hours
export const DEFAULT_RATE_LIMIT_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_RATE_LIMIT_KEYS = 5000; // Maximum tracked keys before eviction

/** Resolve rate limit per 15m window from optional env override or default */
export function getRateLimitPerWindow(): number {
  if (process.env.RATE_LIMIT_PER_WINDOW) {
    const parsed = parseInt(process.env.RATE_LIMIT_PER_WINDOW, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_RATE_LIMIT_PER_WINDOW;
}

/** Resolve rate limit per 24h day from optional env override or default */
export function getRateLimitPerDay(): number {
  if (process.env.RATE_LIMIT_PER_DAY) {
    const parsed = parseInt(process.env.RATE_LIMIT_PER_DAY, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_RATE_LIMIT_PER_DAY;
}

/** Concurrency guard: maximum analyses in flight per server instance */
export const MAX_CONCURRENT_ANALYSES = 4;

/** Model circuit breaker cooldown periods */
export const CIRCUIT_BREAKER_TIMEOUT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes on TIMEOUT
export const CIRCUIT_BREAKER_RATE_LIMIT_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes on 429/RESOURCE_EXHAUSTED
export const CIRCUIT_BREAKER_SERVER_ERROR_COOLDOWN_MS = 1 * 60 * 1000; // 1 minute on 503/5xx

export const AI_DATA_NOTICE =
  "The text you submit is sent to Google's Gemini API for analysis. OfferCheck uses Google's free tier, where Google states that submitted content may be used to improve its products. Do not submit anything you would not want processed this way.";
