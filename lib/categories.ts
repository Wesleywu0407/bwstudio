// 純常數與純函式:client component 可安全 import(不得引入 prisma / node 模組)

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

/** 把任意像素尺寸歸類到最接近的版面長寬比 */
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
