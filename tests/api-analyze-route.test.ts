import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET, PUT, DELETE, PATCH } from "@/app/api/analyze/route";
import * as geminiModule from "@/lib/analysis/gemini";

describe("/api/analyze Route Handler", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 405 Method Not Allowed for non-POST HTTP methods", async () => {
    const methods = [GET, PUT, DELETE, PATCH];
    for (const handler of methods) {
      const res = await handler();
      expect(res.status).toBe(405);
      expect(res.headers.get("Allow")).toBe("POST");
      expect(res.headers.get("Cache-Control")).toContain("no-store");
    }
  });

  it("returns 413 when Content-Length header exceeds 40 KB", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-length": String(50 * 1024), // 50 KB
        "content-type": "application/json",
      },
      body: JSON.stringify({ text: "Hello" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("TOO_LONG");
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("returns 413 when body length exceeds 40 KB", async () => {
    const oversizedText = "x".repeat(45 * 1024);
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: oversizedText }),
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("TOO_LONG");
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ not-valid-json ]",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("INVALID_JSON");
  });

  it("returns 400 when 'text' field is missing from request body", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ otherField: "abc" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("INVALID_REQUEST");
  });

  it("the route returns 400 for a non-string text field", async () => {
    // 'text' is a number
    const req1 = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: 12345 }),
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);
    const body1 = await res1.json();
    expect(body1.ok).toBe(false);
    expect(body1.error.code).toBe("INVALID_REQUEST");

    // 'text' is a boolean
    const req2 = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: true }),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
    const body2 = await res2.json();
    expect(body2.ok).toBe(false);
    expect(body2.error.code).toBe("INVALID_REQUEST");

    // 'text' is an array
    const req3 = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: ["array", "of", "strings"] }),
    });
    const res3 = await POST(req3);
    expect(res3.status).toBe(400);
    const body3 = await res3.json();
    expect(body3.ok).toBe(false);
    expect(body3.error.code).toBe("INVALID_REQUEST");
  });

  it("returns 200 with { ok: true, analysis } on successful analysis", async () => {
    const mockAnalysis = {
      concerns: [],
      missingInfo: [],
      verificationQuestions: [],
      droppedCount: 0,
      limits: ["Reviews supplied text only."],
    };

    vi.spyOn(geminiModule, "analyzeOfferText").mockResolvedValue({
      ok: true,
      analysis: mockAnalysis,
      modelUsed: "gemini-3.8-flash",
      attempts: [
        {
          model: "gemini-3.8-flash",
          outcome: "SUCCESS",
          httpStatus: 200,
          elapsedMs: 850,
        },
      ],
    });

    const validOffer =
      "Congratulations! We are pleased to extend an offer for the Software Development Internship at ExampleCorp.";
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: validOffer }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.analysis).toEqual(mockAnalysis);
  });

  it("maps wrapper error codes to appropriate status codes and error shape", async () => {
    vi.spyOn(geminiModule, "analyzeOfferText").mockResolvedValue({
      ok: false,
      code: "RATE_LIMITED",
      message: "The review service is currently busy.",
      httpStatus: 429,
      attempts: [
        {
          model: "gemini-3.8-flash",
          outcome: "RATE_LIMITED",
          httpStatus: 429,
          elapsedMs: 250,
        },
      ],
    });

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Some internship offer text..." }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toEqual({
      code: "RATE_LIMITED",
      message: "The review service is currently busy.",
    });
  });

  it("route response never contains model names or attempts list in success or error bodies", async () => {
    // 1. Success check
    vi.spyOn(geminiModule, "analyzeOfferText").mockResolvedValue({
      ok: true,
      analysis: {
        concerns: [],
        missingInfo: [],
        verificationQuestions: [],
        droppedCount: 0,
        limits: ["Reviews supplied text only."],
      },
      modelUsed: "gemini-3.8-flash",
      attempts: [
        {
          model: "gemini-3.8-flash",
          outcome: "SUCCESS",
          httpStatus: 200,
          elapsedMs: 900,
        },
      ],
    });

    const reqSuccess = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Valid offer text with sufficient characters..." }),
    });
    const resSuccess = await POST(reqSuccess);
    const bodySuccess = await resSuccess.json();
    const rawSuccessStr = JSON.stringify(bodySuccess);

    expect(bodySuccess.modelUsed).toBeUndefined();
    expect(bodySuccess.attempts).toBeUndefined();
    expect(rawSuccessStr).not.toContain("gemini");
    expect(rawSuccessStr).not.toContain("flash");

    // 2. Error check
    vi.spyOn(geminiModule, "analyzeOfferText").mockResolvedValue({
      ok: false,
      code: "UPSTREAM_ERROR",
      message: "An upstream service error occurred while analyzing the offer. Please try again shortly.",
      httpStatus: 502,
      attempts: [
        {
          model: "gemini-3.8-flash",
          outcome: "UPSTREAM_ERROR",
          httpStatus: 502,
          elapsedMs: 400,
        },
      ],
    });

    const reqError = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Valid offer text with sufficient characters..." }),
    });
    const resError = await POST(reqError);
    const bodyError = await resError.json();
    const rawErrorStr = JSON.stringify(bodyError);

    expect(bodyError.modelUsed).toBeUndefined();
    expect(bodyError.attempts).toBeUndefined();
    expect(rawErrorStr).not.toContain("gemini");
    expect(rawErrorStr).not.toContain("flash");
  });
});
