import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
export async function PATCH(request: Request) { if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 }); const input = await request.json(); const allowed = ["siteName", "tagline", "location", "showreelUrl", "showreelPoster", "aboutText", "email", "instagram", "vimeo", "behance"]; const data = Object.fromEntries(allowed.filter((key) => key in input).map((key) => [key, input[key] || null])); const settings = await prisma.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } }); revalidatePath("/"); revalidatePath("/about"); return Response.json(settings); }
