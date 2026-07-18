// 匯入 assets/ 的真實影片:壓縮全片 + 4 秒 preview + 封面抽幀 + blur,
// 經 StorageAdapter 寫入(本地 → public/uploads;設了 Supabase env → 雲端 bucket),
// 再寫入 Settings(showreel)與 Work。對同一目的地可重複執行(冪等)。
// 用法:npx tsx scripts/import-assets.ts
//   本地:直接跑
//   上雲(一次性遷移):.env 設好 DATABASE_URL(postgres)+ SUPABASE_* 後跑
import { spawn } from "child_process";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import { PrismaClient } from "@prisma/client";
import { makePreviewClip, extractPoster, blurDataURL } from "../lib/media";
import { getStorage } from "../lib/storage";

const prisma = new PrismaClient();
const ROOT = process.cwd();
const storage = getStorage();

function run(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath as unknown as string, args);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(stderr.slice(-500))),
    );
  });
}

/** 壓縮成網頁可用的 h264(素材無音軌,直接 -an) */
async function compress(input: string, output: string, maxW: number, crf: number) {
  await run([
    "-y", "-i", input,
    "-vf", `scale='min(${maxW},iw)':-2`,
    "-an",
    "-c:v", "libx264", "-crf", String(crf), "-preset", "veryfast",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    output,
  ]);
}

async function processOne(
  input: string,
  keyPrefix: string,
  { posterAt = 1, previewFrom = 0 } = {},
) {
  const workDir = await mkdtemp(path.join(tmpdir(), "bobweb-import-"));
  try {
    const full = path.join(workDir, "full.mp4");
    const preview = path.join(workDir, "preview.mp4");
    const cover = path.join(workDir, "cover.jpg");
    await compress(input, full, 1440, 23);
    await makePreviewClip(input, preview, previewFrom);
    await extractPoster(input, cover, posterAt);
    const coverBuffer = await readFile(cover);
    const [videoUrl, previewClip, coverImage] = await Promise.all([
      storage.save(await readFile(full), `${keyPrefix}/full.mp4`, "video/mp4"),
      storage.save(await readFile(preview), `${keyPrefix}/preview.mp4`, "video/mp4"),
      storage.save(coverBuffer, `${keyPrefix}/cover.jpg`, "image/jpeg"),
    ]);
    const blur = await blurDataURL(coverBuffer);
    return { videoUrl, previewClip, coverImage, blur };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

async function main() {
  // ── showreel:vj_ig_2(7.3s loop)──
  const reelDir = await mkdtemp(path.join(tmpdir(), "bobweb-reel-"));
  let showreelUrl: string, showreelPoster: string;
  try {
    const reel = path.join(reelDir, "showreel.mp4");
    const poster = path.join(reelDir, "poster.jpg");
    await compress(path.join(ROOT, "assets", "vj_ig_2.mp4"), reel, 1280, 26);
    await extractPoster(path.join(ROOT, "assets", "vj_ig_2.mp4"), poster);
    [showreelUrl, showreelPoster] = await Promise.all([
      storage.save(await readFile(reel), "showreel/showreel.mp4", "video/mp4"),
      storage.save(await readFile(poster), "showreel/poster.jpg", "image/jpeg"),
    ]);
  } finally {
    await rm(reelDir, { recursive: true, force: true });
  }
  console.log("✓ showreel processed →", showreelUrl);

  // posterAt / previewFrom:掃過整支片後挑的最有色彩的段落(開頭偏暗)
  const works = [
    { slug: "vj-set-01", title: "VJ SET 01", src: "vj_ig.mp4", posterAt: 30, previewFrom: 22 },
    { slug: "vj-set-02", title: "VJ SET 02", src: "vj_ig_2.mp4", posterAt: 1, previewFrom: 0 },
  ];

  for (const [index, w] of works.entries()) {
    const media = await processOne(path.join(ROOT, "assets", w.src), `works/${w.slug}`, w);
    const record = {
      title: w.title,
      category: "EXPERIMENT",
      year: 2026,
      aspect: "4:3",
      role: "3D / Motion",
      coverImage: media.coverImage,
      coverBlur: media.blur,
      previewClip: media.previewClip,
      videoUrl: media.videoUrl,
      featured: true,
      published: true,
      sortOrder: index,
    };
    await prisma.work.upsert({
      where: { slug: w.slug },
      update: record,
      create: { slug: w.slug, ...record },
    });
    console.log(`✓ work ${w.slug} processed`);
  }

  const settingsData = { siteName: "BWSTUDIO", showreelUrl, showreelPoster };
  await prisma.settings.upsert({
    where: { id: 1 },
    update: settingsData,
    create: { id: 1, ...settingsData, tagline: "3D / CG GENERALIST", location: "TAIPEI, TAIWAN" },
  });
  console.log("✓ settings updated (BWSTUDIO)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
