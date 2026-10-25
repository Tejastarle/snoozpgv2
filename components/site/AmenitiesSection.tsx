"use client";

import type { Amenity } from "@/lib/types";
import { Icon } from "@/lib/icons";
import { Fade, RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

export function AmenitiesSection({ amenities }: { amenities: Amenity[] }) {
  const { content, openEnquiry } = useSite();
  return (
    <section id="amenities" className="on-light bg-linen py-24 text-charcoal md:py-36" aria-labelledby="amenities-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <RevealHeading id="amenities-title" lines={[content.amenities_title]} className="display display-l max-w-[14ch] text-charcoal" />
          <Fade>
            <button type="button" onClick={() => openEnquiry("amenities")} className="btn btn-ghost-dark">
              {content.cta_primary}
            </button>
          </Fade>
        </div>

        <ul className="mt-12 grid grid-cols-2 border-l border-t border-charcoal/12 lg:grid-cols-4 md:mt-20">
          {amenities.map((a, i) => (
            <li key={a.id} className="group relative border-b border-r border-charcoal/12">
              <Fade delay={(i % 4) * 0.06} y={10} className="flex h-full flex-col p-4 sm:p-7 md:p-8 lg:min-h-[260px]">
                <span className="icon-draw grid h-11 w-11 place-items-center sm:h-14 sm:w-14 rounded-full border border-charcoal/15 text-maroon transition-colors duration-500 group-hover:border-maroon group-hover:bg-maroon group-hover:text-linen">
                  <Icon name={a.icon} className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.3} />
                </span>
                <h3 className="mt-6 text-[1.02rem] font-bold leading-snug sm:mt-10 sm:text-[1.2rem] lg:mt-auto">{a.title}</h3>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-charcoal/60 sm:mt-2 sm:text-[0.95rem]">{a.description}</p>
              </Fade>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
