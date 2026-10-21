"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { charterSlides, type CharterSlide, type CharterStat } from "@/data/charter";
import { cn } from "@/lib/utils";
import { CHARTER_LOOKS, CHARTER_TOPIC } from "./charter-looks";
import { CharterVisual } from "./charter-viz";

/*
 * Charter: problem, challenge, vision, mission, goal and impact, laid out
 * like the partner reviews. On a wide screen (xl) it is one full-width row
 * with one card open: the closed cards stand as narrow spines, the open one
 * takes the rest of the row. Pointing at a spine (and resting there a
 * moment) opens it. On a laptop or landscape tablet (lg, 1024 to 1279px)
 * the open card stands on the left and the closed ones line up as short
 * rows beside it, so the charter fits one landscape screen. Below lg the
 * cards stack and open in place. A card is one solid field (navy, ink or
 * cobalt, nothing else).
 *
 * Every card names its topic the same way, read across, never set upright
 * (Mahir, 2026-10-21): a spine carries its symbol with the name under it at
 * the top; the open card carries both in a row at its top-left, where the
 * spine had them. Under that name the open card shows three separate
 * panels, the claim (a short lede, not the whole text), its figures and
 * its motion graphic, and they rise in one after another. Type inside a
 * panel is sized from the panel's own width, so a big card reads big and
 * a narrow one stays whole.
 *
 * The open slide is set at the open card's final width, so it never
 * reflows while the card grows; its container queries pick the layout
 * (claim | figures, then claim | figures | graphic once there is room).
 * The + on each card turns to × when open; it is the keyboard and touch
 * control (focus opens, Enter or a tap toggles).
 */

/** Pointing at a spine opens it only once the pointer settles, so sweeping across the row does not flicker. */
export const HOVER_INTENT_MS = 120;

/** The lg layout moves the open card beside the rows, so pointing at a row there must not open it (the rows would shuffle under the pointer). */
const SIDE_ROWS_MQ = "(min-width: 64rem) and (max-width: 79.98rem)";

