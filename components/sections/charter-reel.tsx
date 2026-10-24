"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import type { Photo } from "@/data/bangladesh";
import { charterSlides, type CharterSlide } from "@/data/charter";
import { ruralBackdrops, ruralStories } from "@/data/rural-life";
import { cn } from "@/lib/utils";
import { CountUp, useInView } from "./charter-kit";
import { CHARTER_LOOKS, CHARTER_TOPIC } from "./charter-looks";

/*
 * Charter (Mahir, 2026-10-25, after getahugo.com's assessment reel): a
 * one-line gold title with two bare gold arrows, then the six topics as
 * photograph cards. From 90rem they stand in one row: the open card wide,
 * the other five as narrow tiles. A tile opens on a click (or Enter); the
 * arrows step through. Below 90rem the cards are a swipe reel, every card
 * whole, the arrows paging it (on a phone the peeking next card and the
 * swipe do).
 *
 * The open card shows its photograph in full, untinted (Mahir: "full
 * transparent image when card is open"). Everything to read sits on frosted
 * panes of the topic's field (navy, ink or cobalt), as in the reference: a
 * caption pane at the bottom-left (the topic's symbol and name, the title,
 * the text, the two actions) and, apart from it at the bottom-right, a
 * narrower pane for the topic's evidence (a table of figures, its pillars
 * or its one word); stacked on a narrow card. The panes are translucent and
 * blurred (Mahir, 2026-10-25: "solid blurish ... same to same clone"), dense
 * enough for the type: white at 4.5 : 1. A closed tile keeps a light wash of
 * its field and carries its symbol and name on a small frosted label. No
 * gradient. The photographs' credits live on the /bangladesh page.
 */

const story = (id: string) => ruralStories.find((s) => s.id === id)!.photo;

/**
 * Each topic's photograph (Wikimedia Commons, credited with the others on
 * /bangladesh) and how it is framed so its subject stays clear of the panes
 * at the card's foot: `focus` slides the picture sideways, `lift` (a
 * fraction of the card's height) sets it taller than the card and anchors it
 * at the bottom, which crops the empty top and raises the subject above the
 * panes (a point at height y lands at y(1 + lift) - lift). Deep where the
 * subject sits low (the bank, the boat), gentle where heads are high. A
 * closed tile keeps the plain framing (its photograph has no panes to clear).
 */
const PHOTOS: Record<string, { photo: Photo; focus: string; lift: number }> = {
  problem: { photo: story("teesta-erosion"), focus: "40% 50%", lift: 0.5 },
  challenge: { photo: story("rickshaw-rain"), focus: "42% 50%", lift: 0.26 },
  vision: { photo: story("sowing-paddy"), focus: "62% 50%", lift: 0.1 },
  mission: { photo: story("garment-machine"), focus: "74% 50%", lift: 0.14 },
  goal: { photo: ruralBackdrops.floodBoat, focus: "56% 50%", lift: 0.45 },
  impact: { photo: story("paddy-bales"), focus: "72% 50%", lift: 0.2 },
};

/** What each topic's evidence shows, named so it reads as proof for that topic. */
const PROOF_HEADING: Record<string, string> = {
  problem: "The problem in numbers",
  challenge: "The three fronts",
  vision: "In one word",
  mission: "What we are building",
  impact: "Where we stand",
};

/** The expanding row from 90rem (below it the open card is too narrow for its slide); below it, the swipe reel. */
const ROW_MQ = "(min-width: 90rem)";

/** Pages the reel so card `i` stands at its gutter. */
function scrollReelTo(list: HTMLElement, i: number) {
  const card = list.children[i] as HTMLElement | undefined;
  if (!card) return;
  const pad = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  list.scrollTo({ left: card.offsetLeft - pad, behavior: reduce ? "auto" : "smooth" });
}

