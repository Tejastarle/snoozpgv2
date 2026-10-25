import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { VisitSection } from "@/components/site/VisitSection";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";
import { getSiteContent, seoFor } from "@/lib/content";
import { formatPhone, fullAddress, phoneList, telHref, whatsappHref } from "@/lib/contact";
import Image from "next/image";
import { ConnectSection } from "@/components/site/ConnectSection";
import { breadcrumbSchema, JsonLd } from "@/lib/schema";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteContent();
  const o = seoFor(c, "/contact");
  const title = o?.title ?? "Contact SNOOZ — Book a Capsule Stay in CBD Belapur";
  const description =
    o?.description ??
    `Call ${formatPhone(c.site.phone_mobile)}, WhatsApp or send an enquiry to book SNOOZ, Bay View Tower, Sector 11, CBD Belapur, Navi Mumbai. Open 24/7.`;
  return { title: { absolute: `${title} | SNOOZ` }, description, alternates: { canonical: "/contact" }, openGraph: { title, description, url: "/contact" } };
}

export default async function ContactPage() {
  const { site } = await getSiteContent();
  const phones = phoneList(site);
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <PageHero compact crumbs={[{ name: "Home", href: "/" }, { name: "Contact" }]} lines={["Let's get you", "a berth by the bay."]} intro="Send your dates and we'll confirm availability. Or call, WhatsApp or drop in — we're open 24/7." />

      <section className="on-light bg-linen py-20 text-charcoal md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-extrabold [font-variation-settings:'wdth'_108]">Reach us directly</h2>
            <ul className="mt-8 space-y-6">
              <li className="flex gap-4">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-maroon" />
                <div>
                  <p className="text-sm text-charcoal/55">Phone</p>
                  {phones.map((p) => (
                    <a key={p.number} href={telHref(p.number)} className="flex flex-wrap items-baseline gap-x-2 text-lg font-semibold hover:text-maroon" data-track="phone_click" data-track-location="contact-page">
                      {formatPhone(p.number)} <span className="text-sm font-normal text-charcoal/50">{p.label}</span>
                    </a>
                  ))}
                  {site.phone_landline && (
                    <a href={telHref(site.phone_landline)} className="flex flex-wrap items-baseline gap-x-2 text-lg font-semibold hover:text-maroon" data-track="phone_click" data-track-location="contact-page">
                      {site.phone_landline} <span className="text-sm font-normal text-charcoal/50">Landline</span>
                    </a>
                  )}
                </div>
              </li>
              <li className="flex gap-4">
                <WhatsAppIcon className="mt-1 h-5 w-5 shrink-0 text-maroon" />
                <div>
                  <p className="text-sm text-charcoal/55">WhatsApp</p>
                  <a href={whatsappHref(site)} target="_blank" rel="noopener" className="text-lg font-semibold hover:text-maroon" data-track="whatsapp_click" data-track-location="contact-page">Chat on {formatPhone(site.whatsapp)}</a>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-maroon" />
                <div>
                  <p className="text-sm text-charcoal/55">Email</p>
                  <a href={`mailto:${site.email}`} className="break-all text-lg font-semibold hover:text-maroon" data-track="email_click" data-track-location="contact-page">{site.email}</a>
                </div>
              </li>
              <li className="flex gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-maroon" />
                <div>
                  <p className="text-sm text-charcoal/55">Address</p>
                  <p className="text-lg font-semibold leading-snug">{fullAddress(site)}</p>
                  {site.landmarks && <p className="mt-1 text-[0.95rem] text-charcoal/65">{site.landmarks}</p>}
                  <p className="mt-1 text-sm text-charcoal/55">{site.hours_label}</p>
                </div>
              </li>
            </ul>
            {site.contact_person && (
              <div className="mt-10 flex items-center gap-5 rounded-[24px] bg-white p-4 ring-1 ring-charcoal/5">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-charcoal/5">
                  <Image src="/media/img/host-gian-chand-sippy.jpg" alt={site.contact_person} fill sizes="80px" className="object-cover object-top" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-charcoal/55">Your host</p>
                  <p className="text-lg font-bold">{site.contact_person}</p>
                  {site.contact_person_phone && (
                    <a href={telHref(site.contact_person_phone)} className="font-semibold text-maroon" data-track="phone_click" data-track-location="contact-host">
                      {formatPhone(site.contact_person_phone)}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-[32px] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(103,35,26,0.35)] ring-1 ring-charcoal/5 sm:p-10">
              <h2 className="text-2xl font-extrabold [font-variation-settings:'wdth'_108]">Send an enquiry</h2>
              <p className="mt-2 text-charcoal/60">We usually reply the same day.</p>
              <div className="mt-8">
                <EnquiryForm source="contact-page" after="redirect" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <ConnectSection site={site} />
      <div className="pt-24 md:pt-36 bg-charcoal">
        <VisitSection />
      </div>
    </>
  );
}
