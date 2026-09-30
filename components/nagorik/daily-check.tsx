"use client";

import { useState } from "react";
import { StoryHeading } from "@/components/bangladesh/story-heading";
import { Icon } from "@/components/ui/icon";
import { SignalSeam } from "@/components/ui/section-kit";
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
    <section id="self-check" aria-labelledby="check-title" className="section-band relative isolate scroll-mt-40 overflow-hidden bg-black text-white">
      <SignalSeam className="top-0" />
      <div className="mx-auto grid max-w-7xl gap-10 px-gutter-x lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-44 lg:self-start">
          <StoryHeading
            id="check-title"
            index="০৫"
            kicker="আত্মপরীক্ষা"
            title="আজ রাতের আয়না"
            accent="আয়না"
            lede="ঘুমানোর আগে দশটি প্রশ্ন। কোথাও জমা হয় না, কেউ দেখে না — শুধু নিজের কাছে সৎ থাকা।"
          />
          <div className="story-reveal flex items-center gap-5 rounded-3xl bg-text-primary p-5 ring-1 ring-white/12">
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
              <p className="font-bengali text-4xl font-bold text-signal-orange">
                {toBanglaDigits(n)}/{toBanglaDigits(DAILY_CHECKS.length)}
              </p>
              <p className="mt-1 font-bengali text-base text-white/85">{verdict.text}</p>
            </div>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {DAILY_CHECKS.map((c, i) => {
            const on = done.has(i);
            return (
              <li key={c} className="story-reveal flex">
                <label
                  className={cn(
                    "relative flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 font-bengali text-[15px] leading-snug [-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 active:scale-[0.97] active:duration-150 has-focus-visible:ring-2 has-focus-visible:ring-white motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
                    on
                      ? "bg-signal-orange font-semibold text-text-primary shadow-[0_18px_34px_-20px_var(--color-signal-orange)]"
                      : "bg-text-primary text-white ring-1 ring-white/12 hover:shadow-[0_18px_34px_-20px_var(--color-bdgreen-500)]",
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
                  <span aria-hidden className={cn("flex size-6 shrink-0 items-center justify-center rounded-md border-2", on ? "border-text-primary bg-text-primary text-signal-orange" : "border-white/40")}>
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
