"use client";

import { useState } from "react";
import Image from "next/image";
import { MAP_HEIGHT, MAP_WIDTH, divisionShapes, project } from "@/data/bangladesh-map";
import type { MapPin } from "@/data/motherland-blocks";
import { cn } from "@/lib/utils";
import { RiseText } from "./rise-text";

/** The country in outline with a pin on each place; the chosen one is told beside it, and the list works without the map. */
export function PinBoard({ pins }: { pins: MapPin[] }) {
  const [chosen, setChosen] = useState(pins[0].id);
  const pin = pins.find((p) => p.id === chosen) ?? pins[0];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 rounded-[1.25rem] bg-white p-5 text-ml-ink ring-1 ring-ml-ink/8 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-12 lg:p-10">
      <div className="relative mx-auto aspect-600/842 w-full max-w-sm">
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden className="absolute inset-0 size-full">
          {divisionShapes.map((d) => (
            <path key={d.id} d={d.d} className="fill-ml-ground stroke-ml-navy/30" strokeWidth={1.5} strokeLinejoin="round" />
          ))}
        </svg>
        {pins.map((p) => {
          const at = project(p.lat, p.lon);
          const on = p.id === pin.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-label={`${p.name}, ${p.place}`}
              aria-pressed={on}
              onClick={() => setChosen(p.id)}
              style={{ left: `${(at.x / MAP_WIDTH) * 100}%`, top: `${(at.y / MAP_HEIGHT) * 100}%` }}
              className={cn("absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-ml-navy", on && "z-10")}
            >
              <span className={cn("block rounded-full ring-2 ring-white transition-all duration-300 motion-reduce:transition-none", on ? "size-5 bg-signal-orange" : "size-3 bg-ml-navy hover:bg-signal-orange")} />
            </button>
          );
        })}
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <article key={pin.id} aria-live="polite" className="ml-fade-in flex flex-col overflow-hidden rounded-2xl bg-ml-navy text-white">
          {pin.picture ? (
            <div className="relative aspect-16/9 w-full overflow-hidden bg-ml-mist">
              <Image src={pin.picture.src} alt={pin.picture.alt} fill sizes="(min-width: 1024px) 46vw, 92vw" className="object-cover" style={{ objectPosition: pin.picture.focus }} />
              {pin.tag ? <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-full bg-signal-orange px-4 py-1.5 text-sm font-semibold text-ml-navy">{pin.tag}</span> : null}
            </div>
          ) : null}
          <div className="flex flex-col gap-2 p-6 sm:p-7">
            <RiseText as="h3" now text={pin.name} className="w-full font-ml-sans font-extrabold text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.1] tracking-[-0.03em]" />
            <p className="font-semibold text-white/75">{pin.place}</p>
            <p className="leading-relaxed text-pretty text-white/90">{pin.text}</p>
          </div>
        </article>
        <ul className="grid gap-1.5 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
          {pins.map((p) => (
            <li key={p.id}>
              <button type="button" aria-pressed={p.id === pin.id} onClick={() => setChosen(p.id)} className={cn("w-full rounded-xl px-4 py-2.5 text-left font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ml-navy", p.id === pin.id ? "bg-signal-orange" : "bg-ml-ground hover:bg-signal-orange/40")}>
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
