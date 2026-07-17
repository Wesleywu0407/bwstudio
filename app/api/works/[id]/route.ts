import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { cleanWork } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try { const { id } = await context.params; const data = cleanWork(await request.json()); const work = await prisma.work.update({ where: { id }, data }); revalidatePath("/"); revalidatePath("/works"); revalidatePath(`/works/${work.slug}`); return Response.json(work); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 }); }
}
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) { if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 }); const { id } = await context.params; await prisma.work.delete({ where: { id } }); revalidatePath("/"); revalidatePath("/works"); return Response.json({ ok: true }); }
