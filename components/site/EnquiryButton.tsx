"use client";
import type { ReactNode } from "react";
import { useSite } from "./SiteShell";

/** Lets server-rendered pages open the enquiry drawer. */
export function EnquiryButton({ source, className, children }: { source: string; className?: string; children?: ReactNode }) {
  const { content, openEnquiry } = useSite();
  return (
    <button type="button" onClick={() => openEnquiry(source)} className={className}>
      {children ?? content.cta_primary}
    </button>
  );
}

export function CallLink({ className, location, children }: { className?: string; location: string; children?: ReactNode }) {
  const { site } = useSite();
  const d = (site.phone_mobile || site.phone_office_1).replace(/\D/g, "");
  return (
    <a href={`tel:+91${d.slice(-10)}`} className={className} data-track="phone_click" data-track-location={location}>
      {children ?? "Call now"}
    </a>
  );
}
