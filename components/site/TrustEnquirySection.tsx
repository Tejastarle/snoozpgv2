"use client";

import { Mail, Phone } from "lucide-react";
import type { Availability } from "@/lib/types";
import { Icon } from "@/lib/icons";
import { formatPhone, primaryPhone, telHref, whatsappHref } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";
import { Fade, RevealHeading } from "@/components/ui/motion";
import { EnquiryForm } from "./EnquiryForm";
import { useSite } from "./SiteShell";

const TRUST = [
  { icon: "snowflake", label: "AC beds, 3 × 6 ft" },
  { icon: "wifi", label: "Wi-Fi" },
  { icon: "lock", label: "Lockers" },
  { icon: "shower", label: "Geyser / hot water" },
  { icon: "glass", label: "Water filter" },
  { icon: "droplets", label: "24-hour water" },
  { icon: "waves", label: "Sea-view facing" },
  { icon: "clock", label: "24/7 service" },
];

export function TrustEnquirySection({ availability }: { availability: Availability[] }) {
  const { site, content } = useSite();
  const avail = content.show_availability ? availability.filter((a) => a.is_public) : [];
  return (
    <section id="enquire" className="on-light relative bg-linen py-24 text-charcoal md:py-36" aria-labelledby="enquire-title">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <RevealHeading id="enquire-title" lines={[content.trust_title]} className="display display-m max-w-[18ch] text-charcoal" />
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5">
            {TRUST.map((t, i) => (
              <Fade as="li" key={t.label} delay={i * 0.05} y={10} className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-maroon/8 text-maroon">
                    <Icon name={t.icon} className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span className="font-semibold">{t.label}</span>
              </Fade>
            ))}
          </ul>

          {avail.length > 0 && (
            <div className="mt-10 rounded-2xl border border-charcoal/10 bg-white/60 p-5">
              {avail.map((a) => (
                <p key={a.id} className="flex items-center gap-3 text-[0.98rem]">
                  <span className="relative grid h-2.5 w-2.5 place-items-center">
                    <span className="ping-soft absolute inset-0 rounded-full bg-emerald-500" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  </span>
                  <span>
                    <strong>{a.label}:</strong> {a.available > 0 ? `${a.available} available` : "Call to check"}
                    {a.note ? <span className="text-charcoal/60"> — {a.note}</span> : null}
                  </span>
                </p>
              ))}
            </div>
          )}

          <div className="mt-12 space-y-3 border-t border-charcoal/10 pt-8">
            <p className="text-sm text-charcoal/55">Rather talk to someone?</p>
            <a href={telHref(primaryPhone(site))} className="flex items-center gap-3 text-lg font-semibold hover:text-maroon" data-track="phone_click" data-track-location="enquiry-section">
              <Phone className="h-5 w-5 text-maroon" /> {formatPhone(primaryPhone(site))}
            </a>
            <a href={whatsappHref(site)} target="_blank" rel="noopener" className="flex items-center gap-3 text-lg font-semibold hover:text-maroon" data-track="whatsapp_click" data-track-location="enquiry-section">
              <WhatsAppIcon className="h-5 w-5 text-maroon" /> WhatsApp us
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-3 break-all text-lg font-semibold hover:text-maroon" data-track="email_click" data-track-location="enquiry-section">
              <Mail className="h-5 w-5 shrink-0 text-maroon" /> {site.email}
            </a>
          </div>
        </div>

        <Fade delay={0.1} className="lg:col-span-6 lg:col-start-7">
          <div className="rounded-[32px] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(103,35,26,0.35)] ring-1 ring-charcoal/5 sm:p-10">
            <h3 className="text-2xl font-extrabold [font-variation-settings:'wdth'_108]">Check availability</h3>
            <p className="mt-2 text-charcoal/60">Share your dates and we&apos;ll confirm a berth.</p>
            <div className="mt-8">
              <EnquiryForm source="enquiry-section" />
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );
}
