import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const isPostgres = /^postgres(ql)?:/.test(process.env.DATABASE_URL ?? "");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (isPostgres) {
  // 雲端模式:內容存在 Postgres + Supabase Storage,建置只同步 schema 與基本設定
  run("node", ["scripts/db.mjs", "generate"]);
  run("node", ["scripts/db.mjs", "push"]);
  run("npx", ["tsx", "prisma/seed.ts"]);
} else {
  // 展示模式(沒設雲端 DB):SQLite 烘進部署 + 從 assets/ 生成內容
  process.env.DATABASE_URL = "file:./dev.db";
  await mkdir("prisma", { recursive: true });
  if (!existsSync("prisma/dev.db")) await writeFile("prisma/dev.db", "");
  run("node", ["scripts/db.mjs", "generate"]);
  run("node", ["scripts/db.mjs", "push"]);
  run("npx", ["tsx", "prisma/seed.ts"]);
  run("npx", ["tsx", "scripts/import-assets.ts"]);
}
run("npx", ["next", "build"]);
