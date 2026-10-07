"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Sparkles, Star } from "lucide-react";
import { DEMO_NOW } from "@/data/media/clock";
import { coursesOf, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { LEVELS, MODES, weekOf, type ClassVideo, type Course, type Department, type Level } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Compact, Num, Taka, useFormat } from "../../ui/numerals";
import { ModeTag, standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { useVideos } from "../videos/use-videos";
import { watchHref } from "../videos/video-card";
import { DeptIcon } from "../departments/dept-icons";

const THIS_WEEK = weekOf(DEMO_NOW.toISOString());
const SHOW = 2;

/** The levels a department teaches at, in order. */
export const levelsOf = (dept: Department) => (Object.keys(LEVELS) as Level[]).filter((l) => coursesOf(dept.id).some((c) => c.level === l));

/**
 * "প্রস্তাবিত কোর্স": tabs by level over wide course cards — the first marked
 * as the top pick — two at a time with "আরও দেখুন".
 */
export function Credentials({ dept, level, setLevel }: { dept: Department; level: Level; setLevel: (l: Level) => void }) {
  const reduce = useReducedMotion();
  const [more, setMore] = useState(false);
  const levels = levelsOf(dept);
  const list = coursesOf(dept.id)
    .filter((c) => c.level === level)
    .sort((a, b) => (teacherRecord(b.teacher)?.rating.avg ?? 0) - (teacherRecord(a.teacher)?.rating.avg ?? 0) || b.enrolled - a.enrolled);
  const shown = more ? list : list.slice(0, SHOW);

  return (
    <section id="courses" aria-labelledby="cred-title" className="scroll-mt-20">
      <h2 id="cred-title" className="text-2xl font-bold text-white sm:text-[1.9rem]">
        প্রস্তাবিত কোর্স
      </h2>
      <div role="tablist" aria-label="স্তর" className="mt-3 flex flex-wrap gap-2">
        {levels.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={l === level}
            onClick={() => (setLevel(l), setMore(false))}
            className={cn("relative h-9 rounded-full px-4 text-sm font-semibold transition-colors", l === level ? "text-text-primary" : "text-white ring-1 ring-white/30 hover:bg-white/10")}
          >
            {l === level && <motion.span layoutId="cred-level" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className="relative">{LEVELS[l]}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.ul key={level} className="mt-5 space-y-5" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {shown.map((c, i) => (
            <li key={c.id}>
              <CredentialCard course={c} dept={dept} top={i === 0} />
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
      {list.length > SHOW && (
        <button type="button" onClick={() => setMore((m) => !m)} className={mediaButton({ variant: "outline", className: "mt-5" })}>
          {more ? "কম দেখান" : <>আরও <Num value={list.length - SHOW} />টি দেখুন</>}
        </button>
      )}
    </section>
  );
}

function CredentialCard({ course, dept, top }: { course: Course; dept: Department; top: boolean }) {
  const hydrated = useHydrated();
  const admission = useAcademy((a) => a.admissions[dept.id]);
  const enrolled = useAcademy((a) => course.id in a.enrolled);
  const videos = useVideos();
  const [why, setWhy] = useState(false);
  const { num } = useFormat();
  const record = teacherRecord(course.teacher);
  const teacher = personOrThrow(course.teacher);
  const left = course.seats - course.enrolled;
  const fresh = videos.some((v) => v.course === course.id && v.access === "free" && weekOf(v.at) === THIS_WEEK);
  const lessons = course.lessons.map((l) => l.title);

  // Why this one: only things that are true for this viewer and this course.
  const reasons = [
    hydrated && admission && "আপনি এই বিভাগে যোগ দিয়েছেন",
    hydrated && admission?.level === course.level && `আপনার ভর্তি পরীক্ষার স্তর “${LEVELS[course.level]}” — কোর্সটাও সেই স্তরের`,
    course.fee === 0 && "কোনো ফি নেই",
    fresh && "এ সপ্তাহের বিনামূল্যের ক্লাস এসেছে — ভর্তির আগে দেখে নিন",
    record && standingOf(record).tier === "lead" && `${teacher.nameBn} প্রধান শিক্ষক`,
    record && `${teacher.nameBn}-এর ক্লাসে গড় রেটিং ${num(record.rating.avg.toFixed(1))}`,
  ].filter(Boolean) as string[];

  return (
    <article className="relative grid gap-8 rounded-3xl bg-text-primary p-6 ring-1 ring-white/15 sm:p-8 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
      {top && <span className="absolute top-3 left-3 rounded-full bg-bd-green px-2.5 py-0.5 text-xs font-bold text-white">শীর্ষ প্রস্তাব</span>}
      <div className="min-w-0 pt-3">
        <span className="grid size-10 place-items-center rounded-lg bg-white ring-1 ring-white/20">
          <DeptIcon dept={dept.id} school={dept.school} className="size-7" />
        </span>
        <h3 className="mt-3 text-2xl leading-tight font-bold text-balance text-white sm:text-[1.85rem]">
          <Link href={`/media/academy/course/${course.id}`} className="underline-offset-4 hover:underline">
            {course.title}
          </Link>
        </h3>
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/75">
          <span className="font-bold text-white">যা শিখবেন:</span> {lessons.join(", ")}
        </p>
        {record && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/70">
            <Star className="size-4 fill-signal-orange text-signal-orange" aria-hidden />
            <span className="font-bold text-white">
              <Num value={record.rating.avg} decimals={1} />
            </span>
            (<Compact n={record.rating.count} />টি রেটিং)
          </p>
        )}
        <p className="mt-1 text-sm text-white/70">
          {LEVELS[course.level]} · <Num value={course.weeks} /> সপ্তাহ · {course.fee === 0 ? "বিনা ফি" : <Taka amount={course.fee} />} · {left > 0 ? <><Num value={left} />টি আসন বাকি</> : "আসন পূর্ণ"}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href={`/media/academy/course/${course.id}`} className={mediaButton()}>
            {hydrated && enrolled ? "কোর্সে যান" : "ভর্তি হন"}
          </Link>
          <Link href={`/media/academy/course/${course.id}`} className="text-sm font-semibold text-signal-orange hover:underline">
            বিস্তারিত
          </Link>
          <button type="button" aria-expanded={why} onClick={() => setWhy((w) => !w)} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-signal-orange hover:underline">
            <Sparkles className="size-4 transition-transform group-hover:rotate-12 motion-reduce:transition-none" aria-hidden /> কেন এটা আপনার জন্য?
          </button>
        </div>
        <AnimatePresence initial={false}>
          {why && (
            <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="mt-4 space-y-1.5 overflow-hidden rounded-xl bg-black/50 p-4 text-sm text-white/85">
              {reasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-signal-orange" aria-hidden /> {r}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <WeekTrack course={course} videos={videos} />
    </article>
  );
}

/**
 * The course week by week, like a credential's course sequence: a picture
 * per week (the class video where there is one), joined by a line, with
 * arrows to move along.
 */
function WeekTrack({ course, videos }: { course: Course; videos: ClassVideo[] }) {
  const track = useRef<HTMLOListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const measure = useCallback(() => {
    const el = track.current;
    if (el) setEdge({ start: el.scrollLeft < 6, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 6 });
  }, []);
  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  function go(dir: 1 | -1) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.current?.scrollBy({ left: dir * (track.current.clientWidth * 0.75), behavior: reduce ? "auto" : "smooth" });
  }

  const arrow = "grid size-9 place-items-center rounded-full text-white transition-colors hover:bg-white/10 disabled:text-white/25 disabled:hover:bg-transparent";
  return (
    <div className="min-w-0 self-center">
      <ol ref={track} onScroll={measure} aria-label="সপ্তাহ ধরে" className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scrollbar-none">
        {course.lessons.map((l, i) => {
          const v = videos.find((x) => x.course === course.id && x.week === l.week && !x.short);
          const thumb = (
            <span className="relative block aspect-[3/2] overflow-hidden rounded-xl bg-bd-green-dark ring-1 ring-white/15">
              {v ? (
                <>
                  {/* One course picture, framed differently each week, so the weeks read as separate classes. */}
                  <Image src={course.image} alt="" fill sizes="176px" style={{ objectPosition: `${(l.week * 37) % 100}% ${(l.week * 23) % 100}%` }} className="scale-[1.35] object-cover transition-transform duration-500 group-hover:scale-[1.45] motion-reduce:transition-none" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-10 place-items-center rounded-full bg-black/70 text-white transition-transform group-hover:scale-110">
                      <Play className="size-4.5 fill-current" aria-hidden />
                    </span>
                  </span>
                  {v.access === "free" && <span className="absolute top-2 left-2 rounded-md bg-bd-green px-1.5 py-0.5 text-[10px] font-bold text-white">বিনামূল্যে</span>}
                </>
              ) : (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="text-center">
                    <span className="block text-3xl font-extrabold text-white/90">
                      <Num value={l.week} />
                    </span>
                    <ModeTag mode={l.mode} className="mt-1 justify-center" />
                  </span>
                </span>
              )}
            </span>
          );
          return (
            <li key={l.week} className="relative w-40 shrink-0 snap-start sm:w-44">
              {i < course.lessons.length - 1 && <span className="absolute top-[3.33rem] -right-4 h-0.5 w-4 bg-white/25 sm:top-[3.67rem]" aria-hidden />}
              {v ? (
                <Link href={watchHref(v)} className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange" aria-label={`সপ্তাহ ${l.week}: ${l.title} — ভিডিও দেখুন`}>
                  {thumb}
                </Link>
              ) : (
                thumb
              )}
              <p className="mt-3 line-clamp-2 text-sm leading-snug font-semibold text-white">{l.title}</p>
              <p className="mt-1.5 text-xs text-white/60">
                সপ্তাহ <Num value={l.week} /> / <Num value={course.lessons.length} /> · {MODES[l.mode]}
              </p>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex justify-end gap-1">
        <button type="button" onClick={() => go(-1)} disabled={edge.start} className={arrow}>
          <ChevronLeft className="size-5" aria-hidden />
          <span className="sr-only">আগের সপ্তাহ</span>
        </button>
        <button type="button" onClick={() => go(1)} disabled={edge.end} className={arrow}>
          <ChevronRight className="size-5" aria-hidden />
          <span className="sr-only">পরের সপ্তাহ</span>
        </button>
      </div>
    </div>
  );
}
