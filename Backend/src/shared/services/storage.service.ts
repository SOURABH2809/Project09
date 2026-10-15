import fs from "fs/promises";
import path from "path";

export class StorageService {
  private readonly storageBaseDir = process.env.STORAGE_PATH || "./storage";

  /**
   * Saves a buffer to the local filesystem (NFS Ready)
   * @param buffer The file content
   * @param fileName Name of the file (e.g., supplier_nda_123.pdf)
   * @param subfolder Optional subfolder (e.g., 'suppliers/documents')
   * @returns The relative path to the saved file
   */
  async saveFile(buffer: Buffer, fileName: string, subfolder: string = ""): Promise<string> {
    try {
      const targetDir = path.join(this.storageBaseDir, subfolder);

      // Ensure directory exists (mkdir -p)
      await fs.mkdir(targetDir, { recursive: true });

      const filePath = path.join(targetDir, fileName);
      await fs.writeFile(filePath, buffer);

      console.log(`[StorageService] File saved successfully at: ${filePath}`);

      // Return the relative path from the storage base
      return path.join(subfolder, fileName);
    } catch (error: any) {
      console.error("[StorageService] Error saving file:", error.message);
      throw new Error("Failed to save file to local storage");
    }
  }

  /**
   * Reads a file from storage
   */
  async getFile(relativeFilePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.storageBaseDir, relativeFilePath);
      return await fs.readFile(fullPath);
    } catch (error: any) {
      console.error("[StorageService] Error reading file:", error.message);
      throw new Error("File not found in storage");
    }
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(relativeFilePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.storageBaseDir, relativeFilePath);
      await fs.unlink(fullPath);
    } catch (error: any) {
      console.warn(
        `[StorageService] Could not delete file: ${relativeFilePath}. It may not exist.`,
      );
    }
  }
}

export const storageService = new StorageService();
