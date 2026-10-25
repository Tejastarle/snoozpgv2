"use client";

import { motion } from "framer-motion";
import { pad2 } from "@/lib/utils";
import { RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

const REASONS = [
  { title: "Sea view facing", text: "Bay View Tower is a sea-view facing building — mornings come with the bay outside." },
  { title: "24/7 service", text: "Late trains, early flights, night shifts. Check in when you arrive." },
  { title: "AC beds, 3 × 6 ft", text: "Full-length beds in an air-conditioned dorm, with a remote within reach." },
  { title: "Opposite Belapur station", text: "Sector 11, right opposite CBD Belapur railway station, near the UTI Building." },
  { title: "Lockers, hot water, filtered water", text: "A locker for your bags, a geyser, 24-hour water and a water filter." },
  { title: "Wi-Fi enabled", text: "Video calls, streaming and work — stay connected from your berth." },
];

export function WhySection() {
  const { content, openEnquiry } = useSite();
  return (
    <section id="why" className="relative overflow-hidden bg-maroon py-24 text-linen md:py-36" aria-labelledby="why-title">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <RevealHeading id="why-title" lines={[content.why_title]} className="display text-[clamp(2.4rem,4.4vw,4.8rem)]" />
              <p className="lede mt-6 text-linen/75">Six reasons guests pick SNOOZ over a regular PG or hotel room in Belapur.</p>
              <button type="button" onClick={() => openEnquiry("why")} className="btn btn-light mt-8">
                {content.cta_primary}
              </button>
            </div>
          </div>
          <ol className="lg:col-span-7 lg:col-start-6">
            {REASONS.map((r, i) => (
              <motion.li
                key={r.title}
                className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-4 border-t border-linen/20 py-8 sm:gap-x-5 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-x-8 md:py-10"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-15% 0px" }}
              >
                <motion.span
                  aria-hidden
                  className="display numeral-outline text-[clamp(2.4rem,7vw,6rem)] tabular-nums"
                  variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {pad2(i + 1)}
                </motion.span>
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                >
                  <h3 className="text-[clamp(1.3rem,2.4vw,2.1rem)] font-extrabold leading-tight [overflow-wrap:break-word] [font-variation-settings:'wdth'_110]">{r.title}</h3>
                  <p className="mt-2 max-w-md text-linen/70">{r.text}</p>
                </motion.div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
