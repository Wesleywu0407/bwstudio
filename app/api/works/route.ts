import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { cleanWork } from "@/lib/validation";

export async function GET() { if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 }); return Response.json(await prisma.work.findMany({ include: { stills: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })); }
export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try { const data = cleanWork(await request.json()); const work = await prisma.work.create({ data }); revalidatePath("/"); revalidatePath("/works"); return Response.json(work, { status: 201 }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 }); }
}
