"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { divisions, landmarks, type Division, type Landmark } from "@/data/bangladesh";
import { MAP_HEIGHT, MAP_SOURCE, MAP_WIDTH, divisionShapes, project } from "@/data/bangladesh-map";
import { cn } from "@/lib/utils";
import { StoryHeading } from "./story-heading";
import { StoryPhoto } from "./story-photo";

const KIND_ICON: Record<Landmark["kind"], string> = {
  sea: "beach_access",
  forest: "forest",
  hill: "landscape",
  heritage: "account_balance",
  water: "water",
  city: "location_city",
};

/**
 * The divisions of Bangladesh, drawn from real boundaries.
 *
 * Three ways in, all equivalent: click or keyboard-select a division on
 * the map, pick it from the list, or tap a landmark pin. The detail card
 * follows whichever was chosen last. Outlines draw themselves on scroll.
 */
export function BdMap() {
  const [selected, setSelected] = useState<Division["id"]>("chattogram");
  const [hovered, setHovered] = useState<Division["id"] | null>(null);
  const [pin, setPin] = useState<Landmark | null>(null);

  const division = divisions.find((d) => d.id === selected) ?? divisions[0];
  const choose = (id: Division["id"]) => {
    setSelected(id);
    setPin(null);
  };

  return (
    <section id="map" className="section-band-tinted scroll-mt-40 border-y border-emerald-100 bg-linear-to-b from-mint-subtle to-white">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          index="০২"
          kicker="মানচিত্র"
          title="আট বিভাগ, চৌষট্টি জেলা, একটি দেশ"
          accent="একটি দেশ"
          lede="মানচিত্রে একটি বিভাগ বেছে নিন, অথবা পিনে চাপ দিয়ে দেখুন দেশের বিখ্যাত জায়গাগুলো।"
        />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* ── Map ─────────────────────────────────────────── */}
          <div className="story-reveal relative lg:col-span-7">
            <div className="relative mx-auto max-w-[560px] rounded-[2rem] border border-emerald-100 bg-white/70 p-4 shadow-elevated backdrop-blur-sm sm:p-6">
              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                className="h-auto w-full"
                role="group"
                aria-label="বাংলাদেশের বিভাগভিত্তিক মানচিত্র"
              >
                <defs>
                  <linearGradient id="bd-active" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00875d" />
                    <stop offset="100%" stopColor="#004731" />
                  </linearGradient>
                  <filter id="bd-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#003d2a" floodOpacity="0.25" />
                  </filter>
                </defs>

                <g filter="url(#bd-shadow)">
                  {divisionShapes.map((s) => {
                    const d = divisions.find((x) => x.id === s.id);
                    const isSel = s.id === selected && !pin;
                    const isHover = s.id === hovered;
                    return (
                      <path
                        key={s.id}
                        d={s.d}
                        pathLength={1}
                        role="button"
                        tabIndex={0}
                        aria-label={`${d?.nameBn ?? s.id} বিভাগ`}
                        aria-pressed={isSel}
                        onClick={() => choose(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            choose(s.id);
                          }
                        }}
                        onMouseEnter={() => setHovered(s.id)}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                          "story-draw cursor-pointer stroke-white transition-[fill] duration-300 outline-none focus-visible:stroke-signal-orange motion-reduce:transition-none",
                          isSel ? "fill-[url(#bd-active)]" : isHover ? "fill-emerald-400" : "fill-emerald-200",
                        )}
                        strokeWidth={isSel ? 3 : 1.6}
                        strokeLinejoin="round"
                      />
                    );
                  })}
                </g>

                {/* Division names. */}
                {divisionShapes.map((s) => {
                  const d = divisions.find((x) => x.id === s.id);
                  const isSel = s.id === selected && !pin;
                  return (
                    <text
                      key={`${s.id}-label`}
                      x={s.cx}
                      y={s.cy}
                      textAnchor="middle"
                      className={cn(
                        "pointer-events-none font-bengali text-[17px] font-bold",
                        isSel ? "fill-white" : "fill-emerald-900",
                      )}
                    >
                      {d?.nameBn}
                    </text>
                  );
                })}

                {/* Landmark pins. */}
                {landmarks.map((l) => {
                  const { x, y } = project(l.lat, l.lon);
                  const active = pin?.id === l.id;
                  return (
                    <g
                      key={l.id}
                      transform={`translate(${x} ${y})`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${l.nameBn} — ছবি দেখুন`}
                      onClick={() => setPin(l)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setPin(l);
                        }
                      }}
                      className="group/pin cursor-pointer outline-none"
                    >
                      <circle r="14" className="fill-national-crimson/25 animate-ping motion-reduce:animate-none" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
                      <circle
                        r={active ? 9 : 7}
                        className={cn(
                          "stroke-white transition-all group-hover/pin:fill-signal-orange group-focus-visible/pin:fill-signal-orange",
                          active ? "fill-signal-orange" : "fill-national-crimson",
                        )}
                        strokeWidth={2.5}
                      />
                      <g className={cn("transition-opacity", active ? "opacity-100" : "opacity-0 group-hover/pin:opacity-100 group-focus-visible/pin:opacity-100")}>
                        <rect x="12" y="-14" rx="8" height="28" width={l.nameBn.length * 11 + 20} className="fill-slate-950/85" />
                        <text x="22" y="5" className="fill-white font-bengali text-[14px] font-semibold">
                          {l.nameBn}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Legend. */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 font-bengali text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-national-crimson" /> দর্শনীয় স্থান</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm bg-bd-green" /> নির্বাচিত বিভাগ</span>
              </div>
            </div>
          </div>

          {/* ── Detail card ─────────────────────────────────── */}
          <div className="story-reveal lg:sticky lg:top-48 lg:col-span-5">
            <article
              key={pin?.id ?? division.id}
              className="animate-in fade-in-0 slide-in-from-bottom-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-elevated duration-500"
            >
              <StoryPhoto
                photo={pin ? pin.photo : division.photo}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[16/10]"
              />
              <div className="p-6">
                {pin ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 font-bengali text-sm font-bold text-national-crimson">
                      <Icon name={KIND_ICON[pin.kind]} className="text-[18px]!" />
                      দর্শনীয় স্থান
                    </span>
                    <h3 className="mt-1 font-bengali text-3xl font-bold text-text-primary">{pin.nameBn}</h3>
                    <button
                      type="button"
                      onClick={() => setPin(null)}
                      className="mt-4 inline-flex items-center gap-1 font-bengali text-sm font-semibold text-bd-green hover:underline"
                    >
                      <Icon name="arrow_back" className="text-[16px]!" />
                      {division.nameBn} বিভাগে ফিরুন
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-bengali text-3xl font-bold text-text-primary">
                        {division.nameBn}
                        <span className="ml-2 font-sans text-sm font-medium text-slate-400">{division.nameEn}</span>
                      </h3>
                      <span className="shrink-0 rounded-full bg-bd-green-light px-3 py-1 font-bengali text-sm font-bold text-bd-green">
                        {division.districts.toLocaleString("bn-BD")} জেলা
                      </span>
                    </div>
                    <p className="mt-1 font-bengali text-base font-semibold text-signal-orange">{division.tagline}</p>
                    <p className="mt-3 font-bengali text-base leading-relaxed text-text-secondary">{division.body}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {division.highlights.map((h) => (
                        <li key={h} className="rounded-full border border-emerald-200 bg-mint-subtle px-3 py-1 font-bengali text-xs font-semibold text-bd-green">
                          {h}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </article>

            {/* Division list — the same choice without the map. */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {divisions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => choose(d.id)}
                  aria-pressed={d.id === selected && !pin}
                  className={cn(
                    "rounded-xl border px-2 py-2 font-bengali text-sm font-semibold transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:hover:translate-y-0",
                    d.id === selected && !pin
                      ? "border-bd-green bg-bd-green text-white shadow-glow-green"
                      : "border-slate-200 bg-white text-slate-700 hover:border-bd-green hover:text-bd-green",
                  )}
                >
                  {d.nameBn}
                </button>
              ))}
            </div>

            <p className="mt-3 text-right font-mono text-[10px] text-slate-400">
              Boundaries: <a href={MAP_SOURCE.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{MAP_SOURCE.name}</a> · {MAP_SOURCE.license}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
