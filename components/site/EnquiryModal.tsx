"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Phone, X } from "lucide-react";
import { formatPhone, primaryPhone, telHref, whatsappHref } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";
import { EnquiryForm } from "./EnquiryForm";
import { useSite } from "./SiteShell";

export function EnquiryModal({ open, source, onClose }: { open: boolean; source: string; onClose: () => void }) {
  const { site } = useSite();
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("input:not([tabindex='-1'])")?.focus(), 450);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a, button, input:not([tabindex='-1']), select, textarea");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lastFocus.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
          <motion.button
            type="button"
            aria-label="Close enquiry form"
            className="absolute inset-0 cursor-default bg-charcoal/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            data-lenis-prevent
            className="absolute inset-x-0 bottom-0 max-h-[94dvh] overflow-y-auto rounded-t-[28px] bg-linen md:inset-y-3 md:left-auto md:right-3 md:max-h-none md:w-[min(560px,calc(100vw-24px))] md:rounded-[28px]"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-linen/95 px-6 pb-3 pt-5 backdrop-blur md:px-8">
              <span className="mx-auto h-1 w-10 rounded-full bg-charcoal/15 md:hidden" aria-hidden />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-charcoal/70 transition hover:bg-charcoal/5 hover:text-charcoal"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-8 md:px-8">
              <h2 id="enquiry-title" className="display display-m text-charcoal">Check availability</h2>
              <p className="mt-3 max-w-md text-[0.98rem] text-charcoal/65">
                Tell us your dates and stay type. We&apos;ll confirm a berth and get back to you shortly.
              </p>
              <div className="mt-7">
                <EnquiryForm source={source} onDone={onClose} />
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-charcoal/10 pt-6 text-sm text-charcoal/75">
                <span className="text-charcoal/50">Prefer to talk?</span>
                <a href={telHref(primaryPhone(site))} className="inline-flex items-center gap-2 font-semibold text-charcoal hover:text-maroon" data-track="phone_click" data-track-location="modal">
                  <Phone className="h-4 w-4" /> {formatPhone(primaryPhone(site))}
                </a>
                <a href={whatsappHref(site)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 font-semibold text-charcoal hover:text-maroon" data-track="whatsapp_click" data-track-location="modal">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
