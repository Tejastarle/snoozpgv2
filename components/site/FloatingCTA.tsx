"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Phone } from "lucide-react";
import { primaryPhone, telHref, whatsappHref } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";
import { useSite } from "./SiteShell";

/** Mobile: a glass action bar (Call / WhatsApp / Enquire). Desktop: one quiet enquiry pill + WhatsApp. */
export function FloatingCTA() {
  const { site, openEnquiry } = useSite();
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.75);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [pathname]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Mobile bar */}
          <motion.nav
            aria-label="Quick contact"
            className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-[60] md:hidden"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="glass grid grid-cols-[1fr_1fr_1.4fr] gap-1.5 rounded-full p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.6)]">
              <a href={telHref(primaryPhone(site))} className="flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold text-linen active:bg-linen/10" data-track="phone_click" data-track-location="mobile-bar">
                <Phone className="h-4 w-4" /> Call
              </a>
              <a href={whatsappHref(site)} target="_blank" rel="noopener" className="flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold text-linen active:bg-linen/10" data-track="whatsapp_click" data-track-location="mobile-bar">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
              <button type="button" onClick={() => openEnquiry("mobile-bar")} className="flex h-12 items-center justify-center gap-2 rounded-full bg-linen text-sm font-semibold text-maroon">
                <CalendarCheck className="h-4 w-4" /> Enquire
              </button>
            </div>
          </motion.nav>

          {/* Desktop */}
          <motion.div
            className="fixed bottom-6 right-6 z-[60] hidden items-center gap-2 md:flex"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <a
              href={whatsappHref(site)}
              target="_blank"
              rel="noopener"
              aria-label="Chat on WhatsApp"
              className="glass grid h-12 w-12 place-items-center rounded-full text-linen transition hover:text-white"
              data-track="whatsapp_click"
              data-track-location="floating"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <button
              type="button"
              onClick={() => openEnquiry("floating")}
              className="btn btn-light btn-sm h-12 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)]"
            >
              <CalendarCheck className="h-4 w-4" /> Enquire
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
