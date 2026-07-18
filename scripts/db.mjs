// Prisma 指令包裝:依 DATABASE_URL 自動選 provider。
//   postgres://…  → 直接用 prisma/schema.prisma(正典,Postgres)
//   file:…(或未設)→ 衍生 prisma/schema.sqlite.prisma 後以 --schema 執行
// 用法:node scripts/db.mjs generate | push
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

function envDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (existsSync(".env")) {
    const match = readFileSync(".env", "utf8").match(/^DATABASE_URL="?([^"\n]+)"?/m);
    if (match) return match[1];
  }
  return "file:./dev.db";
}

const url = envDatabaseUrl();
const isPostgres = /^postgres(ql)?:/.test(url);
const schemaArgs = [];

if (!isPostgres) {
  const canonical = readFileSync("prisma/schema.prisma", "utf8");
  const sqlite = canonical.replace('provider = "postgresql"', 'provider = "sqlite"');
  writeFileSync("prisma/schema.sqlite.prisma", sqlite);
  schemaArgs.push("--schema", "prisma/schema.sqlite.prisma");
}

const command = process.argv[2];
const commands = {
  generate: ["prisma", "generate", ...schemaArgs],
  push: ["prisma", "db", "push", "--skip-generate", ...schemaArgs],
};
if (!commands[command]) {
  console.error("用法:node scripts/db.mjs generate|push");
  process.exit(1);
}
console.log(`[db] provider: ${isPostgres ? "postgresql" : "sqlite"}`);
const result = spawnSync("npx", commands[command], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
