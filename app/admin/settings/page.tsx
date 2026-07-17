import SettingsEditor from "@/components/admin/SettingsEditor";
import { getSettings } from "@/lib/works";
export default async function SettingsPage() { const settings = await getSettings(); return <main className="p-5 md:p-8"><p className="mono-label text-mut">Identity / contact / reel</p><h1 className="mb-10 mt-3 font-display text-5xl font-light md:text-7xl">SETTINGS</h1><SettingsEditor initial={settings} /></main>; }
