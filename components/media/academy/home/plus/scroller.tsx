"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** A sideways row that knows whether it can move left or right, and moves a page at a time. */
export function useScroller<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const page = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  }, []);

  return { ref, edge, page };
}

/** The pair of round arrows a course site puts beside a row. */
export function ArrowPair({ edge, page, label, className }: { edge: { start: boolean; end: boolean }; page: (dir: 1 | -1) => void; label: string; className?: string }) {
  const btn =
    "grid size-10 place-items-center rounded-full bg-white text-m-blue shadow-m-ink ring-1 ring-m-ink/12 transition-[background-color,opacity,scale] duration-200 hover:bg-m-blue hover:text-m-on active:scale-95 disabled:pointer-events-none disabled:opacity-35";
  return (
    <div className={cn("flex gap-2", className)}>
      <button type="button" onClick={() => page(-1)} disabled={edge.start} className={btn} aria-label={`${label} — আগের`}>
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button type="button" onClick={() => page(1)} disabled={edge.end} className={btn} aria-label={`${label} — পরের`}>
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}
