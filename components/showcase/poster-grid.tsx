"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FilmFrame, type FilmId } from "@/components/films/motion-film";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { MediaReel } from "./media-reel";
import { PosterScene, type PosterSceneKind } from "./poster-scenes";

/*
 * The home page's product and service cards, set like the featured-project
 * cards of kudos.framer.media (Mahir, 2026-10-29): the whole card is one
 * link, a tall framed picture in its own field (navy, cobalt or ink) with a
 * skeleton shimmer until the photograph arrives, and under it, on the black
 * ground, the name with its number, one line, and from lg the promise. On
 * hover or focus the picture eases in closer, the frame takes a gold edge
 * and a bare gold arrow rises in its corner; the name turns gold.
 */

/** The three fields of the palette (Mahir, 2026-10-18): navy, cobalt, ink. */
const FIELDS = {
  navy: "bg-bdnavy-900",
  cobalt: "bg-cobalt",
  ink: "bg-text-primary",
} as const;

export type PosterFace = keyof typeof FIELDS;

export interface PosterItem {
  id: string;
  /** The list item's id, an anchor other pages link to. */
  anchorId?: string;
  /** The field behind the picture (it shows around films and while a photograph loads). */
  face: PosterFace;
  /** The big name and one short line under the picture. */
  title: ReactNode;
  tagline: string;
  /** The name as plain text, for the link's label. */
  nameText: string;
  /** The promise, shown from lg. */
  pitch: string;
  href: string;
  /** The photograph; left out when a film fills the picture instead. */
  image?: { src: string; alt: string; position?: string };
  /** A 3D film (components/films) that fills the picture in place of the photograph. */
  film3d?: FilmId;
  /** A motion layer: drawn over the photograph, or the film itself. */
  scene?: PosterSceneKind | "media-reel";
  /** The foot line: the category and stage. */
  note?: string;
}

export function PosterGrid({ items, label }: { items: PosterItem[]; label: string }) {
  return (
    // Two by two on phones and upright tablets; four across from lg, and already from md on a
    // landscape screen (a turned tablet or phone), where two rows would not fit the height.
    <ul aria-label={label} className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:max-lg:landscape:grid-cols-4 lg:grid-cols-4">
      {items.map((item, i) => (
        // The scroll reveal sits on the <li>, so its rise never fights the card's own motion.
        <li key={item.id} id={item.anchorId} className="story-reveal flex scroll-mt-header lg:scroll-mt-header-lg">
          <PosterCard item={item} index={i} />
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

const EASE = "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

// No `priority`: the grids sit far below the fold, and preloading them would compete with the hero's poster.
function PosterCard({ item, index }: { item: PosterItem; index: number }) {
  const [ref, onScreen] = useOnScreen<HTMLAnchorElement>();
  // A photograph shows the skeleton until it has loaded; a film or the reel draws at once.
  const [loaded, setLoaded] = useState(!item.image);
  const film = item.scene === "media-reel";
  const scene = item.scene === "media-reel" ? undefined : item.scene;

  return (
    <Link
      ref={ref}
      href={item.href}
      aria-label={`${item.nameText}: ${item.tagline}`}
      data-paused={!onScreen}
      className="ms-root group flex w-full flex-col rounded-2xl [-webkit-tap-highlight-color:transparent] focus-visible:outline-none sm:rounded-3xl"
    >
      {/* The picture in its frame. */}
      <div
        className={cn(
          "relative aspect-4/5 overflow-hidden rounded-2xl sm:rounded-3xl",
          // The edge is drawn on a layer above the picture, so a film filling the frame never hides it.
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/12 after:ring-inset after:transition-shadow after:duration-700",
          "group-hover:after:ring-signal-orange/70 group-focus-visible:after:ring-2 group-focus-visible:after:ring-signal-orange",
          FIELDS[item.face],
        )}
      >
        {!loaded && <span aria-hidden className="skeleton-shimmer absolute inset-0" />}

        {/* Everything drawn eases in closer together (scale, so the scenes' own transforms stay theirs). */}
        <div className={cn("absolute inset-0 transition-[scale] group-hover:scale-[1.06] group-focus-visible:scale-[1.06] motion-reduce:group-hover:scale-100", EASE)}>
          {item.film3d ? <FilmFrame film={item.film3d} className="absolute inset-0" /> : null}
          {item.image && (
            <Image
              src={item.image.src}
              alt={item.image.alt}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              onLoad={() => setLoaded(true)}
              style={{ objectPosition: item.image.position } as CSSProperties}
              className={cn("object-cover transition-opacity duration-700 ease-out", loaded ? "opacity-100" : "opacity-0", scene && "ms-zoom")}
            />
          )}
          {/* Drawn taller than the picture, so the film's caption strip falls below the crop. */}
          {film && (
            <div className="absolute inset-x-0 top-0 h-[124%]">
              <MediaReel />
            </div>
          )}
          {scene && <PosterScene kind={scene} />}
        </div>

        {/* A bare gold arrow rising into the corner on hover or focus (no disc, Mahir 2026-10-17). */}
        <Icon
          name="arrow_outward"
          className={cn(
            "absolute right-3 bottom-3 text-3xl! text-signal-orange opacity-0 drop-shadow-[0_1px_2px_rgb(0_0_0/0.6)] sm:right-5 sm:bottom-5 sm:text-4xl!",
            "translate-y-2 transition-[opacity,translate] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
            EASE,
          )}
        />
      </div>

      {/* The words, on the black ground under the picture. */}
      <div className="@container mt-4 flex flex-1 flex-col sm:mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={cn(
              "min-w-0 font-grotesk leading-tight font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-signal-orange",
              typeof item.title === "string" && "text-lg sm:text-2xl",
            )}
          >
            {item.title}
          </h3>
          <span aria-hidden className="shrink-0 text-xs font-semibold text-white/65 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-1.5 font-grotesk text-xs leading-snug font-semibold text-white/80 sm:text-sm">{item.tagline}</p>
        <p className="mt-3 mb-4 hidden text-sm leading-relaxed text-white/65 lg:line-clamp-3">{item.pitch}</p>
        {item.note ? <p className="hidden border-t border-white/12 pt-3 text-xs text-white/65 lg:mt-auto lg:block">{item.note}</p> : null}
      </div>
    </Link>
  );
}
