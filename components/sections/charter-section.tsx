"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { charterSlides, type CharterSlide, type CharterStat } from "@/data/charter";
import { cn } from "@/lib/utils";
import { CharterVisual } from "./charter-viz";

/** The glide's pace, in px a second: a half card passes in about twenty seconds. */
const SPEED = 30;
/** An arrow press glides to the next card edge in this long. */
const STEP_MS = 700;

/**
 * Each slide's field and accent, from the site palette only: a deep solid
 * fill (navy, ink or bottle green, all white-text grounds) and one accent
 * for its title line, figures and motion graphic. Red is the urgency colour
 * (CLAUDE.md §4.1), so only the problem slide carries it.
 */
const LOOKS: Record<string, { fill: string; accent: string; text: string }> = {
  problem: { fill: "bg-bdnavy-900", accent: "var(--color-crimson-bright)", text: "text-crimson-bright" },
  challenge: { fill: "bg-text-primary", accent: "var(--color-signal-orange)", text: "text-signal-orange" },
  vision: { fill: "bg-bd-green", accent: "var(--color-signal-orange)", text: "text-signal-orange" },
  mission: { fill: "bg-bdnavy-900", accent: "var(--color-bdgreen-500)", text: "text-bdgreen-500" },
  goal: { fill: "bg-text-primary", accent: "var(--color-signal-orange)", text: "text-signal-orange" },
  impact: { fill: "bg-bd-green", accent: "var(--color-signal-orange)", text: "text-signal-orange" },
};

type Part = "claim" | "proof";

/** Every slide as two half cards: the claim (title, copy, routes), then its proof (figures and motion graphic). */
const CARDS = charterSlides.flatMap((slide, n) => (["claim", "proof"] as Part[]).map((part) => ({ slide, n, part })));

/** How many cards sit left of the column at first paint (the impact pair, peeking in). */
const LEAD = 2;

const mod = (a: number, b: number) => ((a % b) + b) % b;
const ease = (p: number) => 1 - Math.pow(1 - p, 3);

/**
 * Charter: problem, challenge, vision, mission, goal and impact (Mahir's
 * copy, 2026-10-15), laid out per his mark-up of 2026-10-17: every slide is
 * two half cards, its claim and its proof, so the page's content column
 * (the `max-w-7xl px-gutter-x` box, 1216px on a wide screen) holds one
 * slide's pair side by side and the cards either side peek in at the window
 * edges. On a phone a card is the full column.
 *
 * The whole row glides left on its own, without stopping, and holds still
 * while the pointer is over it, focus is inside it or it is being dragged
 * (mouse or finger). Each card is placed on its own and wraps from the far
 * left to the far right while out of sight, so the loop never jumps on
 * screen. The two gold arrows (← →, Mahir's mark-up) sit in the gaps either
 * side of the column and glide to the next card edge. Under reduced motion
 * the row stands still and only the arrows and dragging move it.
 */
