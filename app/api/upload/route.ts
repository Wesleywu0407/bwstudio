import path from "path";
import { blurDataURL, processVideo } from "@/lib/media";
import { requireAdmin } from "@/lib/session";
import { getStorage } from "@/lib/storage";

const VIDEO = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const IMAGE = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX = 250 * 1024 * 1024;

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "File exceeds 250MB" }, { status: 413 });
  if (!VIDEO.has(file.type) && !IMAGE.has(file.type)) return Response.json({ error: "Unsupported file type" }, { status: 415 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const key = `${Date.now()}-${safeName}`;
  const storage = getStorage();
  // 雲端儲存(serverless)沒有本地 ffmpeg 管線:影片一律走 /api/upload-url 直傳
  if (VIDEO.has(file.type) && !storage.localPath("/uploads/_probe")) {
    return Response.json({ error: "Use direct upload for videos on cloud storage" }, { status: 400 });
  }
  const original = await storage.save(buffer, `originals/${key}`, file.type);
  if (IMAGE.has(file.type)) return Response.json({ url: original, blur: await blurDataURL(buffer), kind: "image" });
  try {
    const local = storage.localPath(original);
    if (!local) throw new Error("Video processing requires local storage");
    const output = await processVideo(local);
    const base = path.parse(safeName).name;
    const [previewClip, coverImage] = await Promise.all([
      storage.save(output.previewBuffer, `previews/${Date.now()}-${base}.mp4`),
      storage.save(output.posterBuffer, `covers/${Date.now()}-${base}.jpg`),
    ]);
    return Response.json({ kind: "video", videoUrl: original, previewClip, coverImage, coverBlur: output.posterBlur, aspect: output.aspect });
  } catch (error) { await storage.remove(original); return Response.json({ error: error instanceof Error ? error.message : "Processing failed" }, { status: 422 }); }
}
