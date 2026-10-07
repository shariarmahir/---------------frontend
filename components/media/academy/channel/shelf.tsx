"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One row on a channel's home: a title, "▶ সব চালান", a line about it, and
 * cards that scroll sideways, with round arrows on wider screens once the
 * row runs past the edge.
 */
export function Shelf({
  title,
  playAll,
  about,
  eyebrow,
  children,
  tall,
  className,
}: {
  title: React.ReactNode;
  playAll?: string;
  about?: React.ReactNode;
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  /** Tall cards (shorts): the arrows sit lower, at the picture's middle. */
  tall?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  function go(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  }

  const arrow = "absolute z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-m-card text-m-ink shadow-[0_8px_24px_-6px_rgb(16_24_40/0.27)] ring-1 ring-m-ink/17 transition-[opacity,background-color] hover:bg-m-blue-soft sm:grid";

  return (
    <section className={cn("border-b border-m-ink/9 pb-7", className)}>
      {eyebrow && <p className="mb-1 text-xs font-semibold text-m-blue">{eyebrow}</p>}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <h3 className="text-lg font-bold text-m-ink sm:text-xl">{title}</h3>
        {playAll && (
          <Link href={playAll} className="group inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-m-ink transition-colors hover:bg-m-ink/6">
            <Play className="size-4 fill-current transition-transform group-hover:scale-110 motion-reduce:transition-none" aria-hidden /> সব চালান
          </Link>
        )}
      </div>
      {about && <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-relaxed text-m-ink/65">{about}</p>}

      <div className="relative mt-4">
        {/* Room below the cards (given back by the negative margin) keeps a card's ⋮ menu from being cut off by the sideways scroll. */}
        <ul ref={track} onScroll={measure} className="pointer-events-none -mx-3 -mb-43 flex snap-x snap-mandatory scroll-px-3 gap-4 overflow-x-auto px-3 pb-44 scrollbar-none sm:mx-0 sm:scroll-px-0 sm:px-0">
          {children}
        </ul>
        <button type="button" onClick={() => go(-1)} aria-label="আগের ভিডিও" tabIndex={-1} className={cn(arrow, tall ? "top-32" : "top-24", "-left-5", edge.start && "pointer-events-none opacity-0")}>
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="পরের ভিডিও" tabIndex={-1} className={cn(arrow, tall ? "top-32" : "top-24", "-right-5", edge.end && "pointer-events-none opacity-0")}>
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </section>
  );
}

/** A card's slot in a shelf: about five across on a wide screen, one and a bit on a phone. */
export function ShelfItem({ children, tall }: { children: React.ReactNode; tall?: boolean }) {
  return (
    <li
      className={cn(
        "pointer-events-auto shrink-0 snap-start",
        tall ? "w-[42vw] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)]" : "w-[78vw] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] 2xl:w-[calc((100%-4rem)/5)]",
      )}
    >
      {children}
    </li>
  );
}
