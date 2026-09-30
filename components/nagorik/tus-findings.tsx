"use client";

import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { TUS } from "@/data/nagorik";
import { toBanglaDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";
import { useInView } from "./use-in-view";

/**
 * The survey's headline findings, as the home page's solid colour fields.
 * The ratios measure different things, so they are figures, not bars on a
 * shared axis; the one like-for-like comparison (an attitude by age) is a
 * bar pair on an ink card.
 */
export function TusFindings() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const lf = TUS.womenLabourForce;
  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4">
        {TUS.ratios.map((r, i) => {
          const tone = surfaceAt(i);
          return (
            <li key={r.value + r.text} className="story-reveal flex">
              <div style={glowStyle(tone.glow)} className={cn("group flex w-full flex-col rounded-3xl p-5 shadow-sm sm:p-6", LIFT, tone.card)}>
                <p className="font-bengali text-4xl font-bold sm:text-5xl">{r.value}</p>
                <p className="mt-2 font-bengali text-sm leading-relaxed sm:text-[15px]">{r.text}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-5">
        <figure className="story-reveal rounded-3xl bg-text-primary p-6 text-white ring-1 ring-white/12">
          <figcaption className="font-bengali text-base font-bold text-signal-orange">“পুরুষের কাজ নারীর কাজের চেয়ে বেশি গুরুত্বপূর্ণ” — যাঁরা মনে করেন</figcaption>
          <div className="mt-4 space-y-3">
            {TUS.menWorkMoreImportant.map((a, i) => (
              <div key={a.group}>
                <div className="flex justify-between font-bengali text-sm">
                  <span className="text-white/80">{a.group}</span>
                  <span className="font-bold text-white">{toBanglaDigits(a.pct)}%</span>
                </div>
                <div className="mt-1 h-3 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-bdgreen-500 transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    style={{ width: seen ? `${a.pct}%` : "0%", transitionDelay: `${i * 150}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-bengali text-sm leading-relaxed text-white/75">তরুণেরা বদলাচ্ছে — পুরোনো ধারণা ভাঙার কাজটা তাদের হাতেই এগোবে।</p>
        </figure>

        <div style={glowStyle("var(--color-bd-green)")} className={cn("story-reveal rounded-3xl bg-bd-green p-6 text-white shadow-sm", LIFT)}>
          <p className="font-bengali text-sm text-white/85">নারীর শ্রমশক্তিতে অংশগ্রহণ</p>
          <p className="mt-1 font-bengali text-3xl font-bold">
            {toBanglaDigits(lf.from.pct)}% <span className="text-signal-orange">({lf.from.year})</span> → {toBanglaDigits(lf.to.pct)}% <span className="text-signal-orange">({lf.to.year})</span>
          </p>
          <p className="mt-3 font-bengali text-[15px] leading-relaxed text-white/90">{TUS.bothShouldEarn}</p>
        </div>
      </div>
    </div>
  );
}
