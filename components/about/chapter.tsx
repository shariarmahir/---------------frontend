"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { CountUp, useInView } from "@/components/sections/charter-section";
import { CHARTER_LOOKS, CHARTER_TOPIC } from "@/components/sections/charter-looks";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { sourcePoints, type Urgency } from "@/data/amar-bangladesh";
import type { CharterSlide, CharterStat } from "@/data/charter";
import { cn } from "@/lib/utils";
import { OFFSET_CARD, offsetFor } from "./offset";

/* ── The impact ──────────────────────────────────────────────────────── */

/** Each urgency's pixel colour and name. Red is kept for the most urgent (CLAUDE.md §4.1). */
const URGENCY: Record<Urgency, { cell: string; label: string }> = {
  "very-high": { cell: "bg-national-crimson", label: "Very high" },
  high: { cell: "bg-signal-orange", label: "High" },
  "medium-high": { cell: "bg-bdnavy-300", label: "Medium" },
  medium: { cell: "bg-bdnavy-300", label: "Medium" },
};
const URGENCY_ORDER: Urgency[] = ["very-high", "high", "medium-high", "medium"];

/** The 32 problems grouped by sector, most problems first, each sector's pixels most urgent first. */
const SECTORS = Object.entries(
  sourcePoints.reduce<Record<string, typeof sourcePoints>>((acc, p) => {
    (acc[p.theme] ??= []).push(p);
    return acc;
  }, {}),
)
  .map(([theme, points]) => ({
    theme,
    points: [...points].sort((a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency) || a.n - b.n),
  }))
  .sort((a, b) => b.points.length - a.points.length || a.theme.localeCompare(b.theme));

const code = (n: number) => `BD-${String(n).padStart(3, "0")}`;

/**
 * The impact, as one narrow navy panel: the claim and its four figures on
 * one side; on the other the map it is measured against, the dossier's 32
 * problems as pixels, one row per sector (in two columns), coloured by
 * urgency; each pixel names its problem on hover. The pixels
 * light in turn when the panel comes into view.
 */
export function ImpactPanel({ slide, title }: { slide: CharterSlide; title?: string }) {
  const [ref, { on, active }] = useInView<HTMLElement>();
  const stats = slide.stats ?? [];
  let cell = 0;

  return (
    <section
      ref={ref}
      id={slide.id}
      aria-labelledby={`${slide.id}-title`}
      className="section-band mx-auto max-w-7xl scroll-mt-header px-gutter-x lg:scroll-mt-header-lg"
    >
      <div className="story-reveal grid items-center gap-8 rounded-3xl bg-bdnavy-900 p-6 text-white ring-1 ring-white/12 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="flex min-w-0 flex-col">
          <h2 id={`${slide.id}-title`} className="font-grotesk text-3xl leading-[1.1] font-bold tracking-tight text-balance text-signal-orange sm:text-4xl">
            {title ?? slide.title.join(" ")}
          </h2>
          {slide.body.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 font-sans text-base leading-relaxed text-white/80">
              {p}
            </p>
          ))}

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {stats.map((s) => (
              // The label leads in the markup (a term before its values); the figure leads on screen.
              <div key={s.label} className="flex min-w-0 flex-col">
                <dt className="order-2 mt-1 font-grotesk text-base font-bold">{s.label}</dt>
                <dd className="order-1 font-grotesk text-3xl leading-none font-bold tracking-tight text-signal-orange tabular-nums">
                  <CountUp stat={s} active={active} />
                </dd>
                <dd className="order-3 mt-0.5 text-sm leading-snug text-white/80">{s.note}</dd>
              </div>
            ))}
          </dl>

          <Link href={slide.primary.href} className={cn(btn.gold, "mt-7 w-fit")}>
            The full problem map
            <Icon name="arrow_forward" className="text-lg" />
          </Link>
        </div>

        <figure className="flex min-w-0 flex-col rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
          <figcaption className="font-grotesk text-base font-bold">
            {sourcePoints.length} problems across {SECTORS.length} sectors
            <span className="mt-0.5 block font-sans text-sm font-normal text-white/80">From our national dossier: one pixel per problem, red the most urgent.</span>
          </figcaption>

          <ul style={{ "--rows": Math.ceil(SECTORS.length / 2) } as CSSProperties} className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-[repeat(var(--rows),auto)]">
            {SECTORS.map((s) => (
              <li key={s.theme} className="grid grid-cols-[6.5rem_auto_minmax(0,1fr)] items-center gap-3">
                <span className="truncate font-sans text-sm text-white/80">{s.theme}</span>
                <span className="flex gap-1">
                  {s.points.map((p) => {
                    const delay = cell++ * 35;
                    return (
                      <span
                        key={p.n}
                        title={`${code(p.n)} · ${p.topic}`}
                        style={{ transitionDelay: active ? `${delay}ms` : "0ms" }}
                        className={cn(
                          "size-4 rounded-[3px] transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                          URGENCY[p.urgency].cell,
                          on || active ? "scale-100 opacity-100" : "scale-50 opacity-0 motion-reduce:scale-100 motion-reduce:opacity-100",
                        )}
                      />
                    );
                  })}
                </span>
                <span className="font-grotesk text-sm font-bold text-white/80 tabular-nums">{s.points.length}</span>
              </li>
            ))}
          </ul>
        </figure>
      </div>
    </section>
  );
}

