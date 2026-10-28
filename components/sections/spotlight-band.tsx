"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SignalSeam } from "@/components/ui/section-kit";
import { spotlightSlides, type SpotlightSlide } from "@/data/home-spotlight";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Home spotlight band — the narrow headline slider under the hero, after
 * banglalink.net's: a centred line, then a word, a
 * photo pill and a word on one row. The whole slide is the link. Slides
 * travel upward on a 4.2s hold with a 0.5s move, like the original.
 *
 * Re-coloured for the pitch-black home in the UI's own colours: a gold
 * headline, the figure or lead word in the navy tint, the tail in white.
 * Each pill is a navy field: its photograph
 * toned navy-to-gold (a duotone, so every picture belongs to the band),
 * with a motion graphic on top that says what the slide is about (a
 * heartbeat, a scanner, an equaliser, radar rings, or a line chart that
 * draws itself for an indicator) — see `SpotlightMotif`.
 *
 * English only, and no label above the headline: the slide is the headline
 * and the pill row (no sub line or button since 2026-10-21). Rotation holds while the pointer is
 * over the band, while anything in it has focus and while the tab is
 * hidden. Inactive slides are `inert`.
 */

/** Time from one slide's arrival to the next (banglalink measures ~4.17s). */
const HOLD_MS = 4200;

/** Two heartbeats across the pill, drawn on a 288×80 box. */
const ECG_PATH =
  "M0 44 H70 L80 44 L88 30 L96 44 H112 L120 12 L130 70 L140 44 H162 L170 34 L178 44 H198 L206 14 L216 68 L226 44 H288";

/** Large type: tight tracking suits the Latin display face. */
const BIG = "font-display leading-[1.08] tracking-tighter";

/**
 * An indicator's line: nine points trending up or down with a little
 * seeded wander, on the pill's 288×80 box. Seeded from the slide id, so
 * server and browser draw the same line.
 */
function sparkline(id: string, up: boolean) {
  let s = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7) || 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pts = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const trend = up ? 60 - t * 40 : 22 + t * 40;
    return [24 + t * 240, trend + (i === 0 || i === 8 ? 0 : (rnd() - 0.5) * 14)];
  });
  const line = `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}`;
  return { line, area: `${line}L264 80L24 80Z`, end: pts[8] };
}

/**
 * The motion graphic over the pill. Gold strokes and fills on the navy field.
 * The drawn lines keep their normal stroke scaling: a non-scaling stroke
 * measures its dashes in screen pixels, which breaks `pathLength={1}`.
 */
function Motif({ slide }: { slide: SpotlightSlide }) {
  const { motif } = slide.media;

  switch (motif) {
    case "pulse":
      return (
        // A faint full trace, with a bright beat running along it.
        <svg aria-hidden viewBox="0 0 288 80" preserveAspectRatio="none" className="absolute inset-0 size-full">
          {["opacity-30", "spot-ecg"].map((cls) => (
            <path
              key={cls}
              pathLength={1}
              className={cls}
              d={ECG_PATH}
              fill="none"
              stroke="var(--color-signal-orange)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </svg>
      );
    case "scan":
      return (
        // A viewfinder: four corner brackets, and a gold line sweeping between them.
        <span aria-hidden className="absolute inset-[18%_8%]">
          {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "right-0 bottom-0 border-r-2 border-b-2"].map(
            (corner) => (
              <span key={corner} className={cn("absolute size-2 border-white/85 lg:size-3", corner)} />
            ),
          )}
          <span className="spot-scan absolute inset-y-0 w-0.5 rounded-full bg-signal-orange" />
        </span>
      );
    case "bars":
      return (
        <span aria-hidden className="absolute inset-x-[16%] bottom-[20%] flex h-[55%] items-end justify-between">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="spot-bar h-full w-[3px] origin-bottom rounded-full bg-signal-orange lg:w-1.5"
              style={{ animationDelay: `${(i % 6) * 110}ms`, height: `${45 + ((i * 37) % 55)}%` }}
            />
          ))}
        </span>
      );
    case "ping":
      return (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center">
          <span className="spot-ring absolute size-1/2 rounded-full border-2 border-signal-orange" />
          <span className="spot-ring absolute size-1/2 rounded-full border-2 border-signal-orange [animation-delay:1.1s]" />
          <span className="relative size-2 rounded-full bg-signal-orange lg:size-3" />
        </span>
      );
    case "meter": {
      // The indicator's direction, drawn: the line writes itself, the area under it fills in, the end point lands.
      const { line, area, end } = sparkline(slide.id, slide.tailArrow !== "down");
      return (
        <span aria-hidden className="absolute inset-0">
          <svg viewBox="0 0 288 80" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <path d={area} className="spot-area" fill="var(--color-signal-orange)" fillOpacity="0.18" />
            <path
              d={line}
              pathLength={1}
              className="spot-draw"
              fill="none"
              stroke="var(--color-signal-orange)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <span
            className="spot-dot absolute size-2 -translate-1/2 rounded-full bg-white ring-2 ring-signal-orange lg:size-3"
            style={{ left: `${(end[0] / 288) * 100}%`, top: `${(end[1] / 80) * 100}%` }}
          />
        </span>
      );
    }
  }
}

