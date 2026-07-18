import type { Metadata } from "next";
import {
  Space_Grotesk,
  Inter,
  JetBrains_Mono,
  Noto_Sans_TC,
} from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display-var",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const body = Inter({
  variable: "--font-body-var",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const tc = Noto_Sans_TC({
  variable: "--font-tc-var",
  weight: ["300", "400"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "BWSTUDIO — 3D / CG Generalist",
    template: "%s — BWSTUDIO",
  },
  description:
    "3D and motion work. Music videos, live visuals, cinematic worlds.",
  openGraph: {
    type: "website",
    title: "BWSTUDIO — 3D / CG Generalist",
    description: "3D and motion work. Music videos, live visuals, cinematic worlds.",
    images: ["/uploads/showreel/poster.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} ${mono.variable} ${tc.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
