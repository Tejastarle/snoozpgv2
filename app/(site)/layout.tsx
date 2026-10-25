import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { SiteShell } from "@/components/site/SiteShell";
import { getSiteContent } from "@/lib/content";
import { JsonLd, lodgingSchema } from "@/lib/schema";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const c = await getSiteContent();
  return (
    <SiteShell site={c.site} content={c.content}>
      <a href="#main" className="skip-link">Skip to content</a>
      <JsonLd data={lodgingSchema(c.site, c.amenities, c.seo.og_image)} />
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </SiteShell>
  );
}
