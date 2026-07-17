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
run("npx", ["next", "build"]);
