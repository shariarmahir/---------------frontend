"use client";

import { useEffect, useRef } from "react";
import type { Figure, Moment } from "@/data/motherland-deep";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { COLUMN, DISPLAY } from "./kit";
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

/** The sourced figures: each counts up, says what it means, and names where it comes from. */
export function Figures({ title, figures }: { title: string; figures: Figure[] }) {
  /* One size across the set, sized so the longest figure holds one line. */
  const longest = Math.max(...figures.map((f) => f.value.length));
  const size = longest > 12 ? "text-[clamp(1.75rem,2.3vw,2.25rem)]" : longest > 7 ? "text-[clamp(2rem,2.8vw,2.75rem)]" : "text-[clamp(2.5rem,3.6vw,3.25rem)]";
  return (
    <section aria-label={title} className="bg-signal-orange py-12 text-ml-navy sm:py-14 lg:py-16">
      <div className={cn(COLUMN, "flex flex-col gap-8")}>
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

/** Dates along one gold line, running off the right edge like the page's rails. */
export function Timeline({ title, moments }: { title: string; moments: Moment[] }) {
  return (
    <section aria-label={title} className="bg-ml-ground py-12 text-ml-ink sm:py-14 lg:py-16">
      <div className={COLUMN}>
        <RiseText as="h2" text={title} className={DISPLAY} />
      </div>
      <ol className="ml-rail mt-8 flex snap-x snap-mandatory overflow-x-auto pt-1 pb-6" tabIndex={0} aria-label={`${title}, scrollable`}>
        {moments.map((m) => (
          <li key={m.when} className="ml-card relative mr-5 flex w-[min(78vw,22rem)] shrink-0 snap-start flex-col rounded-[1.25rem] bg-white p-7 ring-1 ring-ml-navy/8">
            <p className="font-ml-display text-[clamp(1.75rem,2.6vw,2.5rem)] leading-none tracking-[0.01em]">{m.when}</p>
            <p className="mt-3 leading-relaxed text-pretty text-ml-ink/80">{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
