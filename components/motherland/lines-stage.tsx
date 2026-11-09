"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { Line } from "@/data/motherland-blocks";
import { cn } from "@/lib/utils";
import { COLUMN } from "./kit";

/** "Kazi Nazrul Islam, Bidrohi, 1922" is listed under "Kazi Nazrul Islam". */
const poetOf = (who: string) => who.split(",")[0];

/**
 * The lines everyone knows, each given the whole screen in turn. On a large screen
 * the stage holds still and the scroll moves it from line to line; on a phone, a
 * short screen or with reduced motion the lines simply follow one another
 * (motherland.css, .ml-lines). Every line stays in the page for screen readers.
 */
export function LinesStage({ lines }: { lines: Line[] }) {
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const last = lines.length - 1;

  /** Where the stage sits: how far it has to travel, and how far it has come. */
  const measure = () => {
    const outer = box.current;
    const inner = stage.current;
    if (!outer || !inner) return null;
    const header = parseFloat(getComputedStyle(inner).top) || 0;
    const top = outer.getBoundingClientRect().top - header;
    return { top, travel: outer.offsetHeight - inner.offsetHeight };
  };

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const m = measure();
      if (m && m.travel > 0) setActive(Math.min(last, Math.max(0, Math.round((-m.top / m.travel) * last))));
    };
    const onChange = () => {
      frame ||= requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
      cancelAnimationFrame(frame);
    };
  }, [last]);

  const goTo = (index: number) => {
    const m = measure();
    if (m) window.scrollTo({ top: window.scrollY + m.top + (m.travel * index) / last, behavior: "smooth" });
  };

  return (
    <div ref={box} className="ml-lines" style={{ "--n": lines.length } as CSSProperties}>
      <div ref={stage} className="ml-lines-stage">
        <ul className="ml-lines-list">
          {lines.map((l, i) => (
            <li key={l.who} className="ml-lines-slide relative isolate flex flex-col justify-end overflow-hidden bg-ml-navy" data-on={i === active ? "" : undefined}>
              {l.picture ? <Image src={l.picture.src} alt={l.picture.alt} fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: l.picture.focus }} /> : null}
              <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ml-navy via-ml-navy/55 via-45% to-transparent" />
              <blockquote className={cn(COLUMN, "ml-lines-words flex flex-col items-center gap-3 pt-40 pb-10 text-center text-white lg:gap-4")}>
                <p lang="bn" className="max-w-[24ch] font-bengali text-[clamp(2rem,4.4vw,5.25rem)] leading-[1.3] font-semibold text-balance">
                  {l.bangla}
                </p>
                <p className="max-w-3xl text-lg leading-relaxed text-pretty text-white/90 lg:text-xl">{l.english}</p>
                <footer className="font-semibold text-signal-orange lg:text-lg">{l.who}</footer>
              </blockquote>
            </li>
          ))}
        </ul>
        <div className="ml-lines-names absolute inset-x-0 bottom-0 z-10">
          <div className={cn(COLUMN, "grid gap-3 pb-4")} style={{ gridTemplateColumns: `repeat(${lines.length}, minmax(0, 1fr))` }}>
            {lines.map((l, i) => (
              <button
                key={l.who}
                type="button"
                aria-current={i === active ? "true" : undefined}
                onClick={() => goTo(i)}
                className={cn(
                  "min-h-12 cursor-pointer border-t-2 pt-3 text-left text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:text-base",
                  i === active ? "border-signal-orange text-signal-orange" : "border-white/30 text-white/80 hover:border-white hover:text-white",
                )}
              >
                {poetOf(l.who)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
