import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@/components/site/Analytics";
import { getSiteContent } from "@/lib/content";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

// Fonts are self-hosted (no runtime request to Google): Archivo variable (wght 100–900, wdth 62–125)
// for structure, Instrument Serif italic for the "sea voice".
const archivo = localFont({
  src: [{ path: "./fonts/archivo-variable.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  fallback: ["system-ui", "Segoe UI", "Arial"],
});

const instrument = localFont({
  src: [
    { path: "./fonts/instrument-serif-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { seo, site } = await getSiteContent();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.title, template: seo.title_template },
    description: seo.description,
    keywords: seo.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    applicationName: site.brand,
    authors: [{ name: site.business_name }],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: SITE_URL,
      siteName: `${site.brand} — ${site.business_name}`,
      title: seo.title,
      description: seo.description,
      images: [{ url: seo.og_image, width: 1200, height: 630, alt: "SNOOZ sea-view capsule stay, CBD Belapur" }],
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: [seo.og_image] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    formatDetection: { telephone: true, address: true, email: true },
    category: "travel",
  };
}

export const viewport: Viewport = {
  themeColor: "#16181b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${instrument.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
