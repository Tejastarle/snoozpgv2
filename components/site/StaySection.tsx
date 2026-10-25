"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import type { Room } from "@/lib/types";
import { ClipReveal, Fade, Magnetic, RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

const FEATURES = [
  "AC beds, 3 × 6 ft",
  "Wi-Fi available",
  "Lockers available",
  "Geyser / hot water",
  "Water 24 hours",
  "Water filter",
  "Neat & clean",
  "Sea-view facing",
];

export function StaySection({ rooms }: { rooms: Room[] }) {
  const { content, openEnquiry } = useSite();
  return (
    <section id="stay" className="on-light relative bg-linen py-24 text-charcoal md:py-36" aria-labelledby="stay-title">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <RevealHeading
            id="stay-title"
            lines={content.stay_title.split(". ").map((l, i, a) => (i < a.length - 1 ? `${l}.` : l))}
            className="display display-l text-charcoal lg:col-span-7"
          />
          <Fade delay={0.15} className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="lede text-charcoal/70">{content.stay_text}</p>
            <Magnetic className="mt-7">
              <button type="button" onClick={() => openEnquiry("stay")} className="btn btn-maroon">
                {content.cta_primary}
              </button>
            </Magnetic>
          </Fade>
        </div>

        {/* Room cards: swipeable on mobile, a 3-up grid on desktop */}
        <div className="no-scrollbar -mx-4 mt-16 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {rooms.map((room, i) => (
            <article key={room.id} className="group relative w-[84%] shrink-0 snap-center md:w-auto">
              <ClipReveal delay={i * 0.12} className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-charcoal">
                <Image
                  src={room.image_url}
                  alt={room.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 84vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
                />
                {/* Lighting shifts warm on hover, like a berth light switching on */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,24,27,0)_35%,rgba(22,24,27,0.88)_100%)] transition-opacity duration-700 group-hover:opacity-95" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,206,150,0.35),transparent_60%)] opacity-0 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-linen md:p-7">
                  {room.price_label && <p className="text-sm text-linen/70">{room.price_label}</p>}
                  <h3 className="mt-1 text-[1.65rem] font-extrabold leading-tight [font-variation-settings:'wdth'_110]">{room.title}</h3>
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-focus-within:grid-rows-[1fr] group-hover:grid-rows-[1fr] max-md:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <p className="pt-3 text-[0.95rem] leading-relaxed text-linen/80">{room.description}</p>
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {room.features.slice(0, 4).map((f) => (
                          <li key={f} className="rounded-full border border-linen/25 px-2.5 py-1 text-xs text-linen/85">{f}</li>
                        ))}
                      </ul>
                      <button type="button" onClick={() => openEnquiry(`room-${room.slug}`)} className="btn btn-light btn-sm mt-5">
                        Enquire about this stay
                      </button>
                    </div>
                  </div>
                </div>
              </ClipReveal>
            </article>
          ))}
        </div>

        <Fade className="mt-16 md:mt-20">
          <ul className="grid grid-cols-1 border-t border-charcoal/12 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 border-b border-charcoal/12 py-4 pr-4 text-[0.98rem] font-medium text-charcoal/85">
                <Check className="h-4 w-4 shrink-0 text-maroon" strokeWidth={2.2} aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </Fade>
      </div>
    </section>
  );
}
