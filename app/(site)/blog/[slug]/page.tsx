import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryButton } from "@/components/site/EnquiryButton";
import { getBlogBySlug, getPublishedBlogs } from "@/lib/content";
import { SITE_URL } from "@/lib/env";
import { breadcrumbSchema, JsonLd } from "@/lib/schema";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const blogs = await getPublishedBlogs();
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBlogBySlug(slug);
  if (!b) return { title: "Article not found" };
  const title = b.seo_title || b.title;
  const description = b.seo_description || b.excerpt;
  return {
    title: { absolute: `${title} | SNOOZ` },
    description,
    keywords: b.tags,
    alternates: { canonical: `/blog/${b.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${b.slug}`,
      publishedTime: b.published_at ?? undefined,
      images: b.cover_image ? [b.cover_image] : undefined,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const b = await getBlogBySlug(slug);
  if (!b) notFound();
  const others = (await getPublishedBlogs()).filter((x) => x.id !== b.id).slice(0, 2);
  const words = b.content.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: b.title,
          description: b.seo_description || b.excerpt,
          image: b.cover_image ? (b.cover_image.startsWith("http") ? b.cover_image : `${SITE_URL}${b.cover_image}`) : undefined,
          datePublished: b.published_at,
          dateModified: b.updated_at ?? b.published_at,
          author: { "@type": "Organization", name: b.author || "SNOOZ" },
          publisher: { "@type": "Organization", name: "SNOOZ", logo: { "@type": "ImageObject", url: `${SITE_URL}/media/img/snooz-logo.svg` } },
          mainEntityOfPage: `${SITE_URL}/blog/${b.slug}`,
        }}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: b.title, path: `/blog/${b.slug}` }])} />
      <PageHero compact article crumbs={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: b.title }]} lines={[b.title]}>
        <p className="text-sm text-linen/60">
          {formatDate(b.published_at)} — {minutes} min read{b.author ? ` — ${b.author}` : ""}
        </p>
      </PageHero>

      <section className="on-light bg-linen pb-24 text-charcoal">
        <div className="container-x">
          {b.cover_image && (
            <div className="relative -mt-2 aspect-[21/9] overflow-hidden rounded-[28px] bg-charcoal">
              <Image src={b.cover_image} alt="" fill priority sizes="100vw" className="object-cover" />
            </div>
          )}
          <div className="mx-auto mt-14 grid max-w-6xl gap-14 lg:grid-cols-[1fr_280px]">
            <article className="prose-snooz">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{b.content}</ReactMarkdown>
            </article>
            <aside className="lg:pt-2">
              <div className="rounded-[24px] bg-maroon p-7 text-linen lg:sticky lg:top-28">
                <p className="text-xl font-extrabold leading-tight [font-variation-settings:'wdth'_108]">Need a place to stay in Belapur?</p>
                <p className="mt-3 text-sm text-linen/75">AC capsule berths, sea-view facing, open 24/7.</p>
                <EnquiryButton source={`blog-${b.slug}`} className="btn btn-light btn-sm mt-6 w-full" />
              </div>
              {b.tags.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {b.tags.map((t) => (
                    <li key={t} className="rounded-full border border-charcoal/15 px-3 py-1 text-xs text-charcoal/70">{t}</li>
                  ))}
                </ul>
              )}
            </aside>
          </div>

          {others.length > 0 && (
            <div className="mx-auto mt-24 max-w-6xl border-t border-charcoal/10 pt-14">
              <h2 className="text-2xl font-extrabold [font-variation-settings:'wdth'_108]">Keep reading</h2>
              <ul className="mt-8 grid gap-8 md:grid-cols-2">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`/blog/${o.slug}`} className="group block rounded-[22px] border border-charcoal/10 bg-white p-7 transition hover:border-maroon/40">
                      <p className="text-sm text-charcoal/55">{formatDate(o.published_at)}</p>
                      <h3 className="mt-2 text-xl font-bold leading-snug group-hover:text-maroon">{o.title}</h3>
                      <p className="mt-2 text-charcoal/65">{o.excerpt}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
