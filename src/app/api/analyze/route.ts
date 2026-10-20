import { NextRequest, NextResponse } from "next/server";
import { analyzeOfferText } from "@/lib/analysis/gemini";
import { validateInputHygiene } from "@/lib/input-hygiene";
import { deriveClientKey, defaultRateLimiter } from "@/lib/rate-limit";
import { defaultConcurrencyGuard } from "@/lib/concurrency";

export const maxDuration = 60;

const MAX_BODY_BYTES = 40 * 1024; // 40 KB

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function POST(req: NextRequest) {
  // 1. Reject oversized payloads early based on Content-Length header
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TOO_LONG",
          message: "Payload exceeds maximum allowed size of 40 KB.",
        },
      },
      { status: 413, headers: NO_STORE_HEADERS }
    );
  }

  // 2. Read request body as text
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Failed to read request body.",
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  // 3. Reject oversized payload body length
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TOO_LONG",
          message: "Payload exceeds maximum allowed size of 40 KB.",
        },
      },
      { status: 413, headers: NO_STORE_HEADERS }
    );
  }

  // 4. Parse JSON body
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  // 5. Validate body shape
  if (
    !parsedJson ||
    typeof parsedJson !== "object" ||
    !("text" in parsedJson) ||
    typeof (parsedJson as { text: unknown }).text !== "string"
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Field 'text' is required and must be a string.",
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const rawText = (parsedJson as { text: string }).text;

  // 6. Input hygiene validation (runs BEFORE rate limiting; invalid input does not consume quota)
  const hygiene = validateInputHygiene(rawText);
  if (!hygiene.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: hygiene.code,
          message: hygiene.message,
        },
      },
      { status: hygiene.httpStatus, headers: NO_STORE_HEADERS }
    );
  }

  // 7. Per-client sliding window rate limiting (hashed IP key; raw IP never stored/logged)
  const clientKey = deriveClientKey(req.headers);
  const rateLimit = defaultRateLimiter.checkAndRecord(clientKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "RATE_LIMITED_CLIENT",
          message: rateLimit.message,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
      },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  // 8. In-memory concurrency guard (at most 4 analyses in flight per server instance)
  if (!defaultConcurrencyGuard.tryAcquire()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "BUSY",
          message: "The service is busy right now. Please try again in a minute.",
        },
      },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  // 9. Run server-side Gemini analysis pipeline
  try {
    const result = await analyzeOfferText(hygiene.text);

    if (result.ok) {
      return NextResponse.json(
        {
          ok: true,
          analysis: result.analysis,
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: result.code,
          message: result.message,
        },
      },
      { status: result.httpStatus, headers: NO_STORE_HEADERS }
    );
  } finally {
    defaultConcurrencyGuard.release();
  }
}

// Enforce POST only; all other methods return 405 Method Not Allowed
export async function GET() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST", ...NO_STORE_HEADERS },
  });
}

export async function PUT() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST", ...NO_STORE_HEADERS },
  });
}

export async function DELETE() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST", ...NO_STORE_HEADERS },
  });
}

export async function PATCH() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "POST", ...NO_STORE_HEADERS },
  });
}
