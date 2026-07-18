import { prisma } from "@/lib/prisma";

export const CATEGORIES = [
  "MUSIC_VIDEO",
  "COMMERCIAL",
  "CG_FILM",
  "EXPERIMENT",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  MUSIC_VIDEO: "Music Video",
  COMMERCIAL: "Commercial",
  CG_FILM: "CG Film",
  EXPERIMENT: "Experiment",
};

export const ASPECTS = ["16:9", "9:16", "4:3", "1:1", "4:5"] as const;

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

const workOrder = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

export async function getPublishedWorks(category?: string) {
  return prisma.work.findMany({
    where: {
      published: true,
      ...(category && isCategory(category) ? { category } : {}),
    },
    orderBy: workOrder,
  });
}

export async function getFeaturedWorks(limit = 6) {
  return prisma.work.findMany({
    where: { published: true, featured: true },
    orderBy: workOrder,
    take: limit,
  });
}

export async function getWorkBySlug(slug: string) {
  return prisma.work.findFirst({
    where: { slug, published: true },
    include: { stills: { orderBy: { sortOrder: "asc" } } },
  });
}

/** 上一件 / 下一件(依發布排序循環) */
export async function getAdjacentWorks(slug: string) {
  const all = await getPublishedWorks();
  const index = all.findIndex((w) => w.slug === slug);
  if (index === -1 || all.length < 2) return { prev: null, next: null };
  return {
    prev: all[(index - 1 + all.length) % all.length],
    next: all[(index + 1) % all.length],
  };
}

export async function getSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}
