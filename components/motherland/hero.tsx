"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { HERO } from "@/data/motherland";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { RiseText } from "./rise-text";

/** The film's cut, chosen once per visit: 1080p from lg, 720p below. The server leaves it unset. */
let cut: string | undefined;
const pickCut = () => {
  const { phone, desktop } = HERO.film.src;
  cut ??= desktop && window.matchMedia("(min-width: 1024px)").matches ? desktop : phone;
  return cut;
};
const noSubscription = () => () => {};

/**
 * About Bangladesh: the drone film edge to edge under the header, the
 * anthem's title rising word by word and the title as Tagore wrote it.
 * The film picks its cut once (1080p from lg, 720p below) and plays muted
 * on a loop; with reduced motion it rests on its poster.
 */
export function Hero() {
  const film = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const src = useSyncExternalStore(noSubscription, pickCut, () => undefined);

  useEffect(() => {
    const video = film.current;
    if (!video || !src) return;
    if (reduced) video.pause();
    else video.play().catch(() => {});
  }, [src, reduced]);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[max(40rem,100svh)] flex-col justify-end overflow-hidden bg-ml-deep text-white">
      <video
        ref={film}
        src={src}
        poster={HERO.film.poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/15 to-black/10" />

      <div className="mx-auto flex w-full max-w-336 flex-col items-center px-6 pb-20 text-center sm:px-10 lg:pb-28">
        <RiseText
          as="h1"
          id="hero-title"
          now
          text={HERO.title}
          className="font-ml-display text-[clamp(4rem,12.5vw,11rem)] leading-[0.84] tracking-[0.015em] text-balance text-ml-ground uppercase"
        />
        <p lang="bn" className="hero-rise mt-5 font-bengali text-2xl font-semibold text-white/90 sm:text-3xl" style={{ "--d": "500ms" } as CSSProperties}>
          {HERO.titleBn}
        </p>
      </div>
    </section>
  );
}
