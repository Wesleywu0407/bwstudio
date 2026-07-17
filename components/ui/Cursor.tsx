"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Mode = "default" | "link" | "play";

/**
 * 自訂游標:小白點,hover 可點擊物放大成圓環,影片上顯示 PLAY。
 * 僅在桌面指標裝置啟用;mix-blend-difference 讓它在任何畫面上都可見。
 */
export default function Cursor() {
  const [mode, setMode] = useState<Mode>("default");
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 45, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 700, damping: 45, mass: 0.4 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("site-cursor");

    const onMove = (e: MouseEvent) => {
      setVisible(true);
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as Element | null)?.closest?.(
        "a, button, [data-cursor]",
      ) as HTMLElement | null;
      if (!target) setMode("default");
      else if (target.dataset.cursor === "play") setMode("play");
      else setMode("link");
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("site-cursor");
    };
  }, [x, y]);

  const size = mode === "play" ? 64 : mode === "link" ? 40 : 8;

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none fixed left-0 top-0 z-[70] flex items-center justify-center rounded-full mix-blend-difference ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: size,
        height: size,
        backgroundColor: mode === "default" ? "#ffffff" : "rgba(255,255,255,0)",
        borderWidth: mode === "default" ? 0 : 1,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      <span
        className="border-none font-mono text-[9px] tracking-[0.2em] text-white transition-opacity duration-200"
        style={{ opacity: mode === "play" ? 1 : 0 }}
      >
        PLAY
      </span>
    </motion.div>
  );
}