/* ── The story ───────────────────────────────────────────────────────── */

/** A figure as written (the marquee shows it still; the count-up needs a card on screen). */
const figure = (s: CharterStat) => `${s.value.toFixed(s.decimals ?? 0)}${s.suffix ?? ""}`;

/**
 * The five chapters of the story as one row of cards drifting sideways,
 * drawn twice so the loop has no seam (the copy hidden from screen readers
 * and from the keyboard). A pointer or keyboard focus on the row holds it
 * still; under reduced motion it stands still and scrolls by hand.
 */
export function StoryMarquee({ slides }: { slides: CharterSlide[] }) {
  const row = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} inert={copy || undefined} className="flex shrink-0 items-stretch gap-8 pr-8">
      {slides.map((s) => (
        <StoryCard key={s.id} slide={s} />
      ))}
    </ul>
  );
  return (
    <div className="story-row overflow-hidden">
      <div className="story-marquee flex w-max pt-2 pb-5">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

function StoryCard({ slide }: { slide: CharterSlide }) {
  const look = CHARTER_LOOKS[slide.id];
  const topic = CHARTER_TOPIC[slide.id];
  const stats = slide.stats ?? [];

  return (
    <li
      style={{ ...look.vars, "--offset": offsetFor(look.vars["--field"]) } as CSSProperties}
      className={cn(OFFSET_CARD, "flex w-80 shrink-0 flex-col gap-4 bg-(--field) p-7 text-white sm:w-[26rem] sm:p-8")}
    >
      <p className="flex items-center gap-3 font-grotesk text-base font-bold text-signal-orange">
        <span className="grid size-11 place-items-center rounded-full bg-black/25 ring-1 ring-white/15">
          <Icon name={topic.icon} className="text-2xl" />
        </span>
        {topic.name}
      </p>
      <h3 className="font-grotesk text-2xl leading-[1.15] font-bold tracking-tight text-balance">
        <span className="block">{slide.title[0]}</span>
        <span className={cn("block text-signal-orange", slide.strike && "line-through decoration-2")}>{slide.title[1]}</span>
      </h3>
      {slide.body.map((p) => (
        <p key={p.slice(0, 24)} className="font-sans text-sm leading-relaxed text-white/80">
          {p}
        </p>
      ))}

      {stats.length > 0 && (
        <dl className="grid grid-cols-3 gap-3 border-t border-white/12 pt-4">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-0 flex-col">
              <dt className="order-2 font-grotesk text-sm font-bold">{s.label}</dt>
              <dd className="order-1 font-grotesk text-2xl leading-tight font-bold text-signal-orange tabular-nums">{figure(s)}</dd>
            </div>
          ))}
        </dl>
      )}
      {slide.pillars && (
        <ul className="flex flex-wrap gap-2 border-t border-white/12 pt-4">
          {slide.pillars.map((p) => (
            <li key={p.label} className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 font-grotesk text-sm font-bold">
              <Icon name={p.icon} className="text-lg text-signal-orange" />
              {p.label}
            </li>
          ))}
        </ul>
      )}
      {slide.oneWord && (
        <p className="border-t border-white/12 pt-4 font-grotesk text-3xl leading-none font-bold tracking-tight">
          {slide.oneWord}
          <span aria-hidden className="ch-caret ml-1 inline-block text-signal-orange">
            ▍
          </span>
        </p>
      )}

      <Link href={slide.primary.href} className={cn(btn.goldOutline, "mt-auto w-fit")}>
        {slide.primary.label}
        <span className="sr-only">: {slide.title.join(" ")}</span>
        <Icon name="arrow_forward" className="text-lg" />
      </Link>
    </li>
  );
}
