import Link from "next/link";
import WorksManager from "@/components/admin/WorksManager";
import { prisma } from "@/lib/prisma";
export default async function AdminWorksPage() { const works = await prisma.work.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }); return <main className="p-5 md:p-8"><div className="mb-10 flex items-end justify-between"><div><p className="mono-label text-mut">Archive / {works.length} projects</p><h1 className="mt-3 font-display text-5xl font-light md:text-7xl">WORKS</h1></div><Link href="/admin/works/new" className="bg-fg px-5 py-3 mono-label text-bg">New work +</Link></div><WorksManager initial={works} /></main>; }
