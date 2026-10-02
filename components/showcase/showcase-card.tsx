"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { MotionIcon } from "./motion-icon";
import { MotionScene, type SceneKind } from "./motion-scene";

/*
 * The one showcase card, for products and services alike (CLAUDE.md §8):
 * a photograph that stays fully visible, a motion-graphic layer drawn over
 * its corners, an animated icon, and the copy on a solid colour field. A
 * gold beam runs the card's edge on hover or focus. Off screen, every
 * animation in it pauses; under reduced motion nothing moves.
 */

export type CardTone = "ink" | "green" | "gold" | "white";

const TONE: Record<CardTone, { card: string; sub: string; item: string; icon: string; link: string; glow: string; beam: string }> = {
  ink: { card: "bg-text-primary text-white ring-1 ring-white/12", sub: "text-white/70", item: "bg-white/[0.06] ring-1 ring-white/10", icon: "bg-signal-orange", link: "text-signal-orange", glow: "var(--color-signal-orange)", beam: "stroke-signal-orange" },
  green: { card: "bg-bd-green text-white", sub: "text-white/80", item: "bg-black/15", icon: "bg-signal-orange", link: "text-signal-orange", glow: "var(--color-bdgreen-500)", beam: "stroke-signal-orange" },
  gold: { card: "bg-signal-orange text-text-primary", sub: "text-text-primary/75", item: "bg-text-primary/10", icon: "bg-white", link: "text-text-primary", glow: "var(--color-signal-orange)", beam: "stroke-text-primary" },
  white: { card: "bg-white text-text-primary", sub: "text-text-secondary", item: "bg-mint-subtle ring-1 ring-card-border", icon: "bg-signal-orange", link: "text-bd-green", glow: "white", beam: "stroke-signal-orange" },
};

export interface ShowcaseCardProps {
  href: string;
  image: { src: string; alt: string; credit?: string };
  scene: SceneKind;
  /** Small line above the title: category, stage. */
  eyebrow: string;
  title: string;
  titleBn?: string;
  body: string;
  bodyBn?: string;
  items?: { title: string; body: string }[];
  /** A line of proof under the list, e.g. where the skill is already used. */
  proof?: string;
  cta: string;
  tone: CardTone;
  /** "wide" puts the photo beside the copy on large screens; "stack" puts it on top. */
  layout?: "stack" | "wide";
  /** Extra block under the body (e.g. the Golden Two Hours alert). */
  extra?: ReactNode;
  priority?: boolean;
  /** Which side the photo sits on in the wide layout. */
  flip?: boolean;
}

/** Pause a card's animations while it is off screen. */
function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on] as const;
}

export function ShowcaseCard(p: ShowcaseCardProps) {
  const [ref, on] = useOnScreen<HTMLElement>();
  const tone = TONE[p.tone];
  const wide = p.layout === "wide";

  return (
    <article
      ref={ref}
      data-paused={!on}
      style={{ "--glow": tone.glow } as React.CSSProperties}
      className={cn(
        "ms-root group relative isolate flex h-full flex-col overflow-hidden rounded-[2rem]",
        "transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_var(--glow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        wide && "lg:grid lg:grid-cols-2",
        tone.card,
      )}
    >
      {/* The photograph, uncovered: only the motion layer's thin lines and chips sit on it. */}
      <div className={cn("relative overflow-hidden", wide ? "aspect-16/10 lg:aspect-auto lg:min-h-[30rem]" : "aspect-16/10", wide && p.flip && "lg:order-2")}>
        <Image
          src={p.image.src}
          alt={p.image.alt}
          fill
          priority={p.priority}
          sizes={wide ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 1024px) 620px, 100vw"}
          className="ms-zoom object-cover"
        />
        <MotionScene kind={p.scene} />
      </div>

      <div className="relative flex flex-1 flex-col gap-4 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <MotionIcon kind={p.scene} className={cn("grid size-14 shrink-0 place-items-center rounded-2xl shadow-tile", tone.icon)} />
          <div className="min-w-0">
            <p className={cn("font-mono text-[11px] font-bold tracking-wider uppercase", tone.sub)}>{p.eyebrow}</p>
            <h3 className="mt-1 font-grotesk text-2xl leading-tight font-bold sm:text-[1.75rem]">
              <Link
                href={p.href}
                className="after:absolute after:inset-0 after:z-10 after:rounded-[2rem] focus-visible:outline-none after:focus-visible:ring-3 after:focus-visible:ring-white after:focus-visible:ring-inset"
              >
                {p.title}
              </Link>
            </h3>
            {p.titleBn && <p className={cn("mt-0.5 font-bengali text-[15px] font-semibold", tone.sub)}>{p.titleBn}</p>}
          </div>
        </div>

        <p className="font-sans text-[15px] leading-relaxed">{p.body}</p>
        {p.bodyBn && <p className={cn("font-bengali text-[15px] leading-relaxed", tone.sub)}>{p.bodyBn}</p>}
        {p.extra}

        {p.items && p.items.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {p.items.map((it) => (
              <li key={it.title} className={cn("rounded-2xl px-3.5 py-3", tone.item)}>
                <span className="block font-grotesk text-sm font-bold">{it.title}</span>
                <span className={cn("mt-0.5 block text-[13px] leading-snug", tone.sub)}>{it.body}</span>
              </li>
            ))}
          </ul>
        )}

        {p.proof && (
          <p className={cn("flex items-start gap-2 text-[13px] leading-snug", tone.sub)}>
            <Icon name="verified" className="mt-px text-[17px]" /> {p.proof}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <span className={cn("inline-flex items-center gap-1.5 font-grotesk text-sm font-bold uppercase", tone.link)}>
            {p.cta}
            <Icon name="arrow_forward" className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
          {p.image.credit && <span className={cn("relative z-20 text-[11px]", tone.sub)}>{p.image.credit}</span>}
        </div>
      </div>

      {/* The beam: a short gold dash running the rounded edge on hover and focus. */}
      <svg aria-hidden className="ms-beam pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible">
        <rect x="1.5" y="1.5" width="100%" height="100%" rx="30" pathLength={100} className={cn("fill-none", tone.beam)} strokeWidth="3" style={{ width: "calc(100% - 3px)", height: "calc(100% - 3px)" }} />
      </svg>
    </article>
  );
}
