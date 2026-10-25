import "server-only";
import { cache } from "react";
import { DEFAULT_SITE_CONTENT } from "./defaults";
import { DEFAULT_BLOGS } from "./default-blogs";
import { getPublicSupabase } from "./supabase/server";
import type { Blog, SiteContent } from "./types";

async function rows<T>(table: string, opts: { active?: boolean; order?: string } = {}): Promise<T[] | null> {
  const sb = getPublicSupabase();
  if (!sb) return null;
  let q = sb.from(table).select("*");
  if (opts.active) q = q.eq("is_active", true);
  q = q.order(opts.order ?? "sort_order", { ascending: true });
  const { data, error } = await q;
  if (error) {
    console.error(`[content] ${table}:`, error.message);
    return null;
  }
  return data as T[];
}

/**
 * Loads all public site content. Falls back to defaults table-by-table, so the site
 * always renders — even before Supabase is configured or seeded.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const d = DEFAULT_SITE_CONTENT;
  const sb = getPublicSupabase();
  if (!sb) return d;

  const [settings, rooms, amenities, gallery, videos, faqs, testimonials, locations, availability, seoPages] =
    await Promise.all([
      sb.from("settings").select("key,value").then((r) => (r.error ? null : r.data)),
      rows<SiteContent["rooms"][number]>("rooms", { active: true }),
      rows<SiteContent["amenities"][number]>("amenities", { active: true }),
      rows<SiteContent["gallery"][number]>("gallery", { active: true }),
      rows<SiteContent["videos"][number]>("videos", { active: true }),
      rows<SiteContent["faqs"][number]>("faqs", { active: true }),
      rows<SiteContent["testimonials"][number]>("testimonials", { active: true }),
      rows<SiteContent["locations"][number]>("location_points", { active: true }),
      rows<SiteContent["availability"][number]>("availability"),
      rows<SiteContent["seoPages"][number]>("seo_pages", { order: "path" }),
    ]);

  const map = new Map<string, unknown>((settings ?? []).map((s: { key: string; value: unknown }) => [s.key, s.value]));
  const pick = <T,>(list: T[] | null, fallback: T[]) => (list && list.length ? list : fallback);

  return {
    site: { ...d.site, ...((map.get("site") as object) ?? {}) },
    content: { ...d.content, ...((map.get("content") as object) ?? {}) },
    seo: { ...d.seo, ...((map.get("seo") as object) ?? {}) },
    rooms: pick(rooms, d.rooms),
    amenities: pick(amenities, d.amenities),
    gallery: pick(gallery, d.gallery),
    videos: pick(videos, d.videos),
    faqs: pick(faqs, d.faqs),
    // Testimonials and availability are never back-filled with placeholder data.
    testimonials: testimonials ?? [],
    locations: pick(locations, d.locations),
    availability: availability ?? [],
    seoPages: seoPages ?? [],
  };
});

export const getPublishedBlogs = cache(async (): Promise<Blog[]> => {
  const sb = getPublicSupabase();
  if (!sb) return DEFAULT_BLOGS;
  const { data, error } = await sb
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[content] blogs:", error.message);
    return DEFAULT_BLOGS;
  }
  return (data as Blog[]) ?? [];
});

export const getBlogBySlug = cache(async (slug: string): Promise<Blog | null> => {
  const blogs = await getPublishedBlogs();
  return blogs.find((b) => b.slug === slug) ?? null;
});

export function videoFor(content: SiteContent, placement: "hero" | "experience") {
  return (
    content.videos.find((v) => v.placement === placement && v.is_active) ??
    DEFAULT_SITE_CONTENT.videos.find((v) => v.placement === placement)!
  );
}

export function seoFor(content: SiteContent, path: string) {
  return content.seoPages.find((p) => p.path === path) ?? null;
}
