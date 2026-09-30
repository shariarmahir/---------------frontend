"use client";

import { useState } from "react";
import { StoryHeading } from "@/components/bangladesh/story-heading";
import { Icon } from "@/components/ui/icon";
import { SignalSeam } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { CITY_RIGHTS, SHIELD_LAYERS } from "@/data/desh";
import { cn } from "@/lib/utils";

const SIZE = 320;
const C = SIZE / 2;
/** Ring radii, innermost (আমি) first. */
const R = SHIELD_LAYERS.map((_, i) => 34 + i * 22);

/**
 * The citizen shield: six concentric rings from the self to the country.
 * Choosing a ring lights it and everything inside it — a ring only holds
 * when the ones within it hold — and shows that layer's promise. An ink band
 * with the header's gold pulse on its seam; the promise is a solid gold card.
 */
export function CitizenShield() {
  const [active, setActive] = useState(0);
  const layer = SHIELD_LAYERS[active];

  return (
    <section id="shield" aria-labelledby="shield-title" className="section-band-tinted relative isolate scroll-mt-40 overflow-hidden bg-text-primary text-white">
      <SignalSeam className="top-0" />
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          id="shield-title"
          index="০২"
          kicker="নাগরিক ঢাল"
          title="নাগরিক ঢাল — নিজের এলাকা, নিজের শহর, নিজের দেশ"
          accent="ঢাল"
          lede="জাতীয় সংকটের আক্রমণ ঠেকানোর ঢাল তৈরি হয় ভেতর থেকে বাইরে। প্রতিটি স্তরে দায়িত্ব, আর প্রতিটি স্তরে দয়া — একটি স্তর টিকলে তবেই তার বাইরেরটি টেকে।"
        />

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="story-reveal mx-auto w-full max-w-sm">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" aria-hidden>
              {[...R].reverse().map((r, ri) => {
                const i = R.length - 1 - ri;
                const lit = i <= active;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setActive(i)}>
                    <circle
                      cx={C}
                      cy={C}
                      r={r}
                      className={cn("transition-all duration-500 motion-reduce:transition-none", lit ? "fill-bd-green" : "fill-white/5")}
                      stroke={i === active ? "var(--color-signal-orange)" : lit ? "rgb(52 211 153 / 0.6)" : "rgb(255 255 255 / 0.14)"}
                      strokeWidth={i === active ? 2.5 : 1.2}
                      style={i === active ? { filter: "drop-shadow(0 0 10px rgb(228 176 39 / 0.7))" } : undefined}
                    />
                    <text x={C} y={C - r + 14} textAnchor="middle" className={cn("font-bengali text-[11px] font-semibold", lit ? "fill-white" : "fill-white/45")}>
                      {SHIELD_LAYERS[i].ring}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="story-reveal">
            <div role="tablist" aria-label="ঢালের স্তর" className="flex flex-wrap gap-2">
              {SHIELD_LAYERS.map((l, i) => (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  id={`shield-tab-${l.id}`}
                  aria-selected={i === active}
                  aria-controls="shield-panel"
                  onClick={() => setActive(i)}
                  className={cn(
                    "min-h-10 rounded-full px-4 font-bengali text-sm font-semibold transition-[background-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
                    i === active ? "bg-signal-orange text-text-primary" : "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20",
                  )}
                >
                  {l.ring}
                </button>
              ))}
            </div>

            <div
              id="shield-panel"
              role="tabpanel"
              aria-labelledby={`shield-tab-${layer.id}`}
              aria-live="polite"
              className="mt-6 rounded-3xl bg-signal-orange p-6 text-text-primary shadow-[0_28px_48px_-24px_var(--color-signal-orange)] sm:p-8"
            >
              <h3 className="font-bengali text-2xl font-bold">{layer.title}</h3>
              <p className="mt-3 font-bengali text-xl leading-relaxed font-semibold">“{layer.promise}”</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                {layer.acts.map((act) => (
                  <li key={act} className="flex items-start gap-2 rounded-xl bg-text-primary p-3 font-bengali text-[15px] leading-snug text-white">
                    <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-xs bg-signal-orange" />
                    {act}
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-start gap-2 rounded-xl bg-bd-green p-3 font-bengali text-[15px] leading-relaxed text-white">
                <Icon name="favorite" filled className="mt-0.5 shrink-0 text-[18px] text-signal-orange" />
                {layer.kindness}
              </p>
            </div>
          </div>
        </div>

        {/* City rights — what the city owes, and our part in keeping it. */}
        <div className="mt-16">
          <h3 className="story-reveal font-bengali text-2xl font-bold text-signal-orange">নগর অধিকার: দয়া নয়, প্রাপ্য — আর রক্ষার দায় আমাদেরও</h3>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))]">
            {CITY_RIGHTS.map((r, i) => {
              const tone = surfaceAt(i + (i >= 4 ? 1 : 0));
              return (
                <li key={r.right} className="story-reveal flex">
                  <div style={glowStyle(tone.glow)} className={cn("group w-full rounded-3xl p-5 shadow-sm", LIFT, tone.card)}>
                    <p className="flex items-center gap-2 font-bengali text-lg font-bold">
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
                        <Icon name={r.icon} className="text-[20px]" />
                      </span>
                      {r.right}
                    </p>
                    <p className="mt-3 font-bengali text-[15px] leading-relaxed">{r.what}</p>
                    <p className="mt-3 border-t border-current/20 pt-3 font-bengali text-sm leading-relaxed">
                      <span className="font-bold">আমার ভাগ: </span>
                      {r.myPart}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
