"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { SEASONS, placeById, type Season } from "@/data/motherland-travel";
import { seasonAt } from "@/lib/motherland-crowd";
import { cn } from "@/lib/utils";
import { pill } from "./kit";
import { useMinute } from "./travel-store";

/* The mind map's drawing board, in the same units as the SVG branches. */
const W = 1200;
const H = 680;
const HUB = { x: W / 2, y: H / 2 };

/** The year runs clockwise from the top right, so the two best seasons sit together. */
const SLOTS = [
  { x: 790, y: 110, side: 1 },
  { x: 830, y: 340, side: 1 },
  { x: 790, y: 570, side: 1 },
  { x: 410, y: 570, side: -1 },
  { x: 370, y: 340, side: -1 },
  { x: 410, y: 110, side: -1 },
];

const branch = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const mid = (a.x + b.x) / 2;
  return `M${a.x} ${a.y}C${mid} ${a.y} ${mid} ${b.y} ${b.x} ${b.y}`;
};

const leavesOf = (slot: (typeof SLOTS)[number]) => [-68, 0, 68].map((dy) => ({ x: slot.x + slot.side * 170, y: slot.y + dy }));

/** "Mid-April to mid-June" inside a sentence, keeping the months' capitals. */
const inSentence = (months: string) => months.charAt(0).toLowerCase() + months.slice(1);

const at = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });

