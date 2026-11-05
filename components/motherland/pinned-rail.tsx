"use client";

import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { COLUMN } from "./kit";

/**
 * A chapter told sideways: on a large screen the section holds still while its
 * cards slide past with the scroll. On a phone, a short screen or with reduced
 * motion it is an ordinary rail you swipe.
 */
export function PinnedRail({ head, label, children }: { head: ReactNode; label: string; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const [pinned, setPinned] = useState(false);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useEffect(() => {
    const check = () => setPinned(!reduced && window.innerWidth >= 1024 && window.innerHeight >= 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [reduced]);

  useEffect(() => {
    const el = track.current;
    if (!el || !pinned) return;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pinned]);

  /* The stage is clipped so nothing can scroll it sideways and carry the title away. Tabbing to a
     link in a card off-screen therefore moves the page instead, which is what slides the cards. */
  const bringIntoView = (e: FocusEvent<HTMLUListElement>) => {
    const box = outer.current;
    const card = (e.target as HTMLElement).closest("li");
    if (!pinned || !box || !card || !distance) return;
    const wanted = Math.min(distance, Math.max(0, card.offsetLeft - 48));
    window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY + wanted, behavior: "auto" });
  };

  return (
    <div ref={outer} style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}>
      <div className={cn("flex flex-col", pinned ? "sticky top-0 h-svh gap-8 overflow-clip pt-[calc(var(--ml-header)+1.5rem)] pb-8" : "gap-10 py-20 sm:py-28")}>
        <div className={COLUMN}>{head}</div>
        <motion.ul ref={track} aria-label={label} onFocus={bringIntoView} style={pinned ? { x } : undefined} className={cn("flex gap-6", pinned ? "min-h-0 w-max flex-1 pr-12 pl-[max(3rem,calc((100vw-var(--ml-column))/2+3rem))]" : "ml-rail snap-x snap-mandatory overflow-x-auto")}>
          {children}
        </motion.ul>
      </div>
    </div>
  );
}
