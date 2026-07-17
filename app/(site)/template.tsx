"use client";

import { motion, useReducedMotion } from "framer-motion";

// 頁面轉場:fade + 上移 8px,300ms;reduced-motion 時直接切換
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
