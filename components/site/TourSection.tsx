"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import type { VideoItem } from "@/lib/types";
import { Fade, RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

/** Real, unedited phone videos of SNOOZ. Posters load first; a muted preview plays on hover; tap opens the player with sound. */
export function TourSection({ videos }: { videos: VideoItem[] }) {
  const { openEnquiry, content } = useSite();
  const [open, setOpen] = useState<VideoItem | null>(null);
  if (!videos.length) return null;

  return (
    <section id="tour" className="bg-charcoal pb-24 pt-4 md:pb-36" aria-labelledby="tour-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 border-t border-linen/10 pt-16 md:flex-row md:items-end md:pt-24">
          <div>
            <RevealHeading id="tour-title" lines={["See it for real."]} className="display display-l text-linen" />
            <p className="lede mt-5 text-linen/65">Unedited phone videos from SNOOZ — the walk in, the dorm, the view at night.</p>
          </div>
          <Fade>
            <button type="button" onClick={() => openEnquiry("tour")} className="btn btn-light">
              {content.cta_primary}
            </button>
          </Fade>
        </div>

        <ul className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {videos.map((v) => (
            <li key={v.id} className="w-[62%] shrink-0 snap-start sm:w-auto">
              <TourCard video={v} onOpen={() => setOpen(v)} />
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-charcoal/95 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <Player video={open} onClose={() => setOpen(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TourCard({ video, onOpen }: { video: VideoItem; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (hover) v.play().catch(() => {});
    else v.pause();
  }, [hover]);
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-[22px] bg-charcoal-800 text-left ring-1 ring-linen/10"
      aria-label={`Play video: ${video.title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {video.poster && <img src={video.poster} alt="" decoding="async" fetchPriority="low" className="absolute inset-0 h-full w-full object-cover" />}
      {hover && (
        <video ref={ref} src={video.src_mp4} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-transparent to-transparent" />
      <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-linen/90 text-maroon shadow-xl transition-transform duration-500 group-hover:scale-110">
        <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-4 text-sm font-semibold leading-tight text-linen">{video.title}</span>
    </button>
  );
}

function Player({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  useEffect(() => {
    window.__lenis?.stop();
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", on);
    return () => {
      document.removeEventListener("keydown", on);
      window.__lenis?.start();
    };
  }, [onClose]);
  return (
    <motion.div
      className="relative flex max-h-full w-full max-w-[min(440px,100%)] flex-col"
      initial={{ scale: 0.96, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.96, y: 10 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-3 flex items-center justify-between gap-3 text-linen">
        <p className="truncate font-semibold">{video.title}</p>
        <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-linen/10" aria-label="Close video">
          <X className="h-5 w-5" />
        </button>
      </div>
      <video
        src={video.src_mp4}
        poster={video.poster ?? undefined}
        controls
        autoPlay
        playsInline
        className="max-h-[80svh] w-full rounded-[18px] bg-black object-contain"
      />
    </motion.div>
  );
}
