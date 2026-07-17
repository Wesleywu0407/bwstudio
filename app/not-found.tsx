import Link from "next/link";
import MonoLabel from "@/components/ui/MonoLabel";
export default function NotFound() { return <main className="flex min-h-screen flex-col justify-between p-5 pt-28 md:p-10 md:pt-36"><MonoLabel>Projection error / 404</MonoLabel><div><h1 className="font-display text-[28vw] font-light leading-[.65] tracking-[-.09em]">NO SIGNAL</h1><div className="mt-12 flex justify-between border-t border-line pt-5"><p className="text-sm text-mut">This frame is missing from the timeline.</p><Link href="/" className="mono-label">Return to reel →</Link></div></div></main>; }
