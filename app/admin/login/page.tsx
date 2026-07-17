"use client";
import { useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter(); const search = useSearchParams();
  return <main className="flex min-h-[calc(100vh-58px)] items-center justify-center p-5"><form className="w-full max-w-md border border-line bg-panel p-6 md:p-10" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); const res = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) }); setBusy(false); if (!res.ok) { setError(res.status === 429 ? "Too many attempts. Try again later." : "Incorrect password."); return; } router.replace(search.get("next") || "/admin/works"); router.refresh(); }}><p className="mono-label text-mut">Restricted access</p><h1 className="my-8 font-display text-5xl font-light tracking-tight">CONTROL ROOM</h1><label className="mono-label mb-2 block text-mut" htmlFor="password">Password</label><input id="password" type="password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} className="admin-input" />{error && <p className="mt-3 text-sm text-red-300">{error}</p>}<button disabled={busy} className="mt-6 w-full bg-fg px-4 py-3 mono-label text-bg disabled:opacity-50">{busy ? "Checking…" : "Enter →"}</button></form></main>;
}

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-screen bg-bg" />}><LoginForm /></Suspense>;
}
