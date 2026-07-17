import { ASPECTS, CATEGORIES } from "@/lib/works";

export function cleanWork(input: Record<string, unknown>) {
  const title = String(input.title ?? "").trim();
  const slug = String(input.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  const category = String(input.category ?? "EXPERIMENT");
  const aspect = String(input.aspect ?? "16:9");
  const year = Number(input.year ?? new Date().getFullYear());
  if (!title || !slug) throw new Error("Title and slug are required");
  if (!(CATEGORIES as readonly string[]).includes(category)) throw new Error("Invalid category");
  if (!(ASPECTS as readonly string[]).includes(aspect)) throw new Error("Invalid aspect ratio");
  if (!Number.isInteger(year) || year < 1980 || year > 2100) throw new Error("Invalid year");
  const nullable = (value: unknown) => String(value ?? "").trim() || null;
  return {
    title, slug, category, aspect, year,
    description: String(input.description ?? "").trim(),
    client: nullable(input.client), role: nullable(input.role),
    software: String(input.software ?? "").trim(),
    coverImage: String(input.coverImage ?? "").trim(),
    coverBlur: nullable(input.coverBlur), previewClip: nullable(input.previewClip),
    videoUrl: nullable(input.videoUrl), externalUrl: nullable(input.externalUrl),
    featured: Boolean(input.featured), published: Boolean(input.published),
    sortOrder: Number(input.sortOrder ?? 0),
  };
}
