/**
 * Magic-byte file type detection.
 * Inspects raw buffer bytes rather than trusting declared MIME types or file extensions.
 */

export type DetectedFileType = "png" | "jpeg" | "webp" | "pdf";

/**
 * Detects file type from raw binary header bytes.
 * Returns null if the header does not match any allowed format.
 */
export function detectFileType(bytes: Uint8Array): DetectedFileType | null {
  if (!bytes || bytes.length < 3) {
    return null;
  }

  // 1. JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }

  // 2. PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return "pdf";
  }

  // 3. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }

  // 4. WebP: "RIFF" at 0..3 (0x52 0x49 0x46 0x46) and "WEBP" at 8..11 (0x57 0x45 0x42 0x50)
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

/**
 * Maps detected type to standard MIME type.
 */
export function detectedTypeToMime(type: DetectedFileType): string {
  switch (type) {
    case "png":
      return "image/png";
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "pdf":
      return "application/pdf";
  }
}
