"use client";

import { useState } from "react";
import { Check, Copy, Play, Star } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { lines, youtubeId } from "@/lib/contact";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/brand/SocialIcons";
import { Fade, RevealHeading } from "@/components/ui/motion";

/** Social videos, Google review, Instagram and UPI payment — all managed in Admin → Contact info. */
export function ConnectSection({ site, showUpi = true }: { site: SiteSettings; showUpi?: boolean }) {
  const shorts = lines(site.youtube_shorts).map((u) => ({ url: u, id: youtubeId(u) })).filter((s) => s.id);
  const reels = lines(site.facebook_reels);

  return (
    <section id="connect" className="bg-charcoal py-24 md:py-32" aria-labelledby="connect-title">
      <div className="container-x">
        <RevealHeading id="connect-title" lines={["Watch, follow, review."]} className="display display-m max-w-[16ch] text-linen" />
        <p className="lede mt-5 text-linen/65">Short videos from SNOOZ, our socials, and an easy way to leave a review or pay by UPI.</p>

        {(shorts.length > 0 || reels.length > 0) && (
          <div className="mt-12 grid gap-4 md:grid-cols-12">
            {shorts.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:col-span-7 lg:col-span-6">
                {shorts.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <YouTubeFacade id={s.id!} />
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-3 md:col-span-5 lg:col-span-6">
              {site.youtube && (
                <a href={site.youtube} target="_blank" rel="noopener" className="flex items-center gap-4 rounded-[20px] border border-linen/10 p-5 text-linen transition hover:border-linen/30" data-track="social_click" data-track-label="youtube">
                  <YoutubeIcon className="h-7 w-7 shrink-0 text-[#ff4e45]" />
                  <span>
                    <span className="block font-semibold">SNOOZ on YouTube</span>
                    <span className="block text-sm text-linen/55">Room tours and Shorts</span>
                  </span>
                </a>
              )}
              {site.facebook && (
                <a href={site.facebook} target="_blank" rel="noopener" className="flex items-center gap-4 rounded-[20px] border border-linen/10 p-5 text-linen transition hover:border-linen/30" data-track="social_click" data-track-label="facebook">
                  <FacebookIcon className="h-7 w-7 shrink-0 text-[#4c8dff]" />
                  <span>
                    <span className="block font-semibold">SNOOZ on Facebook</span>
                    <span className="block text-sm text-linen/55">Updates and reels</span>
                  </span>
                </a>
              )}
              {reels.length > 0 && (
                <ul className="grid grid-cols-2 gap-3">
                  {reels.map((r, i) => (
                    <li key={r}>
                      <a href={r} target="_blank" rel="noopener" className="flex h-full items-center gap-3 rounded-[16px] bg-linen/[0.04] px-4 py-3.5 text-sm font-semibold text-linen/85 transition hover:bg-linen/[0.08] hover:text-linen" data-track="social_click" data-track-label={`facebook-reel-${i + 1}`}>
                        <Play className="h-4 w-4 shrink-0 text-[#4c8dff]" fill="currentColor" /> Facebook reel {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className={`mt-6 grid gap-4 sm:grid-cols-2 ${showUpi && site.upi_qr ? "xl:grid-cols-3" : ""}`}>
          {site.google_review && (
            <QrCard
              title="Rate us on Google"
              text="Stayed with us? A quick review helps other guests find SNOOZ."
              img={site.google_review_qr}
              alt="QR code to review The New Snoozy Capsules Premise on Google"
              action={
                <a href={site.google_review} target="_blank" rel="noopener" className="btn btn-light btn-sm" data-track="review_click">
                  <Star className="h-4 w-4" /> Write a review
                </a>
              }
            />
          )}
          {site.instagram && (
            <QrCard
              title={`Follow ${site.instagram_handle || "us on Instagram"}`}
              text="Photos, stories and what's new at SNOOZ."
              img={site.instagram_qr}
              alt={`Instagram QR code for ${site.instagram_handle}`}
              action={
                <a href={site.instagram} target="_blank" rel="noopener" className="btn btn-light btn-sm" data-track="social_click" data-track-label="instagram">
                  <InstagramIcon className="h-4 w-4" /> Open Instagram
                </a>
              }
            />
          )}
          {showUpi && site.upi_qr && (
            <QrCard
              title="Pay by UPI"
              text="Scan with any UPI app. Please confirm your booking with us before paying."
              img={site.upi_qr}
              alt="UPI payment QR code for SNOOZ — The New Snoozy Capsules Premise"
              action={site.upi_vpa ? <CopyVpa vpa={site.upi_vpa} /> : null}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function QrCard({ title, text, img, alt, action }: { title: string; text: string; img: string; alt: string; action: React.ReactNode }) {
  return (
    <Fade className="flex flex-col rounded-[24px] bg-linen p-5 text-charcoal sm:p-6">
      <div className="flex gap-4">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={alt} loading="lazy" className="h-32 w-28 shrink-0 rounded-xl bg-white object-contain ring-1 ring-charcoal/10 sm:h-36 sm:w-32" />
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold leading-tight [overflow-wrap:anywhere] [font-variation-settings:'wdth'_106]">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-charcoal/65">{text}</p>
        </div>
      </div>
      {action && <div className="mt-5">{action}</div>}
    </Fade>
  );
}

function CopyVpa({ vpa }: { vpa: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(vpa).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        });
      }}
      className="btn btn-ghost-dark btn-sm max-w-full"
      title="Copy UPI ID"
    >
      {done ? <Check className="h-4 w-4 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
      <span className="truncate">{done ? "Copied" : vpa}</span>
    </button>
  );
}

/** Lightweight YouTube embed: shows the thumbnail and only loads the player when tapped. */
function YouTubeFacade({ id }: { id: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-[20px] bg-charcoal-800 ring-1 ring-linen/10">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title="SNOOZ on YouTube"
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0" aria-label="Play YouTube video" data-track="video_play" data-track-label={`youtube-${id}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute inset-0 bg-charcoal/25 transition group-hover:bg-charcoal/10" />
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#ff0033] text-white shadow-xl transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
