"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Play, Sparkles, Star } from "lucide-react";
import { teacherRecord } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { COURSE_DAYS, LEVELS, MODES, weekOf, type ClassVideo, type Course, type Department, watchHref } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { Compact, Num, Taka, useFormat } from "../../ui/numerals";
import { actionClass } from "../catalogue/asset-card";
import { twoDigits } from "../catalogue/band";
import { EnrolButton } from "../catalogue/enrol-button";
import { toneStyle } from "../catalogue/tones";
import { standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { useVideos } from "../videos/use-videos";

const THIS_WEEK = weekOf(DEMO_NOW.toISOString());

/** Every course of the department as a ruled row: what it is on the left, its weeks running across on the right. */
export function WeekTracks({ dept, courses, tone }: { dept: Department; courses: Course[]; tone: number }) {
  const videos = useVideos();
  return (
    <ol style={toneStyle(tone)} className="tone grid gap-px border-t border-(--c-line) bg-(--c-line)">
      {courses.map((c, i) => (
        <li key={c.id} className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          <About course={c} dept={dept} n={i + 1} videos={videos} />
          <Weeks course={c} videos={videos} />
        </li>
      ))}
    </ol>
  );
}

function About({ course, dept, n, videos }: { course: Course; dept: Department; n: number; videos: ClassVideo[] }) {
  const hydrated = useHydrated();
  const admission = useAcademy((a) => a.admissions[dept.id]);
  const [why, setWhy] = useState(false);
  const { num } = useFormat();
  const record = teacherRecord(course.teacher);
  const teacher = personOrThrow(course.teacher);
  const left = course.seats - course.enrolled;
  const fresh = videos.some((v) => v.course === course.id && v.access === "free" && weekOf(v.at) === THIS_WEEK);

  // Why this one: only things that are true for this viewer and this course.
  const reasons = [
    hydrated && admission && "আপনি এই বিভাগে যোগ দিয়েছেন",
    hydrated && admission?.level === course.level && `আপনার স্তর “${LEVELS[course.level]}” — কোর্সটাও সেই স্তরের`,
    course.fee === 0 && "কোনো ফি নেই",
    fresh && "এ সপ্তাহের বিনামূল্যের ক্লাস এসেছে — ভর্তির আগে দেখে নিন",
    record && standingOf(record).tier === "lead" && `${teacher.nameBn} প্রধান শিক্ষক`,
    record && `${teacher.nameBn}-এর ক্লাসে গড় রেটিং ${num(record.rating.avg.toFixed(1))}`,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col bg-(--c-bg) p-6 md:p-8">
      <p className="hud flex items-center justify-between gap-4 text-(--c-faint)">
        <span>{twoDigits(n)}</span>
        <span className="font-mono tracking-[0.08em]">{course.id}</span>
      </p>
      <h3 className="display mt-4 text-2xl leading-[1.15] text-(--c-ink-strong)">
        <Link href={`/media/academy/course/${course.id}`} className="decoration-(--c-app) decoration-2 underline-offset-4 hover:underline">
          {course.title}
        </Link>
      </h3>
      {record && record.rating.count > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-(--c-muted)">
          <Star className="size-4 fill-(--c-signal) text-(--c-signal)" aria-hidden />
          <span className="font-bold text-(--c-ink-strong)">
            <Num value={record.rating.avg} decimals={1} />
          </span>
          (<Compact n={record.rating.count} />
          টি রেটিং) · {teacher.nameBn}
        </p>
      )}
      <p className="hud mt-2 text-(--c-app-ink)">
        {LEVELS[course.level]} · <Num value={COURSE_DAYS} /> দিন · {course.fee === 0 ? "বিনা ফি" : <Taka amount={course.fee} />} ·{" "}
        {left > 0 ? (
          <>
            <Num value={left} />
            টি আসন বাকি
          </>
        ) : (
          "আসন পূর্ণ"
        )}
      </p>

      <div className="mt-auto flex flex-col gap-2 pt-6">
        <EnrolButton course={course} className="w-full" />
        <Link href={`/media/academy/course/${course.id}`} className={actionClass}>
          <ArrowUpRight className="size-4" aria-hidden />
          কোর্স দেখুন
        </Link>
        <button type="button" aria-expanded={why} onClick={() => setWhy((w) => !w)} className="hud mt-2 flex w-fit items-center gap-1.5 font-bold text-(--c-accent-ink) underline-offset-4 hover:underline">
          <Sparkles className="size-3.5" aria-hidden />
          কেন এটা আপনার জন্য?
        </button>
        {why && (
          <ul className="mt-1 border-t border-(--c-line)">
            {reasons.map((r) => (
              <li key={r} className="flex gap-2 border-b border-(--c-line) py-2 text-sm text-(--c-ink)">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-(--c-signal)" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** The weeks as frames in a row: the class video where there is one (one picture, framed differently each week), otherwise the week's number and how it is taught. */
function Weeks({ course, videos }: { course: Course; videos: ClassVideo[] }) {
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

  const arrow = "grid size-9 place-items-center border-l border-(--c-line) text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg) disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className="flex min-w-0 flex-col bg-(--c-bg)">
      <div className="flex items-center justify-between border-b border-(--c-line) pl-6 md:pl-8">
        <p className="hud text-(--c-faint)">
          সপ্তাহ ধরে · <Num value={course.lessons.length} />
          টি পাঠ
        </p>
        <div className="flex">
          <button type="button" onClick={() => go(-1)} disabled={edge.start} className={arrow}>
            <ChevronLeft className="size-4.5" aria-hidden />
            <span className="sr-only">আগের সপ্তাহ</span>
          </button>
          <button type="button" onClick={() => go(1)} disabled={edge.end} className={arrow}>
            <ChevronRight className="size-4.5" aria-hidden />
            <span className="sr-only">পরের সপ্তাহ</span>
          </button>
        </div>
      </div>
      <ol ref={track} onScroll={measure} aria-label={`${course.title} — সপ্তাহ ধরে`} className="flex flex-1 snap-x snap-mandatory gap-px overflow-x-auto bg-(--c-line) scrollbar-none">
        {course.lessons.map((l) => {
          const v = videos.find((x) => x.course === course.id && x.week === l.week && !x.short);
          const frame = (
            <span className="relative block aspect-3/2 overflow-hidden bg-(--c-bg-sunken)">
              {v ? (
                <>
                  <Image
                    src={course.image}
                    alt=""
                    fill
                    sizes="13rem"
                    style={{ objectPosition: `${(l.week * 37) % 100}% ${(l.week * 23) % 100}%` }}
                    className="scale-[1.35] object-cover transition-transform duration-500 group-hover:scale-[1.45] motion-reduce:transition-none"
                  />
                  <span className="hud absolute bottom-2 left-2 flex items-center gap-1 bg-(--c-invert-bg) px-2 py-1 font-bold text-(--c-invert-fg)">
                    <Play className="size-3 fill-current" aria-hidden />
                    {v.access === "free" ? "বিনামূল্যে" : "চালান"}
                  </span>
                </>
              ) : (
                <span className="display absolute inset-0 grid place-items-center text-5xl text-(--c-app-ink)">
                  <Num value={l.week} />
                </span>
              )}
            </span>
          );
          return (
            <li key={l.week} className="flex w-52 shrink-0 snap-start flex-col bg-(--c-bg)">
              {v ? (
                <Link href={watchHref(v)} className="group block" aria-label={`সপ্তাহ ${l.week}: ${l.title} — ভিডিও দেখুন`}>
                  {frame}
                </Link>
              ) : (
                frame
              )}
              <div className="flex flex-1 flex-col p-4">
                <p className="hud text-(--c-faint)">
                  সপ্তাহ <Num value={l.week} /> · {MODES[l.mode]}
                </p>
                <p className="mt-1.5 line-clamp-3 text-sm leading-snug font-semibold text-(--c-ink)">{l.title}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
