"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-bay"
      style={{ scaleX }}
    />
  );
}

/** A soft ring that trails the pointer and swells over interactive elements. Fine pointers only. */
export function CursorFollower() {
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ring.current!;
    let x = -100, y = -100, tx = -100, ty = -100, s = 1, ts = 1, raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [role=button], [data-cursor=hover], input, select, textarea, label");
      ts = interactive ? 1.9 : 1;
      el.style.opacity = "1";
    };
    const leave = () => (el.style.opacity = "0");
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      s += (ts - s) * 0.15;
      el.style.transform = `translate3d(${x - 18}px, ${y - 18}px, 0) scale(${s})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-9 w-9 rounded-full border border-linen/60 opacity-0 mix-blend-difference transition-opacity duration-300 [@media(pointer:fine)]:block"
    />
  );
}
