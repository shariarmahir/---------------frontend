"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LayoutGrid } from "lucide-react";
import { SECTIONS } from "@/data/media/market-sections";
import { cn } from "@/lib/utils";
import { chipClass } from "../ui/field-styles";
import { Num } from "../ui/numerals";
import { SectionIcon } from "./section-icon";

const SPEED = 28; // px/s

/**
 * The বিভাগ chip row. "সব বিভাগ" is a fixed button — it never scrolls away —
 * that opens the full category browser; the section chips beside it scroll
 * themselves in a seamless loop. The list is duplicated once, and the
 * strip jumps back by exactly one copy's width whenever it passes the
 * seam, so the loop never visibly resets. Hovering, touching or focusing a
 * chip pauses it; `prefers-reduced-motion` turns the loop off entirely.
 */
export function SectionRail({ baseParams, sec, sectionCounts, onBrowse }: { baseParams: Record<string, string | undefined>; sec?: string; sectionCounts: Record<string, number>; onBrowse: () => void }) {
  const track = useRef<HTMLUListElement>(null);
  const paused = useRef(false);

  const href = (s?: string) => {
    const q = new URLSearchParams(Object.entries({ ...baseParams, sec: s }).filter(([, v]) => v) as [string, string][]);
    const query = q.toString();
    return query ? `/media/market?${query}` : "/media/market";
  };

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const half = () => el.scrollWidth / 2;
    let x = el.scrollLeft % half();
    let last = performance.now();
    let frame = requestAnimationFrame(tick);
    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused.current) {
        x = (x + SPEED * dt) % half();
        el!.scrollLeft = x;
      } else {
        x = el!.scrollLeft % half();
      }
      frame = requestAnimationFrame(tick);
    }
    const pause = () => (paused.current = true);
    const resume = () => (paused.current = false);
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);
    el.addEventListener("focusin", pause);
    el.addEventListener("focusout", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
      el.removeEventListener("focusin", pause);
      el.removeEventListener("focusout", resume);
      el.removeEventListener("touchstart", pause);
    };
  }, []);

  const chip = (s: (typeof SECTIONS)[number], dup?: boolean) => (
    <li key={dup ? `${s.id}-dup` : s.id} aria-hidden={dup || undefined}>
      <Link href={href(sec === s.id ? undefined : s.id)} scroll={false} tabIndex={dup ? -1 : undefined} aria-current={!dup && sec === s.id ? "page" : undefined} className={cn(chipClass(!dup && sec === s.id), "shrink-0")}>
        <SectionIcon icon={s.icon} className="size-3.5" />
        {s.bn}
        {(sectionCounts[s.id] ?? 0) > 0 && <span className="text-[10px] opacity-70">(<Num value={(sectionCounts[s.id] ?? 0)} />)</span>}
      </Link>
    </li>
  );

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onBrowse} aria-haspopup="dialog" className={cn(chipClass(false), "shrink-0 border-m-blue bg-m-yellow text-m-ink hover:text-m-ink")}>
        <LayoutGrid className="size-3.5" aria-hidden />
        সব বিভাগ
      </button>
      <ul ref={track} className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto scrollbar-none">
        {SECTIONS.map((s) => chip(s))}
        {SECTIONS.map((s) => chip(s, true))}
      </ul>
    </div>
  );
}
