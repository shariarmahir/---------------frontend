"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { RecordDialog } from "@/components/record/record-dialog";
import { CarouselArrow, type ArrowTone } from "@/components/ui/carousel-arrow";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { promos, type Promo, type PromoField } from "@/data/promos";
import { cn } from "@/lib/utils";

/*
 * The banner gallery, after banglalink.net's home carousel and framed like
 * the charter row: one wide banner centred in the content column, its
 * neighbours peeking in at the window edges. A banner holds, then the row
 * glides one place on. It holds still under the pointer, with focus
 * inside, off screen, or while the recorder is open; with reduced motion
 * it never moves on its own. By hand: the bare arrows at the window edges
 * (hidden until the row is pointed at), a swipe, or ← →.
 *
 * Every banner keeps its own translate. A banner is at most two places
 * left of the centre and n − 3 to the right; one that has to wrap round
 * jumps while out of sight, with its transition switched off, so the loop
 * never runs backwards across the screen.
 */

/** How long a banner holds, ms. */
const HOLD_MS = 6000;
/** One glide from banner to banner, ms. */
const GLIDE_MS = 900;
/** A swipe shorter than this is a tap, px. */
const SWIPE_PX = 48;

const FIELDS: Record<PromoField, { card: string; muted: string; button: string; melt: string; glow: string }> = {
  navy: {
    card: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/75",
    button: btn.gold,
    melt: "from-bdnavy-900",
    glow: "var(--color-bdnavy-400)",
  },
  ink: {
    card: "bg-text-primary text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/75",
    button: btn.gold,
    melt: "from-text-primary",
    glow: "var(--color-signal-orange)",
  },
  gold: {
    card: "bg-signal-orange text-text-primary",
    muted: "text-text-primary/80",
    button: btn.navy,
    melt: "from-signal-orange",
    glow: "var(--color-signal-orange)",
  },
};

type Pos = { index: number; prev: number };

const mod = (a: number, b: number) => ((a % b) + b) % b;
/** A banner's place relative to the centre: −2 … n − 3. */
const place = (i: number, index: number, n: number) => mod(i - index + 2, n) - 2;
const shift = (by: number) => (p: Pos): Pos => ({ index: p.index + by, prev: p.index });

