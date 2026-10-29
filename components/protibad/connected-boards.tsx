"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { openRecorder } from "@/components/record/open-recorder";
import { CardIcon } from "@/components/ui/card-icon";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

interface Board {
  title: string;
  line: string;
  lordicon: string;
  fallback: string;
  field: string;
  href?: string;
  action?: "record";
}

/** Everywhere প্রতিবাদ reaches, each in one of the three card fields (navy, ink, cobalt). */
const BOARDS: Board[] = [
  {
    title: "Crime & complaint dashboard",
    line: "A live command board for police stations and the consumer rights directorate (demo).",
    lordicon: "server",
    fallback: "space_dashboard",
    field: "bg-bdnavy-900",
    href: "/protibad/command",
  },
  {
    title: "National TV wall",
    line: "The country's news, a risk map and live TV, on one screen.",
    lordicon: "antenna",
    fallback: "connected_tv",
    field: "bg-text-primary",
    href: "/tv-wall",
  },
  {
    title: "Crime and justice news",
    line: "Chetona's paper, with every story linked to the outlet that reported it.",
    lordicon: "media",
    fallback: "newspaper",
    field: "bg-cobalt",
    href: "/media/news/news/crime-justice",
  },
  {
    title: "Citizen reports on Chetona",
    line: "Local problems and alerts, posted by members themselves.",
    lordicon: "problem",
    fallback: "campaign",
    field: "bg-bdnavy-900",
    href: "/media/civic",
  },
  {
    title: "Your rights and justice",
    line: "Five steps to take when a right is denied, and the laws that help.",
    lordicon: "nagorik",
    fallback: "balance",
    field: "bg-text-primary",
    href: "/nagorik#justice",
  },
  {
    title: "Evidence recorder",
    line: "Record photo, video or audio. Files stay on your device.",
    lordicon: "record",
    fallback: "radio_button_checked",
    field: "bg-cobalt",
    action: "record",
  },
];

const CARD =
  "group relative flex h-full min-h-56 flex-col gap-4 rounded-3xl p-6 text-left ring-1 ring-white/12 ring-inset [-webkit-tap-highlight-color:transparent] transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-28px_rgb(228_176_39/0.7)] hover:ring-signal-orange/70 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/**
 * "Everything it connects to": the places প্রতিবাদ reaches (Mahir, 2026-10-29):
 * the crime and complaint dashboard, the National TV Wall, চেতনা's paper
 * and its citizen reports, the rights page, and the recorder, as the home
 * page's icon cards: an animated Lordicon, a gold title, one line, and an
 * arrow that leans out when the card is pointed at.
 */
export function ConnectedBoards() {
  return (
    <section id="connected" aria-labelledby="connected-title" className="section-band w-full scroll-mt-40 bg-black">
      <div className="mx-auto max-w-384 px-gutter-x">
        <SectionHeading
          tone="dark"
          title={<span id="connected-title">Everything it connects to</span>}
          lead="The boards, news and tools where reports, complaints and evidence go next."
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {BOARDS.map((b) => {
            const face: ReactNode = (
              <>
                <CardIcon name={b.lordicon} fallback={b.fallback} size={56} />
                <span className="font-grotesk text-xl leading-snug font-bold text-signal-orange">{b.title}</span>
                <span className="font-sans text-base leading-relaxed text-white/80">{b.line}</span>
                <Icon
                  name="arrow_outward"
                  className="mt-auto self-end text-2xl text-signal-orange transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none"
                />
              </>
            );
            return (
              <li key={b.title} className="story-reveal">
                {b.action ? (
                  <button type="button" onClick={openRecorder} className={cn(CARD, b.field, "w-full")}>
                    {face}
                  </button>
                ) : (
                  <Link href={b.href!} className={cn(CARD, b.field)}>
                    {face}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
