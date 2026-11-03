"use client";

import { useEffect, useRef } from "react";
import type { Film } from "@/data/motherland";

/**
 * The hero's film: it plays muted and on a loop behind the title. It stays a
 * still picture for visitors who ask for less motion or for saving data.
 */
export function WeekFilm({ film }: { film: Film }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!quiet && !saving) void video.current?.play().catch(() => undefined);
  }, []);

  return (
    <video ref={video} muted loop playsInline preload="metadata" poster={film.poster} aria-hidden className="absolute inset-0 -z-20 size-full object-cover">
      {film.src.desktop ? <source media="(min-width: 1024px)" src={film.src.desktop} type="video/mp4" /> : null}
      <source src={film.src.phone} type="video/mp4" />
    </video>
  );
}
