"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone } from "lucide-react";
import { telHref, primaryPhone } from "@/lib/contact";
import type { VideoItem } from "@/lib/types";
import { useRenderTier, useViewport } from "@/hooks/useDevice";
import { Magnetic, RevealHeading } from "@/components/ui/motion";
import { scrollToId, useSite } from "./SiteShell";

const HeroParticles = dynamic(() => import("@/components/three/HeroParticles"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ video }: { video: VideoItem }) {
  const { site, content, openEnquiry } = useSite();
  const root = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  const tier = useRenderTier();
  const { visible } = useViewport(root, "0px");
  const [mount3D, setMount3D] = useState(false);

  // Mount the particle field after the first paint so it never competes with the hero for LCP.
  useEffect(() => {
    if (!tier || tier === "none") return;
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const id = ric ? ric(() => setMount3D(true)) : window.setTimeout(() => setMount3D(true), 900);
    return () => {
      if (!ric) clearTimeout(id);
    };
  }, [tier]);

  // Scroll choreography: the video slowly scales, copy drifts up, the capsule window moves faster (parallax).
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => (scroll.current = self.progress),
        },
      });
      tl.to(bgRef.current, { scale: 1.16, yPercent: 8, ease: "none" }, 0)
        .to(copyRef.current, { yPercent: -18, opacity: 0.15, ease: "none" }, 0)
        .to(windowRef.current, { yPercent: -32, ease: "none" }, 0)
        .to(shadeRef.current, { opacity: 0.85, ease: "none" }, 0);
    }, root);
    return () => ctx.revert();
  }, []);

  const sources = (
    <>
      {video.src_webm && <source src={video.src_webm} type="video/webm" />}
      <source src={video.src_mp4} type="video/mp4" />
    </>
  );

  return (
    <section ref={root} id="top" className="relative isolate min-h-[100svh] overflow-hidden bg-charcoal" aria-label="Welcome to SNOOZ">
      {/* Background video — the real SNOOZ dorm */}
      <div ref={bgRef} className="absolute inset-0 -z-20 origin-center will-change-transform">
        <video
          className="h-full w-full object-cover lg:scale-105 lg:blur-[2px]"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={video.poster ?? undefined}
          aria-hidden
          tabIndex={-1}
        >
          {sources}
        </video>
      </div>
      {/* Readability: dark translucent overlay, heavier at the bottom where the copy sits */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(22,24,27,0.55)_0%,rgba(22,24,27,0.35)_35%,rgba(22,24,27,0.82)_78%,#16181b_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,rgba(29,78,107,0.35),transparent_60%)] mix-blend-screen" />
      <div ref={shadeRef} className="absolute inset-0 -z-10 bg-charcoal opacity-0" />

      {/* 3D particles: water, air and light */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {mount3D && tier && tier !== "none" && <HeroParticles count={tier === "high" ? 1500 : 600} scroll={scroll} active={visible} />}
      </div>

      <div className="container-x relative flex min-h-[100svh] flex-col justify-end pb-[max(6.5rem,11svh)] pt-28 md:pb-28">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div ref={copyRef} className="will-change-transform">
            <RevealHeading
              as="h1"
              immediate
              delay={0.25}
              lines={[content.hero_line_1, content.hero_line_2]}
              className="text-linen"
              lineClass={(i) =>
                i === 0
                  ? "display text-[clamp(2.4rem,min(7.4vw,10.5svh),7.5rem)]"
                  : "sea mt-1 text-[clamp(2.6rem,min(8.4vw,12svh),8.5rem)] md:mt-0"
              }
            />
            <motion.p
              className="lede mt-5 text-linen/80 md:mt-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 1.05 }}
            >
              {content.hero_subtext}
            </motion.p>
            <motion.div
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 1.2 }}
            >
              <Magnetic>
                <button type="button" onClick={() => openEnquiry("hero")} className="btn btn-light w-full sm:w-auto">
                  {content.cta_primary}
                </button>
              </Magnetic>
              <div className="grid grid-cols-2 gap-3 sm:flex">
                <button type="button" onClick={() => openEnquiry("hero-book")} className="btn btn-ghost">
                  {content.cta_secondary}
                </button>
                <a href={telHref(primaryPhone(site))} className="btn btn-ghost sm:border-transparent sm:px-3 sm:hover:bg-transparent sm:hover:text-white" data-track="phone_click" data-track-location="hero">
                  <Phone className="h-4 w-4" /> {content.cta_call}
                </a>
              </div>
            </motion.div>
          </div>

          {/* Capsule window: a crisp, pill-shaped look into the real dorm (desktop) */}
          <div ref={windowRef} className="hidden will-change-transform lg:block">
            <motion.figure
              initial={{ clipPath: "inset(100% 0% 0% 0% round 999px)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0% round 999px)" }}
              transition={{ duration: 1.6, ease: EASE, delay: 0.6 }}
              className="relative h-[min(56vh,520px)] w-[min(19vw,290px)] overflow-hidden rounded-full ring-1 ring-linen/25"
            >
              <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={video.poster ?? undefined} aria-hidden tabIndex={-1}>
                {sources}
              </video>
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.45)]" />
            </motion.figure>
            <motion.figcaption
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="mt-4 text-center text-sm text-linen/60"
            >
              Inside SNOOZ, 4th floor
            </motion.figcaption>
          </div>
        </div>
      </div>

      {/* Bottom rail: trust facts + scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute inset-x-0 bottom-0 hidden md:block"
      >
        <div className="container-x flex items-center justify-between border-t border-linen/15 py-5 text-sm text-linen/70">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            <li>24/7 service</li>
            <li>AC dormitory</li>
            <li>Wi-Fi</li>
            <li>Sea-view facing</li>
            <li className="hidden lg:block">CBD Belapur, Navi Mumbai</li>
          </ul>
          <button type="button" onClick={() => scrollToId("location")} className="group flex items-center gap-3 text-linen/80 hover:text-linen">
            Explore SNOOZ
            <span className="relative block h-9 w-px overflow-hidden bg-linen/20" aria-hidden>
              <span className="scroll-cue-line absolute inset-0 bg-linen" />
            </span>
          </button>
        </div>
      </motion.div>
      <button
        type="button"
        onClick={() => scrollToId("location")}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs text-linen/70 md:hidden"
      >
        Explore SNOOZ
        <span className="relative block h-7 w-px overflow-hidden bg-linen/20" aria-hidden>
          <span className="scroll-cue-line absolute inset-0 bg-linen" />
        </span>
      </button>
    </section>
  );
}
