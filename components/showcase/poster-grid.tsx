"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";
import { MediaReel } from "./media-reel";
import { PosterScene, type PosterSceneKind } from "./poster-scenes";

/*
 * The home page's product and service cards: four across inside the
 * content column, laid out and lifted like the Pixel-Map cards, cut like
 * the team portraits (the picture melting into a solid field, the name and
 * one line on the colour below). On hover, focus or tap a panel rises in a
 * blackened shade of the card's own colour with the full name, the promise
 * and "Explore".
 */

/** The three fields of the palette, nothing else (Mahir, 2026-10-17): navy, gold, ink. */
const FACES = {
  navy: { card: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset", field: "var(--color-bdnavy-900)", glow: "var(--color-bdnavy-400)", sub: "text-white/80" },
  gold: { card: "bg-signal-orange text-text-primary", field: "var(--color-signal-orange)", glow: "var(--color-signal-orange)", sub: "text-text-primary/80" },
  ink: { card: "bg-text-primary text-white ring-1 ring-white/12 ring-inset", field: "var(--color-text-primary)", glow: "var(--color-signal-orange)", sub: "text-white/80" },
} as const;

export type PosterFace = keyof typeof FACES;

export interface PosterItem {
  id: string;
  /** The list item's id, an anchor other pages link to. */
  anchorId?: string;
  face: PosterFace;
  /** The face: a big name and one short line. */
  title: ReactNode;
  tagline: string;
  /** The panel: the full name (and as plain text, for the link's label), the promise, where "Explore" goes. */
  name: ReactNode;
  nameText: string;
  pitch: string;
  href: string;
  /** The photograph; left out when a film fills the picture instead. */
  image?: { src: string; alt: string; position?: string };
  /** A motion layer: drawn over the photograph, or the film itself. */
  scene?: PosterSceneKind | "media-reel";
  /** The panel's foot line: a photo credit or the stage. */
  note?: string;
}

export function PosterGrid({ items, label }: { items: PosterItem[]; label: string }) {
  return (
    <ul aria-label={label} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {items.map((item, i) => (
        // The scroll reveal sits on the <li> so its transform never fights the card's hover lift.
        <li key={item.id} id={item.anchorId} className="story-reveal flex scroll-mt-header lg:scroll-mt-header-lg">
          <PosterCard item={item} priority={i < 2} />
        </li>
      ))}
    </ul>
  );
}

/** True while the element is on screen (with a margin), so off-screen motion can pause. */
function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on] as const;
}

function PosterCard({ item, priority }: { item: PosterItem; priority: boolean }) {
  const face = FACES[item.face];
  const [ref, onScreen] = useOnScreen<HTMLElement>();
  // A touch screen has no hover: a tap on the card opens the panel instead.
  const [open, setOpen] = useState(false);
  const tap = () => {
    if (window.matchMedia("(hover: none)").matches) setOpen((o) => !o);
  };
  const film = item.scene === "media-reel";
  const scene = item.scene === "media-reel" ? undefined : item.scene;

  return (
    <article
      ref={ref}
      data-open={open}
      data-paused={!onScreen}
      onClick={tap}
      style={{ "--field": face.field, "--glow": face.glow } as CSSProperties}
      className={cn(
        "ms-root group relative flex w-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl",
        // The Pixel-Map cards' lift: up a little, a glow in the card's own colour beneath.
        "[-webkit-tap-highlight-color:transparent] touch-manipulation shadow-sm transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)] data-[open=true]:-translate-y-2 data-[open=true]:shadow-[0_28px_48px_-22px_var(--glow)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        face.card,
      )}
    >
      {/* The picture, melting into the field at its foot like the team portraits. */}
      <div className={cn("relative aspect-[1/0.92] shrink-0 overflow-hidden", film && "bg-text-primary")}>
        {item.image && (
          <Image
            src={item.image.src}
            alt={item.image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 300px, 50vw"
            style={{ objectPosition: item.image.position }}
            className={cn(
              "object-cover transition-[scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
              scene && "ms-zoom",
            )}
          />
        )}
        {/* Drawn taller than the picture, so the film's caption strip falls below the crop. */}
        {film && (
          <div className="absolute inset-x-0 top-0 h-[124%]">
            <MediaReel />
          </div>
        )}
        {scene && <PosterScene kind={scene} />}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-b from-transparent to-(--field)" />
      </div>

      <div className="@container relative -mt-4 flex flex-1 flex-col px-3 pb-4 sm:px-6 sm:pb-6">
        <p
          // The line height comes after the size: tailwind-merge drops a leading-* that precedes a text-* size.
          className={cn(
            "font-extrabold tracking-tight",
            typeof item.title === "string" && "font-grotesk text-lg sm:text-3xl",
            "leading-[0.95]",
          )}
        >
          {item.title}
        </p>
        <p className={cn("mt-1.5 font-grotesk text-xs leading-snug font-semibold sm:mt-2 sm:text-sm", face.sub)}>{item.tagline}</p>
      </div>

      {/* The panel, rising on hover, focus or tap: the card's own colour, blackened. */}
      <div
        className={cn(
          "absolute inset-0 flex translate-y-full flex-col p-4 text-white opacity-0 transition-[translate,opacity] duration-400 ease-out sm:p-6",
          "bg-[color-mix(in_oklab,var(--field)_26%,#0a0a0a)]",
          "group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 group-data-[open=true]:translate-y-0 group-data-[open=true]:opacity-100",
          "motion-reduce:transition-none",
        )}
      >
        <span aria-hidden className="h-1 w-10 shrink-0 rounded-full bg-signal-orange" />
        <h3 className="mt-4 line-clamp-3 font-grotesk text-lg leading-tight font-bold wrap-break-word sm:mt-5 sm:text-2xl">{item.name}</h3>
        <p className="mt-2 line-clamp-5 text-xs leading-relaxed text-white/80 sm:mt-3 sm:text-sm">{item.pitch}</p>
        <Link
          href={item.href}
          className={cn(btn.gold, "mt-4 w-fit sm:mt-5")}
        >
          Explore<span className="sr-only"> {item.nameText}</span>
          <span aria-hidden>→</span>
        </Link>
        {item.note ? <p className="mt-auto hidden text-xs leading-snug text-white/65 sm:block">{item.note}</p> : null}
      </div>
    </article>
  );
}
