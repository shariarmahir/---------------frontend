"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import type { Film } from "@/data/motherland";
import { cn } from "@/lib/utils";

/**
 * Videos: one large player and the playlist beside it (under it on a
 * phone). Nothing downloads until a film is chosen or played; choosing
 * another starts it straight away, with sound if the visitor turns it on.
 */
export function VideoPlayer({ films, credited = true }: { films: Film[]; /** Off on the Videos page, whose credits are in its footer. */ credited?: boolean }) {
  const player = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const film = films[index];

  const choose = (i: number) => {
    setIndex(i);
    requestAnimationFrame(() => void player.current?.play().catch(() => undefined));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-10">
      <figure className={cn("flex flex-col gap-4", !credited && "lg:sticky lg:top-32 lg:self-start")}>
        <div className="overflow-hidden rounded-3xl bg-black ring-1 ring-white/10">
          <video
            key={film.poster}
            ref={player}
            controls
            playsInline
            preload="none"
            poster={film.poster}
            src={film.src.desktop ?? film.src.phone}
            className="aspect-video w-full object-cover"
          >
            {film.title}
          </video>
        </div>
        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <span className="text-lg font-semibold">{film.title}</span>
          {credited ? (
            <a href={film.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-white/65 underline decoration-white/30 underline-offset-4 hover:text-signal-orange">
            Film: {film.credit.source}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          ) : null}
        </figcaption>
      </figure>

      <ol aria-label="Playlist" className="flex flex-col gap-3">
        {films.map((f, i) => {
          const chosen = i === index;
          return (
            <li key={f.poster}>
              <button
                type="button"
                aria-current={chosen ? "true" : undefined}
                onClick={() => choose(i)}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-white",
                  chosen ? "bg-white/12" : "hover:bg-white/6",
                )}
              >
                <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-black sm:w-36">
                  <Image src={f.poster} alt="" fill sizes="9rem" className="object-cover" />
                  <span className={cn("absolute inset-0 grid place-items-center bg-black/30 transition-opacity", chosen ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                    <Icon name={chosen ? "equalizer" : "play_arrow"} className="text-3xl text-white" />
                  </span>
                </span>
                <span className={cn("text-[0.95rem] leading-snug font-semibold", chosen ? "text-signal-orange" : "text-white/85")}>{f.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
