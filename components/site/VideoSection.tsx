"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { VideoItem } from "@/lib/types";
import { Magnetic, RevealHeading } from "@/components/ui/motion";
import { useSite } from "./SiteShell";

/** Cinematic brand film. Loads only when near the viewport, always muted, pauses off-screen. */
export function VideoSection({ video }: { video: VideoItem }) {
  const { content, openEnquiry } = useSite();
  const section = useRef<HTMLElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [src, setSrc] = useState(video.src_mp4);

  useEffect(() => {
    // Smaller file on phones when the default film is in use
    if (window.innerWidth < 768 && video.src_mp4.includes("brand-film-1080")) setSrc(video.src_mp4.replace("1080", "720"));
  }, [video.src_mp4]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setLoad(true);
        const v = ref.current;
        if (!v) return;
        if (e.isIntersecting && !userPaused) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [userPaused]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
      setUserPaused(false);
    } else {
      v.pause();
      setPlaying(false);
      setUserPaused(true);
    }
  };

  return (
    <section ref={section} className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ocean-deep" aria-labelledby="video-title">
      <video
        ref={ref}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        poster={video.poster ?? undefined}
        aria-hidden
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {load && (
          <>
            {video.src_webm && !src.includes("720") && <source src={video.src_webm} type="video/webm" />}
            <source src={src} type="video/mp4" />
          </>
        )}
      </video>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#16181b_0%,rgba(22,24,27,0.2)_25%,rgba(22,24,27,0.35)_60%,rgba(22,24,27,0.92)_100%)]" />

      <div className="container-x pb-20 pt-40 md:pb-28">
        <RevealHeading
          id="video-title"
          lines={[content.video_title_1, content.video_title_2]}
          className="text-linen"
          lineClass={(i) => (i === 0 ? "display display-l" : "sea mt-1 text-[clamp(2.8rem,7.2vw,7.4rem)]")}
        />
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Magnetic>
            <button type="button" onClick={() => openEnquiry("video")} className="btn btn-light">
              {content.video_cta}
            </button>
          </Magnetic>
          <button type="button" onClick={toggle} className="btn btn-ghost" aria-label={playing ? "Pause video" : "Play video"}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pause film" : "Play film"}
          </button>
        </div>
      </div>
    </section>
  );
}
