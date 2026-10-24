
import path from "node:path";
import { LocalStorageProvider } from "./providers/local-storage.provider";
import { ImageValidatorService } from "./validators/image-validator.service";
import { ImageProcessorService } from "./processors/image-processor.service";
import { StorageService } from "./storage.service";

export const storagePath =
  process.env.STORAGE_PATH ??
  path.resolve(__dirname, "../../../../storage");

const providerName = process.env.STORAGE_PROVIDER ?? "local";

if (providerName !== "local") {
  throw new Error(
    `Unsupported STORAGE_PROVIDER: ${providerName}`,
  );
}

const provider = new LocalStorageProvider(storagePath);
const validator = new ImageValidatorService();
const processor = new ImageProcessorService();

export const storageService = new StorageService(
  provider,
  validator,
  processor,
);
