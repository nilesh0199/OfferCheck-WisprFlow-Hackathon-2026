import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  RateLimiter,
  deriveClientKey,
} from "@/lib/rate-limit";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/analyze/route";
import * as geminiModule from "@/lib/analysis/gemini";
import { defaultRateLimiter } from "@/lib/rate-limit";
import { defaultConcurrencyGuard } from "@/lib/concurrency";

describe("RateLimiter sliding window and key hashing", () => {
  let virtualTime: number;
  const mockNow = () => virtualTime;

  beforeEach(() => {
    virtualTime = 1_700_000_000_000;
    defaultRateLimiter.reset();
    defaultConcurrencyGuard.reset();
  });

  it("anonymizes client IP using SHA-256 and salt; raw IP never appears in result", () => {
    const rawIp = "203.0.113.195";
    const key1 = deriveClientKey({ "x-forwarded-for": rawIp });
    const key2 = deriveClientKey({ "x-forwarded-for": `${rawIp}, 10.0.0.1` });

    // Must be 64-character hex string (SHA-256)
    expect(key1).toMatch(/^[a-f0-9]{64}$/);
    expect(key2).toBe(key1); // Takes first IP from list
    expect(key1).not.toContain(rawIp);

    // Fallback to x-real-ip
    const keyFromRealIp = deriveClientKey({ "x-real-ip": rawIp });
    expect(keyFromRealIp).toBe(key1);

    // Fallback to local when headers are absent
    const keyLocal = deriveClientKey({});
    expect(keyLocal).toMatch(/^[a-f0-9]{64}$/);
    expect(keyLocal).not.toContain("local");
    expect(keyLocal).not.toContain(rawIp);
  });

  it("different salts generate different hashes for the same IP", () => {
    const rawIp = "198.51.100.1";
    const hash1 = deriveClientKey({ "x-forwarded-for": rawIp }, "salt-A");
    const hash2 = deriveClientKey({ "x-forwarded-for": rawIp }, "salt-B");
    expect(hash1).not.toBe(hash2);
  });

  it("enforces sliding window limit (default 8 per 15 minutes)", () => {
    const limiter = new RateLimiter({
      now: mockNow,
      limitPerWindow: 8,
      limitPerDay: 30,
      windowMs: 15 * 60 * 1000,
    });

    const clientKey = "test-client-1";

    // 8 requests should all be allowed
    for (let i = 0; i < 8; i++) {
      const res = limiter.checkAndRecord(clientKey);
      expect(res.allowed).toBe(true);
      virtualTime += 1000; // 1s apart
    }

    // 9th request must be rejected
    const blockedRes = limiter.checkAndRecord(clientKey);
    expect(blockedRes.allowed).toBe(false);
    if (!blockedRes.allowed) {
      expect(blockedRes.reason).toBe("WINDOW_EXCEEDED");
      expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
      expect(blockedRes.retryAfterMinutes).toBeGreaterThanOrEqual(1);
      expect(blockedRes.message).toContain("You have reached the request limit for now");
    }

    // Advance time past the 15-minute window of the first request
    virtualTime += 15 * 60 * 1000;
    const allowedAfterWindow = limiter.checkAndRecord(clientKey);
    expect(allowedAfterWindow.allowed).toBe(true);
  });

  it("enforces daily cap (default 30 per 24 hours)", () => {
    const limiter = new RateLimiter({
      now: mockNow,
      limitPerWindow: 100, // Make window high to test daily cap exclusively
      limitPerDay: 5,
      dayMs: 24 * 60 * 60 * 1000,
    });

    const clientKey = "test-client-daily";

    for (let i = 0; i < 5; i++) {
      const res = limiter.checkAndRecord(clientKey);
      expect(res.allowed).toBe(true);
      virtualTime += 60 * 1000; // 1 min apart
    }

    // 6th request within 24h must be rejected with DAY_EXCEEDED
    const blockedRes = limiter.checkAndRecord(clientKey);
    expect(blockedRes.allowed).toBe(false);
    if (!blockedRes.allowed) {
      expect(blockedRes.reason).toBe("DAY_EXCEEDED");
      expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
      expect(blockedRes.message).toContain("You have reached the request limit for now");
    }

    // Advance past 24 hours
    virtualTime += 24 * 60 * 60 * 1000;
    const allowedNextDay = limiter.checkAndRecord(clientKey);
    expect(allowedNextDay.allowed).toBe(true);
  });

  it("evicts oldest entries when capacity limit is reached", () => {
    const maxKeys = 10;
    const limiter = new RateLimiter({
      now: mockNow,
      maxKeys,
      dayMs: 24 * 60 * 60 * 1000,
    });

    // Populate up to maxKeys
    for (let i = 0; i < maxKeys; i++) {
      limiter.checkAndRecord(`client-${i}`);
      virtualTime += 1000;
    }
    expect(limiter.getKeyCount()).toBe(maxKeys);

    // Adding another client triggers eviction of oldest
    limiter.checkAndRecord("client-new");
    // Should stay within or below maxKeys
    expect(limiter.getKeyCount()).toBeLessThanOrEqual(maxKeys);
  });

  it("returns 429 with Retry-After header and RATE_LIMITED_CLIENT body from route", async () => {
    // Fill up allowance for a specific IP
    const testIp = "192.0.2.100";
    const validOfferText =
      "Congratulations! We are pleased to extend an offer for the Software Engineering Internship at Acme.";

    // Mock analyzeOfferText so successful calls resolve cleanly
    const analyzeSpy = vi.spyOn(geminiModule, "analyzeOfferText").mockResolvedValue({
      ok: true,
      analysis: {
        concerns: [],
        missingInfo: [],
        verificationQuestions: [],
        droppedCount: 0,
        limits: ["Limits apply."],
      },
      modelUsed: "gemini-3.8-flash",
      attempts: [],
    });

    // Consume all 8 slots in defaultRateLimiter
    for (let i = 0; i < 8; i++) {
      const req = new NextRequest("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": testIp,
        },
        body: JSON.stringify({ text: validOfferText }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }
    expect(analyzeSpy).toHaveBeenCalledTimes(8);

    // 9th request must return 429 RATE_LIMITED_CLIENT with Retry-After
    const overLimitReq = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({ text: validOfferText }),
    });

    const overLimitRes = await POST(overLimitReq);
    expect(overLimitRes.status).toBe(429);
    expect(overLimitRes.headers.get("Retry-After")).toBeTruthy();
    const body = await overLimitRes.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("RATE_LIMITED_CLIENT");
    expect(body.error.message).toContain("You have reached the request limit for now");
    expect(body.error.retryAfterSeconds).toBeGreaterThan(0);
    // Raw IP must never appear in response
    expect(JSON.stringify(body)).not.toContain(testIp);
  });

  it("validation failures (empty/short/long) do NOT consume rate limit allowance", async () => {
    const testIp = "192.0.2.101";

    // Submit invalid requests (too short)
    for (let i = 0; i < 15; i++) {
      const shortReq = new NextRequest("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": testIp,
        },
        body: JSON.stringify({ text: "Too short text" }),
      });
      const shortRes = await POST(shortReq);
      expect(shortRes.status).toBe(422);
    }

    // Valid request should still succeed because invalid inputs never consume allowance
    const analyzeSpy = vi.spyOn(geminiModule, "analyzeOfferText").mockResolvedValue({
      ok: true,
      analysis: {
        concerns: [],
        missingInfo: [],
        verificationQuestions: [],
        droppedCount: 0,
        limits: ["Limits apply."],
      },
      modelUsed: "gemini-3.8-flash",
      attempts: [],
    });

    const validOfferText =
      "Congratulations! We are pleased to extend an offer for the Software Engineering Internship at Acme.";
    const validReq = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({ text: validOfferText }),
    });

    const validRes = await POST(validReq);
    expect(validRes.status).toBe(200);
    expect(analyzeSpy).toHaveBeenCalledTimes(1);
  });
});
