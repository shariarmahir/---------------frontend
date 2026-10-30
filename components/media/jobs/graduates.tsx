import Image from "next/image";
import Link from "next/link";
import { Award, CalendarClock, GraduationCap, MapPin, ShieldCheck } from "lucide-react";
import { board, departments, getCourse } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { talentFrom, type Talent } from "@/lib/media/hiring";
import { cn } from "@/lib/utils";
import { toneStyle } from "../academy/catalogue/tones";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num } from "../ui/numerals";
import { InviteButton } from "./invite";

const hud = "font-mono text-[11px] font-bold tracking-wide uppercase";

function GraduateCard({ talent }: { talent: Talent }) {
  const { seat } = talent;
  const course = getCourse(seat.course);
  const tone = Math.max(
    0,
    departments.findIndex((d) => d.id === course?.dept),
  );
  const certified = talent.stage === "certified";
  return (
    <article
      style={toneStyle(tone)}
      className="tone story-reveal relative flex h-full flex-col overflow-hidden rounded-2xl border border-m-ink/10 bg-m-card transition-colors duration-300 hover:border-(--c-app)/60"
    >
      <span aria-hidden className="tone-bar" />
      <div className="relative aspect-16/9 overflow-hidden bg-m-mist">
        {course?.image && <Image src={course.image} alt="" fill sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 92vw" className="object-cover" />}
        <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
        <span className={cn(hud, "absolute top-3 left-3 rounded-full px-2.5 py-1", certified ? "bg-m-yellow text-black" : "bg-black/60 text-white backdrop-blur")}>
          {certified ? talent.label : "ইন্টারভিউ সামনে"}
        </span>
        <Link href={`/media/academy/course/${seat.course}`} className="absolute right-3 bottom-3 left-3 text-white">
          <span className={cn(hud, "block text-white/70")}>{seat.course}</span>
          <span className="line-clamp-1 text-sm font-bold hover:underline">{course?.title}</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-bold text-m-ink">{seat.learner}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-m-ink/60">
          <MapPin className="size-3" aria-hidden /> {seat.district}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-m-ink/85">
          <span className="text-m-ink/55">প্রজেক্ট: </span>
          {seat.project}
        </p>

        {certified ? (
          <div className="mt-4">
            <p className="flex items-baseline justify-between gap-2 text-xs text-m-ink/60">
              <span>প্যানেলের গড় নম্বর</span>
              <span className="text-base font-bold text-m-ink">
                <Num value={talent.average} />
                <span className="text-xs font-normal text-m-ink/50">/১০০</span>
              </span>
            </p>
            <span aria-hidden className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-m-ink/10">
              <span className="block h-full rounded-full bg-(--c-app)" style={{ width: `${talent.average}%` }} />
            </span>
            <Link href={`/media/academy/exam?id=${seat.certificate}#verify`} className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-(--c-app-ink) hover:underline">
              <ShieldCheck className="size-3.5" aria-hidden /> {seat.certificate}
            </Link>
          </div>
        ) : (
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-m-ink/75">
            <CalendarClock className="size-4 text-(--c-app-ink)" aria-hidden /> প্যানেল ইন্টারভিউ <DateText iso={seat.at} time />
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <InviteButton target={{ to: seat.id, toName: seat.learner, kind: "graduate" }} role={course?.title} />
          <Link href={certified ? `/media/academy/exam?id=${seat.certificate}#verify` : `/media/academy/panel/${seat.id}`} className={mediaButton({ variant: "quiet", size: "sm" })}>
            {certified ? <Award aria-hidden /> : <GraduationCap aria-hidden />}
            {certified ? "সনদ যাচাই" : "ইন্টারভিউ দেখুন"}
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * The academy's skill hunters: everyone who passed the panel, best result
 * first, each with a certificate anyone can verify; then those whose open
 * interview is still ahead. Recruiters invite them straight from here.
 */
export function Graduates() {
  const talent = talentFrom(board, DEMO_NOW);
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {talent.map((t) => (
        <li key={t.seat.id}>
          <GraduateCard talent={t} />
        </li>
      ))}
    </ul>
  );
}

/** How many are ready, for the page's numbers. */
export const graduateCount = () => talentFrom(board, DEMO_NOW).filter((t) => t.stage === "certified").length;
