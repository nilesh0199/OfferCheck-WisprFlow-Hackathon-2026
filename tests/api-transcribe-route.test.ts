import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET, PUT, DELETE, PATCH } from "@/app/api/transcribe/route";
import * as uploadModule from "@/lib/upload";
import { defaultTranscribeRateLimiter, defaultRateLimiter } from "@/lib/rate-limit";
import { defaultConcurrencyGuard } from "@/lib/concurrency";
import { MAX_UPLOAD_TOTAL_BYTES } from "@/lib/config";

describe("API /api/transcribe route handler", () => {
  beforeEach(() => {
    defaultTranscribeRateLimiter.reset();
    defaultRateLimiter.reset();
    defaultConcurrencyGuard.reset();
    vi.restoreAllMocks();
  });

  it("returns 405 Method Not Allowed for non-POST methods", async () => {
    const getRes = await GET();
    expect(getRes.status).toBe(405);
    expect(getRes.headers.get("Allow")).toBe("POST");

    const putRes = await PUT();
    expect(putRes.status).toBe(405);

    const deleteRes = await DELETE();
    expect(deleteRes.status).toBe(405);

    const patchRes = await PATCH();
    expect(patchRes.status).toBe(405);
  });

  it("returns 415 Unsupported Media Type if Content-Type is not multipart/form-data", async () => {
    const req = new NextRequest("http://localhost:3000/api/transcribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(415);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("returns 413 when Content-Length exceeds 4 MB", async () => {
    const req = new NextRequest("http://localhost:3000/api/transcribe", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundary",
        "content-length": String(MAX_UPLOAD_TOTAL_BYTES + 1024),
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe("TOTAL_TOO_LARGE");
  });

  it("returns 400 UNSUPPORTED_TYPE when magic bytes do not match allowed formats", async () => {
    const spoofedFile = new File(["NOT AN IMAGE OR PDF CONTENT"], "fake.png", {
      type: "image/png",
    });
    const formData = new FormData();
    formData.append("files", spoofedFile);

    const req = new NextRequest("http://localhost:3000/api/transcribe", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe("UNSUPPORTED_TYPE");
    expect(data.error.message).toContain("fake.png");
  });

  it("enforces separate transcribe rate limiting with 429 and Retry-After", async () => {
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
    ]);

    vi.spyOn(uploadModule, "transcribeFiles").mockResolvedValue({
      ok: true,
      transcript: "Transcribed offer text",
      warnings: [],
      perFileReadable: [true],
      exceedsInputLimit: false,
      charCount: 22,
      modelUsed: "gemini-3.8-flash",
      attempts: [],
    });

    const testIp = "192.0.2.111";

    // Rate limit default for transcribe is 6 per window
    for (let i = 0; i < 6; i++) {
      const formData = new FormData();
      formData.append(
        "files",
        new File([pngHeader], `offer-${i}.png`, { type: "image/png" })
      );
      const req = new NextRequest("http://localhost:3000/api/transcribe", {
        method: "POST",
        headers: { "x-forwarded-for": testIp },
        body: formData,
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 7th request must be rate limited
    const formData7 = new FormData();
    formData7.append(
      "files",
      new File([pngHeader], "offer-7.png", { type: "image/png" })
    );
    const req7 = new NextRequest("http://localhost:3000/api/transcribe", {
      method: "POST",
      headers: { "x-forwarded-for": testIp },
      body: formData7,
    });
    const res7 = await POST(req7);
    expect(res7.status).toBe(429);
    expect(res7.headers.get("Retry-After")).toBeDefined();
    const data7 = await res7.json();
    expect(data7.ok).toBe(false);
    expect(data7.error.code).toBe("RATE_LIMITED_CLIENT");

    // Analysis rate limiter remains clean and unaffected
    expect(defaultRateLimiter.getKeyCount()).toBe(0);
  });

  it("returns 503 BUSY when concurrency limit is reached", async () => {
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
    ]);

    // Exhaust concurrency slots
    while (defaultConcurrencyGuard.tryAcquire()) {
      // acquire all slots
    }

    const formData = new FormData();
    formData.append(
      "files",
      new File([pngHeader], "busy.png", { type: "image/png" })
    );
    const req = new NextRequest("http://localhost:3000/api/transcribe", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe("BUSY");
  });

  it("returns 200 with transcript on valid upload", async () => {
    const pdfHeader = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a, 0x25,
    ]);

    vi.spyOn(uploadModule, "transcribeFiles").mockResolvedValue({
      ok: true,
      transcript: "Internship Offer Letter Details",
      warnings: [],
      perFileReadable: [true],
      exceedsInputLimit: false,
      charCount: 31,
      modelUsed: "gemini-3.8-flash",
      attempts: [],
    });

    const formData = new FormData();
    formData.append(
      "files",
      new File([pdfHeader], "letter.pdf", { type: "application/pdf" })
    );
    const req = new NextRequest("http://localhost:3000/api/transcribe", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.transcript).toBe("Internship Offer Letter Details");
    expect(data.perFileReadable).toEqual([true]);
  });
});
