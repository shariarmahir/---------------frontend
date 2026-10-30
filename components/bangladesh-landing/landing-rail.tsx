"use client";

import { useRef, useState, type ReactNode } from "react";
import { ARROW } from "@/components/research/kit";
import { Icon } from "@/components/ui/icon";

/**
 * A horizontal rail of cards (`children` are its <li>s): swipe or scroll
 * on any screen, the bare gold arrows page it a screen at a time, and tab
 * walks its links, which scroll into view on their own.
 */
export function LandingRail({ label, children }: { label: string; children: ReactNode }) {
  const row = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const onScroll = () => {
    const el = row.current;
    if (el) setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  const move = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div>
      <div className="mb-2 flex justify-end gap-1">
        <button type="button" onClick={() => move(-1)} disabled={edge.start} aria-label="Previous cards" className={ARROW}>
          <Icon name="arrow_back" className="text-2xl!" />
        </button>
        <button type="button" onClick={() => move(1)} disabled={edge.end} aria-label="Next cards" className={ARROW}>
          <Icon name="arrow_forward" className="text-2xl!" />
        </button>
      </div>
      {/* pt-2 and pb-8 leave room for the cards' lift and shadow inside the scroller's clip. */}
      <ul
        ref={row}
        onScroll={onScroll}
        aria-label={label}
        data-rail
        className="-mx-gutter-x flex snap-x snap-mandatory scroll-px-gutter-x gap-4 overflow-x-auto px-gutter-x pt-2 pb-8 [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </div>
  );
}
