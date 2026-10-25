import type { MetadataRoute } from "next";
import { getPublishedBlogs } from "@/lib/content";
import { SITE_URL } from "@/lib/env";
import { LANDING_PAGES } from "@/lib/landing-pages";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const blogs = await getPublishedBlogs();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...LANDING_PAGES.map((p) => ({ url: `${SITE_URL}/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...blogs.map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: new Date(b.updated_at ?? b.published_at ?? now),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
