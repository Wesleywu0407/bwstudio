import { spawn } from "child_process";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

function runFfmpeg(args: string[], allowFail = false): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error("ffmpeg binary not found"));
    const proc = spawn(ffmpegPath as unknown as string, args);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0 || allowFail) resolve(stderr);
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-800)}`));
    });
  });
}

export type VideoInfo = { width: number; height: number; aspect: string };

/** 從 ffmpeg -i 的 stderr 解析影片尺寸並歸類長寬比 */
export async function probeVideo(inputPath: string): Promise<VideoInfo> {
  const stderr = await runFfmpeg(["-i", inputPath], true);
  const match = stderr.match(/Video:.* (\d{2,5})x(\d{2,5})/);
  if (!match) throw new Error("無法解析影片尺寸(檔案可能損毀或非影片)");
  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  return { width, height, aspect: classifyAspect(width, height) };
}

export function classifyAspect(width: number, height: number): string {
  const ratio = width / height;
  const options: [string, number][] = [
    ["16:9", 16 / 9],
    ["9:16", 9 / 16],
    ["4:3", 4 / 3],
    ["1:1", 1],
    ["4:5", 4 / 5],
  ];
  options.sort((a, b) => Math.abs(a[1] - ratio) - Math.abs(b[1] - ratio));
  return options[0][0];
}

/** 生成 4 秒靜音低碼率 preview clip(hover 用,目標 < 1MB);start 可指定起始秒數 */
export async function makePreviewClip(
  inputPath: string,
  outputPath: string,
  start = 0,
): Promise<void> {
  await runFfmpeg([
    "-y",
    "-ss", String(start),
    "-t", "4",
    "-i", inputPath,
    "-vf", "scale='min(640,iw)':-2",
    "-an",
    "-c:v", "libx264",
    "-crf", "30",
    "-preset", "veryfast",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    outputPath,
  ]);
}

/** 抽指定秒數的 frame 當封面(預設第 1 秒) */
export async function extractPoster(
  inputPath: string,
  outputPath: string,
  at = 1,
): Promise<void> {
  await runFfmpeg([
    "-y",
    "-ss", String(at),
    "-i", inputPath,
    "-frames:v", "1",
    "-q:v", "3",
    outputPath,
  ]);
}

/** 生成 base64 blur placeholder */
export async function blurDataURL(imageBuffer: Buffer): Promise<string> {
  const buf = await sharp(imageBuffer)
    .resize(20, 20, { fit: "inside" })
    .jpeg({ quality: 40 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

export type ProcessedVideo = {
  aspect: string;
  previewBuffer: Buffer;
  posterBuffer: Buffer;
  posterBlur: string;
};

/**
 * 完整影片管線:probe 長寬比 → preview clip → 封面抽幀 → blur。
 * 全部在暫存目錄處理,結果以 Buffer 回傳交給 StorageAdapter。
 */
export async function processVideo(inputPath: string): Promise<ProcessedVideo> {
  const workDir = await mkdtemp(path.join(tmpdir(), "bobweb-"));
  try {
    const info = await probeVideo(inputPath);
    const previewPath = path.join(workDir, "preview.mp4");
    const posterPath = path.join(workDir, "poster.jpg");
    await makePreviewClip(inputPath, previewPath);
    await extractPoster(inputPath, posterPath);
    const previewBuffer = await readFile(previewPath);
    const posterBuffer = await readFile(posterPath);
    const posterBlur = await blurDataURL(posterBuffer);
    return { aspect: info.aspect, previewBuffer, posterBuffer, posterBlur };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
