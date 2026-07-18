import { requireAdmin } from "@/lib/session";
import { getStorage } from "@/lib/storage";

// 簽名直傳票券:雲端儲存時回傳瀏覽器可直傳的 URL(繞過 serverless body 限制);
// 本地儲存回 { mode: "local" },前端改走傳統 /api/upload
const KINDS = new Set(["video", "preview", "cover", "image", "showreel", "poster"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { filename = "file", contentType = "", kind = "" } = await request
    .json()
    .catch(() => ({}) as Record<string, string>);
  if (!KINDS.has(kind)) return Response.json({ error: "Invalid kind" }, { status: 400 });
  if (!VIDEO_TYPES.has(contentType) && !IMAGE_TYPES.has(contentType)) {
    return Response.json({ error: "Unsupported file type" }, { status: 415 });
  }
  const safeName = String(filename).toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-80);
  const key = `${kind}s/${Date.now()}-${safeName}`;
  try {
    const ticket = await getStorage().createUploadTicket(key, contentType);
    return Response.json(ticket);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Ticket failed" },
      { status: 500 },
    );
  }
}
