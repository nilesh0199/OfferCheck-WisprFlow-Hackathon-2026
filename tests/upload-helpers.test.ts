import { describe, it, expect } from "vitest";
import {
  detectFileType,
  detectedTypeToMime,
  validateUploadSet,
  planImageCompression,
  joinTranscripts,
  sanitizeTranscript,
} from "@/lib/upload";
import { MAX_UPLOAD_TOTAL_BYTES } from "@/lib/config";

describe("Upload Helpers - detectFileType", () => {
  it("detects PNG from valid 8-byte magic header", () => {
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
    ]);
    expect(detectFileType(pngHeader)).toBe("png");
    expect(detectedTypeToMime("png")).toBe("image/png");
  });

  it("detects JPEG from 3-byte magic header", () => {
    const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(detectFileType(jpegHeader)).toBe("jpeg");
    expect(detectedTypeToMime("jpeg")).toBe("image/jpeg");
  });

  it("detects WebP from RIFF and WEBP magic bytes", () => {
    const webpHeader = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // RIFF
      0x24, 0x00, 0x00, 0x00, // size
      0x57, 0x45, 0x42, 0x50, // WEBP
    ]);
    expect(detectFileType(webpHeader)).toBe("webp");
    expect(detectedTypeToMime("webp")).toBe("image/webp");
  });

  it("detects PDF from %PDF- magic header", () => {
    const pdfHeader = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37,
    ]);
    expect(detectFileType(pdfHeader)).toBe("pdf");
    expect(detectedTypeToMime("pdf")).toBe("application/pdf");
  });

  it("rejects truncated headers cleanly without throwing", () => {
    expect(detectFileType(new Uint8Array([]))).toBeNull();
    expect(detectFileType(new Uint8Array([0x89]))).toBeNull();
    expect(detectFileType(new Uint8Array([0x89, 0x50]))).toBeNull();
    expect(detectFileType(new Uint8Array([0x52, 0x49, 0x46, 0x46]))).toBeNull(); // RIFF without WEBP
    expect(detectFileType(new Uint8Array([0x25, 0x50, 0x44]))).toBeNull(); // Truncated %PDF
  });

  it("rejects spoofed files (e.g. ASCII text or random binary)", () => {
    const textBytes = new TextEncoder().encode("Not a real image file!");
    expect(detectFileType(textBytes)).toBeNull();

    const gifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
    expect(detectFileType(gifBytes)).toBeNull();
  });
});

describe("Upload Helpers - validateUploadSet", () => {
  it("validates a healthy mixed set of images and PDFs", () => {
    const files = [
      { name: "offer-letter.pdf", size: 150_000, declaredType: "application/pdf" },
      { name: "screenshot1.png", size: 450_000, declaredType: "image/png" },
      { name: "screenshot2.jpg", size: 300_000, declaredType: "image/jpeg" },
    ];
    const result = validateUploadSet(files);
    expect(result.ok).toBe(true);
  });

  it("rejects empty file set", () => {
    const result = validateUploadSet([]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("EMPTY_FILE");
    }
  });

  it("rejects more than 5 files with TOO_MANY_FILES", () => {
    const files = Array.from({ length: 6 }, (_, i) => ({
      name: `file${i}.png`,
      size: 10_000,
      declaredType: "image/png",
    }));
    const result = validateUploadSet(files);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("TOO_MANY_FILES");
      expect(result.message).toContain("at most 5 files");
    }
  });

  it("rejects a zero-byte file with EMPTY_FILE", () => {
    const files = [
      { name: "valid.png", size: 10_000, declaredType: "image/png" },
      { name: "empty.png", size: 0, declaredType: "image/png" },
    ];
    const result = validateUploadSet(files);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("EMPTY_FILE");
      expect(result.message).toContain('empty.png" is empty');
    }
  });

  it("rejects unsupported types (e.g. svg, heic, docx)", () => {
    const files = [
      { name: "vector.svg", size: 10_000, declaredType: "image/svg+xml" },
    ];
    const result = validateUploadSet(files);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("UNSUPPORTED_TYPE");
      expect(result.message).toContain("vector.svg");
    }
  });

  it("rejects total size exceeding 4 MB with TOTAL_TOO_LARGE", () => {
    const files = [
      { name: "big1.pdf", size: 2_500_000, declaredType: "application/pdf" },
      { name: "big2.pdf", size: 2_000_000, declaredType: "application/pdf" },
    ];
    expect(2_500_000 + 2_000_000).toBeGreaterThan(MAX_UPLOAD_TOTAL_BYTES);

    const result = validateUploadSet(files);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("TOTAL_TOO_LARGE");
      expect(result.message).toContain("exceeds 4 MB");
    }
  });
});

describe("Upload Helpers - planImageCompression", () => {
  it("keeps standard dimensions under 1600x6000 unchanged", () => {
    const result = planImageCompression(1200, 800);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.targetWidth).toBe(1200);
      expect(result.plan.targetHeight).toBe(800);
      expect(result.plan.qualityLadder).toEqual([0.85, 0.75, 0.65, 0.6]);
    }
  });

  it("scales down wide images proportionally to max width 1600", () => {
    const result = planImageCompression(2400, 1200);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.targetWidth).toBe(1600);
      expect(result.plan.targetHeight).toBe(800);
    }
  });

  it("scales down tall screenshots proportionally to max height 6000", () => {
    // 1000 x 8000 (8 MP, within 12 MP limit)
    const result = planImageCompression(1000, 8000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.targetHeight).toBe(6000);
      expect(result.plan.targetWidth).toBe(750);
    }
  });

  it("rejects images exceeding 12 megapixels with a helpful error", () => {
    // 4000 x 4000 = 16 MP (> 12 MP)
    const result = planImageCompression(4000, 4000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("exceeds 12 megapixels");
    }
  });

  it("rejects invalid dimensions", () => {
    expect(planImageCompression(0, 100).ok).toBe(false);
    expect(planImageCompression(-50, 100).ok).toBe(false);
    expect(planImageCompression(NaN, 100).ok).toBe(false);
  });
});

describe("Upload Helpers - joinTranscripts and sanitizeTranscript", () => {
  it("returns empty string for empty item list", () => {
    expect(joinTranscripts([])).toBe("");
  });

  it("returns raw trimmed transcript for a single file without file index header", () => {
    const items = [
      { index: 0, transcript: "Dear Candidate, congratulations on your offer.", readable: true },
    ];
    expect(joinTranscripts(items)).toBe(
      "Dear Candidate, congratulations on your offer."
    );
  });

  it("inserts [File N of M] headers for multiple files in index order", () => {
    const items = [
      { index: 1, transcript: "Second page details.", readable: true },
      { index: 0, transcript: "First page header.", readable: true },
    ];
    const joined = joinTranscripts(items);
    expect(joined).toBe(
      "[File 1 of 2]\nFirst page header.\n\n[File 2 of 2]\nSecond page details."
    );
  });

  it("sanitizeTranscript strips NUL and control characters while preserving formatting", () => {
    const dirty = "Hello\0 World!\x01\x02\nLine 2\tTabbed\r\nLine 3\x7f";
    const clean = sanitizeTranscript(dirty);
    expect(clean).toBe("Hello World!\nLine 2\tTabbed\r\nLine 3");
  });

  it("sanitizeTranscript truncates at MAX_TRANSCRIPT_CHARS", () => {
    const long = "A".repeat(50_000);
    const clean = sanitizeTranscript(long);
    expect(clean.length).toBe(40_000);
  });
});
