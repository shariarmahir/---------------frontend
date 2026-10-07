"use client";

import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowPair, useScroller } from "./scroller";

export type Voice = { name: string; text: string; from: string; certificate?: string };

const RINGS = ["bg-m-yellow text-m-ink", "bg-m-blue text-m-on", "bg-m-blue-night text-m-on"];

/** Learners in their own words: three cards at a time, a round face, name and where they learnt, then the quote. */
export function Voices({ voices, title = "একাডেমি কি সত্যিই কাজে লাগে? শুনুন যাঁরা শিখেছেন", className = "mx-auto max-w-6xl px-4 pt-20 sm:px-6" }: { voices: Voice[]; title?: string; className?: string }) {
  const { ref, edge, page } = useScroller<HTMLUListElement>();
  return (
    <section aria-labelledby="voices" className={className}>
      <div className="flex items-end justify-between gap-4">
        <h2 id="voices" className="text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold text-balance text-m-ink">
          {title}
        </h2>
        <ArrowPair edge={edge} page={page} label="শিক্ষার্থীদের কথা" className="hidden shrink-0 sm:flex" />
      </div>
      <ul ref={ref} className="-mx-1 mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pt-1 pb-4 scrollbar-none">
        {voices.map((v, i) => (
          <li key={v.name} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.625rem)] lg:w-[calc((100%-2.5rem)/3)]">
            <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-m-tile ring-1 ring-m-ink/8">
              <figcaption className="flex items-center gap-4">
                <span className={cn("grid size-16 shrink-0 place-items-center rounded-full text-2xl font-bold shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]", RINGS[i % RINGS.length])} aria-hidden>
                  {v.name.slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-bold text-m-ink">
                    {v.name}
                    {v.certificate && <BadgeCheck className="size-4.5 shrink-0 text-m-green" aria-label="সনদপ্রাপ্ত" />}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-m-ink/65">{v.from}</span>
                </span>
              </figcaption>
              <blockquote className="mt-5 text-[15px] leading-relaxed text-m-ink/85">“{v.text}”</blockquote>
              {v.certificate && <p className="mt-auto pt-5 font-mono text-xs font-semibold text-m-blue">{v.certificate}</p>}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
