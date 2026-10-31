"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { MAP_HEIGHT, MAP_WIDTH, divisionShapes } from "@/data/bangladesh-map";
import type { Place } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { useRhythm } from "./rhythm";

/**
 * The reference site's pin map, drawn on Bangladesh: the eight divisions
 * in outline, a pin on each place, and the chosen place told beside the
 * map (under it on a phone). On the page's shared beat it travels from
 * place to place by itself; choosing a pin hands the tour to the visitor,
 * and it stays where they put it.
 */
export function PinMap({ places }: { places: Place[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(false);
  const place = places[index];
  const hold = useRhythm(root, index, () => setIndex((i) => (i + 1) % places.length), chosen);
  const choose = (i: number) => {
    setChosen(true);
    setIndex(i);
  };

  return (
    <div
      ref={root}
      {...hold}
      className="grid items-center gap-10 rounded-4xl bg-white p-6 ring-1 ring-ml-ink/10 sm:p-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:p-14"
    >
      <div className="relative mx-auto aspect-600/842 w-full max-w-md">
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden className="absolute inset-0 size-full">
          {divisionShapes.map((d) => (
            <path key={d.id} d={d.d} className="fill-ml-ground stroke-ml-mist" strokeWidth={1.5} strokeLinejoin="round" />
          ))}
        </svg>
        <ul aria-label="Places on the map">
          {places.map((p, i) => {
            const on = i === index;
            return (
              <li key={p.id} className={cn("absolute", on && "z-10")} style={{ left: `${(p.at.x / MAP_WIDTH) * 100}%`, top: `${(p.at.y / MAP_HEIGHT) * 100}%` }}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => choose(i)}
                  className={cn(
                    "group relative grid size-11 origin-bottom -translate-x-1/2 translate-y-[-88%] place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)] focus-visible:outline-2 focus-visible:outline-ml-green motion-reduce:transition-none",
                    on ? "scale-125" : "hover:scale-110",
                  )}
                >
                  <svg viewBox="0 0 24 24" aria-hidden className={cn("size-9 drop-shadow-[0_2px_2px_rgb(0_0_0/0.3)] transition-colors duration-500", on ? "text-signal-orange" : "text-ml-ink")}>
                    <path fill="currentColor" stroke="white" strokeWidth="1.2" d="M12 1.8C8 1.8 4.8 5 4.8 9c0 5.4 7.2 13.2 7.2 13.2S19.2 14.4 19.2 9c0-4-3.2-7.2-7.2-7.2Z" />
                    <circle cx="12" cy="9" r="2.6" fill="white" />
                  </svg>
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-full bg-ml-ink px-3 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {p.name}, {p.district}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <article key={place.id} aria-live="polite" className="ml-fade-in flex min-w-0 flex-col gap-5">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-ml-mist">
          <Image src={place.picture.src} alt={place.picture.alt} fill sizes="(min-width: 1024px) 40rem, 90vw" className="object-cover" style={{ objectPosition: place.picture.focus }} />
        </div>
        <h3 className="font-ml-display text-4xl tracking-[0.01em] text-ml-ink uppercase sm:text-5xl">{place.name}</h3>
        <p className="max-w-xl text-lg leading-relaxed text-ml-ink/80">{place.text}</p>
      </article>
    </div>
  );
}
