"use client";

import { useEffect, useRef, useState } from "react";
import { TITLE_ART } from "@/data/motherland-art";

/**
 * Mahir's film opens on its own burned-in "BANGLADESH" (gone by about 2.2s), so আমাদের বাংলা waits
 * for 4s of film time and leaves a second before the film loops back to it: the two never meet.
 */
const IN_AT = 4;
const OUT_BEFORE_END = 1.2;
/** If the film never plays (autoplay refused), the title comes anyway. */
const NO_FILM_AFTER = 5000;

/**
 * The hero's title, low on the left of the film, on the same left edge as the words under the
 * hero, where the eye lands first. Dressed like the film's own title: warm off-white, flat and
 * solid, held off the picture by a soft shadow only, no panel. It comes into focus as it rises a
 * little, and goes out of focus before the film starts over. With less motion, or no film, it
 * simply stands there. The h1 carries its Bangla text; the vector letters are its picture.
 */
export function FilmMark({ title }: { title: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const video = stage.current?.closest("section")?.querySelector("video");
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!video || quiet || saving) {
      const timer = window.setTimeout(() => setShown(true), 0);
      return () => window.clearTimeout(timer);
    }
    const follow = () => {
      const end = Number.isFinite(video.duration) ? video.duration - OUT_BEFORE_END : Infinity;
      setShown(video.currentTime >= IN_AT && video.currentTime < end);
    };
    const noFilm = window.setTimeout(() => {
      if (video.paused && video.currentTime === 0) setShown(true);
    }, NO_FILM_AFTER);
    video.addEventListener("timeupdate", follow);
    video.addEventListener("seeked", follow);
    return () => {
      window.clearTimeout(noFilm);
      video.removeEventListener("timeupdate", follow);
      video.removeEventListener("seeked", follow);
    };
  }, []);

  return (
    <>
      <h1 id="hero-title" lang="bn" className="sr-only">
        {title}
      </h1>
      <div ref={stage} data-shown={shown} className="ml-film-title w-[88%] sm:w-[50vw] lg:w-[max(24vw,24rem)]">
        <svg aria-hidden viewBox={`0 0 ${TITLE_ART.width} ${TITLE_ART.height}`} fill="currentColor" className="block h-auto w-full overflow-visible">
          <path d={TITLE_ART.d} />
        </svg>
      </div>
    </>
  );
}
