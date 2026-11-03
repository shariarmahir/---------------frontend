"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { Film } from "@/data/motherland";

/**
 * The hero's film: it plays muted and on a loop, with a pause button for
 * anyone who wants stillness. It stays a still picture for visitors who ask
 * for less motion or for saving data, until they press play.
 */
export function WeekFilm({ film }: { film: Film }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!quiet && !saving) void video.current?.play().catch(() => undefined);
  }, []);

  return (
    <>
      <video ref={video} muted loop playsInline preload="metadata" poster={film.poster} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} aria-hidden className="absolute inset-0 -z-20 size-full object-cover">
        {film.src.desktop ? <source media="(min-width: 1024px)" src={film.src.desktop} type="video/mp4" /> : null}
        <source src={film.src.phone} type="video/mp4" />
      </video>
      <button type="button" aria-label={playing ? "Pause the film" : "Play the film"} onClick={() => (playing ? video.current?.pause() : void video.current?.play())} className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        <Icon name={playing ? "pause" : "play_arrow"} className="text-2xl" />
      </button>
    </>
  );
}
