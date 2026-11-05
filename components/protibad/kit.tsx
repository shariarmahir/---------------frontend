"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import type { CrimeKind, WireItem } from "@/lib/tv-wall/core";

/** Crime kinds in plain English, for the live wire's chips and bars. */
export const KIND_LABEL: Record<CrimeKind, string> = {
  murder: "Murder",
  rape: "Rape and sexual violence",
  abduction: "Abduction and trafficking",
  robbery: "Robbery and extortion",
  assault: "Assault",
  drugs: "Drugs",
  fraud: "Fraud",
  arrest: "Arrests",
  other: "Other",
};

export const KIND_ICON: Record<CrimeKind, string> = {
  murder: "skull",
  rape: "front_hand",
  abduction: "person_search",
  robbery: "wallet",
  assault: "sports_mma",
  drugs: "medication",
  fraud: "phishing",
  arrest: "local_police",
  other: "report",
};

/** A wire item's kind: its crime kind, or corruption. */
export const kindLabel = (i: WireItem) => (i.category === "corruption" ? "Corruption" : KIND_LABEL[i.crimeKind ?? "other"]);
export const kindIcon = (i: WireItem) => (i.category === "corruption" ? "gavel" : KIND_ICON[i.crimeKind ?? "other"]);

const RM = "(prefers-reduced-motion: reduce)";
export function useReducedMotion() {
  return useSyncExternalStore(
    (fn) => {
      const mq = window.matchMedia(RM);
      mq.addEventListener("change", fn);
      return () => mq.removeEventListener("change", fn);
    },
    () => window.matchMedia(RM).matches,
    () => false,
  );
}

/** True once the element has come on screen (and stays true), so a chart draws itself once. */
export function useSeen<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen];
}

/** A figure that runs up to its value in under a second once `run` is true. */
export function CountUp({ to, run = true, ms = 900 }: { to: number; run?: boolean; ms?: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setN(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, run, reduce, ms]);
  const value = reduce ? to : run ? n : 0;
  return <>{value.toLocaleString("en-US")}</>;
}

/*
 * Small readings of the wire, kept here rather than imported from
 * lib/tv-wall/core.ts: that module builds its place index (and pulls in the
 * 120 KB district outlines) the moment it loads, which the page's first view
 * does not need.
 */

/** "5 min ago". */
export function ago(ms: number, now: number): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86_400);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/** Thousands with commas: 4,114. */
export const fmt = (n: number) => n.toLocaleString("en-US");

/** Outlets sometimes name themselves by their address; show the site instead. */
export function sourceName(source: string): string {
  const s = source.trim();
  if (!/^https?:\/\//i.test(s)) return s;
  try {
    return new URL(s).hostname.replace(/^www\./, "");
  } catch {
    return s;
  }
}

/** Reports per hour over the last `hours` hours, oldest first. */
export function perHour(items: WireItem[], now: number, hours = 24): number[] {
  const bins = Array.from({ length: hours }, () => 0);
  for (const i of items) {
    const ago = Math.floor((now - i.publishedAt) / 3_600_000);
    if (ago >= 0 && ago < hours) bins[hours - 1 - ago]++;
  }
  return bins;
}

/** How many items fall under each key, most first. */
export function tally<K extends string>(items: WireItem[], key: (i: WireItem) => K | null): { key: K; count: number }[] {
  const counts = new Map<K, number>();
  for (const i of items) {
    const k = key(i);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts].map(([k, count]) => ({ key: k, count })).sort((a, b) => b.count - a.count);
}

/** The time, ticking every 30 seconds after hydration (null before), so "5 min ago" stays true without reading the clock in render. */
export function useClock(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 30_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return now;
}
