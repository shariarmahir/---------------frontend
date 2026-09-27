"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
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
 * and the one act of bravery the role asks for.
 */
export function Responsibilities() {
  const [active, setActive] = useState(GROUPS[0].id);
  const g = GROUPS.find((x) => x.id === active)!;

  return (
    <section id="responsibility" aria-labelledby="resp-title" className="section-band scroll-mt-40 bg-white">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="story-reveal max-w-3xl">
          <h2 id="resp-title" className="font-bengali text-3xl leading-tight font-bold text-balance text-text-primary sm:text-4xl">
            প্রত্যেকের <span className="text-amber-700">দায়িত্ব</span> — শিশু থেকে প্রবীণ
          </h2>
          <p className="mt-3 font-bengali text-lg leading-relaxed text-text-secondary">
            দেশ বদলানো কারও একার কাজ নয়। নিজের জায়গাটি বেছে নিন — দায়িত্ব, আজকের কাজ, আচরণ, মানসিকতা আর সাহস।
          </p>
        </div>

        <div role="tablist" aria-label="কার দায়িত্ব" className="no-scrollbar relative mt-8 flex gap-2 overflow-x-auto pb-2">
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
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-bengali text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-bd-green/40 focus-visible:outline-none",
                x.id === active ? "border-bd-green bg-bd-green text-white" : "border-slate-200 text-text-secondary hover:border-bd-green/40 hover:text-text-primary",
              )}
            >
              <Icon name={x.icon} className="text-[20px]" />
              {x.label}
            </button>
          ))}
        </div>

        <div id="resp-panel" role="tabpanel" aria-labelledby={`resp-tab-${g.id}`} className="mt-6 grid gap-4 lg:grid-cols-3">
          {BLOCKS.map((b) => (
            <div key={b.key} className="rounded-2xl border border-slate-200 bg-mint-subtle/60 p-6">
              <h3 className="flex items-center gap-2 font-bengali text-lg font-bold text-text-primary">
                <Icon name={b.icon} className="text-[22px] text-bd-green" /> {b.label}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {g[b.key].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 font-bengali text-[15px] leading-snug text-text-primary">
                    <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-xs bg-bd-green" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rounded-2xl bg-signal-orange/15 p-6 lg:col-span-1">
            <h3 className="flex items-center gap-2 font-bengali text-lg font-bold text-text-primary">
              <Icon name="psychology" className="text-[22px] text-amber-700" /> ইতিবাচক মানসিকতা
            </h3>
            <p className="mt-3 font-bengali text-[15px] leading-relaxed text-text-primary">{g.mindset}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-national-crimson p-6 text-white lg:col-span-2">
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
