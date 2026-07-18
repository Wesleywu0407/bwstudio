"use client";
import { useState } from "react";
import { capturePoster, directUpload, requestTicket } from "@/lib/client-media";

type SettingsInput = { siteName: string; tagline: string; location: string; showreelUrl: string | null; showreelPoster: string | null; aboutText: string; email: string; instagram: string | null; vimeo: string | null; behance: string | null };
export default function SettingsEditor({ initial }: { initial: SettingsInput }) {
  const [data, setData] = useState(initial); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const [pct, setPct] = useState<number | null>(null);
  const fields: [string, keyof SettingsInput][] = [["Display name", "siteName"], ["Tagline", "tagline"], ["Location", "location"], ["Email", "email"], ["Showreel URL", "showreelUrl"], ["Showreel poster URL", "showreelPoster"], ["Instagram", "instagram"], ["Vimeo", "vimeo"], ["Behance", "behance"]];

  /** 上傳首頁 showreel:直傳影片 + 瀏覽器抓 poster;本地模式走 /api/upload */
  async function uploadShowreel(file: File) {
    setBusy(true); setMessage(""); setPct(null);
    try {
      const ticket = await requestTicket("showreel", file.name, file.type);
      if (ticket.mode === "local") {
        setMessage("Processing on server…");
        const form = new FormData(); form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form }); const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Upload failed");
        setData((c) => ({ ...c, showreelUrl: body.videoUrl, showreelPoster: body.coverImage }));
      } else {
        setMessage("Uploading showreel…");
        const showreelUrl = await directUpload(ticket, file, setPct);
        setPct(null); setMessage("Capturing poster…");
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.muted = true; video.playsInline = true; video.src = url;
        await new Promise((r) => (video.onloadedmetadata = r));
        const { poster } = await capturePoster(video, 1);
        URL.revokeObjectURL(url);
        const posterTicket = await requestTicket("poster", `${file.name}.jpg`, "image/jpeg");
        const showreelPoster = posterTicket.mode === "direct" ? await directUpload(posterTicket, poster) : null;
        setData((c) => ({ ...c, showreelUrl, ...(showreelPoster ? { showreelPoster } : {}) }));
      }
      setMessage("Showreel ready. Save settings to apply.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed"); }
    setBusy(false);
  }

  return <form className="max-w-3xl space-y-5" onSubmit={async (e) => { e.preventDefault(); setBusy(true); const res = await fetch("/api/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) }); setBusy(false); setMessage(res.ok ? "Settings saved." : "Save failed."); }}>
    <label className="flex min-h-24 cursor-pointer items-center justify-center border border-dashed border-mut px-6 text-center mono-label text-mut hover:text-fg">Drop / select homepage showreel video<input type="file" accept="video/mp4,video/quicktime,video/webm" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadShowreel(e.target.files[0])} /></label>
    {pct !== null && <div className="mono-label text-mut">UPLOADING {pct}%</div>}
    <div className="grid gap-5 md:grid-cols-2">{fields.map(([label, key]) => <label key={key}><span className="mono-label mb-2 block text-mut">{label}</span><input className="admin-input" value={data[key] ?? ""} onChange={(e) => setData((current) => ({ ...current, [key]: e.target.value }))} /></label>)}</div><label className="block"><span className="mono-label mb-2 block text-mut">About text</span><textarea rows={8} className="admin-input" value={data.aboutText} onChange={(e) => setData((current) => ({ ...current, aboutText: e.target.value }))} /></label>{message && <p className="text-sm text-mut">{message}</p>}<button disabled={busy} className="bg-fg px-6 py-4 mono-label text-bg disabled:opacity-50">{busy ? "Working…" : "Save settings"}</button></form>;
}
