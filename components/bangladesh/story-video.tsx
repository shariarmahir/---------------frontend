"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import type { Film } from "@/data/bangladesh";
import { cn } from "@/lib/utils";
import { StoryPhoto } from "./story-photo";

/**
 * A section's film: a large poster that opens a player.
 *
 * Only films with a real `src` play. The rest are honest placeholders —
 * the dialog shows what the film will cover instead of a black player
 * that never starts, and the poster says "শীঘ্রই" so nobody clicks
 * expecting footage.
 */
export function StoryVideo({
  film,
  className,
  size = "wide",
}: {
  film: Film;
  className?: string;
  size?: "wide" | "tall";
}) {
  const [open, setOpen] = useState(false);
  const ready = Boolean(film.src);

  return (
    // Wrapper keeps the poster credit (a link) outside the button.
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group story-reveal relative block w-full overflow-hidden rounded-3xl bg-slate-950 text-left shadow-elevated ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-2xl focus-visible:ring-4 focus-visible:ring-signal-orange/60 focus-visible:outline-none",
          size === "wide" ? "aspect-video" : "aspect-4/5",
          className,
        )}
        aria-label={`${film.titleBn} — ${ready ? "ভিডিও চালান" : "ভিডিও শীঘ্রই আসছে"}`}
      >
        <StoryPhoto
          photo={film.poster}
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="absolute inset-0"
          imgClassName="opacity-80 group-hover:opacity-95"
          hideCredit
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/25 to-slate-950/10" />

        {/* Play disc with a pulsing halo. */}
        <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="relative flex size-20 items-center justify-center sm:size-24">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/25 motion-reduce:animate-none" />
            <span className="relative flex size-full items-center justify-center rounded-full bg-white/95 text-bd-green shadow-2xl ring-8 ring-white/20 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
              <Icon name="play_arrow" filled className="text-[44px]!" />
            </span>
          </span>
        </span>

        <span className="pointer-events-none absolute top-4 left-4 flex items-center gap-2">
          <span className="rounded-full bg-national-crimson px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-white uppercase">
            Film
          </span>
          {!ready && (
            <span className="rounded-full bg-white/90 px-3 py-1 font-bengali text-[11px] font-bold text-slate-800">
              শীঘ্রই আসছে
            </span>
          )}
          {film.duration && (
            <span className="rounded-full bg-slate-950/60 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-sm">
              {film.duration}
            </span>
          )}
        </span>

        <span className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <span className="block font-bengali text-2xl leading-tight font-bold text-white sm:text-3xl">
            {film.titleBn}
          </span>
          <span className="mt-1 block font-sans text-sm text-white/75">{film.title}</span>
        </span>
      </button>
      {film.poster.credit && (
        <a
          href={film.poster.credit.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block truncate text-right font-mono text-[10px] text-slate-500 hover:text-bd-green hover:underline"
        >
          Poster © {film.poster.credit.author} · {film.poster.credit.license}
        </a>
      )}

      <FilmDialog film={film} open={open} onOpenChange={setOpen} />
    </>
  );
}

/** The player itself — real footage, or an honest "being made" panel. */
export function FilmDialog({
  film,
  open,
  onOpenChange,
}: {
  film: Film;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden border-0 bg-slate-950 p-0 text-white sm:max-w-4xl">
        <DialogTitle className="sr-only">{film.titleBn}</DialogTitle>
        {film.src ? (
          <>
            <video
              src={film.src}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full bg-black"
            />
            <DialogDescription className="px-6 pb-5 font-bengali text-sm text-white/75">
              {film.brief}
            </DialogDescription>
          </>
        ) : (
          <div className="relative aspect-video w-full">
            <StoryPhoto photo={film.poster} sizes="900px" className="absolute inset-0" imgClassName="opacity-40" hideCredit />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/50 p-8 text-center">
              <Icon name="movie" className="text-[48px]! text-signal-orange" />
              <p className="font-bengali text-2xl font-bold">এই ভিডিওটি তৈরি হচ্ছে</p>
              <DialogDescription className="max-w-lg font-bengali text-base text-white/80">
                {film.brief}
              </DialogDescription>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Compact pill trigger for the same player — used over the hero film. */
export function FilmButton({ film, label }: { film: Film; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-3 rounded-full bg-white/95 py-2 pr-5 pl-2 font-bengali text-sm font-bold text-slate-900 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-white focus-visible:ring-4 focus-visible:ring-signal-orange/60 focus-visible:outline-none motion-reduce:hover:translate-y-0"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-national-crimson text-white transition-transform group-hover:scale-110 motion-reduce:transition-none">
          <Icon name="play_arrow" filled className="text-[24px]!" />
        </span>
        {label}
      </button>
      <FilmDialog film={film} open={open} onOpenChange={setOpen} />
    </>
  );
}
