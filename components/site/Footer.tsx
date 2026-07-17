import MonoLabel from "@/components/ui/MonoLabel";

type FooterProps = {
  siteName: string;
  email: string;
  instagram?: string | null;
  vimeo?: string | null;
  behance?: string | null;
};

export default function Footer({
  siteName,
  email,
  instagram,
  vimeo,
  behance,
}: FooterProps) {
  const socials = [
    { label: "INSTAGRAM", href: instagram },
    { label: "VIMEO", href: vimeo },
    { label: "BEHANCE", href: behance },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  return (
    <footer id="contact" className="border-t border-line px-5 py-14 md:px-10">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <MonoLabel>Get in touch</MonoLabel>
          {email && (
            <a
              href={`mailto:${email}`}
              className="nav-link mt-3 block w-fit font-display text-2xl font-light tracking-tight text-fg md:text-4xl"
            >
              {email}
            </a>
          )}
        </div>
        <div className="flex flex-col items-start gap-6 md:items-end">
          {socials.length > 0 && (
            <nav className="flex gap-6" aria-label="Social">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-link mono-label text-fg"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          )}
          <MonoLabel>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </MonoLabel>
        </div>
      </div>
    </footer>
  );
}
