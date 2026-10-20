import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConcurrencyGuard } from "@/lib/concurrency";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/analyze/route";
import * as geminiModule from "@/lib/analysis/gemini";
import { defaultRateLimiter } from "@/lib/rate-limit";
import { defaultConcurrencyGuard } from "@/lib/concurrency";

describe("ConcurrencyGuard", () => {
  beforeEach(() => {
    defaultRateLimiter.reset();
    defaultConcurrencyGuard.reset();
  });

  it("permits acquisitions up to configured limit, then blocks further acquisitions", () => {
    const guard = new ConcurrencyGuard({ limit: 4 });

    expect(guard.tryAcquire()).toBe(true); // 1
    expect(guard.tryAcquire()).toBe(true); // 2
    expect(guard.tryAcquire()).toBe(true); // 3
    expect(guard.tryAcquire()).toBe(true); // 4
    expect(guard.getActiveCount()).toBe(4);

    // 5th acquisition should be blocked
    expect(guard.tryAcquire()).toBe(false);
    expect(guard.getActiveCount()).toBe(4);

    // Release one slot
    guard.release();
    expect(guard.getActiveCount()).toBe(3);

    // Now another acquisition succeeds
    expect(guard.tryAcquire()).toBe(true);
    expect(guard.getActiveCount()).toBe(4);
  });

  it("release is idempotent and never drops below zero", () => {
    const guard = new ConcurrencyGuard({ limit: 2 });
    guard.release();
    guard.release();
    expect(guard.getActiveCount()).toBe(0);

    guard.tryAcquire();
    expect(guard.getActiveCount()).toBe(1);
    guard.release();
    expect(guard.getActiveCount()).toBe(0);
    guard.release();
    expect(guard.getActiveCount()).toBe(0);
  });

  it("route returns 503 with BUSY when concurrency limit is exceeded", async () => {
    const validOfferText =
      "Congratulations! We are pleased to extend an offer for the Software Development Internship at ExampleCorp.";

    // Acquire all 4 concurrency slots in the default guard
    expect(defaultConcurrencyGuard.tryAcquire()).toBe(true);
    expect(defaultConcurrencyGuard.tryAcquire()).toBe(true);
    expect(defaultConcurrencyGuard.tryAcquire()).toBe(true);
    expect(defaultConcurrencyGuard.tryAcquire()).toBe(true);

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "192.0.2.50",
      },
      body: JSON.stringify({ text: validOfferText }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("BUSY");
    expect(body.error.message).toContain("The service is busy right now. Please try again in a minute.");

    // Clean up
    defaultConcurrencyGuard.reset();
  });

  it("always decrements concurrency slot in finally block even when analyzeOfferText throws", async () => {
    const validOfferText =
      "Congratulations! We are pleased to extend an offer for the Software Development Internship at ExampleCorp.";

    vi.spyOn(geminiModule, "analyzeOfferText").mockRejectedValue(new Error("Unexpected crash"));

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "192.0.2.51",
      },
      body: JSON.stringify({ text: validOfferText }),
    });

    await expect(POST(req)).rejects.toThrow("Unexpected crash");

    // Concurrency count must be 0 after exception
    expect(defaultConcurrencyGuard.getActiveCount()).toBe(0);
  });
});
