"use client";

import { useEffect, useRef } from "react";
import type { Film } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { useOnScreen } from "./use-in-view";

const typeOf = (src: string) => (src.endsWith(".webm") ? "video/webm" : "video/mp4");

/**
 * The hero's film, muted and on a loop behind the title. It rests while
 * scrolled away, and stays a still picture for visitors who ask for less
 * motion or for saving data.
 */
export function HeroFilm({ film }: { film: Film }) {
  const video = useRef<HTMLVideoElement>(null);
  const onScreen = useOnScreen(video);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (onScreen && !quiet && !saving) void el.play().catch(() => undefined);
    else el.pause();
  }, [onScreen]);

  return (
    <video ref={video} muted loop playsInline preload="metadata" poster={film.poster} aria-hidden className={cn("absolute inset-0 -z-20 size-full object-cover", film.bars && "scale-120")}>
      {film.src.wide ? <source media="(min-width: 2200px)" src={film.src.wide} type={typeOf(film.src.wide)} /> : null}
      {film.src.desktop ? <source media="(min-width: 1024px)" src={film.src.desktop} type={typeOf(film.src.desktop)} /> : null}
      <source src={film.src.phone} type={typeOf(film.src.phone)} />
    </video>
  );
}
