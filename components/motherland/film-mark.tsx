"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_ART, TITLE_ART } from "@/data/motherland-art";
import { startMelt } from "./film-melt";
import { useFilmInk } from "./film-ink";
import { Logo } from "./logo";

/** Room around the letters for their colour to seep into the film. */
const SEEP = "-inset-[3.5rem]";

/**
 * The hero's mark: the logo over the anthem's name, sized as one piece, and melted into
 * the film (film-melt.ts). The h1 carries the Bangla text; the letters people see are the
 * vector art beneath it, which stands alone where the melt can't run: less motion, data
 * saving, no WebGL 2. There its colour still follows the film, one colour at a time.
 */
export function FilmMark({ title }: { title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [melted, setMelted] = useState(false);
  useFilmInk(box, !melted);

  useEffect(() => {
    const video = box.current?.closest("section")?.querySelector("video");
    const logo = box.current?.querySelector("[data-logo]");
    const art = box.current?.querySelector("[data-title]");
    if (!canvas.current || !video || !logo || !art) return;
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (quiet || saving) return;

    const letters = new Path2D(LOGO_ART.d);
    const words = new Path2D(TITLE_ART.d);
    const { cx, cy, r } = LOGO_ART.sun;
    const stop = startMelt({
      canvas: canvas.current,
      video,
      shapes: [
        {
          el: logo,
          width: LOGO_ART.width,
          draw: (mask) => {
            mask.fillStyle = "#f00";
            mask.fill(letters, "evenodd");
            mask.fillStyle = "#0f0";
            mask.beginPath();
            mask.arc(cx, cy, r, 0, Math.PI * 2);
            mask.fill();
          },
        },
        {
          el: art,
          width: TITLE_ART.width,
          draw: (mask) => {
            mask.fillStyle = "#f00";
            mask.fill(words);
          },
        },
      ],
      onStart: () => setMelted(true),
      onLost: () => setMelted(false),
    });
    return stop ?? undefined;
  }, []);

  return (
    <div ref={box} className="relative w-[min(100%,63.6vw)] text-signal-orange max-sm:w-full transition-colors duration-1000">
      <h1 id="hero-title" lang="bn" className="sr-only">
        {title}
      </h1>
      <div className={melted ? "opacity-0 transition-opacity duration-1000" : undefined}>
        <span data-logo className="ml-[1.5%] block w-[41.5%] max-sm:w-[55%]">
          <Logo className="w-full" />
        </span>
        <svg data-title aria-hidden viewBox={`0 0 ${TITLE_ART.width} ${TITLE_ART.height}`} fill="currentColor" className="mt-[1.7%] block h-auto w-full">
          <path d={TITLE_ART.d} />
        </svg>
      </div>
      <canvas ref={canvas} aria-hidden className={`pointer-events-none absolute ${SEEP} size-[calc(100%+7rem)] ${melted ? "" : "invisible"}`} />
    </div>
  );
}
