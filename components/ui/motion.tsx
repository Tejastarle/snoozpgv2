"use client";

import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";
import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const MOTION_TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p, div: motion.div, span: motion.span } as const;
type RevealTag = keyof typeof MOTION_TAGS;

/**
 * Word-by-word masked reveal for display headings. Each `lines` entry renders on its own line.
 * The in-view trigger sits on the heading itself (the words start clipped, so they can't be observed).
 */
export function RevealHeading({
  as = "h2",
  lines,
  className,
  lineClass,
  delay = 0,
  immediate = false,
  id,
}: {
  id?: string;
  as?: RevealTag | ElementType;
  lines: string[];
  className?: string;
  lineClass?: (i: number) => string | undefined;
  delay?: number;
  immediate?: boolean;
}) {
  const Tag = MOTION_TAGS[(as as RevealTag)] ?? motion.h2;
  let wordIndex = 0;
  const trigger = immediate
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, margin: "0px 0px -12% 0px" } };
  return (
    <Tag id={id} className={className} aria-label={lines.join(" ")} initial="hidden" {...trigger}>
      <span aria-hidden>
        {lines.map((line, li) => {
          const words = line.split(" ");
          return (
            <span key={li} className={cn("block", lineClass?.(li))}>
              {words.map((word, wi) => {
                const i = wordIndex++;
                return (
                  <span key={wi} className="-mb-[0.08em] inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <motion.span
                      className="inline-block will-change-transform"
                      variants={{
                        hidden: { y: "110%" },
                        show: { y: "0%", transition: { duration: 1.05, ease: EASE, delay: delay + i * 0.055 } },
                      }}
                    >
                      {word}
                      {wi < words.length - 1 ? "\u00A0" : ""}
                    </motion.span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}

/** Simple fade/rise for supporting content. */
export function Fade({
  children,
  delay = 0,
  y = 18,
  className,
  as = "div",
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" } & HTMLMotionProps<"div">) {
  const Comp = (as === "li" ? motion.li : motion.div) as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Clip-path image reveal (bottom → top). */
export function ClipReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.25, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Wraps a CTA so it leans towards the pointer. Fine pointers only. */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  return (
    <motion.span
      ref={ref}
      className={cn("inline-flex", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength * 1.2);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/** Counts up to `to` when scrolled into view. */
export function Counter({ to, pad = 2, className }: { to: number; pad?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0.2 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => {
        const el = ref.current;
        if (!el) return;
        const start = performance.now();
        const dur = 1200;
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = String(Math.round(to * eased)).padStart(pad, "0");
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }}
    >
      {String(to).padStart(pad, "0")}
    </motion.span>
  );
}