export function CharterSection() {
  const [open, setOpen] = useState(0);

  // Arriving at "#mission" (the header's Mission tab) or any topic's id opens that card.
  useEffect(() => {
    const fromHash = () => {
      const i = charterSlides.findIndex((s) => `#${s.id}` === window.location.hash);
      if (i >= 0) setOpen(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  return (
    <section id="charter" aria-label="Kandari Lab charter" className="section-band">
      {/*
        * --n: the card count, for the open slide's width. Spines are 6rem with 0.75rem gaps. The row is as tall as the partner reviews (27rem).
        * lg: the open card on the left across five rows, the five closed cards as the rows of a 15rem column on the right.
        */}
      <ul
        style={{ "--n": charterSlides.length } as CSSProperties}
        className={cn(
          "story-reveal @container mx-auto flex w-full max-w-384 flex-col gap-3 px-gutter-x xl:h-108 xl:flex-row",
          open >= 0 && "lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:grid-rows-[repeat(5,auto)] xl:flex",
        )}
      >
        {charterSlides.map((slide, i) => (
          <CharterCard
            key={slide.id}
            slide={slide}
            index={i}
            open={open === i}
            anyOpen={open >= 0}
            onOpen={() => setOpen(i)}
            onToggle={() => setOpen((o) => (o === i ? -1 : i))}
          />
        ))}
      </ul>
    </section>
  );
}

/** `on`: any of the card is in view (its loops run). `active`: a third or more is (its figures count up). */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState({ on: false, active: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const on = e.isIntersecting;
        const active = on && e.intersectionRatio >= 0.35;
        setState((s) => (s.on === on && s.active === active ? s : { on, active }));
      },
      { threshold: [0, 0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, state] as const;
}

/** The + that turns to ×: focus opens, a press toggles. */
export function Toggle({ open, onOpen, onToggle, controls, label }: { open: boolean; onOpen: () => void; onToggle: () => void; controls: string; label: string }) {
  return (
    <button
      type="button"
      onFocus={onOpen}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`${open ? "Close" : "Open"} ${label}`}
      className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--accent) text-(--accent-on) transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-(--ink) focus-visible:ring-offset-2 focus-visible:ring-offset-(--field) focus-visible:outline-none motion-reduce:transition-none"
    >
      <Icon
        name="add"
        className={cn("text-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none", open && "rotate-45")}
      />
    </button>
  );
}

/**
 * A topic's name. In the stacked header (below xl) it reads across with its
 * symbol, which has its own small loop (globals.css, `.topic-icon`): the
 * problem glitches, the flag waves, the eye blinks, the rocket lifts, the
 * target pulses, the people bob. On the open card's name card (`large`) it
 * stands alone, bold and gold, with no symbol.
 */
function TopicName({ id, large, className }: { id: string; large?: boolean; className?: string }) {
  const topic = CHARTER_TOPIC[id];
  if (large) {
    return <span className={cn("font-grotesk text-[1.75rem] leading-none font-extrabold tracking-tight whitespace-nowrap text-signal-orange", className)}>{topic.name}</span>;
  }
  return (
    <span className={cn("flex items-center gap-3 font-grotesk text-lg font-bold tracking-tight", className)}>
      <span data-topic={id} className="topic-icon inline-flex">
        <Icon name={topic.icon} className="text-2xl! text-(--accent)" />
      </span>
      <span className="whitespace-nowrap">{topic.name}</span>
    </span>
  );
}

function CharterCard({
  slide,
  index,
  open,
  anyOpen,
  onOpen,
  onToggle,
}: {
  slide: CharterSlide;
  index: number;
  open: boolean;
  anyOpen: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const look = CHARTER_LOOKS[slide.id];
  const topic = CHARTER_TOPIC[slide.id];
  const bodyId = useId();
  const [ref, { on, active }] = useInView<HTMLLIElement>();
  const intent = useRef(0);
  const label = `${topic.name}: ${slide.title.join(" ")}`;

  useEffect(() => () => window.clearTimeout(intent.current), []);

  return (
    <li
      ref={ref}
      id={slide.id}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || open || window.matchMedia(SIDE_ROWS_MQ).matches) return;
        intent.current = window.setTimeout(onOpen, HOVER_INTENT_MS);
      }}
      onPointerLeave={() => window.clearTimeout(intent.current)}
      style={look.vars as CSSProperties}
      className={cn(
        "relative flex min-w-0 scroll-mt-header flex-col overflow-hidden rounded-3xl bg-(--field) text-(--ink) xl:basis-24 lg:scroll-mt-header-lg",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_30px_60px_-36px_rgb(0_0_0/0.9)]",
        !look.gold && "ring-1 ring-white/12 ring-inset", // ink and navy need an edge on black
        "transition-[flex-grow,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        // Open on a wide screen, the card itself steps back: its slide is two cards of the same field.
        open ? "xl:grow xl:bg-transparent xl:shadow-none xl:ring-0" : anyOpen ? "xl:grow-0" : "xl:grow",
        // lg: the open card spans the five rows on the left; a closed one is a row on the right, its name centred in it.
        anyOpen && (open ? "lg:col-start-1 lg:row-span-5 lg:row-start-1" : "lg:col-start-2 lg:justify-center"),
      )}
    >
      {/* Stacked (below xl): a header row that opens the card in place. */}
      <div className={cn("flex items-center justify-between gap-4 p-5 sm:px-8 xl:hidden", !open && anyOpen && "lg:px-5 lg:py-3")}>
        <TopicName id={slide.id} />
        <Toggle open={open} onOpen={onOpen} onToggle={onToggle} controls={bodyId} label={label} />
      </div>

      {/* The spine (xl): the closed card's face is its name alone, bold and gold in the middle, breathing
          slowly and zooming in when pointed at or focused. The whole spine opens the card (focus too). */}
      <button
        type="button"
        tabIndex={open ? -1 : undefined}
        aria-hidden={open || undefined}
        onFocus={onOpen}
        onClick={onOpen}
        aria-expanded={false}
        aria-controls={bodyId}
        aria-label={`Open ${label}`}
        className={cn(
          "group/spine absolute inset-0 hidden items-center justify-center rounded-3xl px-1 transition-opacity duration-300 motion-reduce:transition-none xl:flex",
          "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none focus-visible:ring-inset",
          open ? "pointer-events-none opacity-0" : "opacity-100 delay-200",
        )}
      >
        <span className="transition-[scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/spine:scale-110 group-focus-visible/spine:scale-110 motion-reduce:transition-none">
          <span
            style={{ "--i": index } as CSSProperties}
            className="ch-name-breathe block font-grotesk text-base leading-none font-extrabold tracking-tight whitespace-nowrap text-signal-orange"
          >
            {topic.name}
          </span>
        </span>
      </button>

      {/* The slide. Stacked: it unfolds under the header. Row: it sits at the open card's final width and fades in. */}
      <div
        id={bodyId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          // lg: the card changes place when it opens, so its slide appears at once (its panels still rise in) and fills the card.
          anyOpen && "lg:transition-none xl:transition-[grid-template-rows,opacity] xl:motion-reduce:transition-none",
          open && "lg:flex-1",
          "xl:absolute xl:inset-y-0 xl:left-0 xl:block xl:w-[calc(100cqw-(var(--n)-1)*6.75rem)]",
          // Opening: the slide shows once the card has made room. Closing: it leaves at once.
          open ? "grid-rows-[1fr] opacity-100 duration-500 xl:delay-150" : "grid-rows-[0fr] opacity-0 duration-200",
        )}
      >
        <div className="min-h-0 overflow-hidden xl:h-full">
          <Slide slide={slide} gold={look.gold} open={open} on={on && open} active={active && open} onClose={onToggle} closeId={bodyId} label={label} />
        </div>
      </div>
    </li>
  );
}

