import { NextRequest, NextResponse } from "next/server";
import {
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_TOTAL_BYTES,
} from "@/lib/config";
import {
  transcribeFiles,
  detectFileType,
  detectedTypeToMime,
  validateUploadSet,
} from "@/lib/upload";
import { deriveClientKey, defaultTranscribeRateLimiter } from "@/lib/rate-limit";
import { defaultConcurrencyGuard } from "@/lib/concurrency";

export const maxDuration = 60;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

/**
 * Safe logging helper for the transcribe route.
 * Emits metadata only (code, status, optional truncated upstream text).
 * Never logs user files, bytes, transcripts, or model output.
 */
function logSafeTranscribeError(
  code: string,
  httpStatus: number,
  upstreamStatusText?: string
): void {
  let extra = "";
  if (
    process.env.NODE_ENV !== "production" &&
    httpStatus >= 400 &&
    httpStatus < 500 &&
    upstreamStatusText
  ) {
    const clean = upstreamStatusText.replace(/[\r\n\t]+/g, " ").trim().slice(0, 120);
    extra = `, upstream=${clean}`;
  }
  console.error(
    `[OfferCheck] Transcription attempt failed: code=${code}, httpStatus=${httpStatus}${extra}`
  );
}

export async function POST(req: NextRequest) {
  // 1. Content-Type check (must be multipart/form-data)
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    logSafeTranscribeError("UNSUPPORTED_MEDIA_TYPE", 415, "Content-Type must be multipart/form-data");
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Request must be multipart/form-data.",
        },
      },
      { status: 415, headers: NO_STORE_HEADERS }
    );
  }

  // 2. Reject oversized payloads early based on Content-Length header (+64 KB allowance for multipart boundary overhead)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_UPLOAD_TOTAL_BYTES + 64 * 1024) {
    logSafeTranscribeError("TOTAL_TOO_LARGE", 413, "Content-Length exceeds 4 MB threshold");
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TOTAL_TOO_LARGE",
          message: "Payload exceeds maximum allowed upload size of 4 MB.",
        },
      },
      { status: 413, headers: NO_STORE_HEADERS }
    );
  }

  // 3. Parse multipart/form-data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    logSafeTranscribeError("INVALID_REQUEST", 400, "Failed to parse multipart form data");
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Failed to parse multipart form data.",
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  // 4. Extract uploaded files
  const rawEntries = formData.getAll("files");
  // Also support single "file" key if sent
  if (rawEntries.length === 0) {
    const single = formData.get("file");
    if (single) {
      rawEntries.push(single);
    }
  }

  const files: File[] = [];
  for (const entry of rawEntries) {
    if (typeof entry === "object" && entry !== null && "arrayBuffer" in entry) {
      files.push(entry as File);
    }
  }

  if (files.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "EMPTY_FILE",
          message: "Please select at least one file to upload.",
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  if (files.length > MAX_UPLOAD_FILES) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TOO_MANY_FILES",
          message: `You can upload at most ${MAX_UPLOAD_FILES} files at a time.`,
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  // 5. Basic set validation (count, size, non-empty)
  const initialSetValidation = validateUploadSet(
    files.map((f) => ({
      name: f.name || "uploaded-file",
      size: f.size,
      declaredType: f.type || "application/octet-stream",
    }))
  );

  if (!initialSetValidation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: initialSetValidation.code,
          message: initialSetValidation.message,
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  // 6. Read binary buffers and inspect magic bytes (verifies true file type)
  const processedFiles: {
    name: string;
    type: "image/png" | "image/jpeg" | "image/webp" | "application/pdf";
    buffer: Buffer;
  }[] = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    let arrayBuf: ArrayBuffer;
    try {
      arrayBuf = await f.arrayBuffer();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_REQUEST",
            message: `Failed to read file ${i + 1}.`,
          },
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const buffer = Buffer.from(arrayBuf);
    const magicHeader = new Uint8Array(
      buffer.buffer,
      buffer.byteOffset,
      Math.min(buffer.byteLength, 16)
    );
    const detected = detectFileType(magicHeader);

    if (!detected) {
      const displayName = f.name ? `"${f.name}"` : `File ${i + 1}`;
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNSUPPORTED_TYPE",
            message: `${displayName} is not a supported file type. Only PNG, JPEG, WebP images and PDF documents are supported.`,
          },
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const mime = detectedTypeToMime(detected) as
      | "image/png"
      | "image/jpeg"
      | "image/webp"
      | "application/pdf";
    processedFiles.push({
      name: f.name || `file-${i + 1}.${detected}`,
      type: mime,
      buffer,
    });
  }

  // 7. Rate limiting (runs AFTER validation; invalid files do not consume rate limit)
  const clientKey = deriveClientKey(req.headers);
  const rateLimit = defaultTranscribeRateLimiter.checkAndRecord(clientKey);
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

  // 8. In-memory concurrency guard
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

  // 9. Transcribe files via Gemini Interactions multimodal pipeline
  try {
    const result = await transcribeFiles(processedFiles);

    if (result.ok) {
      return NextResponse.json(
        {
          ok: true,
          files: result.files,
          warnings: result.warnings,
          perFileReadable: result.perFileReadable,
          exceedsInputLimit: result.exceedsInputLimit,
          charCount: result.charCount,
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    logSafeTranscribeError(result.code, result.httpStatus, result.message);
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
