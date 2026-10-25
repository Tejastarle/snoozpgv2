"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";
import { formatPhone, primaryPhone, telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { scrollToId, useSite } from "./SiteShell";

export const NAV_LINKS = [
  { label: "Home", id: "top" },
  { label: "Stay", id: "stay" },
  { label: "Amenities", id: "amenities" },
  { label: "Sea View", id: "sea-view" },
  { label: "Location", id: "location" },
  { label: "Gallery", id: "gallery" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" },
];

export function Navbar() {
  const { site, openEnquiry } = useSite();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("top");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Highlight the section in view (home only)
  useEffect(() => {
    if (pathname !== "/") return;
    const els = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [open]);

  const go = (id: string) => (e: MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      setOpen(false);
      if (id === "top") window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" });
      else scrollToId(id);
      history.replaceState(null, "", id === "top" ? "/" : `/#${id}`);
    } else if (id === "contact") {
      e.preventDefault();
      router.push("/contact");
    }
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[65]">
        <div
          className={cn(
            "container-x transition-[padding] duration-500",
            scrolled ? "pt-3" : "pt-4 md:pt-6",
          )}
        >
          <nav
            aria-label="Main"
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-4 rounded-full pl-5 pr-2 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:pl-7",
              scrolled ? "glass h-[60px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]" : "h-[64px] border border-transparent",
            )}
          >
            <Link href="/" onClick={go("top")} className="shrink-0 text-linen" aria-label="SNOOZ home">
              <Logo className="h-[22px] w-auto md:h-[26px]" />
            </Link>

            <ul className="hidden items-center gap-1 xl:flex">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <Link
                    href={l.id === "contact" ? "/contact" : l.id === "top" ? "/" : `/#${l.id}`}
                    onClick={go(l.id)}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-[0.92rem] font-medium text-linen/75 transition-colors hover:text-linen",
                      pathname === "/" && active === l.id && "text-linen",
                    )}
                  >
                    {pathname === "/" && active === l.id && (
                      <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-linen/10" transition={{ type: "spring", stiffness: 380, damping: 34 }} />
                    )}
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5">
              <a
                href={telHref(primaryPhone(site))}
                className="hidden h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-linen/85 transition hover:text-linen lg:inline-flex"
                data-track="phone_click"
                data-track-location="nav"
              >
                <Phone className="h-4 w-4" /> {formatPhone(primaryPhone(site))}
              </a>
              <button type="button" onClick={() => openEnquiry("nav")} className="btn btn-light btn-sm hidden h-11 sm:inline-flex">
                Book / Enquire
              </button>
              <button
                type="button"
                className="relative grid h-11 w-11 place-items-center rounded-full text-linen xl:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((o) => !o)}
              >
                <span className="relative block h-3 w-6" aria-hidden>
                  <span className={cn("absolute left-0 top-0 h-[1.5px] w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]", open && "translate-y-[5.5px] rotate-45")} />
                  <span className={cn("absolute bottom-0 left-0 h-[1.5px] w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]", open && "-translate-y-[5.5px] -rotate-45")} />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[64] flex flex-col bg-charcoal xl:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
          >
            <div className="container-x flex flex-1 flex-col justify-between pb-8 pt-28">
              <ul className="space-y-1">
                {NAV_LINKS.map((l, i) => (
                  <li key={l.id} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.045 }}
                    >
                      <Link
                        href={l.id === "contact" ? "/contact" : l.id === "top" ? "/" : `/#${l.id}`}
                        onClick={(e) => {
                          go(l.id)(e);
                          setOpen(false);
                        }}
                        className="display block py-1.5 text-[2.4rem] text-linen/90 active:text-linen"
                      >
                        {l.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="space-y-3"
              >
                <button type="button" onClick={() => { setOpen(false); openEnquiry("mobile-menu"); }} className="btn btn-light w-full">
                  Check availability
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <a href={telHref(primaryPhone(site))} className="btn btn-ghost" data-track="phone_click" data-track-location="mobile-menu">
                    <Phone className="h-4 w-4" /> Call
                  </a>
                  <a href={whatsappHref(site)} target="_blank" rel="noopener" className="btn btn-ghost" data-track="whatsapp_click" data-track-location="mobile-menu">
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