export function PromoGallery() {
  const n = promos.length;
  const [pos, setPos] = useState<Pos>({ index: 0, prev: 0 });
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [recorder, setRecorder] = useState(false);
  const [tones, setTones] = useState<[ArrowTone, ArrowTone]>(["gold", "gold"]);
  const root = useRef<HTMLDivElement>(null);
  const banner = useRef<HTMLDivElement>(null);
  const arrows = useRef<(HTMLButtonElement | null)[]>([]);
  const swipe = useRef<{ id: number; x: number } | null>(null);

  const step = (by: 1 | -1) => setPos(shift(by));
  const active = mod(pos.index, n);
  const paused = hover || focus || !onScreen || recorder;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The hold. Any move or pause restarts it, so a banner always gets its full time.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setPos(shift(1)), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [pos.index, paused]);

  // Each arrow takes the colour that reads on the banner under it: navy over gold, gold over the rest.
  useEffect(() => {
    const row = root.current;
    if (!row) return;
    const measure = () => {
      const box = row.getBoundingClientRect();
      const card = banner.current?.offsetWidth ?? box.width;
      const gap = parseFloat(getComputedStyle(row).getPropertyValue("--gap")) || 0;
      const toneAt = (el: HTMLButtonElement | null): ArrowTone => {
        if (!el) return "gold";
        const r = el.getBoundingClientRect();
        const x = Math.round((r.left + r.width / 2 - box.left - box.width / 2) / (card + gap));
        return promos[mod(active + x, n)].field === "gold" ? "navy" : "gold";
      };
      const next: [ArrowTone, ArrowTone] = [toneAt(arrows.current[0]), toneAt(arrows.current[1])];
      setTones((t) => (t[0] === next[0] && t[1] === next[1] ? t : next));
    };
    // Halfway through the glide, as the banners cross under the arrows.
    const t = window.setTimeout(measure, GLIDE_MS / 2);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [active, n]);

  const onPointerDown = (e: ReactPointerEvent) => {
    swipe.current = { id: e.pointerId, x: e.clientX };
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > SWIPE_PX) step(dx < 0 ? 1 : -1);
  };

  return (
    <section id="gallery" aria-label="What you can do with Kandari-Lab" className="section-band @container relative overflow-hidden">
      <div
        ref={root}
        aria-roledescription="carousel"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHover(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHover(false);
        }}
        onFocus={() => setFocus(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false);
        }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          step(e.key === "ArrowRight" ? 1 : -1);
        }}
        // --card: the content column, as every other section uses. --gap in px: the arrows' colour reads it.
        className="group/carousel relative [--card:calc(min(100cqw,80rem)-2*var(--spacing-gutter-x))] [--gap:12px] lg:[--gap:20px]"
      >
        <div
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipe.current = null)}
          onDragStart={(e) => e.preventDefault()}
          // Room above and below for the hover lift and its glow.
          className="relative grid touch-pan-y py-4"
        >
          {promos.map((promo, i) => {
            const x = place(i, pos.index, n);
            // A wrap is a jump of more than one place: it happens out of sight, unanimated.
            const jump = Math.abs(x - place(i, pos.prev, n)) > 1;
            const current = i === active;
            return (
              <div
                key={promo.id}
                ref={i === 0 ? banner : undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${promo.label}`}
                aria-hidden={!current}
                inert={!current}
                style={{
                  translate: `calc((100cqw - var(--card)) / 2 + ${x} * (var(--card) + var(--gap))) 0`,
                  transitionDuration: `${GLIDE_MS}ms`,
                }}
                className={cn(
                  "aspect-3/4 w-(--card) will-change-[translate] [grid-area:1/1] sm:aspect-video lg:aspect-21/9",
                  !jump && "transition-[translate] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none",
                )}
              >
                <Banner promo={promo} onRecord={() => setRecorder(true)} priority={i === 0} />
              </div>
            );
          })}
        </div>

        {(["prev", "next"] as const).map((side, k) => (
          <CarouselArrow
            key={side}
            ref={(el) => {
              arrows.current[k] = el;
            }}
            side={side}
            tone={tones[k]}
            label={side === "prev" ? "Previous banner" : "Next banner"}
            onClick={() => step(side === "next" ? 1 : -1)}
          />
        ))}
      </div>

      <RecordDialog open={recorder} onOpenChange={setRecorder} />
    </section>
  );
}

/**
 * One banner: the message on its solid field, the picture beside it (above
 * it on a phone), the photograph melting into the field at the seam. Lifts
 * on hover with a glow in its own colour and the picture leans in, as the
 * charter cards do.
 */
function Banner({ promo, onRecord, priority }: { promo: Promo; onRecord: () => void; priority: boolean }) {
  const field = FIELDS[promo.field];
  const art = promo.art;
  return (
    <article
      style={{ "--glow": field.glow } as CSSProperties}
      className={cn(
        "group/card @container grid h-full grid-rows-[42%_minmax(0,1fr)] overflow-hidden rounded-3xl sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:grid-rows-1",
        field.card,
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_30px_60px_-36px_rgb(0_0_0/0.9)]",
        "transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1.5 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_28px_48px_-22px_var(--glow)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <div className="relative order-2 flex min-h-0 flex-col justify-center gap-3 p-5 sm:order-1 sm:gap-4 sm:p-8 lg:p-12">
        <h3 className="font-bengali text-[clamp(1.6rem,4.4cqw,3.25rem)] leading-[1.18] font-bold text-balance">{promo.title}</h3>
        <p className={cn("line-clamp-3 max-w-md text-sm leading-relaxed sm:text-base", field.muted)}>{promo.body}</p>
        <div className="mt-1 sm:mt-2">
          {"href" in promo.action ? (
            <Link href={promo.action.href} draggable={false} className={cn(field.button, "py-3 font-bengali normal-case sm:py-3 sm:text-base")}>
              {promo.action.label}
              <Icon name="arrow_forward" className="text-[18px]" />
            </Link>
          ) : (
            <button type="button" onClick={onRecord} className={cn(field.button, "py-3 font-bengali normal-case sm:py-3 sm:text-base")}>
              <span aria-hidden className="size-2.5 rounded-full bg-national-crimson" />
              {promo.action.label}
            </button>
          )}
        </div>
      </div>

      <div className="relative order-1 min-h-0 overflow-hidden sm:order-2">
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100">
          {art.kind === "photo" && (
            <Image
              src={art.src}
              alt={art.alt}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 640px, (min-width: 640px) 55vw, 100vw"
              style={{ objectPosition: art.position }}
              className="object-cover"
            />
          )}
          {art.kind === "screen" && (
            // The platform's own screen, set like a window sliding in from the corner.
            <div className="absolute top-[10%] left-[8%] h-[110%] w-[110%] overflow-hidden rounded-tl-2xl shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] ring-1 ring-black/20">
              <Image src={art.src} alt={art.alt} fill sizes="(min-width: 1280px) 700px, 60vw" className="object-cover object-top-left" />
            </div>
          )}
          {art.kind === "record" && <RecordArt />}
        </div>

        {art.kind === "photo" && (
          <>
            {/* The photograph melts into the field at the seam, as on the team cards; a pixel past the edge so no hairline shows. */}
            <div
              aria-hidden
              className={cn(
                "absolute inset-x-0 -bottom-px h-1/3 bg-linear-to-t to-transparent sm:inset-y-0 sm:-left-px sm:h-auto sm:w-1/3 sm:bg-linear-to-r",
                field.melt,
              )}
            />
            <a
              href={art.credit.source}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-3 bottom-3 max-w-[70%] truncate rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white/80 hover:text-white"
            >
              Photo: {art.credit.author} · {art.credit.license}
            </a>
          </>
        )}
      </div>
    </article>
  );
}

/** The recorder at work: a live dot, a running clock and a waveform (decorative). */
function RecordArt() {
  const bars = 28;
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3 rounded-full bg-black/35 px-4 py-2 ring-1 ring-white/12">
          <span className="relative flex size-3">
            <span className="absolute inset-0 animate-ping rounded-full bg-national-crimson/70 motion-reduce:hidden" />
            <span className="relative size-3 rounded-full bg-national-crimson" />
          </span>
          <span className="font-mono text-sm font-semibold tracking-[0.2em] text-white">REC 00:12</span>
        </div>
        <div className="flex h-24 items-center gap-1.5">
          {Array.from({ length: bars }, (_, i) => (
            <span
              key={i}
              style={{ "--i": i, height: `${30 + ((i * 37) % 70)}%` } as CSSProperties}
              className="promo-wave w-1.5 rounded-full bg-signal-orange"
            />
          ))}
        </div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-white/55 uppercase">voice · video · one tap</p>
      </div>
    </div>
  );
}