/**
 * On a wide screen each half of the open slide is a card of its own, in the
 * topic's solid field with the spines' edge and the row's 0.75rem gap.
 * Stacked, the halves sit on the card's field and need no edge.
 */
const HALF =
  "flex min-w-0 flex-col xl:rounded-3xl xl:bg-(--field) xl:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_30px_60px_-36px_rgb(0_0_0/0.9)] xl:ring-1 xl:ring-white/12 xl:ring-inset";

/**
 * A slide. Wide screens: one bar across the top with the topic's name, its
 * title on the same line and the ×; under it, on the left the claim's card
 * (the text in short sentences and the two actions), on the right the
 * evidence card, the figures and the motion graphic side by side with no
 * headings and no rules between them. Narrow: stacked, the claim's card
 * carrying the title itself. From a 36rem slide the two cards stand side by
 * side; the graphic joins the figures from 56rem. A slide without figures
 * puts its graphic in the evidence card.
 *
 * Opening: the bar and the claim's card slide in from the left, the
 * evidence card from the right, then their contents rise one by one.
 */
function Slide({
  slide,
  gold,
  open,
  on,
  active,
  onClose,
  closeId,
  label,
}: {
  slide: CharterSlide;
  gold: boolean;
  open: boolean;
  on: boolean;
  active: boolean;
  onClose: () => void;
  closeId: string;
  label: string;
}) {
  const hasData = Boolean(slide.oneWord || slide.pillars || slide.stats);
  const rise = (i: number) => (open ? { className: "ch-rise", style: { "--i": i } as CSSProperties } : {});
  return (
    <div className="group/card @container flex h-full flex-col gap-3 pb-3 xl:pb-0">
      {/* The bar (wide screens; the stacked header shows the name): the name in gold and the title beside it on one line, centred together; the × at the right. */}
      <div className={cn(HALF, "relative hidden h-16 shrink-0 flex-row items-center justify-center gap-[clamp(1rem,3cqi,2rem)] px-16 xl:flex", open && "ch-card-in")}>
        <TopicName id={slide.id} large className={cn("shrink-0 text-[clamp(1.375rem,3.2cqi,1.875rem)]", open && "ch-unfold")} />
        <h3 className={cn("min-w-0 truncate font-grotesk text-[clamp(1.0625rem,2.5cqi,1.625rem)] leading-tight font-bold tracking-[-0.02em]", open && "ch-unfold")}>
          {slide.title[0]}{" "}
          <span className={cn("text-(--accent)", slide.strike && "line-through decoration-2 opacity-80")}>{slide.title[1]}</span>
        </h3>
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <Toggle open onOpen={() => {}} onToggle={onClose} controls={closeId} label={label} />
        </div>
      </div>

      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-1 gap-3",
          hasData
            ? "@min-[36rem]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @4xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)]"
            : "@min-[36rem]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]",
        )}
      >
        {/* The claim's card: the text and the two actions (stacked, the title over them). */}
        <div style={{ "--d": "0.06s" } as CSSProperties} className={cn(HALF, "flex-1", open && "ch-card-in")}>
          <div {...rise(0)} className={cn("@container flex flex-1 items-center justify-center", rise(0).className)}>
            <Claim slide={slide} gold={gold} />
          </div>
        </div>

        {/* The evidence card: figures and graphic side by side. */}
        <div
          style={{ "--d": "0.12s" } as CSSProperties}
          // The impact charts carry the most words (and their honesty note), so they take the larger share.
          className={cn(HALF, "relative", hasData && "@4xl:grid @4xl:grid-cols-2", slide.viz === "impact" && "@4xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]", open && "ch-card-in ch-card-in-right")}
        >
          {hasData && (
            <div className="@container flex min-w-0 flex-1 items-center">
              <Data slide={slide} active={active} open={open} />
            </div>
          )}
          <div {...rise(hasData ? 3 : 1)} className={cn("flex min-w-0 flex-1 items-center justify-center overflow-hidden px-8 pt-4 pb-8 xl:py-6", slide.viz === "impact" && "xl:py-4 xl:pr-6 xl:pl-2", hasData && "@min-[36rem]:hidden @4xl:flex", rise(hasData ? 3 : 1).className)}>
            <div
              className={cn(
                "w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100",
                // The graphics stay a little inside their card, never edge to edge.
              slide.viz !== "impact" && "mx-auto max-w-72 @min-[36rem]:max-w-[88%]",
              )}
            >
              <CharterVisual kind={slide.viz} active={on} grow={active} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** On a wide screen the claim's two actions are a size smaller, so they share one row in the narrower card. */
