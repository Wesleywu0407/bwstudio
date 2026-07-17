import { notFound } from "next/navigation";
import WorkEditor from "@/components/admin/WorkEditor";
import { prisma } from "@/lib/prisma";
export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const work = id === "new" ? undefined : await prisma.work.findUnique({ where: { id } }); if (id !== "new" && !work) notFound(); return <main className="p-5 md:p-8"><p className="mono-label text-mut">{work ? `Edit / ${work.title}` : "Create / new project"}</p><h1 className="mb-10 mt-3 font-display text-5xl font-light md:text-7xl">{work ? "EDIT WORK" : "NEW WORK"}</h1><WorkEditor work={work ?? undefined} /></main>; }
