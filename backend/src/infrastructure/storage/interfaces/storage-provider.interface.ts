
export interface StorageProvider {
  upload(
    key: string,
    buffer: Buffer,
  ): Promise<void>;

  delete(key: string): Promise<void>;
}
