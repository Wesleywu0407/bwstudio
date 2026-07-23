import Link from "next/link";
import MonoLabel from "@/components/ui/MonoLabel";

type FooterProps = {
  siteName: string;
  tagline: string;
  location: string;
  email: string;
  instagram?: string | null;
  vimeo?: string | null;
  behance?: string | null;
};

// 片尾字幕式 colophon:用有標籤的 metadata 欄位取代通用「Get in touch / © All rights reserved」
export default function Footer({
  siteName,
  tagline,
  location,
  email,
  instagram,
  vimeo,
  behance,
}: FooterProps) {
  const socials = [
    { label: "Instagram", href: instagram },
    { label: "Vimeo", href: vimeo },
    { label: "Behance", href: behance },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-line px-5 pb-8 pt-16 md:px-10 md:pt-24">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        {/* 左:接案狀態 + email 大字 */}
        <div className="md:col-span-7">
          <MonoLabel>Available for select projects — {year}</MonoLabel>
          {email && (
            <a
              href={`mailto:${email}`}
              className="nav-link mt-5 block w-fit whitespace-nowrap font-display text-[clamp(1.5rem,4.5vw,3.75rem)] font-light tracking-[-0.04em] text-fg"
            >
              {email}
            </a>
          )}
        </div>

        {/* 右:studio / based / elsewhere 三欄 metadata */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:col-span-5 md:grid-cols-3">
          <div>
            <MonoLabel>Studio</MonoLabel>
            <p className="mt-3 text-sm leading-6 text-fg">{siteName}</p>
            <p className="text-sm leading-6 text-mut">{tagline}</p>
          </div>
          <div>
            <MonoLabel>Based in</MonoLabel>
            <p className="mt-3 text-sm leading-6 text-fg">{location}</p>
            <p className="text-sm leading-6 text-mut">GMT+8</p>
          </div>
          {socials.length > 0 && (
            <div>
              <MonoLabel>Elsewhere</MonoLabel>
              <nav className="mt-3 flex flex-col items-start gap-1" aria-label="Social">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="nav-link text-sm leading-6 text-fg"
                  >
                    {s.label} ↗
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* 底線:版權 + 站內導覽 + 人味 colophon 註記 */}
      <div className="mt-16 flex flex-col gap-4 border-t border-line pt-5 md:mt-24 md:flex-row md:items-center md:justify-between">
        <MonoLabel>
          © {year} {siteName}
        </MonoLabel>
        <nav className="flex gap-6" aria-label="Footer">
          <Link href="/works" className="nav-link mono-label text-mut">Works</Link>
          <Link href="/about" className="nav-link mono-label text-mut">About</Link>
          <a href="#top" className="nav-link mono-label text-mut">Back to top ↑</a>
        </nav>
        <MonoLabel>Rendered in the dark · Taipei</MonoLabel>
      </div>
    </footer>
  );
}
