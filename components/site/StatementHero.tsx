"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * 宣言式開場:第一屏純文字。工作室名 + 定位大字 + 等寬字標籤。
 * 影片不在此自動播放,降級為下方的 showreel 區(滑動才出現)。
 */
export default function StatementHero({
  name,
  tagline,
  location,
  statement,
  hasReel,
}: {
  name: string;
  tagline: string;
  location: string;
  statement: string;
  hasReel: boolean;
}) {
  const reduced = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.08, delayChildren: 0.05 } },
  };
  const rise: Variants = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="page-shell flex min-h-[100svh] flex-col justify-between pb-6 pt-32 md:pb-9 md:pt-40"
    >
      {/* 上緣:名稱 + 座標 */}
      <motion.div variants={rise} className="flex items-start justify-between">
        <span className="mono-label text-mut">{name}®</span>
        <span className="mono-label hidden text-mut md:block">{location} — 2026</span>
      </motion.div>

      {/* 主角:定位大字 */}
      <motion.h1
        variants={rise}
        className="max-w-[16ch] font-display text-[clamp(2.5rem,7.2vw,7rem)] font-light leading-[0.98] tracking-[-0.045em] text-fg"
      >
        {statement}
      </motion.h1>

      {/* 下緣:職稱 · showreel · 滾動提示 */}
      <motion.div
        variants={rise}
        className="flex flex-wrap items-end justify-between gap-y-4 border-t border-line pt-5"
      >
        <span className="mono-label text-mut">{tagline}</span>
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
      </motion.div>
    </motion.section>
  );
}
