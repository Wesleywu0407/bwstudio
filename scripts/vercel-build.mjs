import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

process.env.DATABASE_URL ||= "file:./dev.db";

await mkdir("prisma", { recursive: true });
if (!existsSync("prisma/dev.db")) await writeFile("prisma/dev.db", "");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "db", "push", "--skip-generate"]);
run("npx", ["tsx", "prisma/seed.ts"]);
// 從 assets/ 的原始影片生成 showreel、作品影片、封面與資料庫內容,
// 部署內容永遠跟素材同步(ffmpeg 在 Vercel 建置容器可用)
run("npx", ["tsx", "scripts/import-assets.ts"]);
run("npx", ["next", "build"]);
