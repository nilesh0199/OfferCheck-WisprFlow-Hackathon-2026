import {
  MAX_UPLOAD_FILES,
  MAX_UPLOAD_TOTAL_BYTES,
  ALLOWED_UPLOAD_TYPES,
} from "@/lib/config";

export type UploadValidationErrorCode =
  | "TOO_MANY_FILES"
  | "TOTAL_TOO_LARGE"
  | "UNSUPPORTED_TYPE"
  | "EMPTY_FILE";

export interface UploadFileMeta {
  readonly name: string;
  readonly size: number;
  readonly declaredType?: string;
}

export type UploadSetValidationResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: UploadValidationErrorCode;
      readonly message: string;
    };

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isAllowedMime(mime?: string): boolean {
  if (!mime) return false;
  const normalized = mime.toLowerCase().trim();
  return (ALLOWED_UPLOAD_TYPES as readonly string[]).includes(normalized);
}

/**
 * Validates a set of files intended for upload.
 * Enforces file count, total byte size, non-empty content, and allowed types.
 */
export function validateUploadSet(
  files: readonly UploadFileMeta[]
): UploadSetValidationResult {
  if (!files || files.length === 0) {
    return {
      ok: false,
      code: "EMPTY_FILE",
      message: "Please select at least one file to upload.",
    };
  }

  // 1. File count check
  if (files.length > MAX_UPLOAD_FILES) {
    return {
      ok: false,
      code: "TOO_MANY_FILES",
      message: `You can upload at most ${MAX_UPLOAD_FILES} files at a time.`,
    };
  }

  // 2. Empty file and unsupported type check
  let totalBytes = 0;
  for (const file of files) {
    if (!file.size || file.size <= 0) {
      return {
        ok: false,
        code: "EMPTY_FILE",
        message: `File "${file.name}" is empty (0 bytes). Please select a valid file.`,
      };
    }

    totalBytes += file.size;

    const validMime = isAllowedMime(file.declaredType);
    const validExt = hasAllowedExtension(file.name);

    if (!validMime && !validExt) {
      return {
        ok: false,
        code: "UNSUPPORTED_TYPE",
        message: `File "${file.name}" is not supported. Please upload PNG, JPEG, WebP images, or PDF documents.`,
      };
    }
  }

  // 3. Total byte size check
  if (totalBytes > MAX_UPLOAD_TOTAL_BYTES) {
    return {
      ok: false,
      code: "TOTAL_TOO_LARGE",
      message:
        "The total size of the uploaded files exceeds 4 MB. Please remove some files or compress your screenshots.",
    };
  }

  return { ok: true };
}
