// 一次性匯入 assets/ 的真實影片:
//   壓縮全片 + 生成 4 秒 preview + 封面抽幀 + blur placeholder → public/uploads/
//   然後寫入 Settings(showreel)與 Work(作品)
// 用法:npx tsx scripts/import-assets.ts
import { spawn } from "child_process";
import { mkdir, readFile } from "fs/promises";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import { PrismaClient } from "@prisma/client";
import { makePreviewClip, extractPoster, blurDataURL } from "../lib/media";

const prisma = new PrismaClient();
const ROOT = process.cwd();
const UPLOADS = path.join(ROOT, "public", "uploads");

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

async function processOne(input: string, dir: string) {
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, "full.mp4");
  const preview = path.join(dir, "preview.mp4");
  const cover = path.join(dir, "cover.jpg");
  await compress(input, full, 1440, 23);
  await makePreviewClip(input, preview);
  await extractPoster(input, cover);
  const blur = await blurDataURL(await readFile(cover));
  return blur;
}

async function main() {
  // ── showreel:vj_ig_2(7.3s loop)──
  const reelDir = path.join(UPLOADS, "showreel");
  await mkdir(reelDir, { recursive: true });
  await compress(path.join(ROOT, "assets", "vj_ig_2.mp4"), path.join(reelDir, "showreel.mp4"), 1280, 26);
  await extractPoster(path.join(ROOT, "assets", "vj_ig_2.mp4"), path.join(reelDir, "poster.jpg"));
  console.log("✓ showreel processed");

  // ── works ──
  const works = [
    { slug: "vj-set-01", title: "VJ SET 01", src: "vj_ig.mp4" },
    { slug: "vj-set-02", title: "VJ SET 02", src: "vj_ig_2.mp4" },
  ];

  await prisma.work.deleteMany({});
  for (const [index, w] of works.entries()) {
    const dir = path.join(UPLOADS, "works", w.slug);
    const blur = await processOne(path.join(ROOT, "assets", w.src), dir);
    await prisma.work.create({
      data: {
        slug: w.slug,
        title: w.title,
        category: "EXPERIMENT",
        year: 2026,
        aspect: "4:3",
        role: "3D / Motion",
        coverImage: `/uploads/works/${w.slug}/cover.jpg`,
        coverBlur: blur,
        previewClip: `/uploads/works/${w.slug}/preview.mp4`,
        videoUrl: `/uploads/works/${w.slug}/full.mp4`,
        featured: true,
        published: true,
        sortOrder: index,
      },
    });
    console.log(`✓ work ${w.slug} processed`);
  }

  // ── settings ──
  const settingsData = {
    siteName: "BWSTUDIO",
    showreelUrl: "/uploads/showreel/showreel.mp4",
    showreelPoster: "/uploads/showreel/poster.jpg",
  };
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
