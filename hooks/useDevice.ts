"use client";
import { useEffect, useState, type RefObject } from "react";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export type Tier = "none" | "low" | "high";

/**
 * Decides how much 3D a device gets.
 *  - "none": no WebGL or data-saver on → static / video fallbacks
 *  - "low":  phones, tablets and very weak machines → lighter scenes
 *  - "high": laptops and desktops → full 3D scenes
 * Returns null until mounted (SSR-safe).
 */
export function useRenderTier(): Tier | null {
  const [tier, setTier] = useState<Tier | null>(null);
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (nav.connection?.saveData || !hasWebGL()) return setTier("none");
    const coarse = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches;
    const small = window.innerWidth < 900;
    const veryWeak = (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
    setTier(coarse || small || veryWeak ? "low" : "high");
  }, []);
  return tier;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** `near` flips true once the element is within `margin` of the viewport (for lazy mounting); `visible` tracks it live (for pausing). */
export function useViewport(ref: RefObject<Element | null>, margin = "300px") {
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return { near, visible };
}

export function useIsDesktop(query = "(min-width: 1024px)") {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatch(mq.matches);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}
