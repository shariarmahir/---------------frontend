"use client";

import { useState } from "react";
import { LINK, Section } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { divisions, landmarks, type Division, type Landmark } from "@/data/bangladesh-history";
import { MAP_HEIGHT, MAP_SOURCE, MAP_WIDTH, divisionShapes, project } from "@/data/bangladesh-map";
import { cn } from "@/lib/utils";
import { PhotoCredit, StoryPhoto } from "./story-photo";

const KIND_ICON: Record<Landmark["kind"], string> = {
  sea: "beach_access",
  forest: "forest",
  hill: "landscape",
  heritage: "account_balance",
  water: "water",
};

/** Enter or Space on an SVG shape acting as a button. */
const onActivate = (run: () => void) => (e: React.KeyboardEvent) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  run();
};

/**
 * The eight divisions, drawn from real boundaries. Three ways in, all
 * equal: a division on the map, the same from the list under the card, or
 * a pin for one of the best-known places. The card shows the last choice.
 */
export function BdMap() {
  const [selected, setSelected] = useState<Division["id"]>("dhaka");
  const [pin, setPin] = useState<Landmark | null>(null);
  const division = divisions.find((d) => d.id === selected) ?? divisions[0];
  const choose = (id: Division["id"]) => {
    setSelected(id);
    setPin(null);
  };
  const photo = pin ? pin.photo : division.photo;

  return (
    <Section
      id="divisions"
      title="Eight divisions, 64 districts, one country"
      lede="Choose a division on the map or from the list, or a pin to see some of the country's best-known places."
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="story-reveal rounded-3xl bg-bdnavy-900 p-4 ring-1 ring-white/12 sm:p-8 lg:col-span-7">
          <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="mx-auto h-auto w-full max-w-xl overflow-visible" role="group" aria-label="Map of Bangladesh by division">
            {divisionShapes.map((s) => {
              const d = divisions.find((x) => x.id === s.id)!;
              const on = s.id === selected && !pin;
              return (
                <path
                  key={s.id}
                  d={s.d}
                  pathLength={1}
                  role="button"
                  tabIndex={0}
                  aria-label={`${d.name} division`}
                  aria-pressed={on}
                  onClick={() => choose(s.id)}
                  onKeyDown={onActivate(() => choose(s.id))}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  className={cn(
                    "story-draw cursor-pointer stroke-bdnavy-900 outline-none transition-[fill] duration-300 focus-visible:stroke-white motion-reduce:transition-none",
                    on ? "fill-signal-orange" : "fill-cobalt hover:fill-bdnavy-500 focus-visible:fill-bdnavy-500",
                  )}
                />
              );
            })}

            {divisionShapes.map((s) => (
              <text
                key={`${s.id}-name`}
                x={s.cx}
                y={s.cy}
                textAnchor="middle"
                className={cn(
                  "pointer-events-none font-grotesk text-2xl font-bold",
                  s.id === selected && !pin ? "fill-text-primary" : "fill-white",
                )}
              >
                {divisions.find((x) => x.id === s.id)?.name}
              </text>
            ))}

            {landmarks.map((l) => {
              const { x, y } = project(l.lat, l.lon);
              const on = pin?.id === l.id;
              const flipLabel = x > MAP_WIDTH * 0.6;
              const w = l.name.length * 12 + 28;
              return (
                <g
                  key={l.id}
                  transform={`translate(${x} ${y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${l.name}: show its photograph`}
                  aria-pressed={on}
                  onClick={() => setPin(l)}
                  onKeyDown={onActivate(() => setPin(l))}
                  className="group/pin cursor-pointer outline-none"
                >
                  <circle r="22" className="fill-transparent" />
                  <circle
                    r={on ? 11 : 9}
                    strokeWidth={3}
                    className={cn(
                      "stroke-bdnavy-900 transition-[fill] motion-reduce:transition-none group-hover/pin:fill-signal-orange group-focus-visible/pin:fill-signal-orange",
                      on ? "fill-signal-orange" : "fill-white",
                    )}
                  />
                  <circle r="16" fill="none" strokeWidth={2} className="stroke-white opacity-0 group-focus-visible/pin:opacity-100" />
                  <g className={cn("transition-opacity motion-reduce:transition-none", on ? "opacity-100" : "opacity-0 group-hover/pin:opacity-100 group-focus-visible/pin:opacity-100")}>
                    <rect x={flipLabel ? -w - 18 : 18} y="-18" rx="8" height="36" width={w} className="fill-black" />
                    <text x={flipLabel ? -w - 4 : 32} y="7" className="fill-white font-grotesk text-xl font-semibold">
                      {l.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-full bg-white ring-2 ring-bdnavy-900" /> A place to see
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-sm bg-signal-orange" /> Your choice
            </span>
          </div>
        </div>

        <div className="lg:sticky lg:top-[calc(var(--spacing-header-lg)+2rem)] lg:col-span-5">
          <article
            key={pin?.id ?? division.id}
            className="overflow-hidden rounded-3xl bg-text-primary ring-1 ring-white/12 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500"
          >
            <StoryPhoto photo={photo} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-16/10" hideCredit />
            <div className="p-6 sm:p-8">
              {pin ? (
                <>
                  <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
                    <Icon name={KIND_ICON[pin.kind]} className="text-xl! text-signal-orange" />A place to see
                  </p>
                  <h3 className="mt-2 font-grotesk text-3xl font-bold text-signal-orange">{pin.name}</h3>
                  <p className="mt-2 text-base text-white/80">{photo.alt}.</p>
                  <button
                    type="button"
                    onClick={() => setPin(null)}
                    className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-semibold text-signal-orange hover:underline focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                  >
                    <Icon name="arrow_back" className="text-lg!" />
                    Back to {division.name} division
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-grotesk text-3xl font-bold text-signal-orange">{division.name}</h3>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white tabular-nums">{division.districts} districts</span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-white">{division.tagline}</p>
                  <p className="mt-2 text-base leading-relaxed text-white/80">{division.body}</p>
                  <ul aria-label={`Places in ${division.name}`} className="mt-5 flex flex-wrap gap-2">
                    {division.highlights.map((h) => (
                      <li key={h} className="rounded-full px-3 py-1 text-sm text-white/80 ring-1 ring-white/12">
                        {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <PhotoCredit photo={photo} className="mt-6 border-t border-white/12 pt-4" />
            </div>
          </article>

          <div role="group" aria-label="Divisions" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {divisions.map((d) => {
              const on = d.id === selected && !pin;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => choose(d.id)}
                  aria-pressed={on}
                  className={cn(
                    "min-h-11 rounded-xl px-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none motion-reduce:transition-none",
                    on ? "bg-signal-orange text-text-primary" : "bg-bdnavy-900 text-white ring-1 ring-white/12 hover:text-signal-orange hover:ring-signal-orange",
                  )}
                >
                  {d.name}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-white/65">
            Boundaries:{" "}
            <a href={MAP_SOURCE.url} target="_blank" rel="noopener noreferrer" className={LINK}>
              {MAP_SOURCE.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            · {MAP_SOURCE.license}
          </p>
        </div>
      </div>
    </Section>
  );
}
