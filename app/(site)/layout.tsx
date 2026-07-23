import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Noise from "@/components/ui/Noise";
import Cursor from "@/components/ui/Cursor";
import { getSettings } from "@/lib/works";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <span id="top" aria-hidden />
      <Header siteName={settings.siteName} />
      <main className="flex-1">{children}</main>
      <Footer
        siteName={settings.siteName}
        tagline={settings.tagline}
        location={settings.location}
        email={settings.email}
        instagram={settings.instagram}
        vimeo={settings.vimeo}
        behance={settings.behance}
      />
      <Noise />
      <Cursor />
    </>
  );
}
