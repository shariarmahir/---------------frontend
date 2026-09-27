"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DAILY_CHECKS } from "@/data/nagorik";
import { toBanglaDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";

const VERDICT = [
  { min: 9, text: "আজ আপনি দেশের একজন কাণ্ডারী।" },
  { min: 6, text: "ভালো দিন — কাল আরেকটু।" },
  { min: 3, text: "শুরু হয়েছে। কাল একটি বেশি।" },
  { min: 0, text: "আজ রাতেই একটি বেছে নিন — কাল সেটাই করবেন।" },
];

/**
 * Tonight's private self-check. Nothing is stored or sent — it is a mirror,
 * not a score for anyone else.
 */
export function DailyCheck() {
  const [done, setDone] = useState<Set<number>>(new Set());
  const n = done.size;
  const pct = (n / DAILY_CHECKS.length) * 100;
  const verdict = VERDICT.find((v) => n >= v.min)!;

  return (
    <section id="self-check" aria-labelledby="check-title" className="section-band scroll-mt-40 bg-bdgreen-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-gutter-x lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-44 lg:self-start">
          <h2 id="check-title" className="font-bengali text-3xl leading-tight font-bold sm:text-4xl">
            আজ রাতের <span className="text-signal-orange">আয়না</span>
          </h2>
          <p className="mt-3 font-bengali text-lg leading-relaxed text-emerald-50/85">
            ঘুমানোর আগে দশটি প্রশ্ন। কোথাও জমা হয় না, কেউ দেখে না — শুধু নিজের কাছে সৎ থাকা।
          </p>
          <div className="mt-8 flex items-center gap-5">
            <svg viewBox="0 0 36 36" className="size-28 -rotate-90" aria-hidden>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="var(--color-signal-orange)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${pct} 100`}
                pathLength={100}
                className="transition-[stroke-dasharray] duration-500 motion-reduce:transition-none"
              />
            </svg>
            <div aria-live="polite">
              <p className="font-bengali text-4xl font-bold">
                {toBanglaDigits(n)}/{toBanglaDigits(DAILY_CHECKS.length)}
              </p>
              <p className="mt-1 font-bengali text-base text-emerald-50/85">{verdict.text}</p>
            </div>
          </div>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {DAILY_CHECKS.map((c, i) => {
            const on = done.has(i);
            return (
              <li key={c}>
                <label
                  className={cn(
                    "relative flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 font-bengali text-[15px] leading-snug transition-colors has-focus-visible:ring-2 has-focus-visible:ring-signal-orange",
                    on ? "border-signal-orange/60 bg-signal-orange/15 text-white" : "border-white/12 bg-white/5 text-emerald-50/90 hover:border-white/30",
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() =>
                      setDone((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                  />
                  <span aria-hidden className={cn("flex size-6 shrink-0 items-center justify-center rounded-md border-2", on ? "border-signal-orange bg-signal-orange text-text-primary" : "border-white/40")}>
                    {on && <Icon name="check" className="text-[16px]" />}
                  </span>
                  {c}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
