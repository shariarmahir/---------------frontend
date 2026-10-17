"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MediaReel } from "./media-reel";
import { PosterScene, type PosterSceneKind } from "./poster-scenes";

/*
 * The home page's poster cards, for products and services alike, built on
 * banglalink.net's "Dive Into Digital" strip: tall poster cards (416 × 555,
 * 296 × 395 on a phone) in a row you drag or swipe sideways, running off the
 * right edge of the page. The face is a poster — a big headline and one
 * line on a solid brand colour, the picture in a rounded hill with a line
 * floating above it. The picture is a photograph (products add a motion
 * layer and their status chips over it) or, for শিক্ষিতদের মিডিয়া, a
 * looping motion film. On hover or focus a dark panel slides up from the
 * foot with the name, the promise and a white "Explore" pill; on a touch
 * screen a tap opens it. Off screen, every animation pauses.
 */

/** Solid brand fields (no gradients, see CLAUDE.md §4.1). */
const FACES = {
  green: { card: "bg-bd-green", title: "text-white", tagline: "text-white/90", line: "stroke-white" },
  gold: { card: "bg-signal-orange", title: "text-text-primary", tagline: "text-text-primary/85", line: "stroke-white" },
  navy: { card: "bg-bdnavy-900", title: "text-white", tagline: "text-white/85", line: "stroke-signal-orange" },
  white: { card: "bg-white", title: "text-bd-green", tagline: "text-text-primary/80", line: "stroke-signal-orange" },
} as const;

export type PosterFace = keyof typeof FACES;

export interface PosterItem {
  id: string;
  /** The list item's id, an anchor other pages link to. */
  anchorId?: string;
  face: PosterFace;
  /** The face: a big headline and one short line. */
  title: ReactNode;
  tagline: string;
  /** The panel: the full name (and as plain text, for the link's label), the promise, where "Explore" goes. */
  name: ReactNode;
  nameText: string;
  pitch: string;
  href: string;
  /** The photograph in the hill; left out when a film fills it instead. */
  image?: { src: string; alt: string; position?: string };
  /** A motion layer: drawn over the photograph, or the film itself. */
  scene?: PosterSceneKind | "media-reel";
  /** Small status plates pinned to the hill's lower left. */
  chips?: string[];
  /** The panel's foot line: a photo credit or the stage. */
  note?: string;
}

/**
 * The hill the picture sits in, drawn on the card's 416 × 555 grid: it
 * rises from the left edge, swells into a round crown just right of centre,
 * steps down to a shoulder and runs off the right edge. Points outside the
 * card are clipped by it.
 */
const HILL = "M-10 330 L100 250 C120 190 162 168 208 168 C258 168 294 210 296 318 C352 318 404 346 430 396 L430 620 L-10 620 Z";