export function CharterSection() {
  const root = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  // All motion state lives in refs: the glide writes styles straight to the
  // cards every frame instead of re-rendering React.
  const offset = useRef(0);
  const tween = useRef<{ from: number; to: number; t0: number } | null>(null);
  const hold = useRef({ hover: false, focus: false, drag: false });
  const drag = useRef({ id: -1, x: 0, start: 0, moved: false });
  const geo = useRef({ width: 0, col: 0, step: 0, w: 0 });

  useEffect(() => {
    const sec = root.current;
    if (!sec) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = true;
    let dirty = true;

    const measure = () => {
      const col = colRef.current?.offsetWidth ?? 0;
      const width = sec.clientWidth;
      geo.current = {
        width,
        col: (width - col) / 2,
        step: stepRef.current?.offsetWidth ?? 0,
        w: cards.current[0]?.offsetWidth ?? 0,
      };
      dirty = true;
    };

    const place = () => {
      const { width, col, step, w } = geo.current;
      if (!step) return;
      const total = step * CARDS.length;
      // Cards may sit up to one step left of the window before they wrap.
      const shift = col + step;
      cards.current.forEach((el, i) => {
        if (!el) return;
        const x = mod(i * step - offset.current + shift, total) - shift + col;
        el.style.translate = `${x}px 0`;
        // Only a card mostly on screen takes focus; the rest are scenery.
        const live = Math.min(x + w, width) - Math.max(x, 0) >= w * 0.6;
        if (el.inert === live) el.inert = !live;
      });
    };

    let raf = 0;
    let last = performance.now();
    const frame = (t: number) => {
      // A long gap (a background tab) must not fling the row ahead.
      const dt = Math.min(t - last, 64);
      last = t;
      const tw = tween.current;
      const h = hold.current;
      if (tw) {
        const p = Math.min(1, (t - tw.t0) / STEP_MS);
        offset.current = tw.from + (tw.to - tw.from) * ease(p);
        if (p === 1) tween.current = null;
        dirty = true;
      } else if (onScreen && !h.hover && !h.focus && !h.drag && !reduce.matches) {
        offset.current += (SPEED * dt) / 1000;
        dirty = true;
      }
      if (dirty) {
        place();
        dirty = false;
      }
      raf = requestAnimationFrame(frame);
    };

    measure();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(measure);
    ro.observe(sec);
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(sec);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // The arrows: glide to the next card edge in that direction, so the
  // column comes to rest on whole cards.
  const step = (dir: 1 | -1) => {
    const s = geo.current.step;
    if (!s) return;
    const from = tween.current?.to ?? offset.current;
    const to = dir > 0 ? (Math.floor(from / s + 1e-3) + 1) * s : (Math.ceil(from / s - 1e-3) - 1) * s;
    tween.current = { from: offset.current, to, t0: performance.now() };
  };

  // Drag with a mouse or a finger; vertical swipes still scroll the page.
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    tween.current = null;
    drag.current = { id: e.pointerId, x: e.clientX, start: offset.current, moved: false };
    hold.current.drag = true;
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId || !hold.current.drag) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved) offset.current = d.start - dx;
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.id !== e.pointerId) return;
    drag.current.id = -1;
    hold.current.drag = false;
  };

  return (
    <section id="charter" aria-label="Kandari Lab charter" className="section-band @container relative overflow-hidden">
      <div
        ref={root}
        aria-roledescription="carousel"
        onPointerEnter={(e) => e.pointerType === "mouse" && (hold.current.hover = true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && (hold.current.hover = false)}
        onFocus={() => (hold.current.focus = true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hold.current.focus = false;
        }}
        // --card: the content column (min(window, 80rem) less the gutters);
        // --w: one card, half the column (less the gap) from md, all of it below.
        className={cn(
          "story-reveal relative [--card:calc(min(100cqw,80rem)-2*var(--spacing-gutter-x))] [--gap:0.75rem] lg:[--gap:1.25rem]",
          "[--w:var(--card)] md:[--w:calc((var(--card)-var(--gap))/2)]",
        )}
      >
        {/* Rulers the glide measures: the column and one card plus its gap. */}
        <div ref={colRef} aria-hidden className="pointer-events-none invisible absolute h-0 w-(--card)" />
        <div ref={stepRef} aria-hidden className="pointer-events-none invisible absolute h-0 w-[calc(var(--w)+var(--gap))]" />

        <div
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          // A drag must not also count as a click on a button under it.
          onClickCapture={(e) => {
            if (drag.current.moved) {
              e.preventDefault();
              e.stopPropagation();
              drag.current.moved = false;
            }
          }}
          onDragStart={(e) => e.preventDefault()}
          // Every card stacks in one grid cell, so the row is as tall as the
          // tallest card and every card stretches to it.
          className="grid touch-pan-y select-none"
        >
          {CARDS.map(({ slide, n, part }, i) => (
            <div
              key={`${slide.id}-${part}`}
              ref={(el) => {
                cards.current[i] = el;
              }}
              // The first paint, before the glide measures: the column opens
              // on the first slide's pair, the last pair peeking in on the left.
              style={{
                translate: `calc((100cqw - var(--card)) / 2 + ${i < CARDS.length - LEAD ? i : i - CARDS.length} * (var(--w) + var(--gap))) 0`,
              }}
              className="w-(--w) [grid-area:1/1] will-change-[translate]"
            >
              <Card slide={slide} n={n} part={part} />
            </div>
          ))}
        </div>

        <Arrow side="prev" onClick={() => step(-1)} />
        <Arrow side="next" onClick={() => step(1)} />
      </div>
    </section>
  );
}

