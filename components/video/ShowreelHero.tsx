"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function ShowreelHero({
  name,
  tagline,
  location,
  poster,
  video,
}: {
  name: string;
  tagline: string;
  location: string;
  poster: string;
  video?: string | null;
}) {
  const reduced = useReducedMotion();
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-black" data-cursor="play">
      <Image src={poster} alt="Featured showreel frame" fill priority sizes="100vw" className="object-cover opacity-80" />
      {video && !reduced && <video autoPlay muted loop playsInline poster={poster} className="absolute inset-0 h-full w-full object-cover opacity-80"><source src={video} type="video/mp4" /></video>}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.05),rgba(0,0,0,.05)_45%,rgba(0,0,0,.72))]" />
      <motion.div className="absolute inset-x-0 bottom-0 px-5 pb-5 md:px-10 md:pb-8" initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <div className="mb-5 flex items-end justify-between text-white">
          <span className="mono-label">{tagline}</span><span className="mono-label hidden md:block">{location} — 2026</span>
        </div>
        <h1 className="display-name whitespace-nowrap text-white">{name}</h1>
      </motion.div>
      <span className="mono-label absolute right-5 top-1/2 hidden -translate-y-1/2 rotate-90 text-white md:block">SCROLL TO ENTER →</span>
    </section>
  );
}
