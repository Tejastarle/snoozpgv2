"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import type { HotspotKey } from "@/components/three/CapsuleScene";
import { useRenderTier, useViewport } from "@/hooks/useDevice";
import { cn } from "@/lib/utils";
import { Fade, RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

const CapsuleScene = dynamic(() => import("@/components/three/CapsuleScene"), { ssr: false });

const HOTSPOTS: { key: HotspotKey; label: string; title: string; text: string; pos: { left: string; top: string } }[] = [
  {
    key: "comfort",
    label: "Comfort",
    title: "A proper bed, made up fresh",
    text: "A full-length mattress, crisp white linen, a soft pillow and a warm blanket on every berth.",
    pos: { left: "55%", top: "60%" },
  },
  {
    key: "privacy",
    label: "Privacy",
    title: "Draw the curtain, close the day",
    text: "Each berth has its own tie-back curtain, so you can switch off from the room whenever you like.",
    pos: { left: "85%", top: "40%" },
  },
  {
    key: "ac",
    label: "AC",
    title: "Cool air all night",
    text: "The dorm is fully air-conditioned, with an AC remote kept within reach of the berths.",
    pos: { left: "21%", top: "65%" },
  },
  {
    key: "space",
    label: "Personal space",
    title: "Your light, your socket, your space",
    text: "A personal light and power point at your berth — read, charge and keep your things close.",
    pos: { left: "66%", top: "31%" },
  },
];

const LABELS = Object.fromEntries(HOTSPOTS.map((h) => [h.key, h.label])) as Record<HotspotKey, string>;

export function CapsuleSection() {
  const tier = useRenderTier();
  return tier === "high" ? <Capsule3D /> : <CapsuleFallback />;
}

function Copy() {
  const { content } = useSite();
  return (
    <>
      <RevealHeading lines={[content.capsule_title]} className="display display-l text-linen" />
      <Fade delay={0.15}>
        <p className="lede mt-6 text-linen/70">{content.capsule_text}</p>
      </Fade>
    </>
  );
}

function Detail({ active, onSelect, className }: { active: HotspotKey | null; onSelect: (k: HotspotKey) => void; className?: string }) {
  const { content, openEnquiry } = useSite();
  const current = HOTSPOTS.find((h) => h.key === active) ?? null;
  return (
    <div className={cn("text-linen", className)}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Capsule features">
        {HOTSPOTS.map((h) => (
          <button
            key={h.key}
            role="tab"
            aria-selected={active === h.key}
            type="button"
            onClick={() => onSelect(h.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              active === h.key ? "border-linen bg-linen text-charcoal" : "border-linen/25 text-linen/80 hover:border-linen/60",
            )}
          >
            {h.label}
          </button>
        ))}
      </div>
      <div className="relative mt-6 min-h-[9.5rem]">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.key}
              role="tabpanel"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-2xl font-bold leading-tight [font-variation-settings:'wdth'_108]">{current.title}</h3>
              <p className="mt-3 max-w-md text-linen/70">{current.text}</p>
            </motion.div>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-sm text-linen/60">
              Tap a point on the capsule to see what&apos;s inside your berth.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <button type="button" onClick={() => openEnquiry("capsule")} className="btn btn-light mt-2">
        {content.cta_secondary}
      </button>
    </div>
  );
}

function Capsule3D() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { near, visible } = useViewport(stage, "500px");
  const [active, setActive] = useState<HotspotKey | null>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const copyOpacity = useTransform(scrollYProgress, [0, 0.38, 0.5], [1, 1, 0]);
  const copyX = useTransform(scrollYProgress, [0.3, 0.5], [0, -40]);
  const detailOpacity = useTransform(scrollYProgress, [0.42, 0.58], [0, 1]);
  const detailX = useTransform(scrollYProgress, [0.42, 0.6], [40, 0]);
  const detailEvents = useTransform(scrollYProgress, (v) => (v > 0.45 ? "auto" : "none"));
  const copyEvents = useTransform(scrollYProgress, (v) => (v < 0.5 ? "auto" : "none"));

  return (
    <section ref={wrap} id="capsule" className="relative h-[260vh] bg-[radial-gradient(ellipse_at_50%_35%,#1d4e6b_0%,#0c2230_45%,#16181b_85%)]" aria-label="The SNOOZ capsule">
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {near && (
            <CapsuleScene progress={scrollYProgress} activeKey={active} onSelect={setActive} labels={LABELS} active={visible} />
          )}
        </div>
        <div className="container-x pointer-events-none relative grid h-full grid-cols-12 items-center">
          <motion.div style={{ opacity: copyOpacity, x: copyX, pointerEvents: copyEvents }} className="col-span-5">
            <Copy />
          </motion.div>
          <motion.div style={{ opacity: detailOpacity, x: detailX, pointerEvents: detailEvents }} className="col-span-4 col-start-9">
            <Detail active={active} onSelect={setActive} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Phones, low-power devices and reduced motion: the real berth photo with the same hotspots. */
function CapsuleFallback() {
  const [active, setActive] = useState<HotspotKey | null>("comfort");
  return (
    <section id="capsule" className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#1d4e6b_0%,#0c2230_50%,#16181b_90%)] py-24" aria-label="The SNOOZ capsule">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <Copy />
        </div>
        <div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[999px_999px_36px_36px] ring-1 ring-linen/15">
            <Image src="/media/img/capsule-bed.jpg" alt="A SNOOZ capsule berth with fresh linen, a blanket and an AC remote" fill sizes="(min-width:1024px) 40vw, 90vw" className="kenburns object-cover" />
            <div className="absolute inset-0 bg-charcoal/20" />
            {HOTSPOTS.map((h) => (
              <button
                key={h.key}
                type="button"
                onClick={() => setActive(h.key)}
                aria-pressed={active === h.key}
                aria-label={h.label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={h.pos}
              >
                <span className="relative grid h-9 w-9 place-items-center">
                  <span className="ping-soft absolute inset-0 rounded-full bg-linen/40" />
                  <span className={cn("relative grid h-9 w-9 place-items-center rounded-full border text-sm font-bold", active === h.key ? "border-linen bg-linen text-maroon" : "border-linen/80 bg-charcoal/60 text-linen")}>
                    {active === h.key ? "–" : "+"}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <Detail active={active} onSelect={setActive} className="mt-8" />
        </div>
      </div>
    </section>
  );
}
