"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { CountUp, useInView } from "@/components/sections/charter-section";
import { CHARTER_DATA_LABEL, CHARTER_LOOKS, CHARTER_TOPIC } from "@/components/sections/charter-looks";
import { CharterVisual } from "@/components/sections/charter-viz";
import { Icon } from "@/components/ui/icon";
import type { CharterSlide } from "@/data/charter";
import { cn } from "@/lib/utils";

/**
 * One chapter of the About page's story: a full-width band in its topic's
 * field (the same navy, ink or gold it wears on the home page), the claim
 * and its evidence on one side, the topic's motion graphic on the other.
 * `flip` puts the graphic first, so the bands zig-zag down the page.
 */
export function Chapter({ slide, flip = false }: { slide: CharterSlide; flip?: boolean }) {
  const look = CHARTER_LOOKS[slide.id];
  const topic = CHARTER_TOPIC[slide.id];
  const [ref, { on, active }] = useInView<HTMLElement>();
  const headingId = `${slide.id}-title`;

  return (
    <section
      ref={ref}
      id={slide.id}
      aria-labelledby={headingId}
      style={look.vars as CSSProperties}
      className="scroll-mt-header bg-(--field) text-(--ink) lg:scroll-mt-header-lg"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-gutter-x py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
        <div className={cn("story-reveal min-w-0", flip && "lg:order-2")}>
          <p className="flex items-center gap-2 font-grotesk text-sm font-bold text-(--accent)">
            <Icon name={topic.icon} className="text-xl" />
            {topic.name}
          </p>
          <h2 id={headingId} className="mt-4 font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl">
            <span className="block">{slide.title[0]}</span>
            <span className={cn("block text-(--accent)", slide.strike && "line-through decoration-[3px]")}>{slide.title[1]}</span>
          </h2>
          {slide.body.map((p) => (
            <p key={p.slice(0, 24)} className="mt-6 max-w-[60ch] font-sans text-base leading-relaxed text-(--ink)/80 lg:text-lg">
              {p}
            </p>
          ))}

          <Evidence slide={slide} active={active} />

          <Link
            href={slide.primary.href}
            className="group/more mt-8 inline-flex items-center gap-2 font-grotesk text-base font-bold text-(--accent) focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-(--ink) focus-visible:ring-offset-4 focus-visible:ring-offset-(--field) focus-visible:outline-none"
          >
            <span className="underline decoration-(--accent)/40 decoration-2 underline-offset-8 transition-[text-decoration-color] duration-300 group-hover/more:decoration-(--accent)">
              {slide.primary.label}
            </span>
            <span className="sr-only">: {slide.title.join(" ")}</span>
            <Icon
              name="arrow_forward"
              className="text-xl transition-transform duration-300 group-hover/more:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </div>

        {/* The home cards fix the drawing at 280px tall from xl; here it fills its column. */}
        <div className={cn("story-reveal mx-auto w-full max-w-md xl:[&_svg]:h-auto xl:[&_svg]:w-full", flip && "lg:order-1")}>
          <CharterVisual kind={slide.viz} active={on} grow={active} />
        </div>
      </div>
    </section>
  );
}

/** The topic's figures, pillars or single word, under a small heading. */
function Evidence({ slide, active }: { slide: CharterSlide; active: boolean }) {
  const label = CHARTER_DATA_LABEL[slide.id];
  const stats = slide.stats ?? [];
  if (!slide.oneWord && !slide.pillars && !stats.length) return null;

  return (
    <div className="mt-10 border-t border-(--ink)/12 pt-6">
      {label && <p className="font-grotesk text-sm font-bold text-(--ink)/80">{label}</p>}

      {slide.oneWord && (
        <p className="mt-3 font-grotesk text-5xl leading-none font-bold tracking-tight">
          {slide.oneWord}
          <span aria-hidden className="ch-caret ml-1 inline-block text-(--accent)">
            ▍
          </span>
        </p>
      )}

      {slide.pillars && (
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          {slide.pillars.map((p) => (
            <li key={p.label} className="flex items-center gap-2 font-grotesk text-2xl font-bold">
              <Icon name={p.icon} className="text-3xl! text-(--accent)" />
              {p.label}
            </li>
          ))}
        </ul>
      )}

      {stats.length > 0 && (
        <dl className={cn("mt-4 grid gap-x-6 gap-y-6", stats.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
          {stats.map((s) => (
            // The label leads in the markup (a term before its values); the figure leads on screen.
            <div key={s.label} className="flex min-w-0 flex-col">
              <dt className="order-2 mt-2 font-grotesk text-sm font-bold">{s.label}</dt>
              <dd className="order-1 font-grotesk text-4xl leading-none font-bold tracking-tight text-(--accent) tabular-nums">
                <CountUp stat={s} active={active} />
              </dd>
              <dd className="order-3 mt-1 text-sm leading-snug text-(--ink)/80">{s.note}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
