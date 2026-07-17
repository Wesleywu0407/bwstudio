import type { MetadataRoute } from "next";
import { getPublishedWorks } from "@/lib/works";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"; const works = await getPublishedWorks(); return ["", "/works", "/about"].map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : .8 })).concat(works.map((work) => ({ url: `${base}/works/${work.slug}`, lastModified: work.updatedAt, changeFrequency: "monthly" as const, priority: .7 }))); }
