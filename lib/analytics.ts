"use client";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const FB_STANDARD: Record<string, string> = {
  generate_lead: "Lead",
  phone_click: "Contact",
  whatsapp_click: "Contact",
  check_availability: "Schedule",
};

/** Sends an event to GA4 (gtag) and Meta Pixel (fbq) when they are loaded. */
export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
    const fb = FB_STANDARD[event];
    if (fb) window.fbq?.("track", fb, params);
    else window.fbq?.("trackCustom", event, params);
    if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
  } catch {
    /* analytics must never break the page */
  }
}

const UTM_KEY = "snooz_utm";
export function captureUtm() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach((k) => {
      const v = sp.get(k);
      if (v) utm[k] = v.slice(0, 120);
    });
    if (document.referrer && !document.referrer.includes(window.location.host)) utm.referrer = document.referrer.slice(0, 200);
    if (Object.keys(utm).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  } catch {}
}
export function getUtm(): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
