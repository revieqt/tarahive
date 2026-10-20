
import sharp from "sharp";
import type {
  ImageProfile,
  ProcessedImage,
} from "../storage.types";

export class ImageProcessorService {
  async process(
    buffer: Buffer,
    profile: ImageProfile,
  ): Promise<ProcessedImage> {
    const pipeline = sharp(buffer, {
      limitInputPixels: 40_000_000,
      failOn: "error",
    }).rotate(); // Respect EXIF orientation.

    if (profile.fit === "cover") {
      pipeline.resize(profile.width, profile.height, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      });
    } else {
      pipeline.resize(profile.width, profile.height, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    if (profile.outputFormat === "jpeg") {
      pipeline.jpeg({
        quality: profile.quality,
        mozjpeg: true,
      });
    } else {
      pipeline.webp({
        quality: profile.quality,
        effort: 4,
      });
    }

    const { data, info } = await pipeline.toBuffer({
      resolveWithObject: true,
    });

    return {
      buffer: data,
      contentType:
        profile.outputFormat === "webp"
          ? "image/webp"
          : "image/jpeg",
      extension: profile.outputFormat,
      width: info.width,
      height: info.height,
      sizeBytes: data.length,
    };
  }
}
