"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { pic } from "@/data/motherland-blocks";
import { Icon } from "@/components/ui/icon";
import { LAUNCH_FACTS, LAUNCH_SOURCE, SCIENCE_EVENTS } from "@/data/motherland-live";
import { cn } from "@/lib/utils";
import { CornerButton } from "./corner-button";
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
        <SectionHead id="first-satellite-title" tone="dark" title="Our flag in orbit" lede="A Falcon 9 carried Bangladesh's first satellite to space from Florida." />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] lg:gap-5">
          <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-ml-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/15">
            {playing ? (
              <iframe sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" referrerPolicy="strict-origin-when-cross-origin" src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`} title="Bangabandhu Satellite-1 Mission, by SpaceX" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 size-full" />
            ) : (
              <button type="button" onClick={() => setPlaying(true)} aria-label="Watch the launch film" className="group absolute inset-0 grid size-full cursor-pointer place-items-center overflow-hidden focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-signal-orange">
                {POSTER ? <Image src={POSTER.src} alt={POSTER.alt} fill sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" /> : null}
                <span aria-hidden className="relative grid size-20 place-items-center rounded-full bg-signal-orange text-ml-navy shadow-[0_12px_36px_-8px_rgb(0_0_0/0.7)] transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none sm:size-24">
                  <Icon name="play_arrow" className="text-5xl! sm:text-6xl!" />
                </span>
                <span className="absolute bottom-4 left-4 rounded-full bg-ml-navy px-4 py-2 text-sm font-semibold text-white sm:bottom-6 sm:left-6">SpaceX&apos;s film of the launch</span>
              </button>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            {LAUNCH_FACTS.map((f) => (
              <div key={f.label} className="flex flex-col-reverse justify-end gap-1.5 rounded-[1.25rem] bg-white/8 p-5 ring-1 ring-white/12">
                <dt className="text-sm leading-snug text-pretty text-white/80">{f.label}</dt>
                <dd className="font-ml-display text-[clamp(1.5rem,2vw,2rem)] leading-none tracking-[0.01em] text-signal-orange">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-sm leading-relaxed text-white/70">
          The film plays from YouTube, which may set its own cookies when you press play. Figures:{" "}
          <a href={LAUNCH_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
            {LAUNCH_SOURCE.name}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
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
      <CornerButton onClick={() => setOpen(true)}>Find events, join now</CornerButton>
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
