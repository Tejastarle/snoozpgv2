import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryButton, CallLink } from "@/components/site/EnquiryButton";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { FaqList } from "@/components/site/FaqSection";
import { VisitSection } from "@/components/site/VisitSection";
import { getPublishedBlogs, getSiteContent, seoFor } from "@/lib/content";
import { LANDING_PAGES, landingBySlug } from "@/lib/landing-pages";
import { breadcrumbSchema, faqSchema, JsonLd } from "@/lib/schema";
import { Icon } from "@/lib/icons";
import { pad2 } from "@/lib/utils";

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ landing: p.slug }));
}

type Props = { params: Promise<{ landing: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { landing } = await params;
  const page = landingBySlug(landing);
  if (!page) return {};
  const c = await getSiteContent();
  const o = seoFor(c, `/${page.slug}`);
  const title = o?.title ?? page.title;
  const description = o?.description ?? page.description;
  return {
    title: { absolute: `${title} | SNOOZ` },
    description,
    keywords: (o?.keywords ?? page.keywords).split(",").map((k) => k.trim()),
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title, description, url: `/${page.slug}`, images: [o?.og_image ?? page.image] },
  };
}

export default async function LandingPage({ params }: Props) {
  const { landing } = await params;
  const page = landingBySlug(landing);
  if (!page) notFound();
  const [c, blogs] = await Promise.all([getSiteContent(), getPublishedBlogs()]);
  const related = page.related.map((s) => landingBySlug(s)).filter(Boolean);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: page.navLabel, path: `/${page.slug}` }])} />
      <JsonLd data={faqSchema(page.faqs.map((f) => ({ question: f.q, answer: f.a })))} />

      <PageHero image={page.image} crumbs={[{ name: "Home", href: "/" }, { name: page.navLabel }]} lines={page.h1} intro={page.intro}>
        <EnquiryButton source={`landing-${page.slug}`} className="btn btn-light" />
        <CallLink location={`landing-${page.slug}`} className="btn btn-ghost">Call now</CallLink>
      </PageHero>

      {/* Highlights */}
      <section className="bg-charcoal pb-20">
        <div className="container-x">
          <ul className="grid gap-px overflow-hidden rounded-[28px] border border-linen/10 bg-linen/10 sm:grid-cols-2 lg:grid-cols-4">
            {page.highlights.map((h) => (
              <li key={h.title} className="bg-charcoal p-7">
                <Check className="h-5 w-5 text-bay" aria-hidden />
                <h2 className="mt-5 text-lg font-bold text-linen">{h.title}</h2>
                <p className="mt-2 text-[0.95rem] text-linen/60">{h.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Body + sticky enquiry */}
      <section className="on-light bg-linen py-20 text-charcoal md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <article className="lg:col-span-7">
            {page.sections.map((s) => (
              <div key={s.heading} className="mb-14 last:mb-0">
                <h2 className="text-[clamp(1.6rem,2.6vw,2.3rem)] font-extrabold leading-tight [font-variation-settings:'wdth'_108]">{s.heading}</h2>
                {s.body.map((para, i) => (
                  <p key={i} className="mt-4 max-w-[64ch] text-[1.06rem] leading-relaxed text-charcoal/75">{para}</p>
                ))}
              </div>
            ))}

            <div className="mt-16 grid grid-cols-3 gap-3">
              {c.locations.map((l) => (
                <div key={l.id} className="rounded-[20px] border border-charcoal/10 bg-white p-5">
                  <Icon name={l.icon} className="h-5 w-5 text-maroon" />
                  <p className="mt-5 leading-none">
                    <span className="display text-4xl">{pad2(l.minutes)}</span>
                    <span className="ml-1 text-sm font-semibold text-charcoal/55">min</span>
                  </p>
                  <p className="mt-2 text-sm font-medium text-charcoal/75">{l.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-charcoal/45">Approximate travel times by road.</p>

            <div className="relative mt-16 aspect-[16/10] overflow-hidden rounded-[28px]">
              <Image src="/media/img/dorm-bunk.jpg" alt="AC dormitory bunks at SNOOZ, CBD Belapur" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
            </div>

            <div className="mt-16">
              <h2 className="text-[clamp(1.6rem,2.6vw,2.3rem)] font-extrabold leading-tight [font-variation-settings:'wdth'_108]">Frequently asked</h2>
              <div className="mt-6">
                <FaqList tone="light" faqs={page.faqs.map((f) => ({ question: f.q, answer: f.a }))} />
              </div>
            </div>
          </article>

          <aside className="lg:col-span-5">
            <div className="rounded-[28px] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(103,35,26,0.35)] ring-1 ring-charcoal/5 sm:p-8 lg:sticky lg:top-28">
              <h2 className="text-2xl font-extrabold [font-variation-settings:'wdth'_108]">Check availability</h2>
              <p className="mt-2 text-charcoal/60">Tell us your dates — we&apos;ll confirm a berth.</p>
              <div className="mt-7">
                <EnquiryForm source={`landing-${page.slug}`} after="redirect" compact />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Internal links */}
      <section className="bg-charcoal py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold text-linen [font-variation-settings:'wdth'_108]">More ways to stay in Belapur</h2>
            <ul className="mt-6 divide-y divide-linen/10 border-y border-linen/10">
              {related.map((r) => (
                <li key={r!.slug}>
                  <Link href={`/${r!.slug}`} className="group flex items-center justify-between py-5 text-lg text-linen/85 hover:text-linen">
                    {r!.navLabel}
                    <ArrowUpRight className="h-5 w-5 text-linen/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-linen" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/" className="group flex items-center justify-between py-5 text-lg text-linen/85 hover:text-linen">
                  SNOOZ home <ArrowUpRight className="h-5 w-5 text-linen/40" />
                </Link>
              </li>
            </ul>
          </div>
          {blogs.length > 0 && (
            <div>
              <h2 className="text-2xl font-extrabold text-linen [font-variation-settings:'wdth'_108]">From the blog</h2>
              <ul className="mt-6 divide-y divide-linen/10 border-y border-linen/10">
                {blogs.slice(0, 3).map((b) => (
                  <li key={b.id}>
                    <Link href={`/blog/${b.slug}`} className="group flex items-center justify-between gap-6 py-5 text-linen/85 hover:text-linen">
                      <span className="text-lg">{b.title}</span>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-linen/40" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <VisitSection />
    </>
  );
}
