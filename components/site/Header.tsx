"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const NAV = [
  { href: "/works", label: "WORKS" },
  { href: "/about", label: "ABOUT" },
  { href: "/about#contact", label: "CONTACT" },
];

export default function Header({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  const isActive = (href: string) =>
    href !== "/about#contact" &&
    (pathname === href || pathname.startsWith(href + "/"));

  return (
    <header className="fixed inset-x-0 top-0 z-40 mix-blend-difference">
      <div className="flex items-center justify-between px-5 py-5 md:px-10">
        <Link
          href="/"
          className="mono-label !text-white"
          aria-label={`${siteName} — home`}
        >
          {siteName}
        </Link>

        {/* 桌面導航 */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="nav-link mono-label !text-white"
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 手機選單按鈕 */}
        <button
          type="button"
          className="mono-label !text-white md:hidden"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-label="Open menu"
        >
          MENU
        </button>
      </div>

      {/* 手機全屏選單 */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-bg px-5 py-5 mix-blend-normal"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <span className="mono-label text-fg">{siteName}</span>
              <button
                type="button"
                className="mono-label text-fg"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                CLOSE
              </button>
            </div>
            <nav
              className="flex flex-1 flex-col items-start justify-center gap-8"
              aria-label="Mobile"
            >
              {NAV.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={reduced ? undefined : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-display text-5xl font-light tracking-tight text-fg"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
