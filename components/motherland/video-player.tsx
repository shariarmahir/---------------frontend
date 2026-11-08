"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import type { Film } from "@/data/motherland";
import { cn } from "@/lib/utils";

/**
 * Videos: one large stage and, under it, a row of poster cards. The stage shows the chosen
 * film's poster and title with a big play button; nothing downloads until a film is played.
 * Choosing a card plays it on the stage straight away, with sound if the visitor turns it on.
 * The cards scroll sideways on a phone and sit in one row from lg.
 */
export function VideoPlayer({ films }: { films: Film[] }) {
  const player = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const film = films[index];

  const play = (i: number) => {
    setIndex(i);
    setPlaying(true);
    requestAnimationFrame(() => void player.current?.play().catch(() => undefined));
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <figure className="relative overflow-hidden rounded-[1.75rem] bg-black shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)] ring-1 ring-white/10">
        <video
          key={film.poster}
          ref={player}
          controls={playing}
          playsInline
          preload="none"
          poster={film.poster}
          src={film.src.desktop ?? film.src.phone}
          className="aspect-video w-full object-cover"
        >
          {film.title}
        </video>
        {!playing && (
          <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/75 via-black/15 to-transparent p-6 sm:p-10">
            <button
              type="button"
              onClick={() => play(index)}
              className="group absolute top-1/2 left-1/2 grid size-20 -translate-1/2 place-items-center rounded-full bg-signal-orange text-ml-navy shadow-[0_0_0_10px_rgb(228_176_39/0.25)] transition-transform duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:size-24"
            >
              <Icon name="play_arrow" className="text-5xl!" />
              <span className="sr-only">Play {film.title}</span>
            </button>
            <figcaption className="max-w-2xl text-xl leading-snug font-bold text-balance text-white sm:text-3xl">{film.title}</figcaption>
          </div>
        )}
      </figure>

      <ol aria-label="Films" className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {films.map((f, i) => {
          const chosen = i === index;
          return (
            <li key={f.poster} className="w-40 shrink-0 snap-start sm:w-48 lg:w-auto">
              <button
                type="button"
                aria-current={chosen ? "true" : undefined}
                onClick={() => play(i)}
                className={cn(
                  "group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl text-left ring-2 transition-[box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                  chosen ? "ring-signal-orange" : "ring-transparent",
                )}
              >
                <Image src={f.poster} alt="" fill sizes="(min-width: 1024px) 12rem, 12rem" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none" />
                <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ml-navy via-ml-navy/30 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3.5">
                  <span className={cn("flex items-center gap-1 text-xs font-bold", chosen ? "text-signal-orange" : "text-white/70")}>
                    <Icon name={chosen && playing ? "equalizer" : "play_circle"} className="text-base" />
                    {chosen ? (playing ? "Playing" : "On screen") : "Play"}
                  </span>
                  <span className="line-clamp-3 text-sm leading-snug font-semibold text-white">{f.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