function Detail({ season, now }: { season: Season; now: boolean }) {
  return (
    <div className="grid gap-6 rounded-2xl bg-white/[.07] p-6 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
      <div className="flex flex-col gap-2">
        <h3 className="font-ml-display text-4xl tracking-[0.01em] uppercase sm:text-5xl">
          {season.name} <span lang="bn" className="font-sans font-bold tracking-normal normal-case">{season.nameBn}</span>
        </h3>
        <p className="text-white/75">
          {season.english}, {inSentence(season.months)}
          {now ? ". It's this season now." : ""}
        </p>
        <p className={cn("mt-2 text-2xl leading-snug font-bold", season.pick && "text-signal-orange")}>{season.verdict}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="flex items-center gap-1.5 font-bold">
            <Icon name="visibility" className="text-xl text-signal-orange" />
            What you&apos;ll see
          </h4>
          <p className="mt-2 leading-relaxed text-pretty text-white/85">{season.see}</p>
        </div>
        <div>
          <h4 className="flex items-center gap-1.5 font-bold">
            <Icon name="warning" className="text-xl text-signal-orange" />
            Watch out for
          </h4>
          <p className="mt-2 leading-relaxed text-pretty text-white/85">{season.watch}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * The six seasons as a mind map: the question in the middle, the seasons
 * branching from it in the year's order, and the places each one is best for.
 * On a phone the same branches stack as a tree.
 */
export function SeasonMap() {
  const minute = useMinute();
  const today = minute === null ? null : seasonAt(new Date(minute * 60_000), SEASONS);
  const [chosen, setChosen] = useState<string | null>(null);
  const season = SEASONS.find((s) => s.id === chosen) ?? today ?? SEASONS[3];

  return (
    <div className="flex flex-col gap-8">
      {/* Wide screens: the map itself */}
      <div className="relative hidden aspect-[1200/680] w-full lg:block">
        <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" fill="none">
          {SEASONS.map((s, i) => {
            const slot = SLOTS[i];
            const on = s.id === season.id;
            return (
              <g key={s.id} className="transition-opacity duration-300" opacity={on ? 1 : 0.42}>
                <path d={branch(HUB, slot)} stroke={s.pick ? "#e4b027" : "#fff"} strokeWidth={s.pick ? 3 : 1.5} strokeLinecap="round" />
                {leavesOf(slot).map((leaf, j) => (
                  <path key={j} d={branch({ x: slot.x + slot.side * 96, y: slot.y }, leaf)} stroke={s.pick ? "#e4b027" : "#fff"} strokeWidth={1.25} strokeLinecap="round" />
                ))}
              </g>
            );
          })}
        </svg>

        <div className="absolute grid aspect-square w-[15%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-signal-orange p-3 text-center text-ml-ink" style={at(HUB.x, HUB.y)}>
          <div>
            <p className="font-ml-display text-[clamp(1.25rem,2.2vw,2.25rem)] leading-tight uppercase">When to come</p>
            {today ? <p className="mt-1 text-sm font-semibold">Now: {today.name}</p> : null}
          </div>
        </div>

        {SEASONS.map((s, i) => {
          const slot = SLOTS[i];
          const on = s.id === season.id;
          return (
            <div key={s.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setChosen(s.id)}
                className={cn("group absolute isolate flex aspect-[192/120] w-[16%] -translate-x-1/2 -translate-y-1/2 flex-col justify-end overflow-hidden rounded-xl p-2.5 text-left text-white transition-[box-shadow,scale] duration-300 hover:scale-[1.03] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none", on ? "shadow-[0_0_0_3px_var(--color-signal-orange)]" : "shadow-[0_0_0_1px_rgb(255_255_255/0.2)]")}
                style={at(slot.x, slot.y)}
              >
                <Image src={s.picture.src} alt="" fill sizes="16vw" className="-z-20 object-cover" style={{ objectPosition: s.picture.focus }} />
                <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
                {s.pick ? <span className="absolute top-2 left-2 rounded-full bg-signal-orange px-2 py-0.5 text-xs font-bold text-ml-ink">Best time</span> : null}
                <span className="font-ml-display text-[clamp(1.1rem,1.7vw,1.75rem)] leading-none tracking-[0.01em] uppercase">{s.name}</span>
                <span className="text-xs font-semibold text-white/90">{s.english}</span>
              </button>
              {s.places.map((id, j) => {
                const place = placeById(id)!;
                const leaf = leavesOf(slot)[j];
                return (
                  <a
                    key={id}
                    href={`#place=${id}`}
                    className={cn("absolute flex w-[17%] -translate-y-1/2 items-center gap-2 rounded-full bg-white/10 p-1 text-sm leading-tight font-semibold transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-white", slot.side === 1 ? "flex-row" : "-translate-x-full flex-row-reverse text-right", !on && "opacity-85")}
                    style={at(leaf.x, leaf.y)}
                  >
                    <span className="relative size-8 shrink-0 overflow-hidden rounded-full">
                      <Image src={place.picture.src} alt="" fill sizes="32px" className="object-cover" style={{ objectPosition: place.picture.focus }} />
                    </span>
                    <span className="min-w-0 pr-2">{place.name}</span>
                  </a>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Phones and tablets: the same branches as a tree */}
      <ol className="flex flex-col gap-3 border-l-2 border-signal-orange pl-4 lg:hidden">
        {SEASONS.map((s) => {
          const on = s.id === season.id;
          return (
            <li key={s.id} className="flex flex-col gap-3">
              <button type="button" aria-expanded={on} onClick={() => setChosen(s.id)} className={cn("relative isolate flex min-h-24 items-end justify-between gap-3 overflow-hidden rounded-xl p-4 text-left text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white", on && "shadow-[0_0_0_3px_var(--color-signal-orange)]")}>
                <Image src={s.picture.src} alt="" fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: s.picture.focus }} />
                <span aria-hidden className="absolute inset-0 -z-10 bg-black/55" />
                <span>
                  <span className="block font-ml-display text-3xl leading-none tracking-[0.01em] uppercase">{s.name}</span>
                  <span className="mt-1 block text-sm font-semibold">{s.english}, {inSentence(s.months)}</span>
                </span>
                {s.pick ? <span className="shrink-0 rounded-full bg-signal-orange px-2.5 py-1 text-xs font-bold text-ml-ink">Best time</span> : null}
              </button>
              {on ? (
                <ul className="flex flex-col gap-2">
                  {s.places.map((id) => {
                    const place = placeById(id)!;
                    return (
                      <li key={id}>
                        <a href={`#place=${id}`} className="flex min-h-11 items-center gap-2 rounded-full bg-white/10 p-1 pr-4 font-semibold focus-visible:outline-2 focus-visible:outline-white">
                          <span className="relative size-9 shrink-0 overflow-hidden rounded-full">
                            <Image src={place.picture.src} alt="" fill sizes="36px" className="object-cover" style={{ objectPosition: place.picture.focus }} />
                          </span>
                          {place.name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div aria-live="polite">
        <Detail season={season} now={season.id === today?.id} />
      </div>

      <a href="#map" className={cn(pill.onDark, "self-start")}>
        <Icon name="map" className="text-xl" />
        See it all on the map
      </a>
    </div>
  );
}
