// 瀏覽器端媒體管線:雲端(serverless)沒有 ffmpeg,
// 封面 / 4 秒預覽 / blur 全部在管理員的瀏覽器裡生成後直傳。
// 僅供 client component import。
import { classifyAspect } from "@/lib/categories";
import type { UploadTicket } from "@/lib/storage";

export type VideoMeta = { width: number; height: number; duration: number; aspect: string };

/** 載入影片檔取得尺寸與長度(不進 DOM) */
export function loadVideoMeta(url: string): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        aspect: classifyAspect(video.videoWidth, video.videoHeight),
      });
      video.src = "";
    };
    video.onerror = () => reject(new Error("無法讀取影片"));
    video.src = url;
  });
}

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    video.onseeked = () => resolve();
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.1));
  });
}

function drawFrame(video: HTMLVideoElement, maxW: number): HTMLCanvasElement {
  const scale = Math.min(1, maxW / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", quality),
  );
}

/** 從影片元素目前(或指定)時間點抓封面 jpg + blur dataURL */
export async function capturePoster(
  video: HTMLVideoElement,
  at?: number,
): Promise<{ poster: Blob; blur: string }> {
  if (at !== undefined) await seek(video, at);
  const canvas = drawFrame(video, 1600);
  const poster = await canvasBlob(canvas, 0.85);
  // blur:縮到 20px 再輸出低品質 jpeg
  const tiny = document.createElement("canvas");
  const scale = 20 / Math.max(canvas.width, canvas.height);
  tiny.width = Math.max(1, Math.round(canvas.width * scale));
  tiny.height = Math.max(1, Math.round(canvas.height * scale));
  tiny.getContext("2d")!.drawImage(canvas, 0, 0, tiny.width, tiny.height);
  return { poster, blur: tiny.toDataURL("image/jpeg", 0.4) };
}

/** 圖片檔生成 blur dataURL(封面直接上傳圖片時用) */
export function imageBlur(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const tiny = document.createElement("canvas");
      const scale = 20 / Math.max(img.width, img.height);
      tiny.width = Math.max(1, Math.round(img.width * scale));
      tiny.height = Math.max(1, Math.round(img.height * scale));
      tiny.getContext("2d")!.drawImage(img, 0, 0, tiny.width, tiny.height);
      URL.revokeObjectURL(img.src);
      resolve(tiny.toDataURL("image/jpeg", 0.4));
    };
    img.onerror = () => reject(new Error("無法讀取圖片"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 錄 4 秒靜音 preview(640px webm)。
 * 原理:canvas.captureStream + MediaRecorder 即時重繪影片畫面。
 */
export async function capturePreview(
  video: HTMLVideoElement,
  from: number,
  seconds = 4,
): Promise<Blob> {
  if (typeof MediaRecorder === "undefined") throw new Error("此瀏覽器不支援 MediaRecorder");
  await seek(video, from);
  const scale = Math.min(1, 640 / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(30);
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 900_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  const wasMuted = video.muted;
  video.muted = true;
  await video.play();

  return new Promise((resolve, reject) => {
    let raf = 0;
    const draw = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      raf = requestAnimationFrame(draw);
    };
    recorder.onstop = () => {
      cancelAnimationFrame(raf);
      video.pause();
      video.muted = wasMuted;
      chunks.length ? resolve(new Blob(chunks, { type: "video/webm" })) : reject(new Error("錄製失敗"));
    };
    recorder.onerror = () => reject(new Error("錄製失敗"));
    draw();
    recorder.start();
    setTimeout(() => recorder.state !== "inactive" && recorder.stop(), seconds * 1000);
  });
}

/** 直傳(帶進度);ticket 由 /api/upload-url 簽發 */
export function directUpload(
  ticket: Extract<UploadTicket, { mode: "direct" }>,
  data: Blob,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", ticket.uploadUrl);
    for (const [k, v] of Object.entries(ticket.headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve(ticket.publicUrl)
        : reject(new Error(`上傳失敗 (${xhr.status})`));
    xhr.onerror = () => reject(new Error("上傳失敗(網路)"));
    xhr.send(data);
  });
}

/** 要一張直傳票券;{ mode:"local" } 表示要走傳統 /api/upload */
export async function requestTicket(
  kind: string,
  filename: string,
  contentType: string,
): Promise<UploadTicket> {
  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, filename, contentType }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "無法取得上傳授權");
  return body as UploadTicket;
}