export function CharterReel() {
  const headId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(0);
  const [row, setRow] = useState(false);
  // The reel's own position, for its arrows: the card at its start and whether it can move either way.
  const [reel, setReel] = useState({ at: 0, start: true, end: false });
  const n = charterSlides.length;

  useEffect(() => {
    const mq = window.matchMedia(ROW_MQ);
    const sync = () => setRow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || row) return;
    const read = () => {
      const pad = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
      const left = list.getBoundingClientRect().left + pad;
      const cards = [...list.children] as HTMLElement[];
      let at = 0;
      let best = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.getBoundingClientRect().left - left);
        if (d < best) [best, at] = [d, i];
      });
      const max = list.scrollWidth - list.clientWidth;
      setReel((r) => {
        const next = { at, start: list.scrollLeft < 8, end: list.scrollLeft > max - 8 };
        return r.at === next.at && r.start === next.start && r.end === next.end ? r : next;
      });
    };
    read();
    list.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      list.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [row]);

  // Arriving at "#mission" (the header's Mission tab) or any topic's id brings that card forward:
  // on load, on hashchange and back/forward, and on an in-page link (Next's links push the hash
  // without a hashchange).
  useEffect(() => {
    const bring = (hash: string) => {
      const i = charterSlides.findIndex((s) => `#${s.id}` === hash);
      if (i < 0) return;
      setOpen(i);
      if (!window.matchMedia(ROW_MQ).matches && listRef.current) scrollReelTo(listRef.current, i);
    };
    const fromLocation = () => bring(window.location.hash);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = new URL(a.href, window.location.href);
      if (url.pathname === window.location.pathname) bring(url.hash);
    };
    fromLocation();
    window.addEventListener("hashchange", fromLocation);
    window.addEventListener("popstate", fromLocation);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", fromLocation);
      window.removeEventListener("popstate", fromLocation);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const current = row ? open : reel.at;
  const atStart = row ? open === 0 : reel.start;
  const atEnd = row ? open === n - 1 : reel.end;
  const step = (d: -1 | 1) => {
    const i = Math.min(n - 1, Math.max(0, current + d));
    if (row) setOpen(i);
    else if (listRef.current) scrollReelTo(listRef.current, i);
  };

  return (
    <section id="charter" aria-labelledby={headId} className="section-band">
      <div className="story-reveal mx-auto flex w-full max-w-384 items-end justify-between gap-6 px-gutter-x">
        {/* The home page's section title: gold, bold, one line from lg (SectionHeading's style). */}
        <h2
          id={headId}
          className="font-grotesk text-[1.75rem] leading-[1.15] font-bold tracking-tight text-balance text-signal-orange sm:text-3xl sm:leading-[1.2] lg:text-4xl lg:whitespace-nowrap"
        >
          From Problem to Impact, One Pixel at a Time
        </h2>
        {/* -mr-2.5: the glyph, not its 44px target, lines up with the cards' right edge. A phone swipes instead. */}
        <div role="group" aria-label="Charter cards" className="-mr-2.5 flex shrink-0 gap-1 max-sm:hidden">
          <Arrow dir="prev" disabled={atStart} onClick={() => step(-1)} />
          <Arrow dir="next" disabled={atEnd} onClick={() => step(1)} />
        </div>
      </div>

      <ul
        ref={listRef}
        style={{ "--n": n } as CSSProperties}
        className={cn(
          "reel-list story-reveal @container relative mx-auto mt-8 flex w-full max-w-384 gap-3 px-gutter-x sm:mt-10",
          // The reel: swiped sideways, each card snapping to the gutter.
          "snap-x snap-mandatory scroll-px-gutter-x overflow-x-auto overscroll-x-contain pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden",
          // The row: no scrolling, a fixed height.
          "min-[90rem]:h-144 min-[90rem]:snap-none min-[90rem]:overflow-visible min-[90rem]:pb-0 2xl:h-150",
        )}
      >
        {charterSlides.map((slide, i) => (
          <ReelCard key={slide.id} slide={slide} open={open === i} row={row} onOpen={() => setOpen(i)} />
        ))}
      </ul>

      <p className="sr-only" aria-live="polite">
        {`${CHARTER_TOPIC[charterSlides[current].id].name}, ${current + 1} of ${n}`}
      </p>
    </section>
  );
}

/**
 * A bare gold arrow: no disc, no glass (Mahir, 2026-10-17); a 44px target with a visible focus ring.
 * At the end of the row it is aria-disabled rather than disabled, so keyboard focus stays on it.
 */
function Arrow({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      aria-disabled={disabled}
      aria-label={dir === "prev" ? "Previous card" : "Next card"}
      className={cn(
        "group/arrow grid size-11 place-items-center rounded-xl text-signal-orange transition-opacity duration-300",
        "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
        "aria-disabled:cursor-default aria-disabled:opacity-30",
      )}
    >
      <Icon
        name={dir === "prev" ? "arrow_back" : "arrow_forward"}
        className={cn(
          "text-[1.75rem]! transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          !disabled && (dir === "prev" ? "group-hover/arrow:-translate-x-1" : "group-hover/arrow:translate-x-1"),
        )}
      />
    </button>
  );
}

/** A frosted pane of the topic's field laid on the photograph (globals.css, .reel-glass): the photograph shows through, blurred. */
const GLASS = "reel-glass ring-1 ring-white/15 ring-inset";

/**
 * One card. How it looks in the row is set by CSS from `open` alone (the
 * `min-[90rem]:` classes), so the server's first paint on a wide screen is
 * already the finished row; `row` (known only after hydration) decides what
 * is reachable: in the reel every slide is, in the row only the open one.
 */
