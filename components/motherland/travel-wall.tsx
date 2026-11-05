"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { MAP_HEIGHT, MAP_WIDTH, project } from "@/data/bangladesh-map";
import { STORIES, placeById } from "@/data/motherland-travel";
import { DarkLand } from "./geo-map";

/** One example pin on the travel wall: its note stays folded until opened. Not a real story, and it says so. */
export function WallExample() {
  const [open, setOpen] = useState(false);
  const place = placeById(STORIES.example.placeId)!;
  const { x, y } = project(place.lat, place.lon);

  return (
    <div className="relative mx-auto w-full max-w-xl rounded-2xl bg-white/[.03] p-4 ring-1 ring-white/10">
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full" role="img" aria-label={`A dark map of Bangladesh with one example pin at ${place.name}`}>
        <DarkLand />
        <g transform={`translate(${x} ${y})`}>
          <circle r={12} className="ml-pin-pulse fill-signal-orange/40" />
          <path d="M0 0c-1.4-4-7.5-8.6-7.5-14.5a7.5 7.5 0 0 1 15 0C7.5-8.6 1.4-4 0 0Z" className="fill-signal-orange stroke-black/60" strokeWidth={0.8} />
          <circle cy={-14.5} r={2.6} className="fill-black/70" />
        </g>
      </svg>
      <div className="absolute right-4 bottom-4 w-[min(19rem,calc(100%-2rem))] rounded-xl bg-white p-4 text-ml-ink shadow-[0_24px_48px_-16px_rgb(0_0_0/0.7)]">
        <button type="button" aria-expanded={open} aria-controls="wall-note" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 rounded-sm text-left font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green">
          {STORIES.example.title}: {place.name}
          <Icon name="expand_more" className={open ? "rotate-180 text-2xl transition-transform" : "text-2xl transition-transform"} />
        </button>
        {open ? (
          <p id="wall-note" className="mt-2 text-sm leading-relaxed text-ml-ink/85 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none">
            {STORIES.example.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
