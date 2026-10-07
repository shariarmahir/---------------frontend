"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Award, Check, Clock3, Download, Info, Pause, Play, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { CLASS_MINUTES, MODES, durationText, type ClassVideo, type Course, type Enrollment, type Lesson, type Material, type Mode } from "@/lib/media/academy";
import type { Batch } from "@/lib/media/batch";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num, useFormat } from "../../ui/numerals";
import { MATERIAL_ICON } from "../desk/materials-desk";
import { updateAcademy, useAcademy } from "../use-academy";

/** Each kind of class wears its own tint, like the reference's soft cards. */
const TINT: Record<Mode, { card: string; tile: string }> = {
  live: { card: "bg-m-blue-soft", tile: "bg-m-blue text-m-on" },
  "hands-on": { card: "bg-m-amber-soft", tile: "bg-m-yellow text-m-ink" },
  video: { card: "bg-m-mist", tile: "bg-white text-m-blue" },
};
const NO_MATERIALS: Material[] = [];

/* ── Left: the syllabus ────────────────────────────────────────────── */

/**
 * "আপনার সিলেবাস": a greeting, search, the kind-of-class filter, the course
 * card with its numbers, then the five weeks as tinted cards — pick one and
 * the player turns to it. The final project closes the list.
 */
export function SyllabusRail({ name, course, batch, week, onWeek, done, videos, className }: { name: string; course: Course; batch: Batch; week: number; onWeek: (w: number) => void; done: (w: number) => boolean; videos: number; className?: string }) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);
  const shown = course.lessons.filter((l) => (!mode || l.mode === mode) && (!q.trim() || `${l.title} ${l.homework ?? ""}`.includes(q.trim())));
  const finished = course.lessons.filter((l) => done(l.week)).length;

  return (
    <aside aria-label="সিলেবাস" className={cn("flex min-h-0 flex-col rounded-[1.6rem] bg-m-ground p-4 ring-1 ring-m-ink/6 sm:p-5", className)}>
      <p className="text-sm font-semibold text-m-ink/60">হ্যালো, {name}</p>
      <h2 className="mt-1 text-[1.9rem] leading-[1.1] font-bold text-m-ink">আপনার সিলেবাস</h2>

      <label className="relative mt-4 block">
        <span className="sr-only">সিলেবাসে খুঁজুন</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="খুঁজুন" className="h-11 w-full rounded-full bg-white pr-12 pl-4 text-sm text-m-ink shadow-m-tile ring-1 ring-m-ink/6 placeholder:text-m-ink/45 focus:ring-m-blue/40 focus:outline-none" />
        <span className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-m-ink text-m-on" aria-hidden>
          <Search className="size-4" />
        </span>
      </label>

      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="ক্লাসের ধরন">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-m-ink/70 ring-1 ring-m-ink/8" aria-hidden>
          <SlidersHorizontal className="size-4" />
        </span>
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode((x) => (x === m ? null : m))} className={cn("h-9 shrink-0 rounded-full px-3.5 text-xs font-semibold ring-1 transition-colors", mode === m ? "bg-m-ink text-m-on ring-m-ink" : "bg-white text-m-ink/80 ring-m-ink/10 hover:ring-m-blue/40")}>
            {MODES[m]}
            {mode === m && <span aria-hidden> ×</span>}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5 scrollbar-gold">
        <article className="relative overflow-hidden rounded-[1.4rem] bg-m-blue-soft p-4 ring-1 ring-m-blue/10">
          <h3 className="pr-6 text-lg leading-snug font-bold text-m-ink">{course.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-m-ink/65">{course.outcome}</p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
            <dl className="space-y-2.5">
              <div>
                <dt className="text-[11px] text-m-ink/55">সপ্তাহ</dt>
                <dd className="text-2xl leading-none font-bold text-m-ink">
                  <Num value={course.lessons.length} />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-m-ink/55">ভিডিও</dt>
                <dd className="text-2xl leading-none font-bold text-m-ink">
                  <Num value={videos} />
                </dd>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-m-ink/60">
                <Clock3 className="size-3" aria-hidden /> <Num value={CLASS_MINUTES} /> মিনিট
              </div>
            </dl>
            <span className="relative block overflow-hidden rounded-2xl">
              <Image src={course.image} alt="" fill sizes="7.5rem" className="object-cover" />
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-m-ink/70">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
              <span className="block h-full rounded-full bg-m-blue transition-[width] duration-500" style={{ width: `${(finished / course.lessons.length) * 100}%` }} />
            </span>
            <Num value={finished} />/<Num value={course.lessons.length} />
          </div>
          <span className="absolute top-4 right-4 text-xs font-bold text-m-blue">
            ব্যাচ <Num value={batch.n} />
          </span>
        </article>

        <ul className="space-y-2">
          {shown.map((l) => (
            <li key={l.week}>
              <WeekCard lesson={l} on={l.week === week} done={done(l.week)} onPick={() => onWeek(l.week)} />
            </li>
          ))}
          {shown.length === 0 && <li className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-m-ink/55">এই খোঁজে কোনো সপ্তাহ নেই</li>}
        </ul>

        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-m-ink/6">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-m-yellow text-m-ink">
            <Award className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-m-ink">ফাইনাল প্রজেক্ট ও প্যানেল</span>
            <span className="line-clamp-1 text-xs text-m-ink/60">{course.final}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

function WeekCard({ lesson, on, done, onPick }: { lesson: Lesson; on: boolean; done: boolean; onPick: () => void }) {
  const tint = TINT[lesson.mode];
  return (
    <button type="button" onClick={onPick} aria-current={on ? "true" : undefined} className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-[box-shadow,transform] duration-200 hover:-translate-y-px motion-reduce:transition-none", tint.card, on ? "shadow-m-tile ring-2 ring-m-blue" : "ring-1 ring-m-ink/5")}>
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold shadow-[inset_0_-2px_0_rgb(0_0_0/0.08)]", done ? "bg-m-green text-m-on" : tint.tile)}>
        {done ? <Check className="size-5" strokeWidth={3} aria-label="হয়েছে" /> : <Num value={lesson.week} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-m-ink">{lesson.title}</span>
        <span className="block truncate text-xs text-m-ink/60">{lesson.homework ? `হোমওয়ার্ক: ${lesson.homework}` : MODES[lesson.mode]}</span>
      </span>
    </button>
  );
}

/* ── Right: files, videos, homework ────────────────────────────────── */

type Tab = "files" | "videos" | "homework";
const TABS: { id: Tab; label: string }[] = [
  { id: "files", label: "ফাইল" },
  { id: "videos", label: "ভিডিও" },
  { id: "homework", label: "হোমওয়ার্ক" },
];

/**
 * The course's lectures in a soft panel: its name and batch, three pill tabs
 * — files to download, the recordings (the one playing is white, with a
 * pause sign), and the homework, which an enrolled learner hands in here.
 */
export function LecturePanel({ course, batch, week, onWeek, videoOf, enrollment, className }: { course: Course; batch: Batch; week: number; onWeek: (w: number) => void; videoOf: (w: number) => ClassVideo | undefined; enrollment?: Enrollment; className?: string }) {
  const [tab, setTab] = useState<Tab>("videos");
  return (
    <section aria-labelledby={`lect-${batch.id}`} className={cn("flex min-h-0 flex-col rounded-[1.6rem] bg-m-blue-soft p-4 ring-1 ring-m-blue/10 sm:p-5", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`lect-${batch.id}`} className="line-clamp-1 text-xl font-bold text-m-ink">
            {course.title.split(" — ")[0]}
          </h2>
          <p className="text-sm text-m-ink/60">
            ব্যাচ <Num value={batch.n} /> · {course.id}
          </p>
        </div>
        <Link href={`/media/academy/course/${course.id}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-m-ink shadow-m-tile transition-transform hover:scale-105 motion-reduce:transition-none" aria-label="কোর্সের পাতা">
          <Info className="size-4.5" aria-hidden />
        </Link>
      </header>

      <div role="tablist" aria-label="ক্লাসের জিনিস" className="mt-4 grid grid-cols-3 gap-1.5">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("h-10 rounded-full text-sm font-semibold transition-colors", tab === t.id ? "bg-m-ink text-m-on shadow-m-tile" : "bg-white/70 text-m-ink/75 hover:bg-white")}>
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-3 min-h-0 flex-1 overflow-y-auto pr-0.5 scrollbar-gold">
        {tab === "videos" && <Videos course={course} week={week} onWeek={onWeek} videoOf={videoOf} />}
        {tab === "files" && <Files course={course} />}
        {tab === "homework" && <Homework course={course} enrollment={enrollment} />}
      </div>
    </section>
  );
}

function Videos({ course, week, onWeek, videoOf }: { course: Course; week: number; onWeek: (w: number) => void; videoOf: (w: number) => ClassVideo | undefined }) {
  const { num } = useFormat();
  return (
    <ul className="space-y-2">
      {course.lessons.map((l) => {
        const on = l.week === week;
        const v = videoOf(l.week);
        return (
          <li key={l.week}>
            <button type="button" onClick={() => onWeek(l.week)} aria-current={on ? "true" : undefined} className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors", on ? "bg-white shadow-m-tile" : "bg-white/45 hover:bg-white/80")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", on ? "bg-m-blue text-m-on" : "bg-white text-m-ink ring-1 ring-m-ink/10")}>{on ? <Pause className="size-4 fill-current" aria-hidden /> : <Play className="ml-0.5 size-4 fill-current" aria-hidden />}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-m-ink">{l.title}</span>
                <span className="block truncate text-xs text-m-ink/55">
                  সপ্তাহ {num(l.week)} · {MODES[l.mode]}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-m-ink/70 tabular-nums">{num(durationText(v?.seconds ?? CLASS_MINUTES * 60))}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Files({ course }: { course: Course }) {
  const added = useAcademy((a) => a.materials[course.id] ?? NO_MATERIALS);
  const all = [course.syllabus, course.calendar, ...added, ...course.materials];
  return (
    <ul className="space-y-2">
      {all.map((m, i) => {
        const Icon = MATERIAL_ICON[m.kind];
        return (
          <li key={`${m.title}-${i}`} className="flex items-center gap-3 rounded-2xl bg-white/70 p-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-m-blue ring-1 ring-m-ink/8">
              <Icon className="size-4.5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-m-ink">{m.title}</span>
              <span className="text-xs text-m-ink/55">{m.size}</span>
            </span>
            {m.href ? (
              <a href={m.href} download={m.file} target={m.file ? undefined : "_blank"} rel="noopener noreferrer nofollow" className="grid size-9 shrink-0 place-items-center rounded-full text-m-blue hover:bg-white" aria-label={`${m.title} নামান`}>
                <Download className="size-4" aria-hidden />
              </a>
            ) : (
              <span className="shrink-0 text-[11px] text-m-ink/45">নমুনা</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Homework({ course, enrollment }: { course: Course; enrollment?: Enrollment }) {
  const set = course.lessons.filter((l) => l.homework);
  if (set.length === 0) return <p className="rounded-2xl bg-white/70 p-4 text-sm text-m-ink/65">এই কোর্সে আলাদা হোমওয়ার্ক নেই — প্রজেক্টেই সব।</p>;
  return (
    <ul className="space-y-2">
      {set.map((l) => (
        <li key={l.week}>
          <HomeworkItem code={course.id} lesson={l} answer={enrollment?.homework[l.week]} enrolled={Boolean(enrollment)} />
        </li>
      ))}
    </ul>
  );
}

function HomeworkItem({ code, lesson, answer, enrolled }: { code: string; lesson: Lesson; answer?: string; enrolled: boolean }) {
  const [draft, setDraft] = useState("");
  const done = Boolean(answer?.trim());
  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-xs font-semibold text-m-blue">
        সপ্তাহ <Num value={lesson.week} />
      </p>
      <p className="mt-0.5 text-sm font-bold text-m-ink">{lesson.homework}</p>
      {done ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-m-green">
          <Check className="size-3.5" aria-hidden /> জমা হয়েছে
        </p>
      ) : (
        enrolled && (
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim().length < 5) {
                toast.error("হোমওয়ার্কে কী করলেন, অন্তত এক লাইন লিখুন");
                return;
              }
              updateAcademy((a) => (a.enrolled[code] ? { ...a, enrolled: { ...a.enrolled, [code]: { ...a.enrolled[code], homework: { ...a.enrolled[code].homework, [lesson.week]: draft.trim() } } } } : a));
              toast.success("হোমওয়ার্ক জমা হয়েছে");
            }}
          >
            <label htmlFor={`hw-${code}-${lesson.week}`} className="sr-only">
              উত্তর বা লিংক
            </label>
            <input id={`hw-${code}-${lesson.week}`} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={500} placeholder="কী করলেন, বা লিংক" className="h-9 min-w-0 flex-1 rounded-full bg-m-ground px-3.5 text-sm text-m-ink focus:ring-2 focus:ring-m-blue/30 focus:outline-none" />
            <button type="submit" className={mediaButton({ size: "sm", className: "h-9" })}>
              জমা
            </button>
          </form>
        )
      )}
    </div>
  );
}
