"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Check, Lock, Pause, Play, Send, Sparkles, Star } from "lucide-react";
import type { Chip, ChipTone, Scene, ShotStage, View } from "@/data/platforms";
import { cn } from "@/lib/utils";
import { ClassroomVideoArt, CvArt, EndArt } from "./story-art";

/*
 * THESIS: an advert told the way the product is used — a camera moving over
 * the real screens, a pointer that clicks, the confirmations that pop up —
 * so the reader sees the platform working, not a mock-up of it.
 *
 * Two layouts share one engine: `Film` (caption beside a large frame, for
 * শিক্ষিতদের মিডিয়া) and `Reel` (a compact frame with its caption under
 * it, for the gold and ink promo cards). The story waits off screen, can be
 * paused, and under reduced motion every scene stands on its final frame
 * and moves on only when the reader picks a step.
 */

const SCENE_MS = 6200;
/** Layout pixels in view at zoom 1: the frame is 16:10 of a 1280-wide page. */
const LAYOUT_W = 1280;
const LAYOUT_H = 800;

const bn = (n: number) => String(n).padStart(2, "0").replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[Number(x)]);

/** CSS variables that place a screen so `v` fills the frame (transform-origin is the top-left). */
function place(prefix: "f" | "t", v: View, h: number) {
  return {
    [`--${prefix}x`]: `${((-v.x * v.zoom) / LAYOUT_W) * 100}%`,
    [`--${prefix}y`]: `${((-v.y * v.zoom) / h) * 100}%`,
    [`--${prefix}s`]: v.zoom,
  };
}

/** A layout-pixel point on the screen, as a percentage of the frame at the view `v`. */
function onFrame([px, py]: [number, number], v: View) {
  return { x: ((px - v.x) * v.zoom * 100) / LAYOUT_W, y: ((py - v.y) * v.zoom * 100) / LAYOUT_H };
}

function useStory(count: number, ref: RefObject<HTMLDivElement | null>) {
  const [scene, setScene] = useState(0);
  // Each scene's animation epoch: bumped when the scene starts, so it replays
  // from its first frame, while the scene fading out keeps its last frame.
  const [epochs, setEpochs] = useState<number[]>(() => Array.from({ length: count }, () => 0));
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  const go = (i: number) => {
    setScene(i);
    setEpochs((e) => e.map((n, j) => (j === i ? n + 1 : n)));
  };
  return { scene, epochs, playing, setPlaying, paused: !playing || !visible, go, next: () => go((scene + 1) % count) };
}

type Story = ReturnType<typeof useStory>;

const CHIP: Record<ChipTone, string> = {
  gold: "bg-signal-orange text-text-primary",
  white: "bg-white text-text-primary",
  green: "bg-bd-green text-white",
  ink: "bg-text-primary text-white ring-1 ring-white/25",
};
const CHIP_ICON = { check: Check, star: Star, spark: Sparkles, lock: Lock, send: Send };

function ChipView({ chip, view }: { chip: Chip; view: View }) {
  const p = onFrame(chip.at, view);
  const Glyph = chip.icon ? CHIP_ICON[chip.icon] : null;
  return (
    <span
      className={cn(
        "pf-pop absolute z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bengali text-[11px] font-bold whitespace-nowrap shadow-ink sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm",
        CHIP[chip.tone],
      )}
      style={{ left: `${p.x}%`, top: `${p.y}%`, "--d": chip.delay } as CSSProperties}
    >
      {Glyph && <Glyph className="size-3.5 shrink-0 sm:size-4" aria-hidden strokeWidth={2.6} />}
      {chip.typed ? (
        <>
          <span className="pf-type font-mono tracking-[0.2em]" style={{ "--d": chip.delay + 350 } as CSSProperties}>
            {chip.text}
          </span>
          <span className="pf-blink -ml-0.5 h-[1.1em] w-0.5 bg-signal-orange" />
        </>
      ) : (
        chip.text
      )}
    </span>
  );
}

