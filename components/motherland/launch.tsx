"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { pic } from "@/data/motherland-blocks";
import { SCIENCE_EVENTS } from "@/data/motherland-live";
import { cn } from "@/lib/utils";
import { Dialog } from "./dialog";
import { COLUMN, SectionHead, pill } from "./kit";

const VIDEO_ID = "rQEqKZ7CJlk";
const POSTER = pic("falcon9-bd", "A Falcon 9 rocket lifting off from Kennedy Space Center with Bangladesh's first satellite");

/** SpaceX's own film of the launch of Bangladesh's first satellite. YouTube loads only after the visitor asks for it. */
export function LaunchBand() {
  const [playing, setPlaying] = useState(false);
  return (
    <section id="first-satellite" aria-labelledby="first-satellite-title" className="scroll-mt-(--ml-header) bg-ml-navy py-12 text-white sm:py-14 lg:py-16">
      <div className={cn(COLUMN, "flex flex-col gap-8")}>
        <SectionHead id="first-satellite-title" tone="dark" title="Our flag in orbit" lede="11 May 2018, Kennedy Space Center: a Falcon 9 carried Bangladesh's first satellite to space." />
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-ml-ink">
          {playing ? (
            <iframe sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" referrerPolicy="strict-origin-when-cross-origin" src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`} title="Bangabandhu Satellite-1 Mission, by SpaceX" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 size-full" />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} aria-label="Watch the launch film" className="group absolute inset-0 grid size-full cursor-pointer place-items-center overflow-hidden focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-signal-orange">
              {POSTER ? <Image src={POSTER.src} alt={POSTER.alt} fill sizes="(min-width: 1024px) 92vw, 100vw" className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" /> : null}
              <span aria-hidden className="absolute inset-0 bg-ml-navy/25 transition-colors duration-500 group-hover:bg-ml-navy/10" />
              <span className={cn(pill.onDark, "relative")}>Watch the launch</span>
            </button>
          )}
        </div>
        {!playing ? <p className="text-sm text-white/70">The film plays from YouTube, which may set its own cookies when you press play.</p> : null}
      </div>
    </section>
  );
}

/** The corner button: real contests and events a visitor can sign up for, each on its organiser's own site. */
export function CornerScience() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn(pill.onLight, "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 shadow-[0_12px_28px_-8px_rgb(11_24_73/0.55)] sm:right-8 sm:bottom-8")}>
        Find events, join now
      </button>
      {open ? (
        <Dialog title="Join in" onClose={close}>
          <p className="text-lg">Dates change each year, so every link goes to the organiser.</p>
          <ul className="flex flex-col gap-3">
            {SCIENCE_EVENTS.map((e) => (
              <li key={e.id} className="flex flex-col gap-2 rounded-2xl bg-ml-ground p-5">
                <h3 className="text-lg font-bold">{e.title}</h3>
                <p className="font-semibold text-ml-green">
                  {e.who}. {e.when}.
                </p>
                <p className="leading-relaxed">{e.text}</p>
                <a href={e.url} target="_blank" rel="noopener noreferrer" className={cn(pill.onLight, "mt-1 min-h-10 w-fit px-5 py-2")}>
                  Join now
                  <span className="sr-only">: {e.title} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </Dialog>
      ) : null}
    </>
  );
}
