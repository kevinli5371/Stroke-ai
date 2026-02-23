import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import { app } from 'electron';

// Public community GGUF build (bartowski, MIT license) — Q4_K_M is best quality/size balance
const MODEL_URL =
  'https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf';
const MODEL_FILENAME = 'Phi-3.5-mini-instruct-Q4_K_M.gguf';
/** Approximate size in bytes when content-length is missing (for progress estimate). */
const EXPECTED_MODEL_BYTES = 2_390_000_000;

export class ModelDownloader {
  private modelDir: string;
  private modelPath: string;
  private activeRequest: ReturnType<typeof https.get> | null = null;

  constructor() {
    this.modelDir = path.join(app.getPath('userData'), 'models');
    this.modelPath = path.join(this.modelDir, MODEL_FILENAME);
  }

  /** Check if the model file exists and is reasonably large (>1 GB). */
  async isDownloaded(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.modelPath)) return false;
      const stats = fs.statSync(this.modelPath);
      return stats.size > 1_000_000_000;
    } catch {
      return false;
    }
  }

  getModelPath(): string {
    return this.modelPath;
  }

  /** Return file size in bytes (0 if not present). */
  async getModelSize(): Promise<number> {
    try {
      if (!fs.existsSync(this.modelPath)) return 0;
      return fs.statSync(this.modelPath).size;
    } catch {
      return 0;
    }
  }

  /** Abort an in-progress download. */
  cancelDownload(): void {
    if (this.activeRequest) {
      this.activeRequest.destroy();
      this.activeRequest = null;
    }
  }

  /** Delete the downloaded model from disk. */
  async deleteModel(): Promise<void> {
    this.cancelDownload();
    const tempPath = this.modelPath + '.downloading';
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    if (fs.existsSync(this.modelPath)) fs.unlinkSync(this.modelPath);
  }

  /**
   * Download the model from HuggingFace with progress callbacks.
   * Follows redirects (up to 5). Writes to a temp file first, then renames.
   */
  async download(onProgress: (percent: number) => void): Promise<string> {
    // Ensure models directory exists
    if (!fs.existsSync(this.modelDir)) {
      fs.mkdirSync(this.modelDir, { recursive: true });
    }

    const tempPath = this.modelPath + '.downloading';

    return new Promise<string>((resolve, reject) => {
      const followRedirect = (url: string, redirectCount = 0) => {
        if (redirectCount > 5) {
          reject(new Error('Too many redirects'));
          return;
        }

        const protocol = url.startsWith('https') ? https : http;

        const request = protocol.get(url, (response) => {
          // Handle redirects
          if (
            (response.statusCode === 301 ||
              response.statusCode === 302 ||
              response.statusCode === 307) &&
            response.headers.location
          ) {
            followRedirect(response.headers.location, redirectCount + 1);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Download failed with HTTP ${response.statusCode}`));
            return;
          }

          const totalSize = parseInt(response.headers['content-length'] || '0', 10);
          const effectiveTotal = totalSize > 0 ? totalSize : EXPECTED_MODEL_BYTES;
          let downloadedSize = 0;

          const fileStream = fs.createWriteStream(tempPath);

          response.on('data', (chunk: Buffer) => {
            downloadedSize += chunk.length;
            const pct = totalSize > 0
              ? (downloadedSize / totalSize) * 100
              : Math.min(99, (downloadedSize / effectiveTotal) * 100);
            onProgress(Math.round(pct));
          });

          response.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            try {
              if (fs.existsSync(this.modelPath)) fs.unlinkSync(this.modelPath);
              fs.renameSync(tempPath, this.modelPath);
              onProgress(100);
              resolve(this.modelPath);
            } catch (e) {
              reject(e);
            }
          });

          fileStream.on('error', (err) => {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            reject(err);
          });

          response.on('error', (err) => {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            reject(err);
          });
        });

        request.on('error', (err) => {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          reject(err);
        });

        this.activeRequest = request;
      };

      followRedirect(MODEL_URL);
    });
  }
}
