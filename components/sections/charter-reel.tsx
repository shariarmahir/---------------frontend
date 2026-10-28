"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import type { Photo } from "@/data/bangladesh";
import { charterSlides, type CharterSlide } from "@/data/charter";
import { ruralBackdrops, ruralStories } from "@/data/rural-life";
import { cn } from "@/lib/utils";
import { CountUp } from "./charter-kit";
import { CHARTER_LOOKS, CHARTER_TOPIC } from "./charter-looks";
import { PhotoReel, type ReelItem } from "./photo-reel";

/*
 * The charter (Mahir, 2026-10-25): problem, challenge, vision, mission, goal
 * and impact as the home page's photograph reel (photo-reel.tsx). Each card
 * has a credited rural photograph (the credits are listed on /bangladesh),
 * the copy from data/charter.ts, and its evidence: a table of figures, its
 * pillars or its one word.
 */

const story = (id: string) => ruralStories.find((s) => s.id === id)!.photo;

/**
 * Each topic's photograph (Wikimedia Commons, credited with the others on
 * /bangladesh) and how it is framed so its subject stays clear of the panes
 * at the card's foot: `focus` slides the picture sideways, `lift` (a
 * fraction of the card's height) sets it taller than the card and anchors it
 * at the bottom, which crops the empty top and raises the subject above the
 * panes (a point at height y lands at y(1 + lift) - lift). Deep where the
 * subject sits low (the bank, the boat), gentle where heads are high. A
 * closed tile keeps the plain framing (its photograph has no panes to clear).
 */
const PHOTOS: Record<string, { photo: Photo; focus: string; lift: number }> = {
  problem: { photo: story("teesta-erosion"), focus: "40% 50%", lift: 0.5 },
  challenge: { photo: story("rickshaw-rain"), focus: "42% 50%", lift: 0.26 },
  vision: { photo: story("sowing-paddy"), focus: "62% 50%", lift: 0.1 },
  mission: { photo: story("garment-machine"), focus: "74% 50%", lift: 0.14 },
  goal: { photo: ruralBackdrops.floodBoat, focus: "56% 50%", lift: 0.45 },
  impact: { photo: story("paddy-bales"), focus: "72% 50%", lift: 0.2 },
};

/** What each topic's evidence shows, named so it reads as proof for that topic. */
const PROOF_HEADING: Record<string, string> = {
  problem: "The problem in numbers",
  challenge: "The three fronts",
  vision: "In one word",
  mission: "What we are building",
  impact: "Where we stand",
};

/** A figure: its number large and gold, its unit (%, /100) a step smaller beside it; tabular, so a column aligns. */
const FIGURE = "font-grotesk text-[1.625rem] leading-none font-extrabold tracking-tight text-signal-orange tabular-nums";
const UNIT = "ml-0.5 text-[0.8125rem] font-bold text-signal-orange/80";

/**
 * A topic's evidence: its figures as a table (a fixed number column, the
 * label and its note beside it, hairlines between rows; two by two when
 * there are four), its pillars as a list, or its one word. Figures count up
 * as the card opens in view.
 */
function Proof({ slide, active }: { slide: CharterSlide; active: boolean }) {
  if (slide.oneWord) {
    return (
      <>
        <p className="font-grotesk text-[1.75rem] leading-none font-bold tracking-tight">
          {slide.oneWord}
          <span aria-hidden className="ch-caret ml-1 inline-block text-signal-orange">
            ▍
          </span>
        </p>
        <p className="mt-3 text-[0.8125rem] leading-snug text-white/75">No timeline, no finish line: the responsibility simply continues.</p>
      </>
    );
  }
  if (slide.pillars) {
    return (
      <ul className="divide-y divide-white/10">
        {slide.pillars.map((p) => (
          <li key={p.label} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="grid size-9 place-items-center rounded-xl ring-1 ring-signal-orange/40 ring-inset">
              <Icon name={p.icon} className="text-xl! text-signal-orange" />
            </span>
            <span className="font-grotesk text-lg font-bold tracking-tight">{p.label}</span>
          </li>
        ))}
      </ul>
    );
  }
  const stats = slide.stats ?? [];
  if (stats.length > 3) {
    return (
      <dl className="grid grid-cols-2 gap-x-5">
        {stats.map((s, i) => (
          <div key={s.label} className={cn("flex flex-col py-2.5", i > 1 && "border-t border-white/10", i < 2 && "pt-0")}>
            {/* Read as "label: figure, note"; seen as figure over label over note. */}
            <dt className="order-2 mt-1.5 font-grotesk text-[0.8125rem] leading-tight font-bold">{s.label}</dt>
            <dd className={cn(FIGURE, "order-1")}>
              <CountUp stat={s} active={active} suffixClassName={UNIT} />
            </dd>
            <dd className="order-3 mt-0.5 text-xs leading-snug text-white/65 @max-[30rem]/slide:hidden">{s.note}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className="reel-table divide-y divide-white/10">
      {stats.map((s) => (
        <div key={s.label} className="reel-row py-2.5 first:pt-0 last:pb-0">
          {/* Read as "label: figure, note"; seen as the figure in its column, the label and note beside it. */}
          <dt className="reel-label font-grotesk text-[0.8125rem] leading-tight font-bold">{s.label}</dt>
          <dd className={cn(FIGURE, "reel-figure")}>
            <CountUp stat={s} active={active} suffixClassName={UNIT} />
          </dd>
          <dd className="reel-note text-xs leading-snug text-white/65">{s.note}</dd>
        </div>
      ))}
    </dl>
  );
}

function toItem(slide: CharterSlide): ReelItem {
  const topic = CHARTER_TOPIC[slide.id];
  const { photo, focus, lift } = PHOTOS[slide.id];
  const heading = PROOF_HEADING[slide.id];
  return {
    id: slide.id,
    name: topic.name,
    icon: topic.icon,
    lordicon: slide.id,
    look: CHARTER_LOOKS[slide.id],
    art: { kind: "photo", photo, focus, lift },
    title: (
      <>
        {slide.title[0]} <span className={cn("text-signal-orange", slide.strike && "line-through decoration-[3px]")}>{slide.title[1]}</span>
      </>
    ),
    titleText: slide.title.join(" "),
    summary: slide.summary,
    actions: (
      <>
        <Link href={slide.primary.href} className={cn(btn.gold, "min-h-10 px-4 py-2")}>
          {slide.primary.label}
          <span className="sr-only">: {topic.name}</span>
          <Icon name="arrow_forward" className="text-lg" />
        </Link>
        <Link href={slide.secondary.href} className={cn(btn.goldOutline, "min-h-10 px-4 py-2")}>
          {slide.secondary.label}
        </Link>
      </>
    ),
    proof: heading ? { heading, render: (active) => <Proof slide={slide} active={active} /> } : undefined,
  };
}

export function CharterReel() {
  const items = useMemo(() => charterSlides.map(toItem), []);
  return <PhotoReel sectionId="charter" title="From Problem to Impact, One Pixel at a Time" noun="charter card" items={items} />;
}
