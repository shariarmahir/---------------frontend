"use client";

import { useEffect, useRef } from "react";
import type { FilmCard } from "@/data/motherland-blocks";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { RiseText } from "./rise-text";

/** A silent film that plays only while it is on screen, and stays a still for anyone who asks for less motion. */
function Clip({ film, wide }: { film: FilmCard; wide: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = video.current;
    if (!node || reduced) return;
    const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saving) return;
    const seen = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void node.play().catch(() => undefined);
        else node.pause();
      },
      { threshold: 0.25 },
    );
    seen.observe(node);
    return () => seen.disconnect();
  }, [reduced]);

  return (
    <figure className={cn("flex flex-col overflow-hidden rounded-[1.25rem] bg-white text-ml-navy", wide && "lg:col-span-2")}>
      <div className={cn("relative overflow-hidden bg-ml-navy", wide ? "aspect-video lg:aspect-[21/9]" : "aspect-video")}>
        <video ref={video} muted loop playsInline preload="none" poster={`/motherland/video/${film.file}.jpg`} aria-label={film.title} className="size-full object-cover">
          <source src={`/motherland/video/${film.file}.${film.ext ?? "webm"}`} type={`video/${film.ext ?? "webm"}`} />
        </video>
      </div>
      <figcaption className="flex flex-1 flex-col gap-2 p-6 lg:p-8">
        <RiseText as="h3" text={film.title} className="w-full font-ml-sans font-extrabold text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[1.1] tracking-[-0.03em]" />
        <p className="leading-relaxed text-pretty opacity-90">{film.text}</p>
        <p className="text-sm font-semibold text-ml-navy/70">{film.where}</p>
      </figcaption>
    </figure>
  );
}

/** The first film runs wide, the rest beside each other. */
export function FilmWall({ films }: { films: FilmCard[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {films.map((f, i) => (
        <Clip key={f.file} film={f} wide={i === 0 && films.length % 2 === 1} />
      ))}
    </div>
  );
}
