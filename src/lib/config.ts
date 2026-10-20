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

export const AI_DATA_NOTICE =
  "The text you submit is sent to Google's Gemini API for analysis. OfferCheck uses Google's free tier, where Google states that submitted content may be used to improve its products. Do not submit anything you would not want processed this way.";
