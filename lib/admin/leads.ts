import type { Lead } from "@/lib/types";

export function sourceLabel(s: string | null | undefined) {
  if (!s) return "Website";
  const map: Record<string, string> = {
    hero: "Hero",
    "hero-book": "Hero (Book)",
    nav: "Navigation",
    floating: "Floating button",
    "mobile-bar": "Mobile action bar",
    "mobile-menu": "Mobile menu",
    "enquiry-section": "Enquiry section",
    "contact-page": "Contact page",
    "final-cta": "Final CTA",
    footer: "Footer",
    gallery: "Gallery",
    location: "Location",
    "sea-view": "Sea view",
    stay: "Stay section",
    amenities: "Amenities",
    capsule: "3D capsule",
    why: "Why SNOOZ",
    faq: "FAQ",
    video: "Video section",
    modal: "Enquiry drawer",
  };
  if (map[s]) return map[s];
  if (s.startsWith("landing-")) return `SEO page: ${s.replace("landing-", "").replace(/-/g, " ")}`;
  if (s.startsWith("room-")) return `Room: ${s.replace("room-", "").replace(/-/g, " ")}`;
  if (s.startsWith("blog-")) return "Blog post";
  return s.replace(/-/g, " ");
}

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function leadsToCsv(leads: Lead[]) {
  const cols: (keyof Lead)[] = ["created_at", "full_name", "phone", "email", "check_in", "check_out", "guests", "preference", "message", "status", "source", "page", "utm"];
  const header = ["Submitted", "Name", "Phone", "Email", "Check-in", "Check-out", "Guests", "Preference", "Message", "Status", "Source", "Page", "UTM"];
  const rows = leads.map((l) => cols.map((c) => esc(c === "created_at" ? new Date(l.created_at).toLocaleString("en-IN") : c === "source" ? sourceLabel(l.source) : l[c])).join(","));
  return [header.join(","), ...rows].join("\n");
}

export function downloadCsv(name: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
