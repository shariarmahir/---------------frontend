"use client";

import { useState } from "react";
import { StoryHeading } from "@/components/bangladesh/story-heading";
import { Icon } from "@/components/ui/icon";
import { SignalSeam } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { GROUPS } from "@/data/nagorik";
import { cn } from "@/lib/utils";

const BLOCKS = [
  { key: "duties", label: "দায়িত্ব", icon: "assignment_turned_in" },
  { key: "today", label: "আজকের কাজ", icon: "today" },
  { key: "behave", label: "আচরণ", icon: "handshake" },
] as const;

/**
 * Civic responsibility for every kind of person — one tab each, the same
 * five parts for all: duty, today's task, behaviour, a positive mindset,
 * and the one act of bravery the role asks for. An ink band with the
 * header's gold pulse; each part is a solid colour card.
 */
export function Responsibilities() {
  const [active, setActive] = useState(GROUPS[0].id);
  const g = GROUPS.find((x) => x.id === active)!;

  return (
    <section id="responsibility" aria-labelledby="resp-title" className="section-band-tinted relative isolate scroll-mt-40 overflow-hidden bg-text-primary text-white">
      <SignalSeam className="top-0" />
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          id="resp-title"
          index="০৪"
          kicker="দায়িত্ব"
          title="প্রত্যেকের দায়িত্ব — শিশু থেকে প্রবীণ"
          accent="দায়িত্ব"
          lede="দেশ বদলানো কারও একার কাজ নয়। নিজের জায়গাটি বেছে নিন — দায়িত্ব, আজকের কাজ, আচরণ, মানসিকতা আর সাহস।"
        />

        <div role="tablist" aria-label="কার দায়িত্ব" className="no-scrollbar relative flex gap-2 overflow-x-auto pb-2">
          {GROUPS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`resp-tab-${x.id}`}
              aria-selected={x.id === active}
              aria-controls="resp-panel"
              onClick={() => setActive(x.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 font-bengali text-sm font-semibold [-webkit-tap-highlight-color:transparent] touch-manipulation transition-[background-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
                x.id === active ? "bg-signal-orange text-text-primary" : "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20",
              )}
            >
              <Icon name={x.icon} className="text-[20px]" />
              {x.label}
            </button>
          ))}
        </div>

        <div id="resp-panel" role="tabpanel" aria-labelledby={`resp-tab-${g.id}`} key={g.id} className="mt-6 grid gap-4 lg:grid-cols-3">
          {BLOCKS.map((b, i) => {
            const tone = surfaceAt(i);
            return (
              <div key={b.key} style={glowStyle(tone.glow)} className={cn("story-reveal rounded-3xl p-6 shadow-sm", LIFT, tone.card)}>
                <h3 className="flex items-center gap-2 font-bengali text-lg font-bold">
                  <span className={cn("flex size-9 items-center justify-center rounded-xl", tone.tile)}>
                    <Icon name={b.icon} className="text-[20px]" />
                  </span>
                  {b.label}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {g[b.key].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 font-bengali text-[15px] leading-snug">
                      <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-xs bg-current" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div style={glowStyle("var(--color-signal-orange)")} className={cn("story-reveal rounded-3xl bg-black p-6 text-white ring-1 ring-white/12 lg:col-span-1", LIFT)}>
            <h3 className="flex items-center gap-2 font-bengali text-lg font-bold text-signal-orange">
              <Icon name="psychology" className="text-[22px]" /> ইতিবাচক মানসিকতা
            </h3>
            <p className="mt-3 font-bengali text-[15px] leading-relaxed">{g.mindset}</p>
          </div>
          <div style={glowStyle("var(--color-national-crimson)")} className={cn("story-reveal relative overflow-hidden rounded-3xl bg-national-crimson p-6 text-white lg:col-span-2", LIFT)}>
            <h3 className="flex items-center gap-2 font-bengali text-lg font-bold">
              <Icon name="shield" filled className="text-[22px]" /> সাহস — এটা লাগবেই
            </h3>
            <p className="mt-3 font-bengali text-xl leading-relaxed font-semibold">{g.bravery}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
