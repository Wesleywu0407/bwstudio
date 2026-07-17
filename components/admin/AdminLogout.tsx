"use client";
import { useRouter } from "next/navigation";
export default function AdminLogout() { const router = useRouter(); return <button className="mono-label text-mut hover:text-fg" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }}>Logout</button>; }
