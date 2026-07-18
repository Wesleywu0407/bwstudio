"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export default function HoverPreview({
  cover,
  preview,
  title,
  eager = false,
}: {
  cover: string;
  preview?: string | null;
  title: string;
  eager?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { amount: 0.55 });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  // 桌面:hover 才顯示+播放;手機(coarse pointer,無 hover):進視窗自動播放
  const [coarse, setCoarse] = useState(false);
  const show = coarse ? inView : active;

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (!preview || reduced) return;
    if (show) video.current?.play().catch(() => {});
    else {
      video.current?.pause();
      if (video.current) video.current.currentTime = 0;
    }
  }, [show, preview, reduced]);

  return (
    <div
      ref={wrap}
      className="relative h-full w-full overflow-hidden bg-panel"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <Image src={cover} alt={title} fill loading={eager ? "eager" : "lazy"} sizes="(max-width: 767px) 100vw, 60vw" className="object-cover transition-opacity duration-300" />
      {preview && !reduced && (
        <video ref={video} src={preview} muted loop playsInline preload="metadata" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} />
      )}
    </div>
  );
}
