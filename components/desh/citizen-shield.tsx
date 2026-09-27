"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { CITY_RIGHTS, SHIELD_LAYERS } from "@/data/desh";
import { cn } from "@/lib/utils";

const SIZE = 320;
const C = SIZE / 2;
/** Ring radii, innermost (আমি) first. */
const R = SHIELD_LAYERS.map((_, i) => 34 + i * 22);

/**
 * The citizen shield: six concentric rings from the self to the country.
 * Choosing a ring lights it and everything inside it — a ring only holds
 * when the ones within it hold — and shows that layer's promise.
 */
export function CitizenShield() {
  const [active, setActive] = useState(0);
  const layer = SHIELD_LAYERS[active];

  return (
    <section id="shield" aria-labelledby="shield-title" className="section-band-tinted scroll-mt-40 overflow-hidden bg-bdgreen-950 text-white">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="story-reveal max-w-3xl">
          <h2 id="shield-title" className="font-bengali text-3xl leading-tight font-bold text-balance sm:text-4xl">
            নাগরিক <span className="text-signal-orange [text-shadow:0_0_24px_rgb(228_176_39/0.5)]">ঢাল</span> — নিজের এলাকা, নিজের শহর, নিজের দেশ
          </h2>
          <p className="mt-3 font-bengali text-lg leading-relaxed text-emerald-50/85">
            জাতীয় সংকটের আক্রমণ ঠেকানোর ঢাল তৈরি হয় ভেতর থেকে বাইরে। প্রতিটি স্তরে দায়িত্ব, আর প্রতিটি স্তরে দয়া — একটি স্তর টিকলে তবেই তার বাইরেরটি টেকে।
          </p>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="mx-auto w-full max-w-sm">
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
                      className={cn("transition-all duration-500 motion-reduce:transition-none", lit ? "fill-bdgreen-800/70" : "fill-bdgreen-900/40")}
                      stroke={i === active ? "var(--color-signal-orange)" : lit ? "rgb(52 211 153 / 0.6)" : "rgb(255 255 255 / 0.12)"}
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

          <div>
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
                    "min-h-10 rounded-full border px-4 font-bengali text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
                    i === active ? "border-signal-orange bg-signal-orange text-text-primary" : "border-white/20 text-emerald-50/85 hover:border-white/50 hover:text-white",
                  )}
                >
                  {l.ring}
                </button>
              ))}
            </div>

            <div id="shield-panel" role="tabpanel" aria-labelledby={`shield-tab-${layer.id}`} aria-live="polite" className="mt-6 rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <h3 className="font-bengali text-2xl font-bold text-signal-orange">{layer.title}</h3>
              <p className="mt-3 font-bengali text-xl leading-relaxed font-semibold text-white">“{layer.promise}”</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                {layer.acts.map((act) => (
                  <li key={act} className="flex items-start gap-2 rounded-xl bg-bdgreen-900/60 p-3 font-bengali text-[15px] leading-snug text-emerald-50">
                    <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-xs bg-bdgreen-500" />
                    {act}
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-start gap-2 font-bengali text-[15px] leading-relaxed text-emerald-50/85">
                <Icon name="favorite" filled className="mt-0.5 text-[18px] text-national-crimson" />
                {layer.kindness}
              </p>
            </div>
          </div>
        </div>

        {/* City rights — what the city owes, and our part in keeping it. */}
        <div className="mt-16">
          <h3 className="font-bengali text-2xl font-bold">নগর অধিকার: দয়া নয়, প্রাপ্য — আর রক্ষার দায় আমাদেরও</h3>
          <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {CITY_RIGHTS.map((r) => (
              <li key={r.right} className="bg-bdgreen-950 p-5 transition-colors hover:bg-bdgreen-900">
                <p className="flex items-center gap-2 font-bengali text-lg font-bold text-white">
                  <Icon name={r.icon} className="text-[22px] text-signal-orange" /> {r.right}
                </p>
                <p className="mt-2 font-bengali text-[15px] leading-relaxed text-emerald-50/85">{r.what}</p>
                <p className="mt-3 font-bengali text-sm leading-relaxed text-emerald-200">
                  <span className="font-semibold text-white">আমার ভাগ: </span>
                  {r.myPart}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