const COMPACT = "xl:min-h-10 xl:px-4 xl:py-2";

/** The claim: stacked, the title, the text and the actions, centred; on a wide screen (the title is in the bar) the text and the actions, read from the left. */
function Claim({ slide, gold }: { slide: CharterSlide; gold: boolean }) {
  return (
    <div className="flex flex-col items-center gap-[clamp(1.25rem,6cqi,2rem)] px-[clamp(1.25rem,7cqi,2.5rem)] pt-2 pb-8 text-center xl:items-start xl:gap-6 xl:py-6 xl:text-left">
      <h2 className="font-grotesk text-[clamp(1.75rem,9.5cqi,3rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance xl:hidden">
        <span className="block">{slide.title[0]}</span>
        <span className={cn("block text-(--accent)", slide.strike && "line-through decoration-[3px] opacity-80")}>{slide.title[1]}</span>
      </h2>

      <p className="max-w-[52ch] text-[clamp(0.9375rem,3.4cqi,1.0625rem)] leading-relaxed text-pretty text-(--ink)/85">{slide.summary}</p>

      <div className="flex flex-wrap justify-center gap-3 xl:justify-start">
        <Link href={slide.primary.href} className={cn(gold ? btn.navy : btn.gold, COMPACT)}>
          {slide.primary.label}
          <span className="sr-only">: {slide.title.join(" ")}</span>
          <Icon name="arrow_forward" className="text-lg" />
        </Link>
        <Link href={slide.secondary.href} className={cn(gold ? btn.navyOutline : btn.goldOutline, COMPACT)}>
          {slide.secondary.label}
        </Link>
      </div>
    </div>
  );
}

