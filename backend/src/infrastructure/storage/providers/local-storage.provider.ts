
import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import type { StorageProvider } from "../interfaces/storage-provider.interface";

export class LocalStorageProvider implements StorageProvider {
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  private resolveKey(key: string): string {
    if (
      !key ||
      key.includes("\\") ||
      path.posix.isAbsolute(key) ||
      key.split("/").some(
        (part) => !part || part === "." || part === "..",
      )
    ) {
      throw new Error("Invalid storage key.");
    }

    const destination = path.resolve(this.root, key);
    const relative = path.relative(this.root, destination);

    if (
      !relative ||
      relative === ".." ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative)
    ) {
      throw new Error("Storage key escapes the storage directory.");
    }

    return destination;
  }

  async upload(key: string, buffer: Buffer): Promise<void> {
    const destination = this.resolveKey(key);

    await mkdir(path.dirname(destination), {
      recursive: true,
    });

    // wx prevents overwriting an existing file.
    await writeFile(destination, buffer, {
      flag: "wx",
      mode: 0o640,
    });
  }

  async delete(key: string): Promise<void> {
    const destination = this.resolveKey(key);

    try {
      await unlink(destination);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}