/** A pointer that glides to its target, then clicks. */
function Cursor({ cursor, view }: { cursor: NonNullable<ShotStage["cursor"]>; view: View }) {
  const a = onFrame(cursor.from, view);
  const b = onFrame(cursor.to, view);
  return (
    <span
      aria-hidden
      className="pf-glide pointer-events-none absolute inset-0 z-20"
      style={{ "--gx": `${b.x - a.x}%`, "--gy": `${b.y - a.y}%`, "--d": 1500 } as CSSProperties}
    >
      <span className="absolute" style={{ left: `${a.x}%`, top: `${a.y}%` }}>
        <span className="pf-click absolute top-0 left-0 size-12 rounded-full bg-signal-orange" style={{ "--d": 2950 } as CSSProperties} />
        <svg viewBox="0 0 24 24" className="relative size-6 drop-shadow-md sm:size-7">
          <path d="M4 2.5 L19.5 13 L12.4 13.9 L16.4 21.3 L13.3 22.6 L9.5 15.3 L4.4 20 Z" className="fill-white stroke-text-primary" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}

function ShotView({ stage, sizes }: { stage: ShotStage; sizes: string }) {
  const h = stage.screen.h;
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div className="pf-pan absolute inset-x-0 top-0" style={{ ...place("f", stage.from, h), ...place("t", stage.to, h) } as CSSProperties}>
        <Image src={stage.screen.src} alt={stage.screen.alt} width={2560} height={h * 2} sizes={sizes} quality={80} className="block h-auto w-full" />
      </div>
      {stage.chips?.map((c) => <ChipView key={c.text} chip={c} view={stage.to} />)}
      {stage.cursor && <Cursor cursor={stage.cursor} view={stage.to} />}
    </div>
  );
}

/**
 * The browser frame and its stacked scenes. Only the active scene is
 * visible; it replays from its first frame each time it starts. Phones sit
 * outside the frame's clip so they can stand over its corner.
 */
