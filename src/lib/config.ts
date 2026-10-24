export const APP_NAME = "OfferClara";
export const TAGLINE = "Make every offer clear.";
export const HERO_HEADLINE = "Understand the offer. Know what to verify.";
export const FULL_TAGLINE = "Understand the offer. Know what to verify. Make every offer clear.";
export const MAX_INPUT_CHARS = 12000;
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

/** File upload & transcription constraints (Phase 8) */
export const MAX_UPLOAD_FILES = 5;
export const MAX_UPLOAD_TOTAL_BYTES = 4_000_000; // 4 MB raw bytes (under Vercel Functions 4.5 MB body limit)
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export const ALLOWED_PDF_TYPE = "application/pdf" as const;
export const ALLOWED_UPLOAD_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPE,
] as const;

export const TRANSCRIBE_PER_ATTEMPT_TIMEOUT_MS = 25000; // 25s per-attempt timeout cap for multimodal transcription
export const TRANSCRIBE_MAX_OUTPUT_TOKENS = 4000; // Enough for ~5 pages of text
export const MAX_TRANSCRIPT_CHARS = 40000; // Hard server cap for combined transcript

/** Separate rate limiting defaults for file transcription */
export const DEFAULT_TRANSCRIBE_RATE_LIMIT_PER_WINDOW = 6; // 6 transcriptions per 15 minutes
export const DEFAULT_TRANSCRIBE_RATE_LIMIT_PER_DAY = 20; // 20 transcriptions per 24 hours

export function getTranscribeRateLimitPerWindow(): number {
  if (process.env.TRANSCRIBE_LIMIT_PER_WINDOW) {
    const parsed = parseInt(process.env.TRANSCRIBE_LIMIT_PER_WINDOW, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_TRANSCRIBE_RATE_LIMIT_PER_WINDOW;
}

export function getTranscribeRateLimitPerDay(): number {
  if (process.env.TRANSCRIBE_LIMIT_PER_DAY) {
    const parsed = parseInt(process.env.TRANSCRIBE_LIMIT_PER_DAY, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_TRANSCRIBE_RATE_LIMIT_PER_DAY;
}

/** Separate rate limiting defaults for clear doubt AI helper */
export const DEFAULT_ASK_RATE_LIMIT_PER_WINDOW = 10; // 10 doubts per 15 minutes
export const DEFAULT_ASK_RATE_LIMIT_PER_DAY = 40; // 40 doubts per 24 hours

export function getAskRateLimitPerWindow(): number {
  if (process.env.ASK_LIMIT_PER_WINDOW) {
    const parsed = parseInt(process.env.ASK_LIMIT_PER_WINDOW, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_ASK_RATE_LIMIT_PER_WINDOW;
}

export function getAskRateLimitPerDay(): number {
  if (process.env.ASK_LIMIT_PER_DAY) {
    const parsed = parseInt(process.env.ASK_LIMIT_PER_DAY, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_ASK_RATE_LIMIT_PER_DAY;
}

export const AI_FILE_NOTICE =
  "Files you upload are sent to Google's Gemini API to read the text in them. OfferClara uses Google's free tier, where Google states that submitted content may be used to improve its products. Anything visible in an image or PDF is sent too, so crop or cover personal details first, or paste the text instead. OfferClara does not store your files.";

export const AI_DATA_NOTICE =
  "The text you submit is sent to Google's Gemini API and, if unavailable, may instead be sent to Groq, both on free tiers. Google states content may improve products; Groq processes text under its own terms without using customer inputs to train models by default. Do not submit anything you would not want processed this way.";
