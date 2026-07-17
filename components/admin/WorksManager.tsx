"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WorkCardData } from "@/components/works/WorkCard";

type Item = WorkCardData & { published: boolean; featured: boolean; sortOrder: number };
export default function WorksManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial); const router = useRouter();
  async function patch(item: Item, data: Partial<Item>) { const full = { ...item, ...data }; setItems((all) => all.map((x) => x.id === item.id ? full : x)); await fetch(`/api/works/${item.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(full) }); router.refresh(); }
  async function move(index: number, direction: number) { const target = index + direction; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; setItems(next); await fetch("/api/works/reorder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: next.map((x) => x.id) }) }); router.refresh(); }
  return <div className="divide-y divide-line border-y border-line">{items.map((item, i) => <div key={item.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 py-4 md:grid-cols-[96px_1fr_auto_auto] md:gap-6"><div className="relative aspect-square overflow-hidden bg-panel"><Image src={item.coverImage || "/demo/black-sun.svg"} alt="" fill className="object-cover" /></div><div><Link href={`/admin/works/${item.id}`} className="font-display text-xl font-light md:text-2xl">{item.title}</Link><p className="mono-label mt-2 text-mut">{item.category.replaceAll("_", " ")} / {item.aspect}</p></div><div className="hidden gap-2 md:flex"><button onClick={() => patch(item, { published: !item.published })} className={`border px-3 py-2 mono-label ${item.published ? "border-fg text-fg" : "border-line text-mut"}`}>{item.published ? "Live" : "Draft"}</button><button onClick={() => patch(item, { featured: !item.featured })} className={`border px-3 py-2 mono-label ${item.featured ? "border-fg text-fg" : "border-line text-mut"}`}>Featured</button></div><div className="flex gap-2"><button aria-label="Move up" onClick={() => move(i, -1)} className="border border-line px-3 py-2">↑</button><button aria-label="Move down" onClick={() => move(i, 1)} className="border border-line px-3 py-2">↓</button></div></div>)}</div>;
}