export function PosterStrip({ items, label }: { items: PosterItem[]; label: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: false });

  // Drag to scroll with a mouse, as on the reference; touch and trackpads
  // scroll natively.
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !scroller.current) return;
    drag.current = { on: true, x: e.clientX, left: scroller.current.scrollLeft, moved: false };
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.on || !scroller.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    scroller.current.scrollLeft = d.left - dx;
  };
  const up = () => {
    drag.current.on = false;
  };

  return (
    // Runs to the right edge of the window, past the page's content column.
    <div className="mr-[calc(50%-50vw)]">
      <div
        ref={scroller}
        role="region"
        aria-label={label}
        tabIndex={0}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        // A drag must not also count as a click on the card under it.
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
        onDragStart={(e) => e.preventDefault()}
        className="no-scrollbar cursor-grab overflow-x-auto pb-4 select-none focus-visible:outline-none active:cursor-grabbing"
      >
        <ul className="flex w-max gap-2 pr-4 md:gap-4 md:pr-8">
          {items.map((item, i) => (
            <li key={item.id} id={item.anchorId} className="scroll-mt-header lg:scroll-mt-header-lg">
              <PosterCard item={item} priority={i < 3} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** True while the element is on screen (with a margin), so off-screen motion can pause. */
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

/** Bangla text takes the Bangla face; Latin labels stay mono capitals. */
const isBangla = (s: string) => /[ঀ-৿]/.test(s);

function PosterCard({ item, priority }: { item: PosterItem; priority: boolean }) {
  const face = FACES[item.face];
  const [ref, onScreen] = useOnScreen<HTMLElement>();
  // A touch screen has no hover: a tap on the card opens the panel instead.
  const [open, setOpen] = useState(false);
  const tap = () => {
    if (window.matchMedia("(hover: none)").matches) setOpen((o) => !o);
  };
  const film = item.scene === "media-reel";

  return (
    <article
      ref={ref}
      data-open={open}
      data-paused={!onScreen}
      onClick={tap}
      className={cn("ms-root group relative h-98.75 w-74 overflow-hidden rounded-3xl md:h-138.75 md:w-104", face.card)}
    >
      {/* The poster, drawn at 416 × 555 and scaled down whole on a phone so
          the hill keeps its shape. */}
      <div className="absolute top-0 left-0 h-138.75 w-104 origin-top-left scale-[0.7115] md:scale-100">
        <div className="absolute inset-x-6 top-11 text-center">
          {/* One line always: a long headline ("SMART PHARMACY") steps down a size. */}
          <p
            className={cn(
              "font-grotesk leading-none font-extrabold tracking-tight whitespace-nowrap",
              typeof item.title === "string" && item.title.length > 12 ? "text-[2.125rem]" : "text-[2.5rem]",
              face.title,
            )}
          >
            {item.title}
          </p>
          <p className={cn("mt-3 font-grotesk text-lg leading-snug font-bold", face.tagline)}>{item.tagline}</p>
        </div>

        {/* The picture, cut to the hill. */}
        <div className="absolute inset-0" style={{ clipPath: `path("${HILL}")` }}>
          <div className="absolute inset-x-0 top-40 bottom-0 overflow-hidden">
            {item.image ? (
              <Image
                src={item.image.src}
                alt={item.image.alt}
                fill
                priority={priority}
                sizes="416px"
                style={{ objectPosition: item.image.position }}
                className={cn("object-cover", item.scene && "ms-zoom")}
              />
            ) : null}

            {film ? <MediaReel /> : null}

            {/* Products: a foot shade so the motion layer and chips read on any photo. */}
            {item.scene && item.scene !== "media-reel" ? (
              <>
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
                <PosterScene kind={item.scene} />
              </>
            ) : null}

            {item.chips?.length ? (
              <ul aria-hidden className="absolute bottom-5 left-6 flex flex-wrap gap-1.5">
                {item.chips.map((c, i) => (
                  <li
                    key={c}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full bg-text-primary/85 px-2.5 py-1 text-[11px] leading-none font-bold text-white ring-1 ring-white/20",
                      isBangla(c) ? "font-bengali" : "font-mono tracking-wide uppercase",
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", i === 0 ? "ms-pulse bg-signal-orange" : "bg-bdgreen-500")} />
                    {c}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* The line, floating just above the hill's edge. */}
        <svg viewBox="0 0 416 555" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <path d={HILL} transform="translate(-6 -16)" className={cn("fill-none", face.line)} strokeWidth="4" strokeLinejoin="round" />
        </svg>
      </div>

      {/* The panel, rising from the foot on hover, focus or tap. */}
      <div
        className={cn(
          "absolute inset-0 translate-y-full bg-[linear-gradient(rgb(33_33_33)_50%,rgb(33_33_33/0.8)_100%)] opacity-0 transition-all duration-400 ease-out",
          "group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 group-data-[open=true]:translate-y-0 group-data-[open=true]:opacity-100",
          "motion-reduce:transition-none",
        )}
      >
        <div className="absolute inset-x-0 top-0 flex h-full flex-col p-6 text-white">
          <h3 className="line-clamp-2 py-6 font-grotesk text-[20px] leading-tight font-bold wrap-break-word md:text-[32px]">{item.name}</h3>
          <p className="mb-4 text-sm leading-relaxed md:text-base">{item.pitch}</p>
          <Link
            href={item.href}
            className={cn(
              "w-fit translate-y-4 rounded-full bg-white px-6 py-2 font-semibold text-black transition-[translate,background-color] delay-150 duration-500 hover:bg-gray-100",
              "group-focus-within:translate-y-0 group-hover:translate-y-0 group-data-[open=true]:translate-y-0 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none",
              "motion-reduce:translate-y-0 motion-reduce:transition-none",
            )}
          >
            Explore<span className="sr-only"> {item.nameText}</span>
          </Link>
          {item.note ? <p className="mt-auto text-[11px] text-white/55">{item.note}</p> : null}
        </div>
      </div>
    </article>
  );
}
