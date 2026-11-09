"use client";

import { useEffect, useRef } from "react";
import type { Film } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { useOnScreen } from "./use-in-view";

const typeOf = (src: string) => (src.endsWith(".webm") ? "video/webm" : "video/mp4");

/**
 * The hero's film, muted and on a loop behind the title. It rests while
 * scrolled away, and stays a still picture for visitors who ask for less
 * motion or for saving data. A film with black bars in its frame (`bars`) is
 * given its own frame shape and sized so the picture between the bars just
 * covers the hero, centred, and the bars fall outside it.
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
    <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden [container-type:size]">
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="metadata"
        poster={film.poster}
        className={cn("absolute", film.bars ? "top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" : "inset-0 size-full object-cover")}
        style={film.bars ? { width: `max(100cqw, ${(film.bars.picture * 100).toFixed(2)}cqh)`, aspectRatio: film.bars.frame } : undefined}
      >
        {film.src.wide ? <source media="(min-width: 2200px)" src={film.src.wide} type={typeOf(film.src.wide)} /> : null}
        {film.src.desktop ? <source media="(min-width: 1024px)" src={film.src.desktop} type={typeOf(film.src.desktop)} /> : null}
        <source src={film.src.phone} type={typeOf(film.src.phone)} />
      </video>
    </div>
  );
}
