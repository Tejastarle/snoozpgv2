"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { captureUtm, track } from "@/lib/analytics";
import type { ContentSettings, SiteSettings } from "@/lib/types";
import { EnquiryModal } from "./EnquiryModal";
import { FloatingCTA } from "./FloatingCTA";
import { CursorFollower, ScrollProgress } from "./Chrome";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

type Ctx = {
  site: SiteSettings;
  content: ContentSettings;
  openEnquiry: (source?: string) => void;
  closeEnquiry: () => void;
};

const SiteCtx = createContext<Ctx | null>(null);

export function useSite() {
  const ctx = useContext(SiteCtx);
  if (!ctx) throw new Error("useSite must be used inside <SiteShell>");
  return ctx;
}

/** Smoothly scrolls to an element id (works with or without Lenis). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export function SiteShell({
  site,
  content,
  children,
}: {
  site: SiteSettings;
  content: ContentSettings;
  children: ReactNode;
}) {
  const [enquiry, setEnquiry] = useState<{ open: boolean; source: string }>({ open: false, source: "modal" });
  const pathname = usePathname();
  const depthSent = useRef<Set<number>>(new Set());

  // Smooth scrolling + GSAP ticker sync
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // Reset scroll + scroll-depth tracking on route change
  useEffect(() => {
    depthSent.current = new Set();
    if (!window.location.hash) window.__lenis?.scrollTo(0, { immediate: true });
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => scrollToId(id), 350);
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(t);
  }, [pathname]);

  // UTM capture, analytics click delegation, scroll depth
  useEffect(() => {
    captureUtm();
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      track(el.dataset.track!, {
        label: el.dataset.trackLabel ?? el.textContent?.trim().slice(0, 60),
        location: el.dataset.trackLocation,
        page: window.location.pathname,
      });
    };
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = (window.scrollY / h) * 100;
      [25, 50, 75, 100].forEach((m) => {
        if (pct >= m - 1 && !depthSent.current.has(m)) {
          depthSent.current.add(m);
          track("scroll_depth", { percent: m, page: window.location.pathname });
        }
      });
    };
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const openEnquiry = useCallback((source = "modal") => {
    setEnquiry({ open: true, source });
    track("check_availability", { source });
  }, []);
  const closeEnquiry = useCallback(() => setEnquiry((s) => ({ ...s, open: false })), []);

  useEffect(() => {
    if (enquiry.open) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [enquiry.open]);

  const value = useMemo(() => ({ site, content, openEnquiry, closeEnquiry }), [site, content, openEnquiry, closeEnquiry]);

  return (
    <SiteCtx.Provider value={value}>
      <ScrollProgress />
      <CursorFollower />
      {children}
      <FloatingCTA />
      <EnquiryModal open={enquiry.open} source={enquiry.source} onClose={closeEnquiry} />
    </SiteCtx.Provider>
  );
}
