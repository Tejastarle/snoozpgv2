import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** Shared hero band for inner pages (SEO landing pages, contact, blog). */
export function PageHero({
  image,
  crumbs,
  lines,
  intro,
  children,
  compact = false,
  article = false,
}: {
  article?: boolean;
  image?: string;
  crumbs: { name: string; href?: string }[];
  lines: [string, string?];
  intro?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`relative isolate overflow-hidden bg-charcoal ${compact ? "pb-16 pt-36 md:pb-20 md:pt-44" : "pb-20 pt-40 md:pb-28 md:pt-52"}`}>
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-55" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(22,24,27,0.75)_0%,rgba(22,24,27,0.55)_40%,#16181b_100%)]" />
        </>
      )}
      <div className="container-x">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-linen/60">
            {crumbs.map((c, i) => (
              <li key={c.name} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-linen/35" aria-hidden />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-linen">{c.name}</Link>
                ) : (
                  <span aria-current="page" className="text-linen/85">{c.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="mt-8 max-w-5xl text-linen">
          <span className={article ? "block max-w-4xl text-[clamp(2.1rem,4.6vw,4.2rem)] font-extrabold leading-[1.04] tracking-tight [font-variation-settings:'wdth'_106]" : "display display-l block"}>{lines[0]}</span>
          {lines[1] && <span className="sea mt-1 block text-[clamp(2.6rem,6.2vw,6.4rem)]">{lines[1]}</span>}
        </h1>
        {intro && <p className="lede mt-7 text-linen/75">{intro}</p>}
        {children && <div className="mt-9 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
