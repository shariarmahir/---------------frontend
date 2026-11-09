"use client";

import Image from "next/image";
import { useT } from "../../ui/language";
import Link from "next/link";
import { ArrowUpRight, Building2, GraduationCap, Sparkles, Star } from "lucide-react";
import { personOrThrow } from "@/data/media/users";
import { DEPT_KINDS } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { DeptIcon } from "../departments/dept-icons";
import { academyFit } from "../finder/facts";
import { useAcademy } from "../use-academy";
import { twoDigits } from "./band";
import { splitName, type AcademyEntry } from "./entries";
import { toneStyle } from "./tones";
import { Tx } from "../../ui/language";

/** From this score (of seven) an academy reads "খুব মিলেছে" to the three questions' answers. */
const STRONG = 5;
const FIRST_ROW = 4;

const chip = "flex w-fit items-center gap-1 border border-(--c-line) bg-(--c-bg-sunken) px-1.5 py-px text-[11px] leading-snug font-medium";

/**
 * An academy in the line-up, dressed like a department's card: number and
 * kind across the top, its picture, its first department's icon breaking
 * out of the picture's edge, the name with its last word in its colour,
 * what it is about, its departments (each a link), the facts as small tags
 * and its teachers. The whole card opens the academy.
 */
export function AcademyCard({ entry, n }: { entry: AcademyEntry; n: number }) {
  const { academy: a } = entry;
  const hydrated = useHydrated();
  const t = useT();
  const first = a.departments[0];
  const photo = useAcademy((s) => s.academyMedia[first.id]?.photo);
  const finder = useAcademy((s) => s.finder);
  const match = hydrated && finder ? academyFit(a, finder) : 0;
  const cover = photo ? { src: photo, alt: `${a.name}-এর ছবি` } : entry.cover;
  const [head, tail] = splitName(t(a.name));
  const title = `a-${a.id}-title`;

  return (
    <article id={`a-${a.id}`} data-reveal aria-labelledby={title} style={toneStyle(entry.tone)} className="tone group relative flex h-full scroll-mt-32 flex-col bg-(--c-bg)">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-(--c-app) transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
      />

      <div className="flex items-center justify-between gap-4 border-b border-(--c-line) px-6 py-3">
        <span className="hud bg-(--c-app) px-2 py-0.5 font-bold text-black">{twoDigits(n)}</span>
        <p className="hud truncate text-(--c-faint)">{DEPT_KINDS[a.kind]}</p>
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
          <span
            className={cn(
              "hud absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 font-bold",
              match >= STRONG ? "bg-(--c-signal) text-black" : "bg-(--c-bg) text-(--c-accent-ink)",
            )}
          >
            <Sparkles className="size-3.5" aria-hidden />
            <Tx k={match >= STRONG ? "খুব মিলেছে" : "মিলেছে"} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 md:px-8 md:pb-8">
        <span className="relative -mt-9 grid size-18 place-items-center rounded-[1.15rem] bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none">
          <DeptIcon dept={first.id} school={first.school} className="size-11" />
        </span>

        <h3 id={title} className="display mt-4 text-[1.6rem] leading-[1.15] text-(--c-ink-strong)">
          <Link href={`/media/academy/a/${a.id}`} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-(--c-app)">
            {head}
            <span className="text-(--c-app-ink)">{tail}</span>
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 leading-relaxed text-(--c-muted)">{t(a.about)}</p>

        <ul className="relative z-10 mt-4 grid gap-1" aria-label="বিভাগ">
          {a.departments.map((d) => (
            <li key={d.id}>
              <Link
                href={`/media/academy/dept/${d.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--c-ink) decoration-(--c-app) decoration-2 underline-offset-4 transition-colors hover:text-(--c-ink-strong) hover:underline"
              >
                <Building2 className="size-3.5 shrink-0 text-(--c-app-ink)" aria-hidden />
                <Tx k="{0} বিভাগ" v={[<Tx key="n" k={d.name} />]} />
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="এক নজরে">
          <li className={cn(chip, "text-(--c-app-ink)")}>
            {!entry.seat ? (
              <Tx k="নতুন ব্যাচ শিগগির" />
            ) : entry.seat.running ? (
              <Tx k="ব্যাচ চলছে · আসন খালি" />
            ) : (
              <Tx k="পরের ব্যাচ {0}" v={[<DateText key="d" iso={entry.seat.starts} />]} />
            )}
          </li>
          <li className={cn(chip, "text-(--c-muted)")}>
            <Tx k="{0}টি কোর্স" v={[<Num key="n" value={entry.courses} />]} />
          </li>
          <li className={cn(chip, "text-(--c-muted)")}>
            {entry.fees.max === 0 ? <Tx k="বিনা ফি" /> : entry.fees.min === 0 ? <Tx k="বিনা ফি থেকে শুরু" /> : <Tx k="{0} থেকে" v={[<Taka key="t" amount={entry.fees.min} />]} />}
          </li>
          {entry.graduates > 0 && (
            <li className={cn(chip, "text-(--c-muted)")}>
              <GraduationCap className="size-3" aria-hidden />
              <Tx k="{0} গ্র্যাজুয়েট" v={[<Num key="n" value={entry.graduates} />]} />
            </li>
          )}
          {entry.rating.count > 0 && (
            <li className={cn(chip, "text-(--c-muted)")}>
              <Star className="size-3" aria-hidden />
              <Num value={entry.rating.avg} />
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="hud flex items-center gap-1.5 text-(--c-muted) transition-colors group-hover:text-(--c-ink-strong)">
            <Tx k="একাডেমি দেখুন" />
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden />
          </span>
          <span className="flex">
            <span className="sr-only">শিক্ষক: {a.teachers.map((h) => personOrThrow(h).nameBn).join(", ")}</span>
            <span aria-hidden className="flex -space-x-2">
              {a.teachers.slice(0, 4).map((h) => (
                <PersonAvatar key={h} person={personOrThrow(h)} size="sm" className="ring-2 ring-(--c-bg)" />
              ))}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
