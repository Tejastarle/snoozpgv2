"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { primaryPhone, telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

export function FaqList({ faqs, tone = "dark" }: { faqs: { question: string; answer: string }[]; tone?: "dark" | "light" }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  const light = tone === "light";
  return (
    <ul className={cn("border-t", light ? "border-charcoal/12" : "border-linen/12")}>
      {faqs.map((f, i) => {
        const isOpen = open === i;
        const id = `${base}-${i}`;
        return (
          <li key={f.question} className={cn("border-b", light ? "border-charcoal/12" : "border-linen/12")}>
            <h3>
              <button
                type="button"
                id={`${id}-q`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a`}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  "flex w-full min-w-0 items-center justify-between gap-6 py-6 text-left text-[1.08rem] font-semibold transition-colors md:text-[1.2rem]",
                  light ? "text-charcoal hover:text-maroon" : "text-linen hover:text-white",
                )}
              >
                {f.question}
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] [&>svg]:transition-transform [&>svg]:duration-500",
                    isOpen ? "[&>svg]:rotate-45" : "",
                    light ? (isOpen ? "border-maroon bg-maroon text-linen" : "border-charcoal/20") : isOpen ? "border-linen bg-linen text-charcoal" : "border-linen/25",
                  )}
                  aria-hidden
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-a`}
                  role="region"
                  aria-labelledby={`${id}-q`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className={cn("max-w-2xl pb-7 pr-12 leading-relaxed", light ? "text-charcoal/70" : "text-linen/70")}>{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export function FaqSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const { site, content, openEnquiry } = useSite();
  return (
    <section id="faq" className="bg-charcoal py-24 md:py-36" aria-labelledby="faq-title">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <RevealHeading id="faq-title" lines={[content.faq_title]} className="display text-[clamp(2.2rem,3.3vw,3.3rem)] text-linen" />
            <p className="mt-6 text-linen/65">Still unsure? Talk to us directly — we&apos;re up 24/7.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => openEnquiry("faq")} className="btn btn-light">{content.cta_primary}</button>
              <a href={telHref(primaryPhone(site))} className="btn btn-ghost" data-track="phone_click" data-track-location="faq">Call</a>
              <a href={whatsappHref(site)} target="_blank" rel="noopener" className="btn btn-ghost" data-track="whatsapp_click" data-track-location="faq">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <FaqList faqs={faqs} />
        </div>
      </div>
    </section>
  );
}
