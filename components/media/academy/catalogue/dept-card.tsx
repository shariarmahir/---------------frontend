"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Landmark, Sparkles } from "lucide-react";
import { personOrThrow } from "@/data/media/users";
import { DEPT_KINDS, SCHOOLS } from "@/lib/media/academy";
import { fitScore } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { DeptIcon } from "../departments/dept-icons";
import { useAcademy } from "../use-academy";
import { twoDigits } from "./band";
import type { DeptEntry } from "./entries";
import { toneStyle } from "./tones";

/** From this score (of seven) a department reads "খুব মিলেছে" to the finder's answers. */
const STRONG = 5;
/** The widest row holds four cards; their pictures load straight away. */
const FIRST_ROW = 4;

const chip = "flex w-fit items-center gap-1 border border-(--c-line) bg-(--c-bg-sunken) px-1.5 py-px text-[11px] leading-snug font-medium";

/**
 * A department in the line-up, in its own colour. The number and its field
 * across the top, its picture, its moving icon breaking out of the
 * picture's edge, the name with "বিভাগ" in its colour and the academy that
 * runs it, what it teaches, the facts as small tags, and who teaches. The
 * whole card opens the department; the academy's name opens the academy.
 * `tone` keeps a department's colour when it is shown away from the full
 * line-up.
 */
export function DeptCard({ entry, n, tone = n - 1 }: { entry: DeptEntry; n: number; tone?: number }) {
  const { dept: d } = entry;
  const hydrated = useHydrated();
  const photo = useAcademy((s) => s.academyMedia[d.id]?.photo);
  const finder = useAcademy((s) => s.finder);
  const match = hydrated && finder ? fitScore(d.fit, finder) : 0;
  const cover = photo ? { src: photo, alt: `${d.academy.name}-এর ছবি` } : entry.cover;
  const title = `d-${d.id}-title`;

  return (
    <article id={`d-${d.id}`} data-reveal aria-labelledby={title} style={toneStyle(tone)} className="tone group relative flex h-full flex-col bg-(--c-bg)">
      {/* The department's colour draws across the top on hover. */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-(--c-app) transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none" />

      <div className="flex items-center justify-between gap-4 border-b border-(--c-line) px-6 py-3">
        <span className="hud bg-(--c-app) px-2 py-0.5 font-bold text-black">{twoDigits(n)}</span>
        <p className="hud truncate text-(--c-faint)">{SCHOOLS[d.school]}</p>
      </div>

      <div className="relative aspect-16/10 overflow-hidden border-b border-(--c-line) bg-(--c-bg-sunken)">
        {cover && (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            loading={n <= FIRST_ROW ? "eager" : undefined}
            sizes="(min-width: 1280px) 20rem, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        )}
        {match > 0 && (
          <span className={cn("hud absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 font-bold", match >= STRONG ? "bg-(--c-signal) text-black" : "bg-(--c-bg) text-(--c-accent-ink)")}>
            <Sparkles className="size-3.5" aria-hidden />
            {match >= STRONG ? "খুব মিলেছে" : "মিলেছে"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 md:px-8 md:pb-8">
        <span className="relative -mt-9 grid size-18 place-items-center rounded-[1.15rem] bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none">
          <DeptIcon dept={d.id} school={d.school} className="size-11" />
        </span>

        <h3 id={title} className="display mt-4 text-[1.75rem] leading-[1.12] text-(--c-ink-strong)">
          <Link href={`/media/academy/dept/${d.id}`} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-(--c-app)">
            {d.name} <span className="text-(--c-app-ink)">বিভাগ</span>
          </Link>
        </h3>
        <Link
          href={`/media/academy/a/${d.academy.id}`}
          className="relative z-10 mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-(--c-muted) decoration-(--c-app) decoration-2 underline-offset-4 transition-colors hover:text-(--c-ink-strong) hover:underline"
        >
          <Landmark className="size-4 shrink-0 text-(--c-app-ink)" aria-hidden />
          {d.academy.name}
        </Link>
        <p className="mt-3 leading-relaxed text-(--c-muted)">{d.blurb}</p>

        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="এক নজরে">
          <li className={cn(chip, "text-(--c-app-ink)")}>{!entry.seat ? "নতুন ব্যাচ শিগগির" : entry.seat.running ? "ব্যাচ চলছে · আসন খালি" : <>পরের ব্যাচ <DateText iso={entry.seat.starts} /></>}</li>
          <li className={cn(chip, "text-(--c-app-ink)")}>{DEPT_KINDS[d.kind]}</li>
          <li className={cn(chip, "text-(--c-muted)")}>
            <Num value={entry.courses} />টি কোর্স
          </li>
          <li className={cn(chip, "text-(--c-muted)")}>{entry.fees.max === 0 ? "বিনা ফি" : entry.fees.min === 0 ? "বিনা ফি থেকে শুরু" : <><Taka amount={entry.fees.min} /> থেকে</>}</li>
          {entry.handsOn && <li className={cn(chip, "text-(--c-muted)")}>হাতে-কলমে ক্লাস</li>}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="hud flex items-center gap-1.5 text-(--c-muted) transition-colors group-hover:text-(--c-ink-strong)">
            {d.name} দেখুন
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden />
          </span>
          <span className="flex">
            <span className="sr-only">শিক্ষক: {d.teachers.map((h) => personOrThrow(h).nameBn).join(", ")}</span>
            <span aria-hidden className="flex -space-x-2">
              {d.teachers.slice(0, 4).map((h) => (
                <PersonAvatar key={h} person={personOrThrow(h)} size="sm" className="ring-2 ring-(--c-bg)" />
              ))}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
