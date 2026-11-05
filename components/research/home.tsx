"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import type { ShowcasePhoto } from "@/data/research/showcase";
import { trending } from "@/lib/research/core";
import { useLibrary, useScores } from "@/lib/research/store";
import { findTrack } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";
import { ARROW, articleHref, collectionHref, contentHref, Cover, Fillet, LABEL, LIFT, LINK, TITLE_LINK, typeOf } from "./kit";

const SLIDE_MS = 6000;

const subscribeMotion = (cb: () => void) => {
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
/** True when the reader asked for less motion; false while rendering on the server. */
const useReducedMotion = () => useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);

/**
 * The research home's hero: one photograph at a time, edge to edge right
 * under the tool bar, with the logo and the headline set in a black notch
 * cut into its bottom-right corner. Below it, the caption and licence, and
 * a row of dots: the active dot fills with gold over the slide's six
 * seconds and the next image follows when it is full, so the dot and the
 * slide never disagree. Hovering or focusing the slider holds it; under
 * reduced motion it never turns by itself and the dots are plain choices.
 */
export function HeroSlider({ slides, children }: { slides: ShowcasePhoto[]; children: React.ReactNode }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const reduce = useReducedMotion();
  const auto = !reduce && slides.length > 1;
  const running = auto && !hold;
  const s = slides[i];
  const track = findTrack(s.collection);
  const next = () => setI((n) => (n + 1) % slides.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Scenes from the research"
      className="relative"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHold(false)}
    >
      {/* The landing page hero's band heights (hero-band in globals.css): 32rem, 30rem from sm, 29rem from lg. */}
      <div className="relative h-128 w-full overflow-hidden bg-bdnavy-900 sm:h-120 lg:h-116">
        {slides.map((p, n) => (
          <Image
            key={p.src}
            src={p.src}
            alt={p.alt}
            fill
            sizes="100vw"
            priority={n === 0}
            quality={90}
            className={cn("object-cover transition-[opacity,scale] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none", n === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0")}
            style={{ objectPosition: p.focus ?? "50% 50%" }}
            aria-hidden={n !== i}
          />
        ))}
        <div className="absolute right-0 bottom-0 z-10 w-[min(40rem,calc(100%-1.5rem))] rounded-tl-4xl bg-black pt-5 pr-gutter-x pl-5 sm:pt-7 sm:pl-8 lg:w-auto lg:max-w-[min(44rem,55%)] lg:pt-9 lg:pl-11">
          <Fillet corner="br" className="-top-8 right-0 size-8" />
          <Fillet corner="br" className="bottom-0 -left-8 size-8" />
          {children}
        </div>
      </div>
      {/*
        The caption: below the photo on narrow screens (where the title's notch
        fills the photo's foot), a black card on the photo's bottom-left from
        lg, clear of the notch. Announced only when the reader moves the
        slider, never on every automatic turn.
      */}
      <div
        aria-live={running ? "off" : "polite"}
        className="mx-auto max-w-7xl px-gutter-x pt-5 lg:absolute lg:top-[27.75rem] lg:left-0 lg:z-10 lg:mx-0 lg:ml-gutter-x lg:max-w-[min(30rem,calc(45%-4rem))] lg:-translate-y-full lg:rounded-2xl lg:bg-black lg:px-4 lg:py-3"
      >
        <span className="block text-sm leading-snug font-semibold text-white">{s.caption}</span>
        {s.credit && (
          <span className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-white/65">
            <Icon name="photo_camera" className="text-sm text-signal-orange" />
            <span>{s.credit.author}</span>
            <span aria-hidden>·</span>
            <a href={s.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className={LINK}>{s.credit.license}</a>
            <span aria-hidden>·</span>
            <a href={s.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className={LINK}>Wikimedia Commons</a>
          </span>
        )}
        {track && (
          <span className="mt-1 block text-xs text-white/65">
            In <Link href={collectionHref(track.id)} className={cn(LINK, "font-semibold")}>{track.title}</Link>
          </span>
        )}
      </div>
      <div className="flex justify-end px-gutter-x py-3 lg:py-4">
        <div className="flex items-center">
          <div role="group" aria-label="Choose an image" className="flex items-center">
            {slides.map((p, n) => {
              const on = n === i;
              return (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => setI(n)}
                  aria-label={`Show image ${n + 1}: ${p.caption}`}
                  aria-current={on ? "true" : undefined}
                  className="group/dot grid h-11 place-items-center rounded-full px-1 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "relative block h-2.5 overflow-hidden rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                      on ? "w-10 bg-white/20" : "w-2.5 bg-white/35 group-hover/dot:bg-white/70",
                    )}
                  >
                    {on && (
                      <span
                        key={i}
                        onAnimationEnd={() => auto && next()}
                        className={cn("absolute inset-0 rounded-full bg-signal-orange", auto && "slide-dot-fill")}
                        style={{ ["--slide-ms" as string]: `${SLIDE_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * "Take an interdisciplinary approach to …": the most-read works as a row
 * of covers, type labels and titles, scrolled with bare gold arrows.
 */
export function ThemeCarousel() {
  const list = useLibrary();
  const { points } = useScores();
  const items = trending(list, points, 12);
  const row = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const onScroll = () => {
    const el = row.current;
    if (el) setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  const move = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="mt-10">
      <div className="mb-4 hidden justify-end gap-1 lg:flex">
        <button type="button" onClick={() => move(-1)} disabled={edge.start} aria-label="Previous items" className={ARROW}>
          <Icon name="arrow_back" className="text-2xl" />
        </button>
        <button type="button" onClick={() => move(1)} disabled={edge.end} aria-label="Next items" className={ARROW}>
          <Icon name="arrow_forward" className="text-2xl" />
        </button>
      </div>
      {/* pt-2 leaves room for the covers' lift inside the scroller's clip. */}
      <ul ref={row} onScroll={onScroll} className="-mx-2 flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 pt-2 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((a) => (
          <li key={a.slug} className="group w-[calc((100%-1.5rem)/2)] shrink-0 snap-start sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-6rem)/5)]">
            <Link href={articleHref(a)} tabIndex={-1} aria-hidden className="block">
              <Cover a={a} sizes="(min-width: 1024px) 18vw, 45vw" className={cn("aspect-178/224 w-full", LIFT)} />
            </Link>
            <p className={cn(LABEL, "mt-4")}>{typeOf(a)}</p>
            <Link href={articleHref(a)} className={cn(TITLE_LINK, "mt-1.5 line-clamp-2 block text-base leading-snug")}>{a.title}</Link>
            <p className="mt-2 text-sm text-white/65">Part of <Link href={contentHref(a)} className={LINK}>{a.institution.split(",")[0]}</Link></p>
          </li>
        ))}
      </ul>
    </div>
  );
}