/**
 * A gold arrow centred in the gap beside the content column: a bold, filled
 * arrow with a shaft (not a chevron) on no background at all, nudging in
 * its direction (`ch-nudge` in globals.css; still under reduced motion).
 */
function Arrow({ side, onClick }: { side: "prev" | "next"; onClick: () => void }) {
  const prev = side === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={prev ? "Previous card" : "Next card"}
      // Centred on the gap: the column edge, less half the gap.
      style={{ [prev ? "left" : "right"]: "calc((100% - var(--card)) / 2 - var(--gap) / 2)" } as CSSProperties}
      className={cn(
        // A 48px target around a 34px arrow.
        "group absolute top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full text-signal-orange",
        prev ? "-translate-x-1/2" : "translate-x-1/2",
        "[-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        style={{ "--dir": prev ? -1 : 1 } as CSSProperties}
        className={cn(
          "ch-nudge size-[2.125rem] drop-shadow-[0_4px_10px_rgb(0_0_0/0.55)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-125 group-active:scale-110 motion-reduce:transition-none",
        )}
      >
        <path d={prev ? "M22 9H11V3.5L1.5 12 11 20.5V15H22Z" : "M2 9h11V3.5L22.5 12 13 20.5V15H2Z"} fill="currentColor" />
      </svg>
    </button>
  );
}

/** True while the card is on screen at all (`on`, its motion runs) and mostly so (`active`, its figures count up). */
function useOnScreen<T extends Element>() {
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

/** The compact button height the short card needs (the shared buttons are 50px). */
const SLIM = "py-3 sm:py-3";

function Card({ slide, n, part }: { slide: CharterSlide; n: number; part: Part }) {
  const look = LOOKS[slide.id];
  const [ref, { on, active }] = useOnScreen<HTMLDivElement>();
  const claim = part === "claim";
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={`${n + 1} of ${charterSlides.length}: ${slide.title.join(" ")}${claim ? "" : ", in figures"}`}
      style={{ "--accent": look.accent } as CSSProperties}
      className={cn(
        "@container h-full overflow-hidden rounded-3xl p-6 text-white ring-1 ring-white/12 sm:p-8 xl:p-10",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_40px_80px_-40px_rgb(0_0_0/0.9)]",
        look.fill,
      )}
    >
      {claim ? <Claim slide={slide} text={look.text} /> : <Proof slide={slide} text={look.text} on={on} active={active} />}
    </div>
  );
}

/** The claim, its copy and the two routes. */
function Claim({ slide, text }: { slide: CharterSlide; text: string }) {
  return (
    <div className="flex h-full flex-col justify-center">
      <h2 className="font-grotesk text-[1.75rem] leading-[1.06] font-bold tracking-[-0.03em] text-balance sm:text-[2rem]">
        <span className="block">{slide.title[0]}</span>
        <span className={cn("block", text, slide.strike && "line-through decoration-[3px] opacity-80")}>{slide.title[1]}</span>
      </h2>

      {slide.body.map((p) => (
        <p key={p.slice(0, 24)} className="mt-3 font-sans text-sm leading-[1.6] text-white/80">
          {p}
        </p>
      ))}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={slide.primary.href} draggable={false} className={cn(btn.gold, SLIM)}>
          {slide.primary.label}
          <span className="sr-only">: {slide.title.join(" ")}</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </Link>
        <Link href={slide.secondary.href} draggable={false} className={cn(btn.ghost, SLIM)}>
          {slide.secondary.label}
        </Link>
      </div>
    </div>
  );
}

