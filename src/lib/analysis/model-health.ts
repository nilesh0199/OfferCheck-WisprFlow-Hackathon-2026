import {
  CIRCUIT_BREAKER_TIMEOUT_COOLDOWN_MS,
  CIRCUIT_BREAKER_RATE_LIMIT_COOLDOWN_MS,
  CIRCUIT_BREAKER_SERVER_ERROR_COOLDOWN_MS,
} from "@/lib/config";

export interface ModelCircuitBreakerOptions {
  now?: () => number;
  timeoutCooldownMs?: number;
  rateLimitCooldownMs?: number;
  serverErrorCooldownMs?: number;
}

/**
 * In-memory circuit breaker that puts failing Gemini models on cooldown.
 * Protects quotas, reduces latency for downstream requests, and gracefully
 * falls back to trying all models if every model in the chain is on cooldown.
 */
export class ModelCircuitBreaker {
  private readonly cooldowns = new Map<string, number>();
  private readonly now: () => number;
  private readonly timeoutCooldownMs: number;
  private readonly rateLimitCooldownMs: number;
  private readonly serverErrorCooldownMs: number;

  constructor(options?: ModelCircuitBreakerOptions) {
    this.now = options?.now ?? (() => Date.now());
    this.timeoutCooldownMs =
      options?.timeoutCooldownMs ?? CIRCUIT_BREAKER_TIMEOUT_COOLDOWN_MS;
    this.rateLimitCooldownMs =
      options?.rateLimitCooldownMs ?? CIRCUIT_BREAKER_RATE_LIMIT_COOLDOWN_MS;
    this.serverErrorCooldownMs =
      options?.serverErrorCooldownMs ?? CIRCUIT_BREAKER_SERVER_ERROR_COOLDOWN_MS;
  }

  /**
   * Returns true if the model is currently available (not on an active cooldown).
   */
  isModelAvailable(modelId: string, currentTime?: number): boolean {
    const t = currentTime ?? this.now();
    const expiresAt = this.cooldowns.get(modelId);
    if (!expiresAt) return true;
    if (t >= expiresAt) {
      this.cooldowns.delete(modelId);
      return true;
    }
    return false;
  }

  /**
   * Records a model attempt failure and assigns an appropriate cooldown period:
   * - TIMEOUT: 5 minutes
   * - 429 / RATE_LIMITED / RESOURCE_EXHAUSTED: 15 minutes
   * - 503 or 5xx: 1 minute
   */
  recordFailure(
    modelId: string,
    outcome: string,
    httpStatus?: number,
    currentTime?: number,
    customCooldownMs?: number
  ): void {
    const t = currentTime ?? this.now();

    if (customCooldownMs !== undefined && customCooldownMs > 0) {
      this.cooldowns.set(modelId, t + customCooldownMs);
      return;
    }

    if (outcome === "TIMEOUT" || httpStatus === 504) {
      this.cooldowns.set(modelId, t + this.timeoutCooldownMs);
      return;
    }

    if (outcome === "RATE_LIMITED" || httpStatus === 429) {
      this.cooldowns.set(modelId, t + this.rateLimitCooldownMs);
      return;
    }

    if ((httpStatus && httpStatus >= 500) || outcome === "UPSTREAM_ERROR") {
      this.cooldowns.set(modelId, t + this.serverErrorCooldownMs);
      return;
    }
  }

  /**
   * A successful attempt immediately clears that model's cooldown.
   */
  recordSuccess(modelId: string): void {
    this.cooldowns.delete(modelId);
  }

  /**
   * Filters a list of models according to active cooldowns.
   * If ALL models are on cooldown, ignores cooldowns and returns the full chain
   * so the system never fails closed.
   */
  filterModels(
    models: string[],
    currentTime?: number
  ): {
    modelsToTry: string[];
    skippedModels: string[];
    allWereOnCooldown: boolean;
  } {
    const t = currentTime ?? this.now();
    const available: string[] = [];
    const skipped: string[] = [];

    for (const m of models) {
      if (this.isModelAvailable(m, t)) {
        available.push(m);
      } else {
        skipped.push(m);
      }
    }

    if (available.length > 0) {
      return {
        modelsToTry: available,
        skippedModels: skipped,
        allWereOnCooldown: false,
      };
    }

    // Never fail closed: if all models are on cooldown, try them all normally
    return {
      modelsToTry: [...models],
      skippedModels: [],
      allWereOnCooldown: true,
    };
  }

  /** Returns cooldown expiration timestamp for a model, if active. */
  getCooldownExpiresAt(modelId: string): number | undefined {
    return this.cooldowns.get(modelId);
  }

  /** Clears all cooldowns (for testing). */
  reset(): void {
    this.cooldowns.clear();
  }
}

/** Default singleton instance used across analysis requests */
export const defaultCircuitBreaker = new ModelCircuitBreaker();

/** Default singleton instance used across transcription requests (isolated from analysis) */
export const defaultTranscribeCircuitBreaker = new ModelCircuitBreaker();
