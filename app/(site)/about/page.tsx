import type { Metadata } from "next";
import MonoLabel from "@/components/ui/MonoLabel";
import { getSettings } from "@/lib/works";

export const metadata: Metadata = { title: "About" };
export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div className="page-shell min-h-screen pb-28 pt-36 md:pt-48">
      <MonoLabel>Profile / Taipei</MonoLabel>
      <h1 className="mt-8 font-display text-[16vw] font-light leading-[.72] tracking-[-.08em]">ABOUT</h1>
      <div className="mt-24 grid grid-cols-1 gap-16 border-t border-line pt-5 md:mt-36 md:grid-cols-12">
        <MonoLabel className="md:col-span-3">{settings.tagline}</MonoLabel>
        <div className="md:col-span-7 md:col-start-6"><p className="font-display text-3xl font-light leading-tight tracking-[-.04em] md:text-5xl">{settings.aboutText}</p><p className="mt-12 max-w-xl text-sm leading-7 text-mut">Available for music videos, title design, visual development, commercials, and selected collaborations worldwide.</p></div>
      </div>
      <div id="contact" className="mt-28 grid border-t border-line pt-5 md:mt-44 md:grid-cols-12"><MonoLabel className="md:col-span-3">Contact</MonoLabel><a href={`mailto:${settings.email}`} className="nav-link mt-8 w-fit whitespace-nowrap font-display text-[clamp(1.4rem,3.8vw,3.75rem)] font-light tracking-[-.04em] md:col-span-9 md:mt-0">{settings.email}</a></div>
    </div>
  );
}
