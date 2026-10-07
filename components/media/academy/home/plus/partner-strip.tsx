"use client";

import Link from "next/link";
import { departments } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { PersonAvatar } from "../../../ui/person";
import { Num } from "../../../ui/numerals";
import { ArrowPair, useScroller } from "./scroller";

/** One chip per academy (an academy can run more than one department; its first one is linked). */
const ACADEMIES = departments.filter((d, i) => departments.findIndex((x) => x.academy.name === d.academy.name) === i);

/** "Learn from the academies": a row of rounded chips, each the lead teacher's face and the academy's name. */
export function PartnerStrip() {
  const { ref, edge, page } = useScroller<HTMLUListElement>();
  return (
    <section aria-labelledby="partners" className="mx-auto max-w-6xl px-4 pt-9 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <h2 id="partners" className="text-lg font-bold text-m-ink sm:text-xl">
          দেশের <Num value={ACADEMIES.length} />টি একাডেমির পেশাদারদের কাছে শিখুন
        </h2>
        <ArrowPair edge={edge} page={page} label="একাডেমির সারি" className="hidden sm:flex" />
      </div>
      <ul ref={ref} className="-mx-1 mt-4 flex snap-x gap-2.5 overflow-x-auto px-1 py-1 scrollbar-none">
        {ACADEMIES.map((d) => (
          <li key={d.academy.name} className="shrink-0 snap-start">
            <Link
              href={`/media/academy/dept/${d.id}`}
              className="flex h-11 items-center gap-2 rounded-full bg-white pr-4 pl-1.5 text-sm font-semibold text-m-ink shadow-[0_1px_2px_rgb(0_31_107/0.06)] ring-1 ring-m-ink/12 transition-[box-shadow,color] duration-200 hover:text-m-blue hover:ring-m-blue/45"
            >
              <PersonAvatar person={personOrThrow(d.teachers[0])} size="sm" />
              {d.academy.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
