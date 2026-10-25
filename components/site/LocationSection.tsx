"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { LocationPoint } from "@/lib/types";
import { directionsHref } from "@/lib/contact";
import { Icon } from "@/lib/icons";
import { cn, pad2 } from "@/lib/utils";
import { useRenderTier, useViewport } from "@/hooks/useDevice";
import { Counter, Fade, RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

const LocationScene = dynamic(() => import("@/components/three/LocationScene"), { ssr: false });

export function LocationSection({ points }: { points: LocationPoint[] }) {
  const { site, content, openEnquiry } = useSite();
  const stage = useRef<HTMLDivElement>(null);
  const { near, visible } = useViewport(stage, "400px");
  const tier = useRenderTier();
  const [activeIndex, setActive] = useState<number | null>(null);
  const use3D = tier === "high";

  return (
    <section id="location" className="relative overflow-hidden bg-charcoal py-24 md:py-36" aria-labelledby="location-title">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5 lg:pt-6">
            <RevealHeading id="location-title" lines={[content.location_title]} className="display text-[clamp(2.2rem,4.1vw,4.1rem)] text-linen" />
            <Fade delay={0.2}>
              <p className="lede mt-7 text-linen/70">{content.location_text}</p>
            </Fade>

            <ul className="mt-10 grid grid-cols-3 gap-3 md:gap-4" onMouseLeave={() => setActive(null)}>
              {points.map((p, i) => (
                <li key={p.id}>
                  <Fade delay={0.1 + i * 0.08}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      className={cn(
                        "group w-full rounded-[20px] border p-4 text-left transition-colors duration-500 md:p-5",
                        activeIndex === i ? "border-linen/60 bg-linen/[0.07]" : "border-linen/12 bg-linen/[0.02] hover:border-linen/30",
                      )}
                      aria-label={`About ${p.minutes} minutes to ${p.label}`}
                    >
                      <Icon name={p.icon} className="h-5 w-5 text-bay" />
                      <span className="mt-6 block leading-none">
                        <Counter to={p.minutes} className="display text-[clamp(2.2rem,4.6vw,3.6rem)] text-linen" />
                        <span className="ml-1 text-sm font-semibold text-linen/60">min</span>
                      </span>
                      <span className="mt-2 block text-[0.92rem] font-medium text-linen/80">{p.label}</span>
                    </button>
                  </Fade>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.82rem] text-linen/45">Approximate travel times by road; they vary with traffic.</p>

            <Fade delay={0.3} className="mt-10 flex flex-wrap gap-3">
              <button type="button" onClick={() => openEnquiry("location")} className="btn btn-light">
                {content.cta_primary}
              </button>
              <a href={directionsHref(site)} target="_blank" rel="noopener" className="btn btn-ghost" data-track="directions_click" data-track-location="location">
                Get directions <ArrowUpRight className="h-4 w-4" />
              </a>
            </Fade>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              ref={stage}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/3.4] w-full overflow-hidden rounded-[28px] border border-linen/10 bg-charcoal-800 lg:aspect-auto lg:h-full lg:min-h-[620px]"
            >
              {use3D && near ? (
                <LocationScene points={points} activeIndex={activeIndex} active={visible} />
              ) : (
                <FlatMap points={points} activeIndex={activeIndex} />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-4 md:p-5">
                {["CBD Belapur", "Sea view", "Business district"].map((t) => (
                  <span key={t} className="rounded-full border border-linen/15 bg-charcoal/70 px-3 py-1.5 text-xs font-medium text-linen/80 backdrop-blur">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Lightweight 2D version for phones, low-power devices and reduced motion. */
function FlatMap({ points, activeIndex }: { points: LocationPoint[]; activeIndex: number | null }) {
  const W = 400, H = 340, cx = 205, cy = 175, s = 150;
  const pos = (p: LocationPoint) => [cx + p.map_x * s * 1.15, cy - p.map_y * s * 0.95] as const;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Map showing SNOOZ and nearby destinations">
      <defs>
        <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0H0V18" fill="none" stroke="#f4efe8" strokeOpacity="0.05" />
        </pattern>
        <linearGradient id="bay" x1="0" x2="1">
          <stop offset="0" stopColor="#0c2230" />
          <stop offset="1" stopColor="#1d4e6b" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="#1d2024" />
      <rect width={W} height={H} fill="url(#grid)" />
      <path d="M0 0 H92 C80 60 110 110 88 170 C70 220 100 280 82 340 H0 Z" fill="url(#bay)" />
      <text x="30" y="200" fill="#8dbcd6" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="17">the bay</text>
      {points.map((p, i) => {
        const [x, y] = pos(p);
        const mx = (cx + x) / 2, my = Math.min(cy, y) - 40;
        const on = activeIndex === i;
        return (
          <g key={p.id}>
            <motion.path
              d={`M${cx} ${cy} Q${mx} ${my} ${x} ${y}`}
              fill="none"
              stroke="#8dbcd6"
              strokeWidth={on ? 2.4 : 1.4}
              strokeDasharray="5 5"
              strokeOpacity={on ? 1 : 0.6}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.3 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <circle cx={x} cy={y} r={on ? 7 : 5} fill={on ? "#f4efe8" : "#8dbcd6"} />
            <text x={x} y={y - 14} textAnchor="middle" fill="#f4efe8" fontSize="12" fontWeight="700">
              {pad2(p.minutes)} min
            </text>
            <text x={x} y={y + 22} textAnchor="middle" fill="#f4efe8" fillOpacity="0.7" fontSize="11">
              {p.label}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="20" fill="#f4efe8" fillOpacity="0.12" className="ping-soft" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <circle cx={cx} cy={cy} r="9" fill="#f4efe8" />
      <text x={cx} y={cy + 30} textAnchor="middle" fill="#f4efe8" fontSize="13" fontWeight="800">SNOOZ</text>
    </svg>
  );
}
