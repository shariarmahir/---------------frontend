"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { PROCON } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, BAND_Y, COLUMN, SectionHead } from "./kit";
import { Reveal } from "./reveal";

/** Each note's paper and tilt, in turn, so the wall looks pinned up by hand. */
const PAPER = ["bg-signal-orange", "bg-ml-sun", "bg-ml-mint", "bg-white", "bg-ml-sun"];
const TILT = [-2.2, 1.6, -1.1, 2, -1.6];

/**
 * Pro & Con as a wall of notes (Mahir, 2026-11-07): each question on a medium paper note pinned
 * to the dark band at a slight tilt. Turning a note over shows the strongest case for and against
 * on its back; any number can be turned at once, and turned back. The notes drop onto the wall
 * one after another as it arrives (.ml-note); the turn is a 3D flip, a plain swap with less motion.
 */
export function ProCon() {
  const [turned, setTurned] = useState<number[]>([]);
  const turn = (i: number) => setTurned((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]));

  return (
    <section id="procon" aria-labelledby="procon-title" className={cn(ANCHOR, BAND_Y, "ml-dot-grid relative bg-ml-ink text-white")}>
      <div className={cn(COLUMN, "flex flex-col gap-12 lg:gap-16")}>
        <SectionHead id="procon-title" tone="dark" title={PROCON.title} lede={PROCON.lede} cta={PROCON.cta} />

        <ul className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {PROCON.debates.map((d, i) => {
            const back = turned.includes(i);
            return (
              <Reveal as="li" key={d.question} order={i % 3} className="ml-note w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4rem)/3)]">
                <div className="ml-note-tilt relative h-80 lg:h-76" style={{ "--tilt": `${TILT[i % TILT.length]}deg` } as CSSProperties}>
                  <span aria-hidden className="absolute -top-3 left-1/2 z-10 size-6 -translate-x-1/2 rounded-full bg-ml-navy shadow-[0_3px_4px_rgb(0_0_0/0.35)] ring-2 ring-white/70" />
                  <div data-turned={back} className="ml-note-card relative size-full text-ml-navy">
                    <div className={cn("ml-note-face absolute inset-0 flex flex-col gap-5 p-7 pt-9", PAPER[i % PAPER.length])} inert={back}>
                      <h3 className="text-[clamp(1.3rem,1.6vw,1.6rem)] leading-snug font-extrabold tracking-[-0.02em] text-balance">{d.question}</h3>
                      <button type="button" onClick={() => turn(i)} className="mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-ml-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-ml-navy/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
                        <Icon name="sync" className="text-lg" />
                        Read both sides
                      </button>
                    </div>

                    <div className={cn("ml-note-face ml-note-back absolute inset-0 flex flex-col gap-3 p-6 pt-8", PAPER[i % PAPER.length])} inert={!back}>
                      <Side kind="pro" text={d.pro} />
                      <Side kind="con" text={d.con} />
                      <button type="button" onClick={() => turn(i)} className="mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-full px-1 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
                        <Icon name="undo" className="text-lg" />
                        Back to the question
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Side({ kind, text }: { kind: "pro" | "con"; text: string }) {
  const pro = kind === "pro";
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-1.5 text-sm font-bold">
        <Icon name={pro ? "thumb_up" : "thumb_down"} className="text-base" />
        {pro ? "For" : "Against"}
      </p>
      <p className="text-[0.92rem] leading-normal text-ml-navy/85">{text}</p>
    </div>
  );
}
