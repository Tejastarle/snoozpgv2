"use client";

import type { Testimonial } from "@/lib/types";
import { Fade } from "@/components/ui/motion";

/** Renders only when real testimonials have been added in the admin panel. */
export function TestimonialsSection({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-charcoal py-24 md:py-32" aria-labelledby="testimonials-title">
      <div className="container-x">
        <h2 id="testimonials-title" className="display display-m text-linen">From our guests</h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Fade as="li" key={t.id} delay={i * 0.08} className="flex h-full flex-col justify-between rounded-[24px] border border-linen/10 p-7">
                <blockquote className="sea text-[1.6rem] leading-snug text-linen/90">“{t.quote}”</blockquote>
                <p className="mt-6 text-sm text-linen/60">
                  <span className="font-semibold text-linen">{t.name}</span>
                  {t.role ? `, ${t.role}` : ""}
                </p>
            </Fade>
          ))}
        </ul>
      </div>
    </section>
  );
}
