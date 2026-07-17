import type { ReactNode } from "react";

// 等寬字標籤:全大寫、寬字距,如 `01 — MUSIC VIDEO`
export default function MonoLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`mono-label text-mut ${className}`}>{children}</span>;
}
