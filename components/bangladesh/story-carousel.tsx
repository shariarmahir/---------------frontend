"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { Photo } from "@/data/bangladesh";
import { cn } from "@/lib/utils";
import { PhotoCredit } from "./story-photo";

/** A bare gold arrow, the research home's: no disc, no glass. */
const ARROW =
  "grid size-11 place-items-center rounded-full text-signal-orange transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/**
 * An era's photographs, one at a time: the pictures cross-fade in place,
 * the caption and credit sit under the photo, and two bare gold arrows (or
 * a swipe) step through. It never turns by itself.
 */
export function StoryCarousel({ photos, label }: { photos: Photo[]; label: string }) {
  const [i, setI] = useState(0);
  const swipeFrom = useRef<number | null>(null);
  const n = photos.length;
  const step = (d: 1 | -1) => setI((x) => (x + d + n) % n);
  const p = photos[i];

  return (
    <div role="group" aria-roledescription="carousel" aria-label={label}>
      <div
        className="relative aspect-4/3 touch-pan-y overflow-hidden rounded-3xl bg-bdnavy-900 ring-1 ring-white/12"
        onPointerDown={(e) => (swipeFrom.current = e.clientX)}
        onPointerUp={(e) => {
          const dx = swipeFrom.current === null ? 0 : e.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (n > 1 && Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
        }}
      >
        {photos.map((ph, k) => (
          <Image
            key={ph.src}
            src={ph.src}
            alt={ph.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            aria-hidden={k !== i}
            draggable={false}
            className={cn(
              "object-cover transition-[opacity,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              k === i ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
            )}
            style={ph.focus ? { objectPosition: ph.focus } : undefined}
          />
        ))}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div aria-live="polite" className="min-w-0">
          <p className="text-sm leading-snug font-semibold text-white">{p.alt}</p>
          <PhotoCredit photo={p} className="mt-1.5" />
        </div>
        {n > 1 && (
          <div className="-mt-2.5 flex shrink-0 items-center">
            <button type="button" onClick={() => step(-1)} aria-label="Previous photograph" className={ARROW}>
              <Icon name="arrow_back" className="text-2xl!" />
            </button>
            <span className="min-w-10 text-center text-sm text-white/65 tabular-nums">
              {i + 1} / {n}
            </span>
            <button type="button" onClick={() => step(1)} aria-label="Next photograph" className={ARROW}>
              <Icon name="arrow_forward" className="text-2xl!" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
