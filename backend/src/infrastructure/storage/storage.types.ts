
export const STORAGE_CATEGORIES = [
  "profileImages"
] as const;

export type StorageCategory =
  (typeof STORAGE_CATEGORIES)[number];

export interface ImageProfile {
  maxBytes: number;
  maxWidth: number;
  maxHeight: number;
  outputFormat: "webp" | "jpeg";
  quality: number;
  fit: "inside" | "cover";
  width: number;
  height: number;
}

export interface ProcessedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface StoredImage {
  key: string;
  contentType: string;
  width: number;
  height: number;
  sizeBytes: number;
}
