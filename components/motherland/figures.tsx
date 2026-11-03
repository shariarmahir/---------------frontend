"use client";

import { useEffect, useRef } from "react";
import type { Figure, Moment } from "@/data/motherland-deep";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { COLUMN } from "./kit";
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
  return (
    <section aria-label={title} className="bg-ml-navy py-16 text-white sm:py-20">
      <div className={cn(COLUMN, "flex flex-col gap-10")}>
        <RiseText as="h2" text={title} className="font-ml-display text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.02] tracking-[0.01em] uppercase" />
        <dl className={cn("grid gap-x-8 gap-y-10 sm:grid-cols-2", figures.length === 3 ? "lg:grid-cols-3" : figures.length > 4 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
          {figures.map((f) => (
            <div key={`${f.value}-${f.label}`} className="flex flex-col gap-2 border-t border-white/25 pt-5">
              <dd className="font-ml-display text-[clamp(2.5rem,4vw,4rem)] leading-none tracking-[0.01em] text-signal-orange">
                <CountedValue value={f.value} />
              </dd>
              <dt className="text-lg leading-snug text-pretty">{f.label}</dt>
              <dd className="text-sm">
                <a href={f.source.url} target="_blank" rel="noopener noreferrer" className="text-white/70 underline decoration-white/30 underline-offset-4 hover:text-signal-orange">
                  {f.source.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
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
    <section aria-label={title} className="bg-ml-ground py-20 text-ml-ink sm:py-24">
      <div className={COLUMN}>
        <RiseText as="h2" text={title} className="font-ml-display text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.02] tracking-[0.01em] uppercase" />
      </div>
      <ol className="ml-rail mt-10 flex snap-x snap-mandatory overflow-x-auto pb-2" tabIndex={0} aria-label={`${title}, scrollable`}>
        {moments.map((m) => (
          <li key={m.when} className="relative w-[min(78vw,21rem)] shrink-0 snap-start border-t-2 border-signal-orange pt-6 pr-8">
            <span aria-hidden className="absolute -top-[7px] left-0 size-3 rounded-full bg-signal-orange" />
            <p className="font-ml-display text-[clamp(1.75rem,2.6vw,2.5rem)] leading-none tracking-[0.01em]">{m.when}</p>
            <p className="mt-3 leading-relaxed text-pretty text-ml-ink/80">{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
