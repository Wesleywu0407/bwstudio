import Link from "next/link";
import StatementHero from "@/components/site/StatementHero";
import WorkCard from "@/components/works/WorkCard";
import MonoLabel from "@/components/ui/MonoLabel";
import { getFeaturedWorks, getSettings } from "@/lib/works";

export default async function HomePage() {
  const [works, settings] = await Promise.all([getFeaturedWorks(), getSettings()]);
  const reel = settings.showreelUrl;
  const poster = settings.showreelPoster || works[0]?.coverImage || "";

  return (
    <>
      <StatementHero
        name={settings.siteName}
        tagline={settings.tagline}
        location={settings.location}
        domains="Music · Culture · Brands"
        hasReel={Boolean(reel)}
      />

      {/* Showreel:文字之後才出現的影片(靜音循環,滑動可見)*/}
      {reel && (
        <section id="showreel" className="scroll-mt-24 px-5 md:px-10">
          <div className="mb-4 flex items-end justify-between border-t border-line pt-4">
            <MonoLabel>01 — Showreel</MonoLabel>
            <MonoLabel>{settings.siteName} · 2026</MonoLabel>
          </div>
          {/* object-contain:完整顯示整個 showreel,不裁切(任何比例都適用),黑邊= 放映廳感 */}
          <div className="relative h-[58vh] w-full overflow-hidden bg-black md:h-[78vh]" data-cursor="play">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              {...(poster ? { poster } : {})}
              className="h-full w-full object-contain"
            >
              <source src={reel} type="video/mp4" />
            </video>
          </div>
        </section>
      )}

      <section className="page-shell py-24 md:py-40">
        <div className="mb-20 grid grid-cols-1 gap-8 border-t border-line pt-4 md:mb-32 md:grid-cols-12">
          <MonoLabel className="md:col-span-3">02 — Selected work / 2024—26</MonoLabel>
          <p className="font-display text-3xl font-light leading-tight tracking-[-0.045em] md:col-span-7 md:col-start-6 md:text-5xl">
            Synthetic worlds, moving images, and visual systems shaped for music and culture.
          </p>
        </div>
        <div className="grid grid-cols-1 items-start gap-y-20 md:grid-cols-12 md:gap-x-6 md:gap-y-32">
          {works.map((work, i) => (
            <WorkCard
              key={work.id}
              work={work}
              index={i}
              className={
                i % 4 === 0
                  ? "md:col-span-7"
                  : i % 4 === 1
                    ? "md:col-span-4 md:col-start-9 md:mt-36"
                    : i % 4 === 2
                      ? "md:col-span-5 md:col-start-2"
                      : "md:col-span-6 md:col-start-7 md:mt-24"
              }
            />
          ))}
        </div>
        <div className="mt-28 border-t border-line pt-6 text-right md:mt-44">
          <Link href="/works" className="font-display text-4xl font-light tracking-tight md:text-7xl">
            VIEW ALL WORK →
          </Link>
        </div>
      </section>
    </>
  );
}
