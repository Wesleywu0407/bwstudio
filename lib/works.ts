import { prisma } from "@/lib/prisma";
import { isCategory } from "@/lib/categories";

// server 端資料存取;常數已移到 lib/categories(client-safe),此處 re-export 維持相容
export {
  CATEGORIES,
  CATEGORY_LABELS,
  ASPECTS,
  isCategory,
  type Category,
} from "@/lib/categories";

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
