"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Phone } from "lucide-react";
import { primaryPhone, telHref } from "@/lib/contact";
import { useRenderTier, useViewport } from "@/hooks/useDevice";
import { Magnetic, RevealHeading, Fade } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

const OceanScene = dynamic(() => import("@/components/three/OceanScene"), { ssr: false });

export function FinalCTA() {
  const { site, content, openEnquiry } = useSite();
  const ref = useRef<HTMLElement>(null);
  const { near, visible } = useViewport(ref, "300px");
  const tier = useRenderTier();

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#16181b_0%,#0c2230_55%,#0a1a24_100%)] py-32 md:py-48" aria-labelledby="final-title">
      <div className="absolute inset-0 -z-10" aria-hidden>
        {near && tier && tier !== "none" ? (
          <OceanScene active={visible} density={tier === "high" ? 1 : 0.55} />
        ) : (
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[repeating-linear-gradient(180deg,rgba(141,188,214,0.12)_0_1px,transparent_1px_14px)] [mask-image:linear-gradient(to_top,black,transparent)]" />
        )}
      </div>
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-charcoal to-transparent" />

      <div className="container-x text-center">
        <RevealHeading id="final-title" lines={[content.final_title]} className="display display-xl mx-auto max-w-[12ch] text-linen" />
        <Fade delay={0.3}>
          <p className="sea mx-auto mt-8 max-w-2xl text-[clamp(1.6rem,3vw,2.6rem)] text-linen/85">{content.final_subtitle}</p>
        </Fade>
        <Fade delay={0.45} className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Magnetic>
            <button type="button" onClick={() => openEnquiry("final-cta")} className="btn btn-light h-14 px-8 text-base">
              {content.cta_primary}
            </button>
          </Magnetic>
          <a href={telHref(primaryPhone(site))} className="btn btn-ghost h-14 px-8 text-base" data-track="phone_click" data-track-location="final-cta">
            <Phone className="h-4 w-4" /> Call SNOOZ
          </a>
        </Fade>
      </div>
    </section>
  );
}
