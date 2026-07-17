import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

/**
 * 儲存層抽象:預設本地磁碟(dev 與 VPS 直接可用)。
 * 要換 Supabase/S3 時實作同介面並改 getStorage() 即可,上層程式不動。
 */
export interface StorageAdapter {
  /** 存檔並回傳公開 URL */
  save(buffer: Buffer, key: string): Promise<string>;
  /** 依公開 URL 刪檔(不存在時靜默) */
  remove(url: string): Promise<void>;
  /** 公開 URL 對應的本機路徑(給 ffmpeg/sharp 用);非本地儲存回 null */
  localPath(url: string): string | null;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads/";

class LocalStorage implements StorageAdapter {
  async save(buffer: Buffer, key: string): Promise<string> {
    const filePath = path.join(UPLOAD_DIR, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
    return PUBLIC_PREFIX + key;
  }

  async remove(url: string): Promise<void> {
    const filePath = this.localPath(url);
    if (!filePath) return;
    await unlink(filePath).catch(() => {});
  }

  localPath(url: string): string | null {
    if (!url.startsWith(PUBLIC_PREFIX)) return null;
    const key = url.slice(PUBLIC_PREFIX.length);
    const resolved = path.resolve(UPLOAD_DIR, key);
    // 防 path traversal
    if (resolved !== UPLOAD_DIR && !resolved.startsWith(UPLOAD_DIR + path.sep)) return null;
    return resolved;
  }
}

let storage: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!storage) storage = new LocalStorage();
  return storage;
}
