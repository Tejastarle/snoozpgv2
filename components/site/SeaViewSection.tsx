"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./SiteShell";

const REFLECTIONS = [
  { l: "12%", t: "62%", s: 90, t1: "11s", d: "0s", dx: "60px", dy: "-140px" },
  { l: "28%", t: "78%", s: 50, t1: "9s", d: "2s", dx: "-40px", dy: "-120px" },
  { l: "55%", t: "70%", s: 120, t1: "13s", d: "1s", dx: "30px", dy: "-180px" },
  { l: "72%", t: "84%", s: 64, t1: "10s", d: "3.5s", dx: "-60px", dy: "-130px" },
  { l: "86%", t: "66%", s: 40, t1: "8s", d: "5s", dx: "20px", dy: "-100px" },
  { l: "40%", t: "88%", s: 70, t1: "12s", d: "6s", dx: "50px", dy: "-150px" },
];

export function SeaViewSection({ image = "/media/img/capsule-sea-window.jpg" }: { image?: string }) {
  const { content, openEnquiry } = useSite();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
      // Each layer moves at its own depth: ocean slowest, headline mid, copy fastest.
      gsap.fromTo("[data-depth='bg']", { yPercent: -12, scale: 1.12 }, { yPercent: 12, scale: 1.02, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-depth='title']", { yPercent: 40 }, { yPercent: -30, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-depth='copy']", { yPercent: 90 }, { yPercent: -60, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-depth='glow']", { yPercent: 20, opacity: 0.4 }, { yPercent: -20, opacity: 1, ease: "none", scrollTrigger: st });
    }, root);
    return () => ctx.revert();
  }, []);

  const words = content.sea_title.split(" ");
  const first = words.slice(0, 2).join(" ");
  const rest = words.slice(2);

  return (
    <section ref={root} id="sea-view" className="relative isolate flex min-h-[115svh] items-center overflow-hidden bg-ocean-deep py-32" aria-labelledby="sea-title">
      <div data-depth="bg" className="absolute inset-0 -z-20 will-change-transform">
        <Image src={image} alt="" fill sizes="100vw" className="object-cover" quality={70} />
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#16181b_0%,rgba(12,34,48,0.35)_22%,rgba(12,34,48,0.25)_60%,#16181b_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_60%,rgba(12,34,48,0.75),transparent_65%)]" />
      <div data-depth="glow" className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {REFLECTIONS.map((r, i) => (
          <span
            key={i}
            className="reflection"
            style={{ left: r.l, top: r.t, width: r.s, height: r.s, ["--t" as string]: r.t1, ["--d" as string]: r.d, ["--dx" as string]: r.dx, ["--dy" as string]: r.dy }}
          />
        ))}
      </div>

      <div className="container-x">
        <h2 id="sea-title" data-depth="title" className="sea text-[clamp(4rem,14vw,15rem)] text-linen will-change-transform">
          <span className="block">{first}</span>
          <span className="block pl-[8vw]">{rest.join(" ")}</span>
        </h2>
        <div data-depth="copy" className="mt-12 grid gap-8 will-change-transform md:mt-16 md:grid-cols-12">
          <p className="lede text-linen/85 md:col-span-5 md:col-start-7">{content.sea_text}</p>
          <div className="md:col-span-5 md:col-start-7">
            <dl className="grid grid-cols-3 gap-4 border-t border-linen/20 pt-6 text-linen">
              <div>
                <dt className="text-xs text-linen/55">Floor</dt>
                <dd className="mt-1 text-xl font-bold">4th</dd>
              </div>
              <div>
                <dt className="text-xs text-linen/55">Facing</dt>
                <dd className="mt-1 text-xl font-bold">Sea view</dd>
              </div>
              <div>
                <dt className="text-xs text-linen/55">Open</dt>
                <dd className="mt-1 text-xl font-bold">24/7</dd>
              </div>
            </dl>
            <button type="button" onClick={() => openEnquiry("sea-view")} className="btn btn-light mt-8">
              {content.cta_primary}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
