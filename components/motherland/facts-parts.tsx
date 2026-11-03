"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { divisionShapes, MAP_HEIGHT, MAP_WIDTH, type DivisionId } from "@/data/bangladesh-map";
import { CATEGORIES } from "@/data/motherland-categories";
import { BEST, FACT_TOPICS, NOT_BEST, type Slide, type StackCard } from "@/data/motherland-facts";
import { cn } from "@/lib/utils";
import { pill } from "./kit";
import { useRhythm } from "./rhythm";

/** A link inside the page or out of it. */
function Go({ href, ...rest }: React.ComponentProps<"a"> & { href: string }) {
  return href.startsWith("#") ? <a href={href} {...rest} /> : <Link href={href} {...rest} />;
}

/**
 * Facts about Germany's bar, under MOTHERLAND's header: the mark, the Topics
 * menu with every category, and the two sections the page exists for.
 */
export function FactsBar() {
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = (e: Event) => {
      if (menu.current?.open && (e.type === "keydown" ? (e as KeyboardEvent).key === "Escape" : !menu.current.contains(e.target as Node))) menu.current.open = false;
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, []);

  const main = "rounded-sm font-semibold whitespace-nowrap underline-offset-8 hover:text-ml-green hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ml-green";

  return (
    <nav aria-label="Facts of Bangladesh" className="sticky top-(--ml-header) z-40 border-b border-ml-ink/10 bg-white print:hidden">
      <div className="mx-auto flex w-full max-w-480 flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-3 sm:px-10 xl:px-12">
        <a href="#facts-top" className="flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ml-green">
          <span aria-hidden className="flex h-9 gap-0.5 -skew-y-12">
            <span className="w-2.5 bg-ml-green" />
            <span className="w-2.5 bg-ml-red" />
            <span className="w-2.5 bg-signal-orange" />
          </span>
          <span className="text-sm leading-tight font-bold">
            Facts of
            <br />
            Bangladesh
          </span>
        </a>

        <div className="order-last flex w-full gap-6 overflow-x-auto pb-1 text-[0.95rem] lg:order-none lg:w-auto lg:pb-0 lg:text-base">
          <a href={`#${BEST.id}`} className={main}>
            {BEST.title}
          </a>
          <a href={`#${NOT_BEST.id}`} className={main}>
            {NOT_BEST.title}
          </a>
        </div>

        <details ref={menu} className="group relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-full bg-ml-ink px-5 font-semibold text-white transition-colors hover:bg-ml-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green [&::-webkit-details-marker]:hidden">
            Topics
            <Icon name="expand_more" className="text-xl transition-transform group-open:rotate-180" />
          </summary>
          <ul className="absolute top-full right-0 mt-3 grid max-h-[70svh] w-[min(40rem,calc(100vw-3rem))] gap-x-4 overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_30px_60px_-20px_rgb(15_42_32/0.5)] ring-1 ring-ml-ink/10 sm:grid-cols-2">
            {FACT_TOPICS.map((t) => (
              <li key={t.title}>
                <Go href={t.href} onClick={() => menu.current && (menu.current.open = false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-ml-ground hover:text-ml-green focus-visible:outline-2 focus-visible:outline-ml-green">
                  {t.title}
                </Go>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </nav>
  );
}

/**
 * The opening, as Facts about Germany's: a photograph on the left, the story
 * on the right, and the stepper under them that moves between five stories.
 */
export function FactsHero({ slides }: { slides: Slide[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [stopped, setStopped] = useState(false);
  const hold = useRhythm(root, active, () => setActive((a) => (a + 1) % slides.length), stopped);
  const slide = slides[active];

  return (
    <section ref={root} id="facts-top" aria-label="Facts of Bangladesh" {...hold} className="bg-white">
      <div className="grid lg:min-h-[calc(100svh-var(--ml-header)-13.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative aspect-4/3 overflow-hidden bg-ml-mist lg:aspect-auto">
          {slides.map((s, i) => (
            <Image
              key={s.id}
              src={s.picture.src}
              alt={i === active ? s.picture.alt : ""}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={cn("object-cover transition-opacity duration-700 motion-reduce:transition-none", i === active ? "opacity-100" : "opacity-0")}
              style={{ objectPosition: s.picture.focus }}
            />
          ))}
        </div>
        <div key={slide.id} className="flex flex-col items-start justify-center gap-6 px-6 py-10 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 motion-reduce:animate-none sm:px-10 lg:px-16 xl:px-20">
          <h1 className="font-ml-display text-[clamp(2.75rem,5.4vw,6rem)] leading-[1.02] tracking-[0.01em] text-balance text-ml-ink uppercase">{slide.title}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-ml-ink/85 sm:text-xl">{slide.text}</p>
          <Go href={slide.href} className={pill.onLight}>
            Read more
          </Go>
        </div>
      </div>

      <ol className="mx-auto flex w-full max-w-5xl overflow-x-auto px-4 pt-8 pb-10">
        {slides.map((s, i) => {
          const here = i === active;
          return (
            <li key={s.id} className="relative min-w-32 flex-1">
              {i > 0 ? <span aria-hidden className="absolute top-[0.8rem] right-1/2 h-px w-full bg-ml-ink/25" /> : null}
              <button
                type="button"
                aria-current={here ? "step" : undefined}
                onClick={() => {
                  setActive(i);
                  setStopped(true);
                }}
                className={cn("relative flex w-full flex-col items-center gap-3 rounded-sm px-2 text-center text-[0.95rem] leading-snug font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green", here ? "text-ml-green" : "text-ml-ink hover:text-ml-green")}
              >
                <span aria-hidden className={cn("grid size-[1.6rem] place-items-center rounded-full bg-white", here && "ring-2 ring-ml-green")}>
                  <span className={cn("rounded-full", here ? "size-3 bg-ml-green" : "size-2 bg-ml-ink/70")} />
                </span>
                {s.step}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * Facts about Germany's centred stack: the middle card stands tall, its
 * neighbours lie smaller behind it, and a side card comes forward when
 * chosen. It turns on MOTHERLAND's one beat.
 */
export function FactsStack({ cards, label }: { cards: StackCard[]; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [stopped, setStopped] = useState(false);
  const n = cards.length;
  const hold = useRhythm(root, active, () => setActive((a) => (a + 1) % n), stopped);
  const move = (i: number) => {
    setActive((i + n) % n);
    setStopped(true);
  };

  return (
    <div ref={root} role="group" aria-label={label} {...hold} className="flex flex-col items-center gap-6">
      <div className="relative h-104 w-full overflow-hidden sm:h-124">
        {cards.map((c, i) => {
          let off = (i - active + n) % n;
          if (off > n / 2) off -= n;
          const far = Math.abs(off);
          return (
            <Link
              key={c.title}
              href={c.href}
              tabIndex={off === 0 ? 0 : -1}
              aria-hidden={off !== 0}
              onClick={(e) => {
                if (off !== 0) {
                  e.preventDefault();
                  move(i);
                }
              }}
              style={{ transform: `translateX(calc(-50% + ${off * 84}%)) scale(${1 - far * 0.14})`, zIndex: 10 - far, opacity: far > 2 ? 0 : 1 }}
              className={cn("absolute top-0 left-1/2 flex h-full w-64 items-end overflow-hidden rounded-3xl bg-ml-ink p-6 text-white shadow-[0_30px_50px_-24px_rgb(15_42_32/0.7)] transition-[transform,opacity] duration-700 ease-out focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ml-green motion-reduce:transition-none sm:w-80", far > 2 && "pointer-events-none")}
            >
              <Image src={c.picture.src} alt="" fill sizes="320px" className="object-cover" style={{ objectPosition: c.picture.focus }} />
              <span aria-hidden className={cn("absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-700", off !== 0 && "bg-black/40")} />
              <span className="relative text-xl leading-snug font-bold text-balance sm:text-2xl">{c.title}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={() => move(active - 1)} className="grid size-12 place-items-center rounded-full bg-white ring-1 ring-ml-ink/20 transition-colors hover:bg-signal-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green">
          <Icon name="chevron_left" className="text-2xl" />
          <span className="sr-only">Previous</span>
        </button>
        <button type="button" onClick={() => move(active + 1)} className="grid size-12 place-items-center rounded-full bg-white ring-1 ring-ml-ink/20 transition-colors hover:bg-signal-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green">
          <Icon name="chevron_right" className="text-2xl" />
          <span className="sr-only">Next</span>
        </button>
      </div>
    </div>
  );
}

const DIVISIONS = CATEGORIES.find((c) => c.slug === "travel")!.subcategories.find((s) => s.id === "eight-divisions")!.stories;
const TONES: Record<DivisionId, string> = {
  dhaka: "fill-ml-green",
  chattogram: "fill-ml-deep",
  rajshahi: "fill-ml-deep",
  khulna: "fill-ml-green/75",
  barishal: "fill-ml-deep/80",
  sylhet: "fill-ml-green/75",
  rangpur: "fill-ml-green",
  mymensingh: "fill-ml-green/60",
};

/** Two names would run onto water from their centres, so they sit on their land. */
const LABEL_AT: Partial<Record<DivisionId, { x: number; y: number }>> = { chattogram: { x: 540, y: 640 }, barishal: { x: 289, y: 588 } };

/** Facts about Germany's map of the Länder, for the 8 divisions: point at or choose one to read about it. */
export function FactsMap() {
  const [current, setCurrent] = useState<DivisionId>("dhaka");
  const story = (id: DivisionId) => DIVISIONS.find((d) => d.title.toLowerCase() === id)!;
  const here = story(current);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Map of the eight divisions of Bangladesh" className="mx-auto max-h-[46rem] w-full max-w-xl">
        {divisionShapes.map((d) => (
          <g key={d.id} onMouseEnter={() => setCurrent(d.id)} onClick={() => setCurrent(d.id)} className="cursor-pointer">
            <path d={d.d} className={cn("stroke-white transition-colors duration-300", d.id === current ? "fill-signal-orange" : TONES[d.id])} strokeWidth={2.5} strokeLinejoin="round" />
          </g>
        ))}
        {divisionShapes.map((d) => (
          <text key={d.id} x={LABEL_AT[d.id]?.x ?? d.cx} y={LABEL_AT[d.id]?.y ?? d.cy} textAnchor="middle" className={cn("pointer-events-none font-bold capitalize", d.id === "chattogram" || d.id === "barishal" ? "text-[0.9rem]" : "text-[1.05rem]", d.id === current ? "fill-ml-ink" : "fill-white")}>
            {d.id}
          </text>
        ))}
      </svg>

      <div className="flex flex-col gap-6">
        <ul className="flex flex-wrap gap-2.5">
          {divisionShapes.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                aria-pressed={d.id === current}
                onClick={() => setCurrent(d.id)}
                className={cn("min-h-11 rounded-full px-5 font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green", d.id === current ? "bg-signal-orange text-ml-ink" : "bg-ml-ground text-ml-ink hover:bg-ml-mist")}
              >
                {d.id}
              </button>
            </li>
          ))}
        </ul>
        <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-ml-mist">
          <Image key={here.title} src={here.picture.src} alt={here.picture.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" style={{ objectPosition: here.picture.focus }} />
        </div>
        <div aria-live="polite">
          <h3 className="font-ml-display text-4xl tracking-[0.01em] uppercase">{here.title}</h3>
          <p className="mt-2 max-w-xl text-lg leading-relaxed text-ml-ink/85">{here.text}</p>
        </div>
      </div>
    </div>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={cn(pill.onLight, "print:hidden")}>
      <Icon name="print" className="text-xl" />
      Print or save as PDF
    </button>
  );
}
