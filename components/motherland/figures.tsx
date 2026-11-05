"use client";

import { useEffect, useRef } from "react";
import type { Figure, Moment } from "@/data/motherland-deep";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { BAND_Y, COLUMN, DISPLAY } from "./kit";
import { RiseText } from "./rise-text";

const NUMBER = /^(\D*)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/;
/** Years, dates and ordinals read wrong while they count. */
const STAYS = /^(1\d{3}|20\d{2})$|^\d+(st|nd|rd|th)\b|^\d+ [A-Z][a-z]{2}$|^No\./;

/** A figure that counts up once, the first time it comes into view. The server sends the real value. */
function CountedValue({ value }: { value: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = el.current;
    const parts = NUMBER.exec(value);
    if (!node || reduced || !parts || STAYS.test(value)) return;
    const [, before, digits, after] = parts;
    const target = Number(digits.replace(/,/g, ""));
    const decimals = digits.split(".")[1]?.length ?? 0;
    const grouped = digits.includes(",");
    let frame = 0;
    const seen = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        seen.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 1300);
          const current = target * (1 - (1 - t) ** 3);
          node.textContent = `${before}${grouped ? Math.round(current).toLocaleString("en-US") : current.toFixed(decimals)}${after}`;
          if (t < 1) frame = requestAnimationFrame(step);
          else node.textContent = value;
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    seen.observe(node);
    return () => {
      seen.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, reduced]);

  return <span ref={el}>{value}</span>;
}

/** The figures: each counts up and says what it means. Their sources are on the References page. */
export function Figures({ title, figures }: { title: string; figures: Figure[] }) {
  /* One size across the set, sized so the longest figure holds one line. */
  const longest = Math.max(...figures.map((f) => f.value.length));
  const size = longest > 12 ? "text-[clamp(1.75rem,2.3vw,2.25rem)]" : longest > 7 ? "text-[clamp(2rem,2.8vw,2.75rem)]" : "text-[clamp(2.5rem,3.6vw,3.25rem)]";
  return (
    <section aria-label={title} className={cn(BAND_Y, "bg-signal-orange text-ml-navy")}>
      <div className={cn(COLUMN, "flex flex-col gap-8 lg:gap-12")}>
        <RiseText as="h2" text={title} className={DISPLAY} />
        <dl className={cn("grid gap-4 sm:grid-cols-2 lg:gap-5", figures.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {figures.map((f) => (
            <div key={`${f.value}-${f.label}`} className="flex flex-col-reverse justify-end gap-3 rounded-[1.25rem] bg-white p-6 shadow-[0_10px_30px_-18px_rgb(11_24_73/0.45)]">
              <dt className="leading-snug text-pretty text-ml-navy/80">{f.label}</dt>
              <dd className={cn("font-ml-display leading-none tracking-[0.01em] whitespace-nowrap", size)}>
                <CountedValue value={f.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Dates along one gold line, every one in view. The line runs across the page, and down it on a phone. */
export function Timeline({ title, moments }: { title: string; moments: Moment[] }) {
  return (
    <section aria-label={title} className={cn(BAND_Y, "bg-ml-navy text-white")}>
      <div className={cn(COLUMN, "flex flex-col gap-10 lg:gap-14")}>
        <RiseText as="h2" text={title} className={cn(DISPLAY, "text-signal-orange")} />
        <ol
          className={cn(
            "grid sm:grid-cols-2 sm:gap-y-12 sm:[&>li:last-child:nth-child(odd)]:col-span-2",
            moments.length === 5 ? "lg:grid-cols-5 lg:[&>li:last-child:nth-child(odd)]:col-span-1" : "lg:grid-cols-4 lg:[&>li:last-child:nth-child(4n+1)]:col-span-4 lg:[&>li:last-child:nth-child(4n+2)]:col-span-3 lg:[&>li:last-child:nth-child(4n+3)]:col-span-2",
          )}
        >
          {moments.map((m) => (
            <li key={m.when} className="relative border-l-2 border-signal-orange/50 pb-10 pl-6 last:pb-0 sm:border-t-2 sm:border-l-0 sm:pt-7 sm:pr-8 sm:pb-0 sm:pl-0">
              <span aria-hidden className="absolute top-1 -left-[0.45rem] size-3 rounded-full bg-signal-orange sm:-top-[0.45rem] sm:left-0" />
              <p className="font-ml-display text-[clamp(1.75rem,2.5vw,2.5rem)] leading-none tracking-[0.01em] text-signal-orange">{m.when}</p>
              <p className="mt-3 leading-relaxed text-pretty text-white/85">{m.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
