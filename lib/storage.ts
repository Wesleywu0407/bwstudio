import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

/**
 * 儲存層抽象,依環境變數自動選擇:
 * - 預設:本地磁碟(dev / VPS,搭配伺服器端 ffmpeg 管線)
 * - 設了 SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY:Supabase Storage
 *   (Vercel 等無狀態環境,瀏覽器簽名直傳 + 客戶端生成預覽)
 */

/** 瀏覽器直傳票券;mode:"local" 表示改走傳統 /api/upload multipart */
export type UploadTicket =
  | { mode: "local" }
  | {
      mode: "direct";
      uploadUrl: string;
      headers: Record<string, string>;
      publicUrl: string;
    };

export interface StorageAdapter {
  /** 存檔並回傳公開 URL */
  save(buffer: Buffer, key: string, contentType?: string): Promise<string>;
  /** 依公開 URL 刪檔(不存在時靜默) */
  remove(url: string): Promise<void>;
  /** 公開 URL 對應的本機路徑(給 ffmpeg/sharp 用);非本地儲存回 null */
  localPath(url: string): string | null;
  /** 簽名直傳票券;本地儲存回 { mode: "local" } */
  createUploadTicket(key: string, contentType: string): Promise<UploadTicket>;
}

// ── 本地磁碟 ──────────────────────────────────────────────

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

  async createUploadTicket(): Promise<UploadTicket> {
    return { mode: "local" };
  }
}

// ── Supabase Storage(raw REST,不需 SDK)──────────────────

class SupabaseStorage implements StorageAdapter {
  private base: string;
  private key: string;
  private bucket: string;

  constructor(url: string, serviceKey: string, bucket: string) {
    this.base = url.replace(/\/$/, "");
    this.key = serviceKey;
    this.bucket = bucket;
  }

  private get publicPrefix() {
    return `${this.base}/storage/v1/object/public/${this.bucket}/`;
  }

  private auth(extra: Record<string, string> = {}) {
    return { Authorization: `Bearer ${this.key}`, apikey: this.key, ...extra };
  }

  async save(buffer: Buffer, key: string, contentType = "application/octet-stream"): Promise<string> {
    const res = await fetch(`${this.base}/storage/v1/object/${this.bucket}/${key}`, {
      method: "POST",
      headers: this.auth({ "content-type": contentType, "x-upsert": "true" }),
      body: new Uint8Array(buffer),
    });
    if (!res.ok) throw new Error(`Supabase upload failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
    return this.publicPrefix + key;
  }

  async remove(url: string): Promise<void> {
    if (!url.startsWith(this.publicPrefix)) return;
    const key = url.slice(this.publicPrefix.length);
    await fetch(`${this.base}/storage/v1/object/${this.bucket}/${key}`, {
      method: "DELETE",
      headers: this.auth(),
    }).catch(() => {});
  }

  localPath(): string | null {
    return null;
  }

  async createUploadTicket(key: string, contentType: string): Promise<UploadTicket> {
    const res = await fetch(`${this.base}/storage/v1/object/upload/sign/${this.bucket}/${key}`, {
      method: "POST",
      headers: this.auth({ "content-type": "application/json" }),
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`Signed upload URL failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
    const body = (await res.json()) as { url: string };
    return {
      mode: "direct",
      // body.url 形如 /object/upload/sign/{bucket}/{key}?token=...,瀏覽器用 PUT 上傳
      uploadUrl: `${this.base}/storage/v1${body.url}`,
      headers: { "content-type": contentType, "x-upsert": "true" },
      publicUrl: this.publicPrefix + key,
    };
  }
}

// ── factory ───────────────────────────────────────────────

let storage: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!storage) {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    storage =
      url && serviceKey
        ? new SupabaseStorage(url, serviceKey, process.env.SUPABASE_BUCKET || "media")
        : new LocalStorage();
  }
  return storage;
}

export function isCloudStorage(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
