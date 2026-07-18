// Seed 只建立 Settings 基本資料;真實作品由後台上傳,
// 或用 npx tsx scripts/import-assets.ts 從 assets/ 匯入
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "BWSTUDIO",
      tagline: "3D / CG GENERALIST",
      location: "TAIPEI, TAIWAN",
      aboutText:
        "I build 3D worlds and moving images for music, culture, and brands. My work moves across modeling, look development, lighting, and motion — always chasing the frame that feels unfamiliar but inevitable.",
      email: "bowang.obj@gmail.com",
      instagram: "https://www.instagram.com/bw726____/",
    },
  });
}

main().finally(() => prisma.$disconnect());
