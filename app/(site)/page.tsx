import { AmenitiesSection } from "@/components/site/AmenitiesSection";
import { CapsuleSection } from "@/components/site/CapsuleSection";
import { FaqSection } from "@/components/site/FaqSection";
import { FinalCTA } from "@/components/site/FinalCTA";
import { GallerySection } from "@/components/site/GallerySection";
import { Hero } from "@/components/site/Hero";
import { LocationSection } from "@/components/site/LocationSection";
import { SeaViewSection } from "@/components/site/SeaViewSection";
import { StaySection } from "@/components/site/StaySection";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { TrustEnquirySection } from "@/components/site/TrustEnquirySection";
import { VideoSection } from "@/components/site/VideoSection";
import { VisitSection } from "@/components/site/VisitSection";
import { WhySection } from "@/components/site/WhySection";
import { TourSection } from "@/components/site/TourSection";
import { ConnectSection } from "@/components/site/ConnectSection";
import { getSiteContent, seoFor, videoFor } from "@/lib/content";
import { faqSchema, JsonLd } from "@/lib/schema";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteContent();
  const o = seoFor(c, "/");
  if (!o) return { alternates: { canonical: "/" } };
  return {
    title: { absolute: o.title },
    description: o.description,
    keywords: o.keywords ?? undefined,
    alternates: { canonical: "/" },
    openGraph: o.og_image ? { images: [o.og_image] } : undefined,
  };
}

export default async function HomePage() {
  const c = await getSiteContent();
  const seaImage = c.gallery.find((g) => g.category === "Sea View")?.image_url;
  return (
    <>
      <JsonLd data={faqSchema(c.faqs)} />
      <Hero video={videoFor(c, "hero")} />
      <LocationSection points={c.locations} />
      <SeaViewSection image={seaImage} />
      <StaySection rooms={c.rooms} />
      <CapsuleSection />
      <AmenitiesSection amenities={c.amenities} />
      <WhySection />
      <GallerySection items={c.gallery} />
      <TourSection videos={c.videos.filter((v) => v.placement === "tour" && v.is_active)} />
      <VideoSection video={videoFor(c, "experience")} />
      <TrustEnquirySection availability={c.availability} />
      <ConnectSection site={c.site} />
      {c.content.show_testimonials && <TestimonialsSection items={c.testimonials} />}
      <FaqSection faqs={c.faqs} />
      <VisitSection />
      <FinalCTA />
    </>
  );
}
