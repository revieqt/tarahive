
import { randomUUID } from "node:crypto";
import type { StorageProvider } from "./interfaces/storage-provider.interface";
import { ImageValidatorService } from "./validators/image-validator.service";
import { ImageProcessorService } from "./processors/image-processor.service";
import type {
  StorageCategory,
  StoredImage,
} from "./storage.types";

export class StorageService {
  constructor(
    private readonly provider: StorageProvider,
    private readonly validator: ImageValidatorService,
    private readonly processor: ImageProcessorService,
  ) {}

  async uploadImage(
    buffer: Buffer,
    category: StorageCategory,
  ): Promise<StoredImage> {
    // 1. Validate the original image.
    await this.validator.validate(buffer, category);

    // 2. Process and normalize it.
    const profile = this.validator.getProfile(category);
    const processed = await this.processor.process(buffer, profile);

    // 3. Generate a unique, server-controlled storage key.
    const key = `${category}/${randomUUID()}.${processed.extension}`;

    // 4. Persist the processed image.
    await this.provider.upload(key, processed.buffer);

    // 5. Return metadata for the caller to save in PostgreSQL.
    return {
      key,
      contentType: processed.contentType,
      width: processed.width,
      height: processed.height,
      sizeBytes: processed.sizeBytes,
    };
  }

  async deleteImage(key: string): Promise<void> {
    await this.provider.delete(key);
  }
}
