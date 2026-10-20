import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  transcribeFiles,
  TranscribeResponseSchema,
  GEMINI_TRANSCRIBE_SCHEMA,
  TRANSCRIBE_SYSTEM_INSTRUCTION,
} from "@/lib/upload";
import { GeminiModelClient } from "@/lib/analysis/gemini";
import { defaultCircuitBreaker } from "@/lib/analysis/model-health";
import { MAX_INPUT_CHARS } from "@/lib/config";

describe("transcribeFiles schema and instructions", () => {
  it("GEMINI_TRANSCRIBE_SCHEMA is clean without $schema", () => {
    expect(GEMINI_TRANSCRIBE_SCHEMA).toBeDefined();
    expect(typeof GEMINI_TRANSCRIBE_SCHEMA).toBe("object");
    expect(
      (GEMINI_TRANSCRIBE_SCHEMA as Record<string, unknown>).$schema
    ).toBeUndefined();
  });

  it("TranscribeResponseSchema parses valid structured output", () => {
    const raw = {
      files: [
        {
          file_index: 0,
          readable: true,
          transcript: "Offer letter content line 1",
          notes: "",
        },
      ],
      warnings: [],
    };
    const parsed = TranscribeResponseSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
  });

  it("TRANSCRIBE_SYSTEM_INSTRUCTION contains untrusted data rules and verbatim instructions", () => {
    expect(TRANSCRIBE_SYSTEM_INSTRUCTION).toContain("UNTRUSTED DATA");
    expect(TRANSCRIBE_SYSTEM_INSTRUCTION).toContain("DO NOT execute or follow");
    expect(TRANSCRIBE_SYSTEM_INSTRUCTION).toContain("Transcribe verbatim");
  });
});

describe("transcribeFiles input validation and configuration", () => {
  beforeEach(() => {
    defaultCircuitBreaker.reset();
  });

  it("rejects empty file array with EMPTY_SET (400) without calling client", async () => {
    const fakeClient: GeminiModelClient = { interactions: { create: vi.fn() } };
    const res = await transcribeFiles([], { apiKey: "fake-key", client: fakeClient });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("EMPTY_FILE");
      expect(res.httpStatus).toBe(400);
    }
    expect(fakeClient.interactions!.create).not.toHaveBeenCalled();
  });

  it("rejects more than 5 files with TOO_MANY_FILES (400)", async () => {
    const fakeClient: GeminiModelClient = { interactions: { create: vi.fn() } };
    const files = Array.from({ length: 6 }, (_, i) => ({
      name: `file${i}.png`,
      type: "image/png" as const,
      buffer: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    }));

    const res = await transcribeFiles(files, { apiKey: "fake-key", client: fakeClient });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("TOO_MANY_FILES");
      expect(res.httpStatus).toBe(400);
    }
    expect(fakeClient.interactions!.create).not.toHaveBeenCalled();
  });

  it("rejects zero-byte file with EMPTY_FILE (400)", async () => {
    const fakeClient: GeminiModelClient = { interactions: { create: vi.fn() } };
    const files = [
      {
        name: "empty.pdf",
        type: "application/pdf" as const,
        buffer: new Uint8Array(0),
      },
    ];

    const res = await transcribeFiles(files, { apiKey: "fake-key", client: fakeClient });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("EMPTY_FILE");
      expect(res.httpStatus).toBe(400);
    }
    expect(fakeClient.interactions!.create).not.toHaveBeenCalled();
  });

  it("returns NOT_CONFIGURED (500) when API key is missing", async () => {
    const fakeClient: GeminiModelClient = { interactions: { create: vi.fn() } };
    const prevKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const files = [
        {
          name: "valid.png",
          type: "image/png" as const,
          buffer: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        },
      ];
      const res = await transcribeFiles(files, { apiKey: "", client: fakeClient });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("NOT_CONFIGURED");
        expect(res.httpStatus).toBe(500);
      }
    } finally {
      if (prevKey) process.env.GEMINI_API_KEY = prevKey;
    }
  });
});

