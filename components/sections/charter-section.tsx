"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { charterSlides, type CharterSlide, type CharterStat } from "@/data/charter";
import { cn } from "@/lib/utils";
import { CHARTER_DATA_LABEL, CHARTER_LOOKS, CHARTER_TOPIC } from "./charter-looks";
import { CharterVisual } from "./charter-viz";

/*
 * Charter: problem, challenge, vision, mission, goal and impact, laid out
 * like the partner reviews. On a wide screen (xl) it is one full-width row
 * with one card open: the closed cards stand as narrow spines (symbol and
 * topic, set upright), the open one takes the rest of the row and shows the
 * whole slide. Pointing at a spine (and resting there a moment) opens it.
 * Below xl the cards stack and open in place. A card is one solid field
 * (navy, ink green or gold, nothing else): the claim on one side, a
 * hairline, then its figures and motion graphic.
 *
 * The open slide is set at the open card's final width, so it never
 * reflows while the card grows; its own container queries pick the
 * layout (claim | figures, then claim | figures | graphic once there is
 * room). The + on each card turns to × when open; it is the keyboard and
 * touch control (focus opens, Enter or a tap toggles).
 */

/** Pointing at a spine opens it only once the pointer settles, so sweeping across the row does not flicker. */
export const HOVER_INTENT_MS = 120;

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
      {/* --n: the card count, for the open slide's width. Spines are 5rem with 0.75rem gaps. */}
      <ul
        style={{ "--n": charterSlides.length } as CSSProperties}
        className="story-reveal @container flex flex-col gap-3 px-gutter-x xl:h-[32rem] xl:flex-row xl:px-6"
      >
        {charterSlides.map((slide, i) => (
          <CharterCard
            key={slide.id}
            slide={slide}
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

function CharterCard({
  slide,
  open,
  anyOpen,
  onOpen,
  onToggle,
}: {
  slide: CharterSlide;
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
        if (e.pointerType !== "mouse" || open) return;
        intent.current = window.setTimeout(onOpen, HOVER_INTENT_MS);
      }}
      onPointerLeave={() => window.clearTimeout(intent.current)}
      style={look.vars as CSSProperties}
      className={cn(
        "relative flex min-w-0 scroll-mt-header flex-col overflow-hidden rounded-3xl bg-(--field) text-(--ink) xl:basis-20 lg:scroll-mt-header-lg",
        !look.gold && "ring-1 ring-white/12 ring-inset", // ink and navy need an edge on black
        "transition-[flex-grow,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open
          ? "shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_28px_48px_-22px_var(--glow)] xl:grow"
          : cn("shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_30px_60px_-36px_rgb(0_0_0/0.9)]", anyOpen ? "xl:grow-0" : "xl:grow"),
      )}
    >
      {/* Stacked (below xl): a header row that opens the card in place. */}
      <div className="flex items-center justify-between gap-4 p-5 sm:px-8 xl:hidden">
        <span className="flex items-center gap-3 font-grotesk text-lg font-bold">
          <Icon name={topic.icon} className="text-(--accent)" />
          {topic.name}
        </span>
        <Toggle open={open} onOpen={onOpen} onToggle={onToggle} controls={bodyId} label={label} />
      </div>

      {/* The spine (xl): the closed card's face, symbol and topic set upright. */}
      <div
        aria-hidden={open}
        className={cn(
          "absolute inset-0 hidden flex-col items-center justify-between py-6 transition-opacity duration-300 motion-reduce:transition-none xl:flex",
          open ? "pointer-events-none opacity-0" : "opacity-100 delay-200",
        )}
      >
        <Icon name={topic.icon} className="text-(--accent)" />
        <span className="font-grotesk text-xl font-bold tracking-tight whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
          {topic.name}
        </span>
        <Toggle open={open} onOpen={onOpen} onToggle={onToggle} controls={bodyId} label={label} />
      </div>

      {/* The slide. Stacked: it unfolds under the header. Row: it sits at the open card's final width and fades in. */}
      <div
        id={bodyId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity,translate] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          "xl:absolute xl:inset-y-0 xl:left-0 xl:block xl:w-[calc(100cqw-(var(--n)-1)*5.75rem)]",
          // Opening: the slide drifts in once the card has made room. Closing: it leaves at once.
          open ? "grid-rows-[1fr] opacity-100 duration-500 xl:translate-x-0 xl:delay-200" : "grid-rows-[0fr] opacity-0 duration-200 xl:translate-x-4",
        )}
      >
        <div className="min-h-0 overflow-hidden xl:h-full">
          <Slide slide={slide} gold={look.gold} on={on && open} active={active && open} onClose={onToggle} closeId={bodyId} label={label} />
        </div>
      </div>
    </li>
  );
}

/**
 * A slide's content. Narrow: claim, figures and graphic stacked. From a
 * 42rem slide: claim | figures. From 56rem: claim | figures | graphic. A
 * slide without figures keeps its graphic beside the claim at every width.
 * A hairline parts the claim from its figures.
 */
