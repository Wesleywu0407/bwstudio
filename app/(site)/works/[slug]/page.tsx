import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MonoLabel from "@/components/ui/MonoLabel";
import { CATEGORY_LABELS, getAdjacentWorks, getPublishedWorks, getWorkBySlug, type Category } from "@/lib/works";

export async function generateStaticParams() { return (await getPublishedWorks()).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const work = await getWorkBySlug(slug); return work ? { title: work.title, description: work.description, openGraph: { images: [work.coverImage] } } : {}; }

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();
  const adjacent = await getAdjacentWorks(slug);
  const fullVideo = work.videoUrl || work.previewClip;
  return (
    <article className="pb-10 pt-24 md:pt-28">
      <header className="page-shell mb-10 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-9"><MonoLabel>{CATEGORY_LABELS[work.category as Category] ?? work.category} / {work.year}</MonoLabel><h1 className="mt-5 font-display text-[12vw] font-light leading-[.78] tracking-[-.07em]">{work.title}</h1></div>
        <MonoLabel className="md:col-span-3 md:text-right">PROJECT — {String(work.sortOrder + 1).padStart(2, "0")}</MonoLabel>
      </header>
      <div className="relative mx-auto w-full bg-black" style={{ aspectRatio: work.aspect.replace(":", "/"), maxHeight: "88svh" }} data-cursor="play">
        {fullVideo ? <video controls playsInline poster={work.coverImage} className="h-full w-full object-contain"><source src={fullVideo} /></video> : <Image src={work.coverImage} alt={work.title} fill priority className="object-contain" />}
      </div>
      <section className="page-shell grid grid-cols-1 gap-12 border-b border-line py-16 md:grid-cols-12 md:py-28">
        <p className="font-display text-3xl font-light leading-tight tracking-[-.035em] md:col-span-6 md:text-5xl">{work.description}</p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:col-span-4 md:col-start-9">
          {[ ["Client", work.client], ["Role", work.role], ["Software", work.software], ["Year", work.year], ["Format", work.aspect] ].map(([label, value]) => value && <div key={String(label)}><dt className="mono-label mb-2 text-mut">{label}</dt><dd className="text-sm text-fg">{value}</dd></div>)}
          {work.externalUrl && <div><dt className="mono-label mb-2 text-mut">Full film</dt><dd><a href={work.externalUrl} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">Watch externally ↗</a></dd></div>}
        </dl>
      </section>
      {work.stills.length > 0 && <section className="page-shell grid gap-6 py-16 md:grid-cols-2 md:py-28">{work.stills.map((still) => <div key={still.id} className="relative aspect-[16/10]"><Image src={still.url} alt={`${work.title} still`} fill className="object-cover" /></div>)}</section>}
      <nav className="page-shell grid grid-cols-2 py-20 md:py-32" aria-label="Adjacent work">
        {adjacent.prev && <Link href={`/works/${adjacent.prev.slug}`}><MonoLabel>← Previous</MonoLabel><span className="mt-3 block font-display text-2xl font-light md:text-5xl">{adjacent.prev.title}</span></Link>}
        {adjacent.next && <Link href={`/works/${adjacent.next.slug}`} className="text-right"><MonoLabel>Next →</MonoLabel><span className="mt-3 block font-display text-2xl font-light md:text-5xl">{adjacent.next.title}</span></Link>}
      </nav>
    </article>
  );
}
