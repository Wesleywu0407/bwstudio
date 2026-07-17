import type { Metadata } from "next";
import { Suspense } from "react";
import WorkWall from "@/components/works/WorkWall";
import MonoLabel from "@/components/ui/MonoLabel";
import { getPublishedWorks } from "@/lib/works";

export const metadata: Metadata = { title: "Works", description: "Selected CG direction, motion design, and moving-image work." };

export default async function WorksPage() {
  const works = await getPublishedWorks();
  return (
    <div className="page-shell pb-32 pt-32 md:pt-44">
      <header className="mb-16 md:mb-24"><MonoLabel>Index / {String(works.length).padStart(2, "0")} projects</MonoLabel><h1 className="mt-6 font-display text-[17vw] font-light leading-[.75] tracking-[-.075em]">WORKS</h1></header>
      <Suspense><WorkWall works={works} /></Suspense>
    </div>
  );
}
