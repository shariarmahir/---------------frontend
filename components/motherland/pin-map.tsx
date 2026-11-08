"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { MAP_HEIGHT, MAP_WIDTH, divisionShapes } from "@/data/bangladesh-map";
import { RIVERS } from "@/data/bangladesh-rivers";
import type { Place } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { useRhythm } from "./rhythm";

/**
 * The reference site's pin map, drawn on Bangladesh as a small atlas: the
 * eight divisions in soft greens with their names, the great rivers in blue
 * with a glint running down them (data/bangladesh-rivers.ts, clipped to the
 * land), the Bay of Bengal along the foot, a pin on each place, and the
 * chosen place told beside the map (under it on a phone). On the page's shared beat it travels from
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
      className="grid items-center gap-10 overflow-hidden rounded-4xl bg-linear-to-br from-white via-white to-ml-mint p-6 shadow-[0_30px_60px_-40px_rgb(11_24_73/0.35)] ring-1 ring-ml-ink/10 sm:p-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:p-14"
    >
      <div className="relative mx-auto aspect-600/842 w-full max-w-md">
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden className="ml-atlas absolute inset-0 size-full overflow-visible">
          <defs>
            <radialGradient id="ml-atlas-sea" gradientUnits="userSpaceOnUse" cx={MAP_WIDTH * 0.55} cy={MAP_HEIGHT * 0.95} r={MAP_HEIGHT * 0.42}>
              <stop offset="0" className="ml-atlas-sea-stop" stopOpacity="0.95" />
              <stop offset="0.55" className="ml-atlas-sea-stop" stopOpacity="0.45" />
              <stop offset="1" className="ml-atlas-sea-stop" stopOpacity="0" />
            </radialGradient>
            <clipPath id="ml-atlas-land">
              {divisionShapes.map((d) => (
                <path key={d.id} d={d.d} />
              ))}
            </clipPath>
          </defs>
          <rect x={-MAP_WIDTH * 0.4} y={MAP_HEIGHT * 0.4} width={MAP_WIDTH * 1.8} height={MAP_HEIGHT} fill="url(#ml-atlas-sea)" />
          <g className="ml-atlas-land">
            {divisionShapes.map((d) => (
              <path key={d.id} d={d.d} className="ml-atlas-division" strokeWidth={1.6} strokeLinejoin="round" />
            ))}
          </g>
          <g clipPath="url(#ml-atlas-land)" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {RIVERS.map((r) => (
              <g key={r.d.slice(0, 24)}>
                <path d={r.d} className="ml-atlas-river-bank" strokeWidth={r.width + 3} />
                <path d={r.d} className="ml-atlas-river" strokeWidth={r.width} />
                {r.width > 2 && <path d={r.d} pathLength={100} className="ml-current ml-atlas-glint" strokeWidth={r.width * 0.6} />}
              </g>
            ))}
          </g>
          {divisionShapes.map((d) => (
            <text key={d.id} x={d.cx} y={d.cy} textAnchor="middle" className="ml-atlas-label">
              {d.id[0].toUpperCase() + d.id.slice(1)}
            </text>
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
        <h3 className="text-3xl font-extrabold tracking-[-0.03em] text-ml-ink sm:text-4xl">{place.name}</h3>
        <p className="max-w-xl text-lg leading-relaxed text-ml-ink/80">{place.text}</p>
      </article>
    </div>
  );
}
