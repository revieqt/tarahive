
import sharp from "sharp";
import type { ImageProfile, StorageCategory } from "../storage.types";

const PROFILES: Record<StorageCategory, ImageProfile> = {
  profileImages: {
    maxBytes: 5 * 1024 * 1024,
    maxWidth: 6000,
    maxHeight: 6000,
    outputFormat: "webp",
    quality: 85,
    fit: "cover",
    width: 512,
    height: 512,
  },
};

const ALLOWED_FORMATS = new Set([
  "jpeg",
  "png",
  "webp",
]);

export class ImageValidationError extends Error {}

export class ImageValidatorService {
  getProfile(category: StorageCategory): ImageProfile {
    return PROFILES[category];
  }

  async validate(
    buffer: Buffer,
    category: StorageCategory,
  ): Promise<void> {
    const profile = this.getProfile(category);

    if (!buffer?.length) {
      throw new ImageValidationError("Image file is empty.");
    }

    if (buffer.length > profile.maxBytes) {
      throw new ImageValidationError("Image exceeds the allowed file size.");
    }

    let metadata: sharp.Metadata;

    try {
      metadata = await sharp(buffer, {
        limitInputPixels: 40_000_000,
        failOn: "error",
      }).metadata();
    } catch {
      throw new ImageValidationError("Invalid or corrupted image.");
    }

    if (
      !metadata.format ||
      !ALLOWED_FORMATS.has(metadata.format)
    ) {
      throw new ImageValidationError("Only JPEG, PNG, and WebP images are allowed.");
    }

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width > profile.maxWidth ||
      metadata.height > profile.maxHeight ||
      metadata.width * metadata.height > 40_000_000
    ) {
      throw new ImageValidationError("Image dimensions exceed the allowed limits.");
    }

    // Reject animated/multi-page images for this initial implementation.
    if ((metadata.pages ?? 1) > 1) {
      throw new ImageValidationError("Animated images are not supported.");
    }
  }
}
