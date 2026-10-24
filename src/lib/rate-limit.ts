import { createHash, randomBytes } from "node:crypto";
import {
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  DEFAULT_RATE_LIMIT_DAY_MS,
  MAX_RATE_LIMIT_KEYS,
  getRateLimitPerWindow,
  getRateLimitPerDay,
  getTranscribeRateLimitPerWindow,
  getTranscribeRateLimitPerDay,
  getAskRateLimitPerWindow,
  getAskRateLimitPerDay,
} from "./config";

/** Per-process random salt so client hashes change on each server boot and cannot be precomputed. */
export const PROCESS_IP_SALT = randomBytes(16).toString("hex");

/**
 * Extracts and anonymizes the client IP into an irreversible SHA-256 hash.
 * Checks x-forwarded-for first (first comma-separated entry), then x-real-ip,
 * falling back to "local" when headers are absent.
 * NEVER stores, logs, or returns the raw IP.
 */
export function deriveClientKey(
  headers: Headers | Record<string, string | null | undefined>,
  salt: string = PROCESS_IP_SALT
): string {
  let rawIp = "local";

  if (typeof (headers as Headers).get === "function") {
    const h = headers as Headers;
    const forwarded = h.get("x-forwarded-for");
    if (forwarded && forwarded.trim()) {
      rawIp = forwarded.split(",")[0].trim() || "local";
    } else {
      const realIp = h.get("x-real-ip");
      if (realIp && realIp.trim()) {
        rawIp = realIp.trim();
      }
    }
  } else {
    const rec = headers as Record<string, string | null | undefined>;
    const forwarded = rec["x-forwarded-for"];
    if (forwarded && forwarded.trim()) {
      rawIp = forwarded.split(",")[0].trim() || "local";
    } else {
      const realIp = rec["x-real-ip"];
      if (realIp && realIp.trim()) {
        rawIp = realIp.trim();
      }
    }
  }

  return createHash("sha256").update(`${salt}:${rawIp}`).digest("hex");
}

export type RateLimitResult =
  | { allowed: true }
  | {
      allowed: false;
      retryAfterSeconds: number;
      retryAfterMinutes: number;
      message: string;
      reason: "WINDOW_EXCEEDED" | "DAY_EXCEEDED";
    };

interface ClientHistory {
  timestamps: number[];
  lastAccess: number;
}

export interface RateLimiterOptions {
  now?: () => number;
  maxKeys?: number;
  windowMs?: number;
  dayMs?: number;
  limitPerWindow?: number;
  limitPerDay?: number;
}

/**
 * In-memory sliding-window rate limiter per anonymized client key.
 * Enforces both a short window limit (default 8 analyses / 15 min)
 * and a daily cap (default 30 analyses / 24 hours).
 */
export class RateLimiter {
  private readonly clients = new Map<string, ClientHistory>();
  private readonly now: () => number;
  private readonly maxKeys: number;
  private readonly windowMs: number;
  private readonly dayMs: number;
  private readonly limitPerWindow: number;
  private readonly limitPerDay: number;

  constructor(options?: RateLimiterOptions) {
    this.now = options?.now ?? (() => Date.now());
    this.maxKeys = options?.maxKeys ?? MAX_RATE_LIMIT_KEYS;
    this.windowMs = options?.windowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS;
    this.dayMs = options?.dayMs ?? DEFAULT_RATE_LIMIT_DAY_MS;
    this.limitPerWindow =
      options?.limitPerWindow ?? getRateLimitPerWindow();
    this.limitPerDay = options?.limitPerDay ?? getRateLimitPerDay();
  }

  /**
   * Checks whether the client key is allowed to perform an analysis.
   * If allowed, records the request timestamp and returns { allowed: true }.
   * If exceeded, returns { allowed: false, retryAfterSeconds, retryAfterMinutes, message }.
   */
  checkAndRecord(clientKey: string): RateLimitResult {
    const currentTime = this.now();
    const dayThreshold = currentTime - this.dayMs;
    const windowThreshold = currentTime - this.windowMs;

    let history = this.clients.get(clientKey);

    if (!history) {
      this.ensureCapacity(currentTime);
      history = { timestamps: [], lastAccess: currentTime };
      this.clients.set(clientKey, history);
    } else {
      history.lastAccess = currentTime;
      // Filter out timestamps older than the daily window
      history.timestamps = history.timestamps.filter((t) => t > dayThreshold);
    }

    // 1. Check daily cap
    if (history.timestamps.length >= this.limitPerDay) {
      const oldestInDay = history.timestamps[0];
      const retryAfterMs = Math.max(0, oldestInDay + this.dayMs - currentTime);
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));

      return {
        allowed: false,
        retryAfterSeconds,
        retryAfterMinutes,
        message: `You have reached the request limit for now. Please try again in about ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? "" : "s"}.`,
        reason: "DAY_EXCEEDED",
      };
    }

    // 2. Check 15-minute window limit
    const windowTimestamps = history.timestamps.filter((t) => t > windowThreshold);
    if (windowTimestamps.length >= this.limitPerWindow) {
      const oldestInWindow = windowTimestamps[0];
      const retryAfterMs = Math.max(0, oldestInWindow + this.windowMs - currentTime);
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));

      return {
        allowed: false,
        retryAfterSeconds,
        retryAfterMinutes,
        message: `You have reached the request limit for now. Please try again in about ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? "" : "s"}.`,
        reason: "WINDOW_EXCEEDED",
      };
    }

    // Allowed: record timestamp
    history.timestamps.push(currentTime);
    return { allowed: true };
  }

  /**
   * Memory safety: evicts expired entries, and if still at capacity, evicts oldest keys.
   */
  private ensureCapacity(currentTime: number): void {
    if (this.clients.size < this.maxKeys) return;

    // First pass: purge all entries whose timestamps are completely expired
    const dayThreshold = currentTime - this.dayMs;
    for (const [key, record] of this.clients.entries()) {
      record.timestamps = record.timestamps.filter((t) => t > dayThreshold);
      if (record.timestamps.length === 0 && currentTime - record.lastAccess > this.dayMs) {
        this.clients.delete(key);
      }
    }

    // If still over capacity, sort by lastAccess and remove oldest 10%
    if (this.clients.size >= this.maxKeys) {
      const entries = Array.from(this.clients.entries()).sort(
        (a, b) => a[1].lastAccess - b[1].lastAccess
      );
      const toRemove = Math.ceil(this.maxKeys * 0.1);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        this.clients.delete(entries[i][0]);
      }
    }
  }

  /** Number of currently tracked keys (for testing/diagnostics) */
  getKeyCount(): number {
    return this.clients.size;
  }

  /** Reset internal state (for testing) */
  reset(): void {
    this.clients.clear();
  }
}

/** Default singleton instance used by the analysis route handler */
export const defaultRateLimiter = new RateLimiter();

/** Default singleton instance used by the transcription route handler */
export const defaultTranscribeRateLimiter = new RateLimiter({
  limitPerWindow: getTranscribeRateLimitPerWindow(),
  limitPerDay: getTranscribeRateLimitPerDay(),
});

/** Default singleton instance used by the clear doubt AI route handler */
export const defaultAskRateLimiter = new RateLimiter({
  limitPerWindow: getAskRateLimitPerWindow(),
  limitPerDay: getAskRateLimitPerDay(),
});