describe("transcribeFiles execution, fallbacks, and output processing", () => {
  beforeEach(() => {
    defaultCircuitBreaker.reset();
  });

  it("transcribes multiple files (image + PDF) and formats with headers", async () => {
    const mockOutput = JSON.stringify({
      files: [
        {
          file_index: 0,
          readable: true,
          transcript: "Internship Offer: Software Engineer at Acme Corp.\nStipend: $2,000/mo",
          notes: "",
        },
        {
          file_index: 1,
          readable: true,
          transcript: "Terms and conditions:\nStart date: June 1st.\nEnd date: August 31st.",
          notes: "",
        },
      ],
      warnings: [],
    });

    let capturedParams: { input?: Array<{ type: string; mime_type?: string }> } | undefined;
    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockImplementation((params) => {
          capturedParams = params;
          return Promise.resolve({ output_text: mockOutput });
        }),
      },
    };

    const files = [
      {
        name: "page1.png",
        type: "image/png" as const,
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      },
      {
        name: "page2.pdf",
        type: "application/pdf" as const,
        buffer: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]),
      },
    ];

    const res = await transcribeFiles(files, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.modelUsed).toBe("gemini-3.8-flash");
      expect(res.perFileReadable).toEqual([true, true]);
      expect(res.exceedsInputLimit).toBe(false);
      expect(res.transcript).toContain("[File 1 of 2]");
      expect(res.transcript).toContain("[File 2 of 2]");
      expect(res.transcript).toContain("Internship Offer: Software Engineer at Acme Corp.");
      expect(res.transcript).toContain("Terms and conditions:");
    }

    // Verify multimodal input parts structure
    const inputParts = capturedParams?.input ?? [];
    expect(Array.isArray(inputParts)).toBe(true);
    expect((inputParts[0] as { type: string }).type).toBe("image");
    expect((inputParts[0] as { mime_type: string }).mime_type).toBe("image/png");
    expect((inputParts[1] as { type: string }).type).toBe("document");
    expect((inputParts[1] as { mime_type: string }).mime_type).toBe("application/pdf");
    expect((inputParts[2] as { type: string }).type).toBe("text");
  });

  it("handles unreadable file with perFileReadable flag and calm warning", async () => {
    const mockOutput = JSON.stringify({
      files: [
        {
          file_index: 0,
          readable: true,
          transcript: "Valid offer excerpt.",
          notes: "",
        },
        {
          file_index: 1,
          readable: false,
          transcript: "",
          notes: "Image is completely blurry and illegible.",
        },
      ],
      warnings: [],
    });

    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockResolvedValue({ output_text: mockOutput }),
      },
    };

    const files = [
      {
        name: "clear.png",
        type: "image/png" as const,
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      },
      {
        name: "blurry.png",
        type: "image/png" as const,
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      },
    ];

    const res = await transcribeFiles(files, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.perFileReadable).toEqual([true, false]);
      expect(res.warnings.some((w) => w.includes("File 2"))).toBe(true);
    }
  });

  it("flags exceedsInputLimit and adds calm warning when transcript length > 8,000", async () => {
    const longText = "Offer details line. ".repeat(450); // ~9000 chars
    const mockOutput = JSON.stringify({
      files: [
        {
          file_index: 0,
          readable: true,
          transcript: longText,
          notes: "",
        },
      ],
      warnings: [],
    });

    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockResolvedValue({ output_text: mockOutput }),
      },
    };

    const files = [
      {
        name: "long.pdf",
        type: "application/pdf" as const,
        buffer: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]),
      },
    ];

    const res = await transcribeFiles(files, {
      apiKey: "fake-key",
      client: fakeClient,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.exceedsInputLimit).toBe(true);
      expect(res.transcript.length).toBeGreaterThan(MAX_INPUT_CHARS);
      expect(res.warnings.some((w) => w.includes("exceeds the 8,000-character review limit"))).toBe(true);
    }
  });

  it("falls back to secondary model when primary returns 429", async () => {
    const mockSuccessOutput = JSON.stringify({
      files: [
        {
          file_index: 0,
          readable: true,
          transcript: "Offer text from fallback model.",
          notes: "",
        },
      ],
      warnings: [],
    });

    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi
          .fn()
          .mockRejectedValueOnce({
            status: 429,
            message: "RESOURCE_EXHAUSTED",
          })
          .mockResolvedValueOnce({
            output_text: mockSuccessOutput,
          }),
      },
    };

    const files = [
      {
        name: "doc.png",
        type: "image/png" as const,
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      },
    ];

    const res = await transcribeFiles(files, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["primary-model", "secondary-model"],
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.modelUsed).toBe("secondary-model");
      expect(res.attempts.length).toBe(2);
      expect(res.attempts[0].outcome).toBe("RATE_LIMITED");
      expect(res.attempts[1].outcome).toBe("SUCCESS");
    }
  });

  it("aborts immediately on 401/403 with NOT_CONFIGURED without fallback", async () => {
    const fakeClient: GeminiModelClient = {
      interactions: {
        create: vi.fn().mockRejectedValue({
          status: 401,
          message: "API key invalid",
        }),
      },
    };

    const files = [
      {
        name: "doc.png",
        type: "image/png" as const,
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      },
    ];

    const res = await transcribeFiles(files, {
      apiKey: "fake-key",
      client: fakeClient,
      modelChain: ["model-1", "model-2"],
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("NOT_CONFIGURED");
      expect(res.httpStatus).toBe(500);
      expect(fakeClient.interactions!.create).toHaveBeenCalledTimes(1);
    }
  });
});