function Slide({
  slide,
  gold,
  on,
  active,
  onClose,
  closeId,
  label,
}: {
  slide: CharterSlide;
  gold: boolean;
  on: boolean;
  active: boolean;
  onClose: () => void;
  closeId: string;
  label: string;
}) {
  const hasData = Boolean(slide.oneWord || slide.pillars || slide.stats);
  return (
    <div className="group/card @container relative h-full">
      {/* The open card's ×, in the row's top corner. */}
      <div className="absolute top-5 right-5 z-10 hidden xl:block">
        <Toggle open onOpen={() => {}} onToggle={onClose} controls={closeId} label={label} />
      </div>
      <div
        className={cn(
          "grid h-full grid-cols-1",
          hasData
            ? "@2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] @4xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,1fr)]"
            : "@2xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]",
        )}
      >
        <Claim slide={slide} gold={gold} />
        {hasData && <Data slide={slide} active={active} />}
        <div
          className={cn(
            "flex min-w-0 items-center justify-center px-6 pt-2 pb-8 @2xl:py-10 @2xl:pr-10 @2xl:pl-4",
            hasData && "@2xl:hidden @4xl:flex",
          )}
        >
          <div
            className={cn(
              "w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100",
              slide.viz !== "impact" && "mx-auto max-w-60 @2xl:max-w-none",
            )}
          >
            <CharterVisual kind={slide.viz} active={on} grow={active} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Claim({ slide, gold }: { slide: CharterSlide; gold: boolean }) {
  return (
    <div className="flex flex-col justify-center p-6 sm:p-8 @2xl:py-10 @2xl:pr-8 @2xl:pl-10">
      <h2 className="font-grotesk text-3xl leading-[1.06] font-bold tracking-[-0.03em] text-balance">
        <span className="block">{slide.title[0]}</span>
        <span className={cn("block text-(--accent)", slide.strike && "line-through decoration-[3px] opacity-80")}>{slide.title[1]}</span>
      </h2>

      {slide.body.map((p) => (
        <p key={p.slice(0, 24)} className="mt-3 font-sans text-sm leading-[1.6] text-(--ink)/80">
          {p}
        </p>
      ))}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={slide.primary.href} className={gold ? btn.navy : btn.gold}>
          {slide.primary.label}
          <span className="sr-only">: {slide.title.join(" ")}</span>
          <Icon name="arrow_forward" className="text-lg" />
        </Link>
        <Link href={slide.secondary.href} className={gold ? btn.navyOutline : btn.goldOutline}>
          {slide.secondary.label}
        </Link>
      </div>
    </div>
  );
}

/** A flat, see-through film of the text colour with a hairline edge. */
const TILE = "rounded-2xl bg-(--ink)/[0.07] ring-1 ring-(--ink)/12 ring-inset";

function Data({ slide, active }: { slide: CharterSlide; active: boolean }) {
  const stats = slide.stats ?? [];
  const fourUp = stats.length > 3;
  // Wide enough for the longest figure, so the labels line up.
  const figureWidth = `${Math.max(2, ...stats.map((s) => `${s.value}${s.suffix ?? ""}`.length)) * 0.62}em`;
  const label = CHARTER_DATA_LABEL[slide.id];
  return (
    // The hairline: above the figures when stacked, beside them in a row (inset from the card's edges).
    <div className="mx-6 flex min-w-0 flex-col justify-center border-t border-(--ink)/12 pt-6 pb-4 sm:mx-8 @2xl:mx-0 @2xl:my-10 @2xl:border-t-0 @2xl:border-l @2xl:py-0 @2xl:pr-8 @2xl:pl-8 @4xl:pr-2">
      {label && (
        <p className="mb-3 flex items-center gap-2 font-grotesk text-xs font-bold text-(--ink)/80">
          <span aria-hidden className="size-1.5 rounded-full bg-(--accent)" />
          {label}
        </p>
      )}

      {slide.oneWord && (
        <div className={cn(TILE, "px-5 py-5")}>
          <p className="font-grotesk text-xs font-bold text-(--accent)">In one word</p>
          <p className="mt-1.5 font-grotesk text-2xl leading-none font-bold tracking-tight whitespace-nowrap">
            {slide.oneWord}
            <span aria-hidden className="ch-caret ml-1 inline-block text-(--accent)">
              ▍
            </span>
          </p>
          <p className="mt-3 text-xs leading-snug text-(--ink)/80">No timeline, no finish line: the responsibility simply continues.</p>
        </div>
      )}

      {slide.pillars && (
        <ul className="grid grid-cols-3 gap-2.5 @2xl:grid-cols-1">
          {slide.pillars.map((p) => (
            <li key={p.label} className={cn(TILE, "flex flex-col items-center gap-1.5 px-3 py-3 @2xl:flex-row @2xl:gap-3 @2xl:px-4")}>
              <Icon name={p.icon} className="text-2xl! text-(--accent)" />
              <span className="font-grotesk text-xs font-bold">{p.label}</span>
            </li>
          ))}
        </ul>
      )}

      {stats.length > 0 && (
        <ul className={cn("grid gap-2.5", fourUp ? "grid-cols-2" : "grid-cols-3 @2xl:grid-cols-1")}>
          {stats.map((s) => (
            <li key={s.label} className={cn(TILE, "px-4 py-2.5", !fourUp && "@2xl:flex @2xl:items-center @2xl:gap-4")}>
              <p
                style={fourUp ? undefined : { minWidth: figureWidth }}
                className="font-grotesk text-3xl leading-none font-extrabold tracking-tight text-(--accent) @2xl:shrink-0"
              >
                <CountUp stat={s} active={active} />
              </p>
              <div className={cn("mt-1.5", !fourUp && "@2xl:mt-0")}>
                <p className="font-grotesk text-xs font-bold text-(--ink)/80">{s.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-(--ink)/80">{s.note}</p>
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