function ReelCard({ slide, open, row, onOpen }: { slide: CharterSlide; open: boolean; row: boolean; onOpen: () => void }) {
  const look = CHARTER_LOOKS[slide.id];
  const topic = CHARTER_TOPIC[slide.id];
  const { photo, focus, lift } = PHOTOS[slide.id];
  const slideId = useId();
  const slideRef = useRef<HTMLDivElement>(null);
  const [ref, { active }] = useInView<HTMLLIElement>();

  return (
    <li
      ref={ref}
      id={slide.id}
      // Cobalt is the lightest field, so its panes are a step more opaque to hold the white type.
      style={{ ...look.vars, "--glass": look.vars["--field"] === "var(--color-cobalt)" ? "80%" : "72%" } as CSSProperties}
      className={cn(
        "group/card relative isolate flex shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-(--field) text-white scroll-mt-header lg:scroll-mt-header-lg",
        "min-h-128 w-[min(86vw,30rem)] sm:w-120 lg:w-176",
        "min-[90rem]:min-h-0 min-[90rem]:w-auto min-[90rem]:basis-(--spine) min-[90rem]:transition-[flex-grow] min-[90rem]:duration-700 min-[90rem]:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open ? "min-[90rem]:grow" : "min-[90rem]:grow-0",
      )}
    >
      {/* The photograph: in full on an open card, under a light wash of the field on a closed tile. */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 -z-20 h-(--lifted) transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          !open && "min-[90rem]:h-full",
        )}
        style={{ "--lifted": `${(1 + lift) * 100}%` } as CSSProperties}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 90rem) 70vw, (min-width: 64rem) 52rem, (min-width: 40rem) 36rem, 100vw"
          className={cn(
            "object-cover transition-[scale] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            open ? "reel-settle" : "min-[90rem]:group-hover/card:scale-105",
          )}
          style={{ objectPosition: focus }}
        />
      </div>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 bg-(--field) opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          !open && "min-[90rem]:opacity-35 min-[90rem]:group-hover/card:opacity-0",
        )}
      />
      {/* The edge, drawn over the photograph so it holds on the black. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-10 rounded-3xl ring-1 ring-white/12 ring-inset" />

      {/* A closed tile (row only; hidden in the reel): its symbol and name on a small frosted label at
          the foot; the whole tile opens it. Opened from the keyboard, focus moves into the slide. */}
      <button
        type="button"
        inert={open}
        onClick={(e) => {
          onOpen();
          if (e.detail === 0) requestAnimationFrame(() => slideRef.current?.focus());
        }}
        aria-expanded={false}
        aria-controls={slideId}
        aria-label={`Open ${topic.name}: ${slide.title.join(" ")}`}
        className={cn(
          "absolute inset-0 z-10 hidden flex-col justify-end rounded-3xl p-2 text-left transition-opacity min-[90rem]:flex",
          "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none focus-visible:ring-inset",
          open ? "pointer-events-none opacity-0 duration-150" : "opacity-100 delay-300 duration-500",
        )}
      >
        <span
          className={cn(
            GLASS,
            "flex flex-col items-start gap-2.5 rounded-2xl p-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:-translate-y-1 motion-reduce:transition-none",
          )}
        >
          <Icon name={topic.icon} className="text-[1.375rem]! text-signal-orange" />
          <span className="font-grotesk text-sm leading-tight font-bold">{topic.name}</span>
        </span>
      </button>

      {/* The slide, set at the open card's final width so it never reflows while the card grows. */}
      <div
        ref={slideRef}
        id={slideId}
        tabIndex={-1}
        role="group"
        aria-label={`${topic.name}: ${slide.title.join(" ")}`}
        inert={row && !open}
        className={cn(
          "@container/slide relative flex flex-1 flex-col p-3 outline-none sm:p-4",
          "min-[90rem]:absolute min-[90rem]:inset-y-0 min-[90rem]:left-0 min-[90rem]:w-[calc(100cqw-(var(--n)-1)*(var(--spine)+0.75rem))] min-[90rem]:p-4 min-[90rem]:transition-opacity motion-reduce:transition-none",
          open ? "min-[90rem]:opacity-100 min-[90rem]:delay-200 min-[90rem]:duration-500" : "min-[90rem]:opacity-0 min-[90rem]:duration-150",
        )}
      >
        <Slide slide={slide} rise={open} active={active && (!row || open)} />
      </div>
    </li>
  );
}

