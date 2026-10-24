"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { CharterStat } from "@/data/charter";
import { cn } from "@/lib/utils";

/*
 * Small pieces shared by the charter's rows: the home page's charter reel,
 * its promo row and the About page's chapters.
 */

/** Pointing at a closed card opens it only once the pointer settles, so sweeping across a row does not flicker. */
export const HOVER_INTENT_MS = 120;

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

/** The + that turns to ×: focus opens, a press toggles. */
export function Toggle({ open, onOpen, onToggle, controls, label }: { open: boolean; onOpen: () => void; onToggle: () => void; controls: string; label: string }) {
  return (
    <button
      type="button"
      onFocus={onOpen}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`${open ? "Close" : "Open"} ${label}`}
      className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--accent) text-(--accent-on) transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-(--ink) focus-visible:ring-offset-2 focus-visible:ring-offset-(--field) focus-visible:outline-none motion-reduce:transition-none"
    >
      <Icon
        name="add"
        className={cn("text-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none", open && "rotate-45")}
      />
    </button>
  );
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
    return () => cancelAnimationFrame(raf);
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
