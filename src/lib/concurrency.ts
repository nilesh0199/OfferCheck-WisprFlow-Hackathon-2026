import { MAX_CONCURRENT_ANALYSES } from "./config";

export interface ConcurrencyGuardOptions {
  limit?: number;
}

/**
 * In-memory concurrency guard to bound the number of simultaneous active analyses
 * running on a single server instance.
 */
export class ConcurrencyGuard {
  private inFlight = 0;
  private readonly limit: number;

  constructor(options?: ConcurrencyGuardOptions) {
    this.limit = options?.limit ?? MAX_CONCURRENT_ANALYSES;
  }

  /**
   * Attempts to acquire a concurrency slot.
   * Returns true if acquired; false if maximum concurrent analyses are reached.
   */
  tryAcquire(): boolean {
    if (this.inFlight >= this.limit) {
      return false;
    }
    this.inFlight++;
    return true;
  }

  /**
   * Releases an acquired concurrency slot.
   * Safe to call multiple times; never drops below 0.
   */
  release(): void {
    if (this.inFlight > 0) {
      this.inFlight--;
    }
  }

  /** Returns the current number of in-flight analyses. */
  getActiveCount(): number {
    return this.inFlight;
  }

  /** Resets active counter to 0 (for testing). */
  reset(): void {
    this.inFlight = 0;
  }
}

/** Default singleton instance used by the analysis route handler */
export const defaultConcurrencyGuard = new ConcurrencyGuard();
