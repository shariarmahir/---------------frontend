"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { CardLive, type PosterLive } from "./card-live";
import { MediaReel } from "./media-reel";
import { PosterScene, type PosterSceneKind } from "./poster-scenes";
import { ServiceScene, type ServiceSceneKind } from "./service-scenes";

/*
 * The home page's product and service cards, set like the featured-project
 * cards of kudos.framer.media (Mahir, 2026-10-29): a tall framed picture in
 * its own field (navy, cobalt or ink) with a skeleton shimmer until the
 * picture arrives, and on the full picture only the name in gold and its
 * arrow (Mahir, 2026-10-30: no melt, no buttons). The whole card is one link
 * to its page. On hover the picture eases in closer, the frame takes a gold
 * edge and the bare gold arrow beside the name rises.
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
  /** The big name, at the picture's foot. */
  title: ReactNode;
  /** One short line, read out with the name in the card link's label. */
  tagline: string;
  /** The name as plain text, for the link's label. */
  nameText: string;
  href: string;
  /** The photograph; left out when a service's motion graphic fills the picture instead. */
  image?: { src: string; alt: string; position?: string };
  /** A service's 3D motion graphic (service-scenes.tsx), in place of the photograph. */
  serviceScene?: ServiceSceneKind;
  /** A motion layer: drawn over the photograph, or the film itself. */
  scene?: PosterSceneKind | "media-reel";
  /**
   * A still brought to life as a 3D shot that fills the picture (card-live.tsx; Mahir, 2026-10-29:
   * his Pinterest brain on the AI Agents card). The `serviceScene` drawing stands in until it is in.
   */
  live?: PosterLive;
}

export function PosterGrid({ items, label }: { items: PosterItem[]; label: string }) {
  return (
    // A phone swipes through wide cards (the next one peeking, the row bleeding to the screen's
    // sides); two by two from sm; four across from lg, and
    // already from md on a landscape screen, where two rows would not fit the height. The scroll
    // reveal lives on the list, so a card waiting off to the side is never left hidden.
    <ul
      aria-label={label}
      className={cn(
        "story-reveal no-scrollbar -mx-gutter-x flex snap-x snap-mandatory scroll-px-gutter-x gap-3 overflow-x-auto px-gutter-x",
        "sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 md:max-lg:landscape:grid-cols-4 lg:grid-cols-4",
      )}
    >
      {items.map((item) => (
        <li
          key={item.id}
          id={item.anchorId}
          className="flex w-[82%] max-w-80 shrink-0 snap-start scroll-mt-header sm:w-auto sm:max-w-none lg:scroll-mt-header-lg"
        >
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

const EASE = "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

// No `priority`: the grids sit far below the fold, and preloading them would compete with the hero's poster.
function PosterCard({ item }: { item: PosterItem }) {
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();
  // A photograph shows the skeleton until it has loaded; a film or the reel draws at once.
  const [loaded, setLoaded] = useState(!item.image);
  const film = item.scene === "media-reel";
  const scene = item.scene === "media-reel" ? undefined : item.scene;
  // A living picture: the drawing under it goes once the picture is in.
  const [liveReady, setLiveReady] = useState(false);

  return (
    <div ref={ref} data-paused={!onScreen} className="ms-root group w-full">
      {/* The picture in its frame. */}
      <div
        className={cn(
          "relative aspect-4/5 overflow-hidden rounded-2xl sm:rounded-3xl",
          // The edge is drawn on a layer above the picture, so a film filling the frame never hides it.
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/12 after:ring-inset after:transition-shadow after:duration-700",
          "group-hover:after:ring-signal-orange/70",
          FIELDS[item.face],
        )}
      >
        {/* A film with no drawing to stand in for it shows the skeleton until it is in, as a photograph does. */}
        {(!loaded || (item.live && !item.serviceScene && !liveReady)) && <span aria-hidden className="skeleton-shimmer absolute inset-0" />}

        {/* Everything drawn eases in closer together (scale, so the scenes' own transforms stay theirs). */}
        <div className={cn("absolute inset-0 transition-[scale] group-hover:scale-[1.06] motion-reduce:group-hover:scale-100", EASE)}>
          {item.serviceScene && !liveReady ? <ServiceScene kind={item.serviceScene} /> : null}
          {item.live && <CardLive live={item.live} onScreen={onScreen} onReady={() => setLiveReady(true)} />}
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

        {/* The card's own link, over the whole picture. */}
        <Link
          href={item.href}
          aria-label={`${item.nameText}: ${item.tagline}`}
          className="absolute inset-0 z-1 rounded-[inherit] [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none focus-visible:ring-inset"
        />

        {/* The name in gold at the picture's foot, each letter traced in near-black so it holds on any
            frame (.card-words), and the bare gold arrow (no disc, Mahir 2026-10-17). */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-2 px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="card-words flex items-center gap-2.5">
            <h3
              className={cn(
                "min-w-0 flex-1 font-grotesk leading-tight font-bold tracking-tight text-balance text-signal-orange",
                typeof item.title === "string" && "text-xl sm:text-2xl",
              )}
            >
              {item.title}
            </h3>
            <Icon
              name="arrow_outward"
              className={cn(
                "shrink-0 text-2xl! text-signal-orange opacity-80 sm:text-3xl!",
                "transition-[opacity,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100",
                EASE,
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