/** A figure's size follows its panel's width: large on a wide card, never cut on a narrow one. */
const FIGURE = "font-grotesk text-[clamp(1.5rem,9cqi,2.25rem)] leading-none font-extrabold tracking-tight text-(--accent)";

function Data({ slide, active, open }: { slide: CharterSlide; active: boolean; open: boolean }) {
  const stats = slide.stats ?? [];
  const fourUp = stats.length > 3;
  // Wide enough for the longest figure, so the labels line up.
  const figureWidth = `${Math.max(2, ...stats.map((s) => `${s.value}${s.suffix ?? ""}`.length)) * 0.62}em`;
  // The rows rise one by one, after the cards have slid in.
  const rise = (n: number) => (open ? { className: "ch-rise", style: { "--i": 1 + n * 0.6 } as CSSProperties } : {});
  return (
    <div className="mx-auto w-fit max-w-full px-[clamp(1.5rem,8cqi,2.5rem)] pt-2 pb-8 xl:py-6">
      {slide.oneWord && (
        <div {...rise(0)}>
          <p className="font-grotesk text-[clamp(1.625rem,10.5cqi,2.5rem)] leading-none font-bold tracking-tight whitespace-nowrap">
            {slide.oneWord}
            <span aria-hidden className="ch-caret ml-1 inline-block text-(--accent)">
              ▍
            </span>
          </p>
          <p className="mt-5 max-w-[30ch] text-[clamp(0.875rem,4cqi,1rem)] leading-snug text-(--ink)/80">No timeline, no finish line: the responsibility simply continues.</p>
        </div>
      )}

      {slide.pillars && (
        <ul className="flex flex-col gap-[clamp(0.75rem,4cqi,1.25rem)]">
          {slide.pillars.map((p, n) => (
            <li key={p.label} {...rise(n)}>
              <span className="flex items-center gap-4">
                <span className={cn("grid size-[clamp(2.75rem,15cqi,3.5rem)] shrink-0 place-items-center rounded-2xl ring-1 ring-(--accent)/40 ring-inset", open && "ch-pop")} style={{ "--i": 1.4 + n * 0.6 } as CSSProperties}>
                  <Icon name={p.icon} className="text-[clamp(1.5rem,8cqi,1.875rem)]! text-(--accent)" />
                </span>
                <span className="font-grotesk text-[clamp(1.25rem,8cqi,1.75rem)] font-bold tracking-tight">{p.label}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {stats.length > 0 && (
        <ul className={cn(fourUp ? "grid grid-cols-2 gap-x-6 gap-y-6" : "flex flex-col gap-[clamp(1rem,5cqi,1.5rem)]")}>
          {stats.map((s, n) => (
            <li key={s.label} {...rise(n)}>
              <div className={cn(!fourUp && "flex items-center gap-4")}>
                <p style={fourUp ? undefined : { minWidth: figureWidth }} className={cn(FIGURE, "shrink-0")}>
                  <CountUp stat={s} active={active} />
                </p>
                <div className={cn(fourUp && "mt-1.5")}>
                  <p className="font-grotesk text-sm font-bold">{s.label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-(--ink)/80">{s.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Counts up whenever its card opens in view; screen readers get the final value only. */
export function CountUp({ stat, active }: { stat: CharterStat; active: boolean }) {
  const [shown, setShown] = useState(stat.value);
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1200);
      setShown(p < 1 ? stat.value * (1 - 2 ** (-10 * p)) : stat.value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, stat.value]);
  const fmt = (v: number) => v.toFixed(stat.decimals ?? 0);
  return (
    <>
      <span aria-hidden>
        {fmt(shown)}
        {stat.suffix}
      </span>
      <span className="sr-only">
        {fmt(stat.value)}
        {stat.suffix}
      </span>
    </>
  );
}
