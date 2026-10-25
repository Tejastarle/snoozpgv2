"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { GalleryItem } from "@/lib/types";
import { GALLERY_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Fade, RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

const EASE = [0.16, 1, 0.3, 1] as const;

export function GallerySection({ items }: { items: GalleryItem[] }) {
  const { content, openEnquiry } = useSite();
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState<number | null>(null);

  const cats = useMemo(() => ["All", ...GALLERY_CATEGORIES.filter((c) => items.some((i) => i.category === c))], [items]);
  const visible = useMemo(() => (filter === "All" ? items : items.filter((i) => i.category === filter)), [items, filter]);

  return (
    <section id="gallery" className="bg-charcoal py-24 md:py-36" aria-labelledby="gallery-title">
      <div className="container-x">
        <div className="flex flex-col gap-8">
          <RevealHeading id="gallery-title" lines={[content.gallery_title]} className="display display-l text-linen" />
          <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Gallery categories">
            <LayoutGroup id="gallery-tabs">
              <div className="flex w-max gap-1 rounded-full border border-linen/12 p-1">
                {cats.map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={filter === c}
                    type="button"
                    onClick={() => setFilter(c)}
                    className={cn("relative rounded-full px-4 py-2 text-sm font-medium transition-colors", filter === c ? "text-charcoal" : "text-linen/70 hover:text-linen")}
                  >
                    {filter === c && <motion.span layoutId="gallery-pill" className="absolute inset-0 -z-0 rounded-full bg-linen" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <span className="relative">{c}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </div>
        </div>

        <ul key={filter} className="mt-10 columns-2 gap-3 sm:gap-4 md:mt-14 lg:columns-3 [&>li]:mb-3 sm:[&>li]:mb-4">
            {visible.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, clipPath: "inset(18% 0% 0% 0% round 16px)" }}
                whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 16px)" }}
                viewport={{ once: true, margin: "-5% 0px" }}
                transition={{ duration: 1, ease: EASE, delay: (i % 3) * 0.08 }}
                className="break-inside-avoid"
              >
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group relative block w-full overflow-hidden rounded-[16px] bg-charcoal-800 text-left sm:rounded-[22px]"
                  aria-label={`Open ${item.title}`}
                >
                  <Image
                    src={item.image_url}
                    alt={item.alt ?? item.title}
                    width={900}
                    height={i % 3 === 1 ? 1200 : 700}
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className={cn("w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]", i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/3]")}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-5">
                    <span>
                      <span className="hidden text-xs text-linen/60 sm:block">{item.category}</span>
                      <span className="block text-sm font-semibold leading-tight text-linen sm:text-base">{item.title}</span>
                    </span>
                    <span className="grid h-10 w-10 shrink-0 translate-y-2 place-items-center rounded-full bg-linen/15 text-linen opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <Expand className="h-4 w-4" />
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
        </ul>

        <Fade className="mt-12 flex flex-col items-start justify-between gap-5 border-t border-linen/10 pt-10 sm:flex-row sm:items-center">
          <p className="text-lg text-linen/75">Want to see it in person? Visit any time — we&apos;re open 24/7.</p>
          <button type="button" onClick={() => openEnquiry("gallery")} className="btn btn-light">
            {content.cta_primary}
          </button>
        </Fade>
      </div>

      <Lightbox items={visible} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState(1);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setDir(d);
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (index === null) return;
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    root.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [index, go, onClose]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={root}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-[95] flex flex-col bg-charcoal/95 outline-none backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between px-4 py-4 text-linen md:px-8">
            <p className="text-sm text-linen/70">
              <span className="font-semibold text-linen">{item.title}</span>
              <span className="ml-3 tabular-nums">{index! + 1} / {items.length}</span>
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                className="hidden h-11 w-11 place-items-center rounded-full hover:bg-linen/10 sm:grid"
                aria-label="View full screen"
                onClick={() => (document.fullscreenElement ? document.exitFullscreen() : root.current?.requestFullscreen?.())}
              >
                <Expand className="h-5 w-5" />
              </button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-linen/10" aria-label="Close" onClick={onClose}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={item.id}
                custom={dir}
                className="absolute inset-0 px-4 pb-6 md:px-20"
                initial={{ opacity: 0, x: dir * 80, scale: 0.98, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: dir * -80, scale: 0.98, filter: "blur(8px)" }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <div className="relative h-full w-full">
                  <Image src={item.image_url} alt={item.alt ?? item.title} fill sizes="100vw" className="object-contain" priority />
                </div>
              </motion.div>
            </AnimatePresence>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-linen/10 text-linen backdrop-blur hover:bg-linen/20 md:left-6">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-linen/10 text-linen backdrop-blur hover:bg-linen/20 md:right-6">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
