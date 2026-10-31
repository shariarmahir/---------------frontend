"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { COLUMN } from "./kit";
import { useRhythm } from "./rhythm";

/**
 * A row of cards that runs off the right edge of the page, as on the
 * reference site: it starts on the column's left edge, snaps card by card
 * and scrolls by touch or trackpad. On the page's shared beat it moves on
 * one card by itself, back to the first after the last. `head` is the
 * section heading, with its button beside the title.
 */
export function Rail({ head, label, children }: { head: ReactNode; label: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  /** The scroll positions a card can start at. */
  const [stops, setStops] = useState<number[]>([0]);
  const [active, setActive] = useState(0);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const inset = parseFloat(getComputedStyle(el).paddingLeft);
    const max = el.scrollWidth - el.clientWidth;
    const all = [...el.children].map((card) => Math.round(Math.min(max, Math.max(0, (card as HTMLElement).offsetLeft - inset))));
    const unique = all.filter((x, i) => i === 0 || x - all[i - 1] > 4);
    setStops(unique);
    const nearest = unique.reduce((best, x, i) => (Math.abs(x - el.scrollLeft) < Math.abs(unique[best] - el.scrollLeft) ? i : best), 0);
    setActive(nearest);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const hold = useRhythm(root, active, () => track.current?.scrollTo({ left: stops[(active + 1) % stops.length], behavior: "smooth" }));

  return (
    <div ref={root}>
      <div className={COLUMN}>{head}</div>
      <ul {...hold} ref={track} aria-label={label} className="ml-rail relative mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 sm:gap-8 lg:mt-14">
        {children}
      </ul>
    </div>
  );
}
