"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, MapPin, Navigation } from "lucide-react";
import { directionsHref, formatPhone, mapEmbedSrc, primaryPhone, telHref } from "@/lib/contact";
import { useViewport } from "@/hooks/useDevice";
import { Fade, RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

/** Google Map (keyless embed, loaded on approach) + address card with Get directions. */
export function VisitSection({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const { site } = useSite();
  const box = useRef<HTMLDivElement>(null);
  const { near } = useViewport(box, "600px");
  const [loaded, setLoaded] = useState(false);
  return (
    <section id="contact" className="bg-charcoal pb-24 md:pb-36" aria-labelledby="visit-title">
      <div className="container-x">
        <div className="grid overflow-hidden rounded-[32px] border border-linen/10 bg-charcoal-800 lg:grid-cols-12">
          <div className="p-7 sm:p-10 lg:col-span-5 lg:p-14">
            <RevealHeading as={headingLevel} id="visit-title" lines={["Find SNOOZ"]} className="display display-m text-linen" />
            <address className="mt-8 not-italic">
              <p className="text-xl font-semibold leading-snug text-linen">{site.brand}, Bay View Tower</p>
              <p className="mt-3 leading-relaxed text-linen/65">
                {site.address_line_1}
                <br />
                {site.address_line_2}
                <br />
                {site.locality}, {site.city} – {site.postal_code}
              </p>
              {site.landmarks && <p className="mt-3 text-sm leading-relaxed text-linen/50">{site.landmarks}</p>}
            </address>
            <Fade className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href={directionsHref(site)} target="_blank" rel="noopener" className="btn btn-light" data-track="directions_click" data-track-location="visit">
                <Navigation className="h-4 w-4" /> Get directions
              </a>
              <a href={telHref(primaryPhone(site))} className="btn btn-ghost" data-track="phone_click" data-track-location="visit">
                Call {formatPhone(primaryPhone(site))}
              </a>
            </Fade>
            <a href={site.maps_url} target="_blank" rel="noopener" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-bay hover:text-linen">
              View on Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div ref={box} className="relative min-h-[380px] lg:col-span-7">
            {near && (
              <iframe
                title="SNOOZ location on Google Maps"
                src={mapEmbedSrc(site)}
                className="absolute inset-0 h-full w-full border-0 opacity-0 transition-opacity duration-700 [filter:grayscale(0.35)_contrast(1.05)]"
                style={loaded ? { opacity: 1 } : undefined}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setLoaded(true)}
                allowFullScreen
              />
            )}
            {!loaded && (
              <div className="absolute inset-0 grid place-items-center text-linen/50">
                <MapPin className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