function Slide({ slide, rise, active }: { slide: CharterSlide; rise: boolean; active: boolean }) {
  const topic = CHARTER_TOPIC[slide.id];
  const proof = PROOF_HEADING[slide.id];
  // In the row, the open card's panes rise in one after another; elsewhere they simply stand.
  const r = (i: number) => (rise ? { className: "reel-rise", style: { "--i": i } as CSSProperties } : { className: "" });
  return (
    <div className="reel-slide">
      {/* The caption: the topic's symbol and name, then the title, the text and the actions. */}
      <div {...r(0)} className={cn(GLASS, "reel-caption flex flex-col gap-3 rounded-2xl", r(0).className)}>
        <p className="flex items-center gap-2 font-grotesk text-sm font-semibold text-white/80">
          <Icon name={topic.icon} className="text-xl! text-signal-orange" />
          {topic.name}
        </p>
        <h3 className="font-grotesk text-[clamp(1.375rem,1.05rem+1.1cqi,1.625rem)] leading-[1.12] font-bold tracking-tight text-balance">
          {slide.title[0]}{" "}
          <span className={cn("text-signal-orange", slide.strike && "line-through decoration-[3px]")}>{slide.title[1]}</span>
        </h3>
        <p className="max-w-[60ch] text-sm leading-relaxed text-pretty text-white/90">{slide.summary}</p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link href={slide.primary.href} className={cn(btn.gold, "min-h-10 px-4 py-2")}>
            {slide.primary.label}
            <span className="sr-only">: {topic.name}</span>
            <Icon name="arrow_forward" className="text-lg" />
          </Link>
          <Link href={slide.secondary.href} className={cn(btn.goldOutline, "min-h-10 px-4 py-2")}>
            {slide.secondary.label}
          </Link>
        </div>
      </div>

      {/* The evidence, a narrower pane of its own. */}
      {proof && (
        <div {...r(1)} className={cn(GLASS, "reel-stat rounded-2xl", r(1).className)}>
          <p className="text-xs font-semibold text-white/75">{proof}</p>
          <div className="mt-3">
            <Proof slide={slide} active={active} />
          </div>
        </div>
      )}
    </div>
  );
}

/** A figure: its number large and gold, its unit (%, /100) a step smaller beside it; tabular, so a column aligns. */
const FIGURE = "font-grotesk text-[1.625rem] leading-none font-extrabold tracking-tight text-signal-orange tabular-nums";
const UNIT = "ml-0.5 text-[0.8125rem] font-bold text-signal-orange/80";

/**
 * A topic's evidence: its figures as a table (a fixed number column, the
 * label and its note beside it, hairlines between rows; two by two when
 * there are four), its pillars as a list, or its one word. Figures count up
 * as the card opens in view.
 */
function Proof({ slide, active }: { slide: CharterSlide; active: boolean }) {
  if (slide.oneWord) {
    return (
      <>
        <p className="font-grotesk text-[1.75rem] leading-none font-bold tracking-tight">
          {slide.oneWord}
          <span aria-hidden className="ch-caret ml-1 inline-block text-signal-orange">
            ▍
          </span>
        </p>
        <p className="mt-3 text-[0.8125rem] leading-snug text-white/75">No timeline, no finish line: the responsibility simply continues.</p>
      </>
    );
  }
  if (slide.pillars) {
    return (
      <ul className="divide-y divide-white/10">
        {slide.pillars.map((p) => (
          <li key={p.label} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="grid size-9 place-items-center rounded-xl ring-1 ring-signal-orange/40 ring-inset">
              <Icon name={p.icon} className="text-xl! text-signal-orange" />
            </span>
            <span className="font-grotesk text-lg font-bold tracking-tight">{p.label}</span>
          </li>
        ))}
      </ul>
    );
  }
  const stats = slide.stats ?? [];
  if (stats.length > 3) {
    return (
      <dl className="grid grid-cols-2 gap-x-5">
        {stats.map((s, i) => (
          <div key={s.label} className={cn("flex flex-col py-2.5", i > 1 && "border-t border-white/10", i < 2 && "pt-0")}>
            {/* Read as "label: figure, note"; seen as figure over label over note. */}
            <dt className="order-2 mt-1.5 font-grotesk text-[0.8125rem] leading-tight font-bold">{s.label}</dt>
            <dd className={cn(FIGURE, "order-1")}>
              <CountUp stat={s} active={active} suffixClassName={UNIT} />
            </dd>
            <dd className="order-3 mt-0.5 text-xs leading-snug text-white/65 @max-[30rem]/slide:hidden">{s.note}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className="reel-table divide-y divide-white/10">
      {stats.map((s) => (
        <div key={s.label} className="reel-row py-2.5 first:pt-0 last:pb-0">
          {/* Read as "label: figure, note"; seen as the figure in its column, the label and note beside it. */}
          <dt className="reel-label font-grotesk text-[0.8125rem] leading-tight font-bold">{s.label}</dt>
          <dd className={cn(FIGURE, "reel-figure")}>
            <CountUp stat={s} active={active} suffixClassName={UNIT} />
          </dd>
          <dd className="reel-note text-xs leading-snug text-white/65">{s.note}</dd>
        </div>
      ))}
    </dl>
  );
}