function StageFrame({ scenes, story, maxWidth, phone }: { scenes: Scene[]; story: Story; maxWidth: number; phone: string }) {
  const cur = scenes[story.scene];
  const path = cur.stage.kind === "shot" ? cur.stage.screen.path : "media";
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl bg-black shadow-ink ring-1 ring-white/15 sm:rounded-[1.4rem]">
        <div className="flex h-8 items-center gap-3 bg-text-primary px-3 sm:h-9 sm:px-4">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-signal-orange" />
            <span className="size-2.5 rounded-[3px] bg-bdgreen-500" />
            <span className="size-2.5 rounded-[3px] bg-white/70" />
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 font-mono text-[10px] text-white/70 sm:text-[11px]">
            <Lock className="size-3 shrink-0" aria-hidden />
            <span className="truncate">kandari-lab / {path}</span>
          </span>
          <span className="hidden shrink-0 font-bengali text-[11px] font-bold text-white/55 sm:inline">নমুনা তথ্য</span>
        </div>
        <div className="@container relative aspect-16/10">
          {scenes.map((s, i) => {
            const on = i === story.scene;
            const zoom = s.stage.kind === "shot" ? Math.max(s.stage.from.zoom, s.stage.to.zoom) : 1;
            const sizes = `(min-width: 1024px) ${Math.ceil(maxWidth * zoom)}px, ${Math.ceil(100 * zoom)}vw`;
            return (
              <div key={s.id} className={cn("pf-stage absolute inset-0", on ? "opacity-100" : "opacity-0")} aria-hidden={!on} inert={!on}>
                <div key={story.epochs[i]} className="absolute inset-0">
                  {s.stage.kind === "shot" ? (
                    <ShotView stage={s.stage} sizes={sizes} />
                  ) : s.stage.art === "cv" ? (
                    <CvArt />
                  ) : s.stage.art === "end" ? (
                    <EndArt />
                  ) : (
                    <ClassroomVideoArt playing={on && !story.paused} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {scenes.map((s, i) =>
        s.stage.kind === "shot" && s.stage.phone ? (
          <div key={s.id} aria-hidden className={cn("pf-stage pointer-events-none absolute -right-1 -bottom-5 sm:-right-3 sm:-bottom-7", phone, i === story.scene ? "opacity-100" : "opacity-0")}>
            <div key={story.epochs[i]} className="pf-phone rounded-[1.35rem] bg-black p-1.5 shadow-ink ring-1 ring-white/25" style={{ "--d": 900 } as CSSProperties}>
              <div className="relative aspect-480/1039 overflow-hidden rounded-[1rem]">
                <Image src={s.stage.phone.src} alt="" fill sizes="220px" className="object-cover object-top" />
              </div>
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}

/** Step bars: the current one fills over the scene's length and its end moves the story on. */
function Steps({ scenes, story, tone }: { scenes: Scene[]; story: Story; tone: "dark" | "light" }) {
  const track = tone === "dark" ? "bg-white/18" : "bg-text-primary/20";
  const fill = tone === "dark" ? "bg-signal-orange" : "bg-text-primary";
  return (
    <div className="flex items-center gap-2">
      <ol className="flex flex-1 gap-1.5" aria-label="গল্পের দৃশ্য">
        {scenes.map((s, i) => (
          <li key={s.id} className="flex-1">
            <button
              type="button"
              onClick={() => story.go(i)}
              aria-label={`দৃশ্য ${i + 1}: ${s.title}`}
              aria-current={i === story.scene ? "step" : undefined}
              className="group/step flex h-7 w-full items-center rounded-sm focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
            >
              <span className={cn("relative block h-1.5 w-full overflow-hidden rounded-full transition-[height] group-hover/step:h-2", track)}>
                {i < story.scene && <span className={cn("absolute inset-0 rounded-full", fill)} />}
                {i === story.scene && (
                  <span key={story.epochs[i]} className={cn("pf-fill absolute inset-0 rounded-full", fill)} onAnimationEnd={story.next} />
                )}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => story.setPlaying((p) => !p)}
        aria-label={story.playing ? "ভিডিও থামান" : "ভিডিও চালান"}
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full transition-colors motion-reduce:hidden",
          tone === "dark" ? "bg-white/10 text-white hover:bg-white/20" : "bg-text-primary/10 text-text-primary hover:bg-text-primary/20",
          "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
        )}
      >
        {story.playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

/** The large layout: caption beside the frame on desktop, under it on phones. */
export function Film({ scenes, label }: { scenes: Scene[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const story = useStory(scenes.length, ref);
  const s = scenes[story.scene];
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="ভিডিও"
      aria-label={label}
      data-paused={story.paused}
      style={{ "--scene-ms": `${SCENE_MS}ms` } as CSSProperties}
      className="pf-root story-reveal grid gap-6 rounded-4xl bg-text-primary p-4 pb-5 ring-1 ring-white/12 sm:p-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.4fr)] lg:items-center lg:gap-10 lg:p-8"
    >
      <div className="order-2 flex flex-col gap-5 lg:order-1">
        <p className="flex items-baseline gap-2 font-bengali font-bold">
          <span className="text-4xl leading-none text-signal-orange sm:text-5xl">{bn(story.scene + 1)}</span>
          <span className="text-lg text-white/40">/ {bn(scenes.length)}</span>
        </p>
        <div key={`${story.scene}-${story.epochs[story.scene]}`} aria-live={story.playing ? "off" : "polite"}>
          <p className="pf-rise font-bengali text-sm font-bold text-signal-orange" style={{ "--d": 0 } as CSSProperties}>
            {s.tag}
          </p>
          <h3 className="pf-rise mt-2 min-h-[2.5em] font-bengali text-[1.75rem] leading-[1.25] font-bold text-balance text-white sm:text-4xl lg:min-h-[3.75em] xl:min-h-[2.5em]" style={{ "--d": 80 } as CSSProperties}>
            {s.title}
          </h3>
          <p className="pf-rise mt-3 min-h-[5em] font-bengali text-base leading-relaxed text-white/75" style={{ "--d": 180 } as CSSProperties}>
            {s.body}
          </p>
        </div>
        <Steps scenes={scenes} story={story} tone="dark" />
      </div>
      <div className="order-1 lg:order-2">
        <StageFrame scenes={scenes} story={story} maxWidth={760} phone="w-[24%] max-w-48" />
      </div>
    </div>
  );
}

/** The compact layout for the promo cards: the frame, then one caption line and the steps. */
export function Reel({ scenes, label, tone }: { scenes: Scene[]; label: string; tone: "dark" | "light" }) {
  const ref = useRef<HTMLDivElement>(null);
  const story = useStory(scenes.length, ref);
  const s = scenes[story.scene];
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="ভিডিও"
      aria-label={label}
      data-paused={story.paused}
      style={{ "--scene-ms": `${SCENE_MS - 900}ms` } as CSSProperties}
      className="pf-root"
    >
      <StageFrame scenes={scenes} story={story} maxWidth={580} phone="w-[22%] max-w-36" />
      <div key={`${story.scene}-${story.epochs[story.scene]}`} className="mt-5 min-h-[3.4rem] pr-[24%] sm:mt-6" aria-live={story.playing ? "off" : "polite"}>
        <p className={cn("pf-rise font-bengali text-[15px] leading-snug font-bold", tone === "dark" ? "text-white" : "text-text-primary")}>
          <span className={tone === "dark" ? "text-signal-orange" : "text-bd-green"}>{s.tag}</span> · {s.title}
        </p>
        <p className={cn("pf-rise mt-0.5 font-bengali text-sm", tone === "dark" ? "text-white/65" : "text-text-primary/70")} style={{ "--d": 100 } as CSSProperties}>
          {s.body}
        </p>
      </div>
      <div className="mt-2">
        <Steps scenes={scenes} story={story} tone={tone} />
      </div>
    </div>
  );
}
