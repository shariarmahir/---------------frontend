"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

  return (
    <div ref={outer} style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}>
      <div className={cn("flex flex-col", pinned ? "sticky top-0 h-svh gap-8 overflow-hidden pt-[calc(var(--ml-header)+1.5rem)] pb-8" : "gap-10 py-20 sm:py-28")}>
        <div className={COLUMN}>{head}</div>
        <motion.ul ref={track} aria-label={label} style={pinned ? { x } : undefined} className={cn("flex gap-6", pinned ? "min-h-0 w-max flex-1 pr-12 pl-[max(3rem,calc((100vw-120rem)/2+3rem))]" : "ml-rail snap-x snap-mandatory overflow-x-auto")}>
          {children}
        </motion.ul>
      </div>
    </div>
  );
}
