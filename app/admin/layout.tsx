import Link from "next/link";
import AdminLogout from "@/components/admin/AdminLogout";

// 後台一律動態渲染:每次都讀最新資料,避免清單顯示快取的舊資料
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg text-fg"><header className="flex items-center justify-between border-b border-line px-5 py-4 md:px-8"><Link href="/admin/works" className="mono-label">BWSTUDIO / CONTROL ROOM</Link><nav className="flex items-center gap-6"><Link href="/admin/works" className="mono-label text-mut hover:text-fg">Works</Link><Link href="/admin/settings" className="mono-label text-mut hover:text-fg">Settings</Link><AdminLogout /></nav></header>{children}</div>;
}
