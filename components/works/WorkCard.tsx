import Link from "next/link";
import HoverPreview from "@/components/video/HoverPreview";
import MonoLabel from "@/components/ui/MonoLabel";
import { CATEGORY_LABELS, type Category } from "@/lib/works";

export type WorkCardData = { id: string; slug: string; title: string; category: string; year: number; aspect: string; coverImage: string; previewClip?: string | null };

const ratio: Record<string, string> = { "16:9": "aspect-[16/9]", "9:16": "aspect-[9/16]", "4:3": "aspect-[4/3]", "1:1": "aspect-square", "4:5": "aspect-[4/5]" };

export default function WorkCard({ work, index, className = "" }: { work: WorkCardData; index: number; className?: string }) {
  return (
    <article className={className}>
      <Link href={`/works/${work.slug}`} data-cursor="play" className="group block">
        <div className={`${ratio[work.aspect] ?? ratio["16:9"]} relative overflow-hidden`}><HoverPreview cover={work.coverImage} preview={work.previewClip} title={work.title} eager={index === 0} /></div>
        <div className="mt-3 flex items-start justify-between gap-5">
          <h2 className="font-display text-xl font-light tracking-[-0.035em] md:text-2xl">{work.title}</h2>
          <MonoLabel className="shrink-0 pt-1">{String(index + 1).padStart(2, "0")} — {CATEGORY_LABELS[work.category as Category] ?? work.category}</MonoLabel>
        </div>
      </Link>
    </article>
  );
}