/**
 * The figures, pillars or one word beside the motion graphic (stacked above
 * it on a narrow card). The goal has nothing for that column, so its
 * graphic takes the whole card.
 */
function Proof({ slide, text, on, active }: { slide: CharterSlide; text: string; on: boolean; active: boolean }) {
  const fourUp = (slide.stats?.length ?? 0) > 3;
  const middle = Boolean(slide.oneWord || slide.pillars || slide.stats);
  // The number column is as wide as this slide's longest figure, so the labels line up without a gap.
  const figureWidth = `${Math.max(...(slide.stats ?? []).map((s) => `${s.value}${s.suffix ?? ""}`.length), 2) * 0.62}em`;
  return (
    <div className={cn("grid h-full grid-cols-1 items-center gap-5", middle && "@sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] @sm:gap-6")}>
      {middle && (
        <div className="flex flex-col justify-center">
          {slide.oneWord && (
            <div className="rounded-2xl bg-white/[0.07] px-5 py-5 ring-1 ring-white/10">
              <p className={cn("font-grotesk text-[11px] font-bold tracking-[0.18em] uppercase", text)}>In one word</p>
              <p className="mt-1.5 font-grotesk text-[1.75rem] leading-none font-bold tracking-tight">
                {slide.oneWord}
                <span aria-hidden className={cn("ch-caret ml-1 inline-block", text)}>
                  ▍
                </span>
              </p>
              <p className="mt-3 text-xs leading-snug text-white/60">No timeline, no finish line: the responsibility simply continues.</p>
            </div>
          )}

          {slide.pillars && (
            <ul className="grid grid-cols-3 gap-2.5 @sm:grid-cols-1">
              {slide.pillars.map((p) => (
                <li key={p.label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/[0.07] px-3 py-3 ring-1 ring-white/10 @sm:flex-row @sm:gap-3 @sm:px-4">
                  <Icon name={p.icon} className={cn("text-[24px]!", text)} />
                  <span className="font-grotesk text-xs font-bold tracking-[0.16em] uppercase">{p.label}</span>
                </li>
              ))}
            </ul>
          )}

          {slide.stats && (
            <ul className={cn("grid gap-2.5", fourUp ? "grid-cols-2" : "grid-cols-3 @sm:grid-cols-1")}>
              {slide.stats.map((s) => (
                <li key={s.label} className={cn("rounded-2xl bg-white/[0.07] px-4 py-2.5 ring-1 ring-white/10", !fourUp && "@sm:flex @sm:items-center @sm:gap-4")}>
                  <p style={fourUp ? undefined : { minWidth: figureWidth }} className={cn("font-grotesk text-[1.75rem] leading-none font-extrabold tracking-tight @sm:shrink-0", text)}>
                    <CountUp stat={s} active={active} />
                  </p>
                  <div className={cn(fourUp ? "mt-1.5" : "mt-1.5 @sm:mt-0")}>
                    <p className="font-grotesk text-[10px] font-bold tracking-[0.16em] text-white/60 uppercase">{s.label}</p>
                    <p className="mt-0.5 text-xs leading-snug text-white/65">{s.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Square drawings stay small when stacked under the figures on a narrow card. */}
      <div className={cn("w-full", middle && slide.viz !== "impact" && "mx-auto max-w-[15rem] @sm:max-w-none")}>
        <CharterVisual kind={slide.viz} active={on} grow={active} />
      </div>
    </div>
  );
}

/** A figure that counts up each time its card glides into view; the real value is always in the accessible text. */
function CountUp({ stat, active }: { stat: CharterStat; active: boolean }) {
  const [shown, setShown] = useState(stat.value);
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1200);
      setShown(stat.value * (1 - Math.pow(2, -10 * p)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setShown(stat.value);
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
