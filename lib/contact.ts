import type { SiteSettings } from "./types";

const digits = (s: string) => (s || "").replace(/\D/g, "");

/** "7039071356" → "+917039071356" ; "022-4665 0191" → "+912246650191" */
export function telHref(phone: string) {
  let d = digits(phone);
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length === 10) d = "91" + d;
  return `tel:+${d}`;
}

/** "7039071356" → "+91 70390 71356" */
export function formatPhone(phone: string) {
  const d = digits(phone);
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  if (d.length === 12 && d.startsWith("91")) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return phone;
}

export function whatsappHref(site: SiteSettings, text?: string) {
  let d = digits(site.whatsapp || site.phone_mobile);
  if (d.length === 10) d = "91" + d;
  const msg = encodeURIComponent(text ?? site.whatsapp_message ?? "");
  return `https://wa.me/${d}${msg ? `?text=${msg}` : ""}`;
}

export function primaryPhone(site: SiteSettings) {
  return site.phone_mobile || site.phone_office_1;
}

export function directionsHref(site: SiteSettings) {
  return `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`;
}

export function mapEmbedSrc(site: SiteSettings) {
  // Keyless embed — no API key is ever exposed in the frontend.
  return `https://www.google.com/maps?q=${site.latitude},${site.longitude}&z=17&output=embed`;
}

export function fullAddress(site: SiteSettings) {
  return `${site.address_line_1}, ${site.address_line_2}, ${site.locality}, ${site.city} - ${site.postal_code}`;
}

/** All phone numbers with a human label, in display order. */
export function phoneList(site: SiteSettings) {
  const list: { number: string; label: string }[] = [];
  if (site.phone_mobile) list.push({ number: site.phone_mobile, label: "Call / WhatsApp" });
  if (site.phone_office_1) list.push({ number: site.phone_office_1, label: "Call" });
  if (site.phone_office_2) list.push({ number: site.phone_office_2, label: "Call" });
  if (site.contact_person_phone) list.push({ number: site.contact_person_phone, label: site.contact_person || "Owner" });
  return list;
}

export function lines(text: string | null | undefined) {
  return (text ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

/** Extracts the video id from youtube.com/shorts/ID, youtu.be/ID or watch?v=ID URLs. */
export function youtubeId(url: string) {
  const m = url.match(/(?:shorts\/|youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
