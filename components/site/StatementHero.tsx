import Link from "next/link";

/**
 * 名字為主角的開場:巨大 BWSTUDIO 字標 + 事實標籤(非行銷散文)。
 * 進場動效走純 CSS(.hero-rise + animation-delay),永遠可見、不依賴 JS。
 */
export default function StatementHero({
  name,
  tagline,
  location,
  domains,
  hasReel,
}: {
  name: string;
  tagline: string;
  location: string;
  domains: string;
  hasReel: boolean;
}) {
  const year = new Date().getFullYear();

  return (
    <section className="page-shell flex min-h-[100svh] flex-col justify-between pb-6 pt-32 md:pb-9 md:pt-40">
      {/* 上緣:接案狀態 · 座標 */}
      <div className="hero-rise flex items-start justify-between" style={{ animationDelay: "0.05s" }}>
        <span className="mono-label text-mut">Available for select projects</span>
        <span className="mono-label hidden text-mut md:block">
          {location} — {year}
        </span>
      </div>

      {/* 主角:巨大字標 + 事實標籤 */}
      <div className="hero-rise" style={{ animationDelay: "0.15s" }}>
        <h1 className="font-display text-[clamp(3rem,18vw,15rem)] font-light leading-[0.86] tracking-[-0.06em] text-fg">
          {name}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 md:mt-8">
          <span className="mono-label text-fg">{tagline}</span>
          <span className="mono-label text-mut">{domains}</span>
        </div>
      </div>

      {/* 下緣:版權 · showreel · 精選作品 */}
      <div className="hero-rise flex items-end justify-between" style={{ animationDelay: "0.3s" }}>
        <span className="mono-label text-mut">© {year}</span>
        <div className="flex items-center gap-6">
          {hasReel && (
            <Link href="#showreel" data-cursor="play" className="nav-link mono-label text-fg">
              Showreel ↗
            </Link>
          )}
          <Link href="/works" className="nav-link mono-label text-fg">
            Selected work ↓
          </Link>
        </div>
      </div>
    </section>
  );
}
