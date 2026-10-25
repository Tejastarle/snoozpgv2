import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { getPublishedBlogs, getSiteContent, seoFor } from "@/lib/content";
import { breadcrumbSchema, JsonLd } from "@/lib/schema";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteContent();
  const o = seoFor(c, "/blog");
  const title = o?.title ?? "SNOOZ Journal — Staying in CBD Belapur & Navi Mumbai";
  const description = o?.description ?? "Guides and tips for staying in CBD Belapur: PGs, capsule stays, getting around Navi Mumbai and more from the SNOOZ team.";
  return { title: { absolute: `${title} | SNOOZ` }, description, alternates: { canonical: "/blog" }, openGraph: { title, description, url: "/blog" } };
}

export default async function BlogIndex() {
  const blogs = await getPublishedBlogs();
  const [lead, ...rest] = blogs;
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <PageHero compact crumbs={[{ name: "Home", href: "/" }, { name: "Blog" }]} lines={["The SNOOZ", "journal."]} intro="Practical guides for staying, working and getting around in CBD Belapur and Navi Mumbai." />
      <section className="on-light bg-linen py-20 text-charcoal md:py-28">
        <div className="container-x">
          {!lead ? (
            <p className="text-lg text-charcoal/60">New articles are on the way. Check back soon.</p>
          ) : (
            <>
              <Link href={`/blog/${lead.slug}`} className="group grid gap-8 lg:grid-cols-2 lg:items-center">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-charcoal">
                  {lead.cover_image && <Image src={lead.cover_image} alt="" fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />}
                </div>
                <div>
                  <p className="text-sm text-charcoal/55">{formatDate(lead.published_at)}{lead.tags[0] ? ` — ${lead.tags[0]}` : ""}</p>
                  <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,3rem)] font-extrabold leading-[1.05] [font-variation-settings:'wdth'_108] group-hover:text-maroon">{lead.title}</h2>
                  <p className="mt-4 max-w-xl text-lg text-charcoal/70">{lead.excerpt}</p>
                  <span className="mt-6 inline-block font-semibold text-maroon underline underline-offset-4">Read the article</span>
                </div>
              </Link>
              {rest.length > 0 && (
                <ul className="mt-20 grid gap-10 border-t border-charcoal/10 pt-16 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((b) => (
                    <li key={b.id}>
                      <Link href={`/blog/${b.slug}`} className="group block">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-charcoal">
                          {b.cover_image && <Image src={b.cover_image} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />}
                        </div>
                        <p className="mt-5 text-sm text-charcoal/55">{formatDate(b.published_at)}</p>
                        <h3 className="mt-2 text-xl font-bold leading-snug group-hover:text-maroon">{b.title}</h3>
                        <p className="mt-2 text-charcoal/65">{b.excerpt}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
