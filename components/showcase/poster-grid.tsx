"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FilmFrame, type FilmId } from "@/components/films/motion-film";
import { btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";
import { MediaReel } from "./media-reel";
import { PosterScene, type PosterSceneKind } from "./poster-scenes";

/*
 * The home page's product and service cards: four across the full width
 * of the screen, laid out and lifted like the Pixel-Map cards, cut like
 * the team portraits (the picture melting into a solid field, the name and
 * one line on the colour below). On hover, focus or tap the face fades and
 * a panel in the card's own solid colour fades up in its place with the full
 * name, the promise and "Explore" — one text at a time, never both.
 */

/** The three fields of the palette (Mahir, 2026-10-18): navy, cobalt, ink; gold only for titles on cobalt and actions. */
const FACES = {
  navy: { card: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset", field: "var(--color-bdnavy-900)", glow: "var(--color-bdnavy-400)", sub: "text-white/80", title: "" },
  cobalt: { card: "bg-cobalt text-white ring-1 ring-white/12 ring-inset", field: "var(--color-cobalt)", glow: "var(--color-cobalt)", sub: "text-white/80", title: "text-signal-orange" },
  ink: { card: "bg-text-primary text-white ring-1 ring-white/12 ring-inset", field: "var(--color-text-primary)", glow: "var(--color-signal-orange)", sub: "text-white/80", title: "" },
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
  /** A 3D film (components/films) that fills the picture in place of the photograph. */
  film3d?: FilmId;
  /** A motion layer: drawn over the photograph, or the film itself. */
  scene?: PosterSceneKind | "media-reel";
  /** The panel's foot line: a photo credit or the stage. */
  note?: string;
}

export function PosterGrid({ items, label }: { items: PosterItem[]; label: string }) {
  return (
    // Two by two on a tablet held upright; four across from lg, and already from md on a
    // landscape screen (a turned tablet or phone), where two rows would not fit the height.
    <ul aria-label={label} className="grid grid-cols-2 gap-3 sm:gap-5 md:max-lg:landscape:grid-cols-4 md:max-lg:landscape:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        // The scroll reveal sits on the <li> so its transform never fights the card's hover lift.
        <li key={item.id} id={item.anchorId} className="story-reveal flex scroll-mt-header lg:scroll-mt-header-lg">
          <PosterCard item={item} />
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

// No `priority`: the grids sit far below the fold, and preloading them would compete with the hero's poster.
function PosterCard({ item }: { item: PosterItem }) {
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
      {/* Two-up on upright tablets (640–1023) the picture runs landscape, so two rows still fit about one screen. */}
      <div className={cn("relative aspect-[1/0.92] shrink-0 overflow-hidden sm:max-lg:aspect-4/3 md:max-lg:landscape:aspect-[1/0.92]", (film || item.film3d) && "bg-text-primary")}>
        {item.film3d ? <FilmFrame film={item.film3d} className="absolute inset-0" /> : null}
        {item.image && (
          <Image
            src={item.image.src}
            alt={item.image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
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
        {/* Solid well before the picture's foot, so no seam shows behind the name that overlaps it. */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-transparent via-(--field) via-80% to-(--field)" />
      </div>

      <div className="@container relative -mt-4 flex flex-1 flex-col px-3 pb-4 transition-opacity duration-200 group-focus-within:opacity-0 group-hover:opacity-0 group-data-[open=true]:opacity-0 sm:px-6 sm:pb-6 motion-reduce:transition-none">
        <p
          // The line height comes after the size: tailwind-merge drops a leading-* that precedes a text-* size.
          className={cn(
            "font-extrabold tracking-tight",
            face.title,
            // From sm the name scales with the card (13% of its text column, at most 30px), so a long
            // word like DEVELOPMENT never clips in a narrow four-up card.
            typeof item.title === "string" && "font-grotesk text-lg sm:text-[min(1.875rem,13cqi)]",
            "leading-[0.95]",
          )}
        >
          {item.title}
        </p>
        <p className={cn("mt-1.5 font-grotesk text-xs leading-snug font-semibold sm:mt-2 sm:text-sm", face.sub)}>{item.tagline}</p>
      </div>

      {/* The panel, on hover, focus or tap: the card's own solid colour over the whole card.
          Hidden it only ignores the pointer, so its link can still take keyboard focus. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex translate-y-3 flex-col justify-center bg-(--field) p-4 text-white opacity-0 transition-[translate,opacity] duration-300 ease-out sm:p-6 md:max-lg:landscape:p-4",
          "group-focus-within:pointer-events-auto group-hover:pointer-events-auto group-hover:delay-100 group-data-[open=true]:pointer-events-auto",
          // From sm the panel is a size container: the name scales with its width, and on a
          // short card the promise drops whole lines (and the foot note goes) instead of
          // being cut mid-line under the button.
          "sm:[container-type:size]",
          "group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 group-data-[open=true]:translate-y-0 group-data-[open=true]:opacity-100",
          "motion-reduce:transition-none",
        )}
      >
        {/* From sm the name scales with the panel (13% of its width, at most 24px), so the
            wordmark, which never wraps, fits a narrow four-up card. */}
        <h3 className="line-clamp-3 font-grotesk text-lg leading-tight font-bold wrap-break-word sm:shrink-0 sm:text-[min(1.5rem,13cqi)] md:max-lg:landscape:line-clamp-2">{item.name}</h3>
        <p
          className={cn(
            "mt-2 line-clamp-5 text-xs leading-relaxed text-white/80 sm:mt-3 sm:text-sm",
            "sm:[@container(15.75rem<=height<17.25rem)]:line-clamp-4 sm:[@container(14.25rem<=height<15.75rem)]:line-clamp-3 sm:[@container(height<14.25rem)]:line-clamp-2",
          )}
        >
          {item.pitch}
        </p>
        <Link
          href={item.href}
          className={cn(btn.gold, "mt-4 w-fit sm:mt-5")}
        >
          Explore<span className="sr-only"> {item.nameText}</span>
          <span aria-hidden>→</span>
        </Link>
        {item.note ? <p className="mt-4 hidden text-xs leading-snug text-white/65 sm:block sm:[@container(height<19.5rem)]:hidden">{item.note}</p> : null}
      </div>
    </article>
  );
}
