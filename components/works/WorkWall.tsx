"use client";

import { useRouter, useSearchParams } from "next/navigation";
import WorkCard, { type WorkCardData } from "@/components/works/WorkCard";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/categories";

export default function WorkWall({ works }: { works: WorkCardData[] }) {
  const search = useSearchParams();
  const router = useRouter();
  const category = search.get("category") ?? "ALL";
  const filtered = category === "ALL" ? works : works.filter((work) => work.category === category);
  const setFilter = (value: string) => router.replace(value === "ALL" ? "/works" : `/works?category=${value}`, { scroll: false });

  return (
    <>
      <div className="mb-16 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-4 md:mb-24">
        {["ALL", ...CATEGORIES].map((item) => <button key={item} onClick={() => setFilter(item)} className={`mono-label transition-colors ${category === item ? "text-fg" : "text-mut hover:text-fg"}`}>{item === "ALL" ? "All work" : CATEGORY_LABELS[item as Category]}</button>)}
      </div>
      <div className="grid grid-cols-1 items-start gap-y-16 md:grid-cols-12 md:gap-x-6 md:gap-y-24">
        {filtered.map((work, i) => {
          const patterns = ["md:col-span-5", "md:col-span-6 md:col-start-7 md:mt-16", "md:col-span-8 md:col-start-2", "md:col-span-4 md:col-start-9 md:-mt-12"];
          return <WorkCard key={work.id} work={work} index={works.indexOf(work)} className={patterns[i % patterns.length]} />;
        })}
      </div>
      {filtered.length === 0 && <p className="py-32 text-center font-display text-3xl font-light text-mut">No published work in this category.</p>}
    </>
  );
}
