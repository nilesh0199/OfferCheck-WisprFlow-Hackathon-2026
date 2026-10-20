import { NextRequest, NextResponse } from "next/server";
import { analyzeOfferText } from "@/lib/analysis/gemini";

export const maxDuration = 60;

const MAX_BODY_BYTES = 40 * 1024; // 40 KB

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function POST(req: NextRequest) {
  // Reject oversized payloads early based on Content-Length header
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

  // Read request body as text
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

  // Reject oversized payload body length
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

  // Parse JSON body
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

  // Validate body shape
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

  const text = (parsedJson as { text: string }).text;

  // Run server-side Gemini analysis pipeline
  const result = await analyzeOfferText(text);

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
