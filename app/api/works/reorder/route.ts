import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
export async function POST(request: Request) { if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 }); const { ids } = await request.json(); if (!Array.isArray(ids)) return Response.json({ error: "Invalid order" }, { status: 400 }); await prisma.$transaction(ids.map((id: string, sortOrder: number) => prisma.work.update({ where: { id }, data: { sortOrder } }))); revalidatePath("/"); revalidatePath("/works"); return Response.json({ ok: true }); }
