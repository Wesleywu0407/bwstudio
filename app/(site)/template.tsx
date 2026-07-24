// 頁面轉場:fade + 上移 8px。純 CSS(template 每次路由切換重掛即重播),
// reduced-motion 由 globals 的 @media 規則自動停用。不用 JS 動畫,避免掛住整頁。
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
