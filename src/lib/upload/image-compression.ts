/**
 * Pure image compression planning helper.
 * Calculates target downscale dimensions and quality ladder for browser-side canvas compression.
 */

export interface CompressionPlan {
  readonly targetWidth: number;
  readonly targetHeight: number;
  readonly qualityLadder: readonly number[];
}

export type PlanImageCompressionResult =
  | { readonly ok: true; readonly plan: CompressionPlan }
  | { readonly ok: false; readonly error: string };

export const MAX_IMAGE_MEGAPIXELS = 12_000_000; // 12 MP safety cap
export const MAX_TARGET_WIDTH = 1600;
export const MAX_TARGET_HEIGHT = 6000;
export const DEFAULT_QUALITY_LADDER = [0.85, 0.75, 0.65, 0.6] as const;

/**
 * Plans image downscaling and compression parameters.
 * Scale down only; never upscales.
 */
export function planImageCompression(
  width: number,
  height: number
): PlanImageCompressionResult {
  if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
    return {
      ok: false,
      error: "Invalid image dimensions.",
    };
  }

  const totalPixels = width * height;
  if (totalPixels > MAX_IMAGE_MEGAPIXELS) {
    return {
      ok: false,
      error:
        "The image is too large (exceeds 12 megapixels). Please crop or split the screenshot before uploading.",
    };
  }

  let scale = 1;

  // Scale down width if exceeds MAX_TARGET_WIDTH (1600 px)
  if (width > MAX_TARGET_WIDTH) {
    scale = Math.min(scale, MAX_TARGET_WIDTH / width);
  }

  // Scale down height if exceeds MAX_TARGET_HEIGHT (6000 px)
  const scaledHeight = height * scale;
  if (scaledHeight > MAX_TARGET_HEIGHT) {
    scale = Math.min(scale, MAX_TARGET_HEIGHT / height);
  }

  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  return {
    ok: true,
    plan: {
      targetWidth,
      targetHeight,
      qualityLadder: DEFAULT_QUALITY_LADDER,
    },
  };
}
