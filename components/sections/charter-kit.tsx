"use client";

import { useEffect, useRef, useState } from "react";
import type { CharterStat } from "@/data/charter";

/*
 * Small pieces shared by the charter's cards: the home page's photograph
 * reel (photo-reel.tsx) and the About page's chapters.
 */

/** `on`: any of the element is in view (its loops run). `active`: a third or more is (its figures count up). */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState({ on: false, active: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const on = e.isIntersecting;
        const active = on && e.intersectionRatio >= 0.35;
        setState((s) => (s.on === on && s.active === active ? s : { on, active }));
      },
      { threshold: [0, 0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, state] as const;
}

/** Counts up whenever `active` turns on; screen readers get the final value only. `suffixClassName` sets the unit apart (e.g. smaller). */
export function CountUp({ stat, active, suffixClassName }: { stat: CharterStat; active: boolean; suffixClassName?: string }) {
  const [shown, setShown] = useState(stat.value);
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1200);
      setShown(p < 1 ? stat.value * (1 - 2 ** (-10 * p)) : stat.value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Interrupted (scrolled away mid-count): settle on the true figure, never a half-counted one.
    return () => {
      cancelAnimationFrame(raf);
      setShown(stat.value);
    };
  }, [active, stat.value]);
  const fmt = (v: number) => v.toFixed(stat.decimals ?? 0);
  return (
    <>
      <span aria-hidden>
        {fmt(shown)}
        {suffixClassName && stat.suffix ? <span className={suffixClassName}>{stat.suffix}</span> : stat.suffix}
      </span>
      <span className="sr-only">
        {fmt(stat.value)}
        {stat.suffix}
      </span>
    </>
  );
}
