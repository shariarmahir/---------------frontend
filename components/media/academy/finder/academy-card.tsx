"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, GraduationCap, Sparkles, Star, UserRound, UsersRound } from "lucide-react";
import { personOrThrow } from "@/data/media/users";
import { DEPT_KINDS, type Academy } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { DeptIcon } from "../departments/dept-icons";
import { useAcademy } from "../use-academy";
import type { AcademyFacts } from "./facts";

/** From this score (of seven) the match reads "খুব মিলেছে"; above zero, "মিলেছে". */
const STRONG = 5;

/**
 * An academy as a university's card: its picture and mark, solo or team,
 * the name and the line about it, its departments, the teachers' faces,
 * graduates and rating, fees, the next batch — and, after the finder, how
 * well it suits the learner.
 */
export function AcademyCard({ academy: a, facts: f, match, className }: { academy: Academy; facts: AcademyFacts; match?: number; className?: string }) {
  const first = a.departments[0];
  const photo = useAcademy((s) => s.academyMedia[first.id]?.photo);
  const cover = photo ?? f.courses[0]?.image;
  return (
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-m-tile ring-1 ring-m-ink/7 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-m-lift motion-reduce:transition-none", className)}>
      <div className="relative aspect-[16/9] overflow-hidden bg-m-ground">
        {cover && <Image src={cover} alt="" fill sizes="(min-width: 1280px) 24rem, (min-width: 768px) 45vw, 92vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none" />}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_31_107/0.05)_30%,rgb(0_31_107/0.78))]" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-xs font-bold text-m-ink backdrop-blur">
          {a.kind === "team" ? <UsersRound className="size-3.5 text-m-blue" aria-hidden /> : <UserRound className="size-3.5 text-m-blue" aria-hidden />}
          {DEPT_KINDS[a.kind]}
        </span>
        {match !== undefined && match > 0 && (
          <span className={cn("absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-m-tile", match >= STRONG ? "bg-m-yellow text-m-ink" : "bg-white/92 text-m-blue")}>
            <Sparkles className="size-3.5" aria-hidden /> {match >= STRONG ? "খুব মিলেছে" : "মিলেছে"}
          </span>
        )}
        <span className="absolute -bottom-6 left-4 grid size-14 place-items-center rounded-2xl bg-white shadow-m-lift ring-4 ring-white">
          <DeptIcon dept={first.id} school={first.school} className="size-9" />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-9 pb-4 sm:px-5">
        <h3 className="text-lg leading-snug font-bold text-m-ink">
          <Link href={`/media/academy/a/${a.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {a.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-m-ink/65">{a.about}</p>

        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="বিভাগ">
          {a.departments.map((d) => (
            <li key={d.id} className="rounded-full bg-m-blue-soft px-2.5 py-1 text-xs font-semibold text-m-blue">
              {d.name}
            </li>
          ))}
          <li className="rounded-full bg-m-ground px-2.5 py-1 text-xs font-semibold text-m-ink/65">
            <Num value={f.courses.length} />টি কোর্স
          </li>
        </ul>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex -space-x-2" aria-hidden>
            {a.teachers.slice(0, 4).map((h) => (
              <PersonAvatar key={h} person={personOrThrow(h)} size="sm" className="ring-2 ring-white" />
            ))}
          </span>
          <span className="truncate text-xs text-m-ink/60">{a.teachers.map((h) => personOrThrow(h).nameBn.split(" ")[0]).join(", ")}</span>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-m-ink/6 pt-4 text-center">
          <div>
            <dt className="sr-only">গ্র্যাজুয়েট</dt>
            <dd className="flex items-center justify-center gap-1 text-[15px] font-bold text-m-ink">
              <GraduationCap className="size-4 text-m-blue" aria-hidden />
              <Num value={f.graduates} />
            </dd>
            <dd className="text-[11px] text-m-ink/55">গ্র্যাজুয়েট</dd>
          </div>
          <div>
            <dt className="sr-only">রেটিং</dt>
            <dd className="flex items-center justify-center gap-1 text-[15px] font-bold text-m-ink">
              <Star className="size-4 fill-m-yellow text-m-yellow" aria-hidden />
              {f.rating.count ? <Num value={f.rating.avg} /> : "নতুন"}
            </dd>
            <dd className="text-[11px] text-m-ink/55">রেটিং</dd>
          </div>
          <div>
            <dt className="sr-only">ফি</dt>
            <dd className="text-[15px] font-bold text-m-ink">{f.fees.max === 0 ? "বিনা ফি" : f.fees.min === 0 ? <>০–<Taka amount={f.fees.max} /></> : <Taka amount={f.fees.min} />}</dd>
            <dd className="text-[11px] text-m-ink/55">{f.fees.min === f.fees.max || f.fees.min === 0 ? "ফি" : "থেকে শুরু"}</dd>
          </div>
        </dl>

        <p className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-m-ground px-3 py-2.5 text-xs">
          <span className="flex items-center gap-1.5 text-m-ink/70">
            <CalendarDays className="size-4 text-m-blue" aria-hidden />
            {f.next ? (
              <>
                পরের ব্যাচ <strong className="text-m-ink">
                  <DateText iso={f.next.starts} />
                </strong>
              </>
            ) : (
              "নতুন ব্যাচ শিগগির"
            )}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-m-blue">
            চিনুন <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          </span>
        </p>
      </div>
    </article>
  );
}
