"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ASPECTS, CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/categories";
import { capturePoster, capturePreview, directUpload, imageBlur, loadVideoMeta, requestTicket } from "@/lib/client-media";

type WorkInput = { id?: string; title: string; slug: string; category: string; description: string; client: string | null; role: string | null; software: string; year: number; aspect: string; coverImage: string; coverBlur: string | null; previewClip: string | null; videoUrl: string | null; externalUrl: string | null; featured: boolean; published: boolean; sortOrder: number };
const blank: WorkInput = { title: "", slug: "", category: "MUSIC_VIDEO", description: "", client: "", role: "", software: "", year: new Date().getFullYear(), aspect: "16:9", coverImage: "", coverBlur: null, previewClip: null, videoUrl: null, externalUrl: null, featured: false, published: false, sortOrder: 99 };

export default function WorkEditor({ work }: { work?: WorkInput }) {
  const [data, setData] = useState(work ?? blank); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [pct, setPct] = useState<number | null>(null); const router = useRouter();
  // 直傳模式:保留選檔的 object URL 給「重拍封面」用(零 CORS 問題)
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const scrubRef = useRef<HTMLVideoElement>(null);
  const set = (key: keyof WorkInput, value: unknown) => setData((current) => ({ ...current, [key]: value }));

  async function save(e: React.FormEvent) { e.preventDefault(); setBusy(true); setMessage(""); const res = await fetch(data.id ? `/api/works/${data.id}` : "/api/works", { method: data.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) }); const body = await res.json(); setBusy(false); if (!res.ok) return setMessage(body.error || "Save failed"); if (!data.id) router.replace(`/admin/works/${body.id}`); else setMessage("Saved."); router.refresh(); }

  /** 傳統路徑:本地儲存 + 伺服器 ffmpeg 管線 */
  async function legacyUpload(file: File) {
    setMessage("Processing on server…");
    const form = new FormData(); form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form }); const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Upload failed");
    setData((current) => ({ ...current, ...body, ...(body.url ? { coverImage: body.url, coverBlur: body.blur } : {}) }));
    setMessage(body.kind === "video" ? "Preview, cover and blur generated. Save to keep changes." : "Image ready. Save to keep changes.");
  }

  /** 雲端直傳路徑:瀏覽器生成封面 / 預覽 / blur */
  async function directVideoUpload(file: File) {
    const url = URL.createObjectURL(file);
    const meta = await loadVideoMeta(url);
    setLocalVideoUrl(url);
    setMessage("Uploading video…");
    const ticket = await requestTicket("video", file.name, file.type);
    if (ticket.mode === "local") { URL.revokeObjectURL(url); setLocalVideoUrl(null); return legacyUpload(file); }
    const videoUrl = await directUpload(ticket, file, setPct);
    setPct(null);
    setMessage("Generating cover & preview…");
    const video = document.createElement("video");
    video.muted = true; video.playsInline = true; video.src = url;
    await new Promise((r) => (video.onloadedmetadata = r));
    const { posterUrl, blur, previewUrl } = await captureAndUploadFrom(video, Math.min(1, meta.duration / 2), file.name);
    setData((current) => ({ ...current, videoUrl, aspect: meta.aspect, coverImage: posterUrl, coverBlur: blur, previewClip: previewUrl }));
    setMessage("Video, cover and preview ready. Scrub below to re-capture a better frame, then Save.");
  }

  async function captureAndUploadFrom(video: HTMLVideoElement, at: number, name: string) {
    const { poster, blur } = await capturePoster(video, at);
    const posterTicket = await requestTicket("cover", `${name}.jpg`, "image/jpeg");
    if (posterTicket.mode === "local") throw new Error("Storage mode changed mid-upload");
    const posterUrl = await directUpload(posterTicket, poster);
    let previewUrl: string | null = null;
    try {
      setMessage("Recording 4s hover preview…");
      const preview = await capturePreview(video, at);
      const previewTicket = await requestTicket("preview", `${name}.webm`, "video/webm");
      if (previewTicket.mode === "direct") previewUrl = await directUpload(previewTicket, preview);
    } catch { /* 瀏覽器不支援 MediaRecorder 時保留封面即可 */ }
    return { posterUrl, blur, previewUrl };
  }

  /** 重拍:用捲動到的畫面當封面 + 從該秒起錄預覽 */
  async function recapture() {
    const video = scrubRef.current; if (!video) return;
    setBusy(true); setMessage("Re-capturing…");
    try {
      const at = video.currentTime;
      const { posterUrl, blur, previewUrl } = await captureAndUploadFrom(video, at, data.slug || "work");
      setData((current) => ({ ...current, coverImage: posterUrl, coverBlur: blur, ...(previewUrl ? { previewClip: previewUrl } : {}) }));
      setMessage(`Cover captured at ${at.toFixed(1)}s. Save to keep changes.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Capture failed"); }
    setBusy(false);
  }

  // 雲端儲存單檔上限(Supabase 免費方案 50MB);影片留安全邊界 48MB
  const MAX_VIDEO_MB = 48;
  const MAX_IMAGE_MB = 15;

  async function upload(file: File) {
    setBusy(true); setMessage(""); setPct(null);
    const isVideo = file.type.startsWith("video/");
    const limitMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > limitMB) {
      setBusy(false);
      setMessage(
        isVideo
          ? `This video is ${sizeMB.toFixed(0)}MB — over the ${limitMB}MB cloud limit. Export a web version first (1080p, H.264, ~6 Mbps) and upload that. Raw camera/render files are far too large for the web.`
          : `This image is ${sizeMB.toFixed(0)}MB — over the ${limitMB}MB limit. Export a JPG/WebP under ${limitMB}MB.`,
      );
      return;
    }
    try {
      if (isVideo) await directVideoUpload(file);
      else {
        const ticket = await requestTicket("image", file.name, file.type);
        if (ticket.mode === "local") await legacyUpload(file);
        else {
          setMessage("Uploading image…");
          const url = await directUpload(ticket, file, setPct);
          const blur = await imageBlur(file);
          setData((current) => ({ ...current, coverImage: url, coverBlur: blur }));
          setPct(null); setMessage("Image ready. Save to keep changes.");
        }
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed"); }
    setBusy(false);
  }

  const field = (label: string, key: keyof WorkInput, type = "text") => <label className="block"><span className="mono-label mb-2 block text-mut">{label}</span><input type={type} value={String(data[key] ?? "")} onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)} className="admin-input" /></label>;

  return <form onSubmit={save} className="grid gap-10 md:grid-cols-12"><div className="space-y-6 md:col-span-7"><div className="grid gap-5 md:grid-cols-2">{field("Title", "title")}{field("Slug", "slug")}</div><label className="block"><span className="mono-label mb-2 block text-mut">Description</span><textarea value={data.description} onChange={(e) => set("description", e.target.value)} rows={5} className="admin-input resize-y" /></label><div className="grid gap-5 md:grid-cols-2">{field("Client", "client")}{field("Role", "role")}{field("Software", "software")}{field("Year", "year", "number")}</div><div className="grid gap-5 md:grid-cols-2"><label><span className="mono-label mb-2 block text-mut">Category</span><select value={data.category} onChange={(e) => set("category", e.target.value)} className="admin-input">{CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c as Category]}</option>)}</select></label><label><span className="mono-label mb-2 block text-mut">Aspect</span><select value={data.aspect} onChange={(e) => set("aspect", e.target.value)} className="admin-input">{ASPECTS.map((a) => <option key={a}>{a}</option>)}</select></label></div>{field("External Vimeo / YouTube URL", "externalUrl")}
    {localVideoUrl && <div className="space-y-3 border border-line p-4"><span className="mono-label block text-mut">Pick a better cover frame</span><video ref={scrubRef} src={localVideoUrl} controls muted playsInline className="w-full" /><button type="button" disabled={busy} onClick={recapture} className="w-full border border-mut px-4 py-3 mono-label text-fg disabled:opacity-50">Use current frame as cover + preview</button></div>}
  </div><aside className="space-y-6 md:col-span-4 md:col-start-9"><div className="relative aspect-[4/3] overflow-hidden border border-line bg-panel">{data.coverImage ? <Image src={data.coverImage} alt="Cover preview" fill unoptimized={data.coverImage.startsWith("http")} className="object-contain" /> : <div className="flex h-full items-center justify-center mono-label text-mut">No media</div>}</div><label className="flex min-h-28 cursor-pointer items-center justify-center border border-dashed border-mut px-6 text-center mono-label text-mut hover:text-fg">Drop / select full video or cover<input type="file" accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>{pct !== null && <div className="mono-label text-mut">UPLOADING {pct}%</div>}<div className="space-y-3"><label className="flex items-center justify-between border-b border-line py-3 mono-label">Published<input type="checkbox" checked={data.published} onChange={(e) => set("published", e.target.checked)} /></label><label className="flex items-center justify-between border-b border-line py-3 mono-label">Featured<input type="checkbox" checked={data.featured} onChange={(e) => set("featured", e.target.checked)} /></label></div>{message && <p className="text-sm text-mut">{message}</p>}<button disabled={busy} className="w-full bg-fg px-4 py-4 mono-label text-bg disabled:opacity-50">{busy ? "Working…" : "Save project"}</button>{data.id && <button type="button" onClick={async () => { if (!confirm("Delete this project?")) return; await fetch(`/api/works/${data.id}`, { method: "DELETE" }); router.replace("/admin/works"); router.refresh(); }} className="w-full border border-line px-4 py-3 mono-label text-mut">Delete</button>}</aside></form>;
}