function Pill({ slide, eager }: { slide: SpotlightSlide; eager: boolean }) {
  const { media } = slide;
  return (
    <span
      role="img"
      aria-label={media.alt}
      className="spot-pill relative block h-8 w-24 shrink-0 overflow-hidden rounded-full bg-bdnavy-900 ring-1 ring-white/15 transition-[box-shadow] duration-300 group-hover/slide:ring-signal-orange/70 sm:h-10 sm:w-32 md:h-12 md:w-40 lg:h-14 lg:w-48"
    >
      {media.src ? (
        <>
          {/* Duotone: the photograph in grey, its shadows lifted to navy, its lights tinted gold. */}
          <Image
            src={media.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 192px, (min-width: 768px) 160px, 128px"
            loading={eager ? "eager" : "lazy"}
            style={{ objectPosition: media.position ?? "50% 50%" }}
            className="spot-kenburns object-cover grayscale"
          />
          <span aria-hidden className="absolute inset-0 bg-bdnavy-900 mix-blend-lighten" />
          <span aria-hidden className="absolute inset-0 bg-signal-orange opacity-80 mix-blend-multiply" />
          {/* Deeper navy where the graphic sits, so its gold reads. */}
          <span aria-hidden className="absolute inset-0 bg-linear-to-t from-bdnavy-900/85 via-bdnavy-900/30 to-transparent" />
        </>
      ) : null}
      <Motif slide={slide} />
    </span>
  );
}

/**
 * A slide: the headline, then the lead word, the pill and the tail on one
 * row. The whole slide is the link (no sub line, no button: Mahir,
 * 2026-10-21); the sub line still reaches screen readers and shows as the
 * slide's tooltip, so an indicator keeps its source.
 */
function Slide({ slide, eager }: { slide: SpotlightSlide; eager: boolean }) {
  return (
    <Link
      href={slide.cta.href}
      title={slide.sub}
      className="group/slide flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 text-center focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none focus-visible:ring-inset md:gap-2.5"
    >
      <span className={cn("text-2xl font-semibold text-balance text-signal-orange sm:text-3xl md:text-4xl lg:text-5xl", BIG)}>{slide.headline}</span>

      <span className="flex flex-row items-center justify-center gap-2.5 md:gap-4">
        <span className={cn("text-xl font-semibold whitespace-nowrap text-bdnavy-300 sm:text-2xl md:text-4xl lg:text-5xl", BIG)}>{slide.lead}</span>
        <Pill slide={slide} eager={eager} />
        <span className={cn("inline-flex items-center gap-1 text-xl font-semibold whitespace-nowrap text-white sm:text-2xl md:text-4xl lg:text-5xl", BIG)}>
          {slide.tailArrow ? (
            <Icon name={slide.tailArrow === "up" ? "arrow_upward" : "arrow_downward"} className="text-lg! sm:text-xl! md:text-3xl! lg:text-4xl!" />
          ) : null}
          {slide.tail}
        </span>
      </span>

      <span className="sr-only">
        {slide.sub}. {slide.cta.label}
      </span>
    </Link>
  );
}

export function SpotlightBand() {
  const slides = spotlightSlides;
  const count = slides.length;
  const [active, setActive] = useState(0);
  // False until the first move, so the opening slide sits still on load
  // instead of sliding up into an empty band.
  const [moved, setMoved] = useState(false);
  const held = useRef(false);
  // The rotation can be paused (WCAG 2.2.2); with reduced motion it starts paused.
  const reduce = useReducedMotion();
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);
  const playing = choice ? choice === "play" : !reduce;

  useEffect(() => {
    if (count <= 1 || !playing) return;
    const id = window.setInterval(() => {
      if (held.current || document.hidden) return;
      setActive((i) => (i + 1) % count);
      setMoved(true);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [count, playing]);

  const hold = () => {
    held.current = true;
  };
  const release = () => {
    held.current = false;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Announcements and national indicators"
      className="relative w-full overflow-hidden bg-black"
    >
      <div
        // A mouse over the band or keyboard focus in it holds the slide; a tap
        // on a touch screen does not (its emulated hover would stick).
        onPointerEnter={(e) => e.pointerType === "mouse" && hold()}
        onPointerLeave={release}
        onFocus={(e) => e.target.matches(":focus-visible") && hold()}
        onBlur={release}
        className="relative mx-auto h-30 w-full max-w-[1360px] sm:h-34 sm:max-w-384 sm:px-gutter-x md:h-38 lg:h-42"
      >
        {slides.map((slide, i) => {
          const isActive = i === active;
          const isLeaving = moved && i === (active - 1 + count) % count;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              inert={!isActive}
              className={cn(
                "spot-slide absolute inset-0",
                isActive && (moved ? "is-active" : "is-current"),
                isLeaving && "is-leaving",
              )}
            >
              {/* Only the slide on screen loads at once; the next is in the band's box, so it still loads lazily ahead of its turn. */}
              <Slide slide={slide} eager={i === 0} />
            </div>
          );
        })}
      </div>

      {/* Unseen until reached by keyboard (Mahir, 2026-10-29: no button on the band); a pointer holds the slide by hovering. */}
      {count > 1 && (
        <button
          type="button"
          onClick={() => setChoice(playing ? "pause" : "play")}
          aria-label={playing ? "Pause announcements" : "Play announcements"}
          className="absolute right-1 bottom-1 z-10 grid size-11 place-items-center rounded-full text-white/65 opacity-0 pointer-events-none transition-[color,opacity] hover:text-signal-orange focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:right-3"
        >
          <Icon name={playing ? "pause" : "play_arrow"} className="text-xl" />
        </button>
      )}
      <SignalSeam className="bottom-0" />
    </section>
  );
}
