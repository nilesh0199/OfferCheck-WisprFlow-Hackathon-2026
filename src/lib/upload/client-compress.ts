import { planImageCompression } from "./image-compression";

/**
 * Compresses an image file in the browser using HTMLCanvasElement and createImageBitmap.
 * PDFs and small images under 800 KB with compliant dimensions are passed through directly.
 */
export async function compressFileForUpload(file: File): Promise<File> {
  // Never attempt to compress PDFs via canvas
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return file;
  }

  // Only compress recognized image types
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Check browser environment capabilities
  if (typeof window === "undefined" || typeof createImageBitmap !== "function") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const planResult = planImageCompression(bitmap.width, bitmap.height);
    if (!planResult.ok) {
      bitmap.close?.();
      return file;
    }

    const { targetWidth, targetHeight, qualityLadder } = planResult.plan;

    // If no resize needed and file is under 800 KB, keep original
    if (
      targetWidth === bitmap.width &&
      targetHeight === bitmap.height &&
      file.size < 800_000
    ) {
      bitmap.close?.();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close?.();

    // Use JPEG for general screenshots or WebP if original was WebP
    const outputMime = file.type === "image/webp" ? "image/webp" : "image/jpeg";
    const extension = outputMime === "image/webp" ? ".webp" : ".jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const outputFileName = `${baseName}${extension}`;

    for (const quality of qualityLadder) {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outputMime, quality);
      });

      if (blob && (blob.size < 800_000 || quality === qualityLadder[qualityLadder.length - 1])) {
        if (blob.size < file.size || targetWidth < bitmap.width || targetHeight < bitmap.height) {
          return new File([blob], outputFileName, { type: outputMime });
        }
      }
    }

    return file;
  } catch {
    // If any canvas operation fails, gracefully return the original file
    return file;
  }
}
