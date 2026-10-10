"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Award, Check, Clock3, Download, Info, Pause, Play, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { CLASS_MINUTES, MODES, durationText, type ClassVideo, type Course, type Enrollment, type Lesson, type Material, type Mode } from "@/lib/media/academy";
import type { Batch } from "@/lib/media/batch";
import { cn } from "@/lib/utils";
import { Num, useFormat } from "../../ui/numerals";
import { primaryBtn } from "../catalogue/buttons";
import { MATERIAL_ICON } from "../desk/materials-desk";
import { updateAcademy, useAcademy } from "../use-academy";

/** Each kind of class marks its number square its own way: live inverted, hands-on yellow, video outlined. */
const TILE: Record<Mode, string> = {
  live: "bg-(--c-invert-bg) text-(--c-invert-fg)",
  "hands-on": "bg-(--c-signal) text-black",
  video: "border border-(--c-line-strong) text-(--c-accent-ink)",
};
const NO_MATERIALS: Material[] = [];

/* ── Left: the syllabus ────────────────────────────────────────────── */

/**
 * "আপনার সিলেবাস": a greeting, search, the kind-of-class filter, the course
 * card with its numbers, then the five weeks as tinted cards — pick one and
 * the player turns to it. The final project closes the list.
 */
export function SyllabusRail({
  name,
  course,
  batch,
  week,
  onWeek,
  done,
  videos,
  className,
}: {
  name: string;
  course: Course;
  batch: Batch;
  week: number;
  onWeek: (w: number) => void;
  done: (w: number) => boolean;
  videos: number;
  className?: string;
}) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);
  const shown = course.lessons.filter((l) => (!mode || l.mode === mode) && (!q.trim() || `${l.title} ${l.homework ?? ""}`.includes(q.trim())));
  const finished = course.lessons.filter((l) => done(l.week)).length;

  return (
    <aside aria-label="সিলেবাস" className={cn("flex min-h-0 flex-col bg-(--c-bg) p-5 md:p-6", className)}>
      <p className="hud text-(--c-faint)">হ্যালো, {name}</p>
      <h2 className="display mt-2 text-3xl leading-[1.1] text-(--c-ink-strong)">
        আপনার <span className="turn">সিলেবাস</span>
      </h2>

      <label className="relative mt-4 block">
        <span className="sr-only">সিলেবাসে খুঁজুন</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="খুঁজুন"
          className="h-11 w-full border border-(--c-line-strong) bg-(--c-bg-sunken) pr-12 pl-4 text-sm text-(--c-ink-strong) transition-colors duration-150 placeholder:text-(--c-faint) focus:border-(--c-signal) focus:outline-none"
        />
        <span className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center bg-(--c-invert-bg) text-(--c-invert-fg)" aria-hidden>
          <Search className="size-4" />
        </span>
      </label>

      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="ক্লাসের ধরন">
        <span className="grid size-9 shrink-0 place-items-center border border-(--c-line) text-(--c-faint)" aria-hidden>
          <SlidersHorizontal className="size-4" />
        </span>
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode((x) => (x === m ? null : m))}
            className={cn("h-9 shrink-0 px-3.5 text-xs font-semibold transition-colors", mode === m ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "border border-(--c-line) text-(--c-muted) hover:text-(--c-ink-strong)")}
          >
            {MODES[m]}
            {mode === m && <span aria-hidden> ×</span>}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5 scrollbar-gold">
        <article className="relative overflow-hidden border border-(--c-line) bg-(--c-bg-raised) p-4">
          <h3 className="display pr-14 text-lg leading-snug text-(--c-ink-strong)">{course.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-(--c-muted)">{course.outcome}</p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
            <dl className="space-y-2.5">
              <div>
                <dt className="text-[11px] text-(--c-faint)">সপ্তাহ</dt>
                <dd className="display text-2xl leading-none text-(--c-ink-strong)">
                  <Num value={course.lessons.length} />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-(--c-faint)">ভিডিও</dt>
                <dd className="display text-2xl leading-none text-(--c-ink-strong)">
                  <Num value={videos} />
                </dd>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-(--c-muted)">
                <Clock3 className="size-3" aria-hidden /> <Num value={CLASS_MINUTES} /> মিনিট
              </div>
            </dl>
            <span className="relative block overflow-hidden">
              <Image src={course.image} alt="" fill sizes="7.5rem" className="object-cover" />
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-(--c-muted)">
            <span className="h-1.5 flex-1 overflow-hidden bg-(--c-line)">
              <span className="block h-full bg-(--c-signal) transition-[width] duration-500" style={{ width: `${(finished / course.lessons.length) * 100}%` }} />
            </span>
            <Num value={finished} />/<Num value={course.lessons.length} />
          </div>
          <span className="hud absolute top-4 right-4 font-bold text-(--c-accent-ink)">
            ব্যাচ <Num value={batch.n} />
          </span>
        </article>

        <ul className="space-y-2">
          {shown.map((l) => (
            <li key={l.week}>
              <WeekCard lesson={l} on={l.week === week} done={done(l.week)} onPick={() => onWeek(l.week)} />
            </li>
          ))}
          {shown.length === 0 && <li className="border border-(--c-line) px-4 py-6 text-center text-sm text-(--c-faint)">এই খোঁজে কোনো সপ্তাহ নেই</li>}
        </ul>

        <div className="flex items-center gap-3 border border-(--c-line) p-3">
          <span className="grid size-10 shrink-0 place-items-center bg-(--c-signal) text-black">
            <Award className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-(--c-ink-strong)">ফাইনাল প্রজেক্ট ও প্যানেল</span>
            <span className="line-clamp-1 text-xs text-(--c-muted)">{course.final}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

function WeekCard({ lesson, on, done, onPick }: { lesson: Lesson; on: boolean; done: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-current={on ? "true" : undefined}
      className={cn("flex w-full items-center gap-3 border p-2.5 text-left transition-colors duration-150", on ? "border-(--c-signal) bg-(--c-bg-raised)" : "border-(--c-line) hover:border-(--c-line-strong) hover:bg-(--c-bg-raised)")}
    >
      <span className={cn("display grid size-11 shrink-0 place-items-center text-base", done ? "bg-(--c-good) text-black" : TILE[lesson.mode])}>
        {done ? <Check className="size-5" strokeWidth={3} aria-label="হয়েছে" /> : <Num value={lesson.week} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-(--c-ink-strong)">{lesson.title}</span>
        <span className="block truncate text-xs text-(--c-muted)">{lesson.homework ? `হোমওয়ার্ক: ${lesson.homework}` : MODES[lesson.mode]}</span>
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
export function LecturePanel({
  course,
  batch,
  week,
  onWeek,
  videoOf,
  enrollment,
  className,
}: {
  course: Course;
  batch: Batch;
  week: number;
  onWeek: (w: number) => void;
  videoOf: (w: number) => ClassVideo | undefined;
  enrollment?: Enrollment;
  className?: string;
}) {
  const [tab, setTab] = useState<Tab>("videos");
  return (
    <section aria-labelledby={`lect-${batch.id}`} className={cn("flex min-h-0 flex-col bg-(--c-bg) p-5 md:p-6", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`lect-${batch.id}`} className="display line-clamp-1 text-xl text-(--c-ink-strong)">
            {course.title.split(" — ")[0]}
          </h2>
          <p className="hud mt-1 text-(--c-faint)">
            ব্যাচ <Num value={batch.n} /> · {course.id}
          </p>
        </div>
        <Link
          href={`/media/academy/course/${course.id}`}
          className="grid size-11 shrink-0 place-items-center border border-(--c-line-strong) text-(--c-ink-strong) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
          aria-label="কোর্সের পাতা"
        >
          <Info className="size-4.5" aria-hidden />
        </Link>
      </header>

      <div role="tablist" aria-label="ক্লাসের জিনিস" className="mt-4 grid grid-cols-3 gap-px border border-(--c-line) bg-(--c-line)">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn("hud h-10 font-bold transition-colors duration-150", tab === t.id ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "bg-(--c-bg) text-(--c-muted) hover:text-(--c-ink-strong)")}
          >
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
            <button
              type="button"
              onClick={() => onWeek(l.week)}
              aria-current={on ? "true" : undefined}
              className={cn("flex w-full items-center gap-3 border p-2.5 text-left transition-colors duration-150", on ? "border-(--c-signal) bg-(--c-bg-raised)" : "border-(--c-line) hover:border-(--c-line-strong)")}
            >
              <span className={cn("grid size-10 shrink-0 place-items-center", on ? "bg-(--c-signal) text-black" : "border border-(--c-line) text-(--c-ink-strong)")}>
                {on ? <Pause className="size-4 fill-current" aria-hidden /> : <Play className="ml-0.5 size-4 fill-current" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-(--c-ink-strong)">{l.title}</span>
                <span className="block truncate text-xs text-(--c-faint)">
                  সপ্তাহ {num(l.week)} · {MODES[l.mode]}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-(--c-muted) tabular-nums">{num(durationText(v?.seconds ?? CLASS_MINUTES * 60))}</span>
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
          <li key={`${m.title}-${i}`} className="flex items-center gap-3 border border-(--c-line) p-2.5">
            <span className="grid size-10 shrink-0 place-items-center border border-(--c-line) text-(--c-accent-ink)">
              <Icon className="size-4.5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-(--c-ink-strong)">{m.title}</span>
              <span className="text-xs text-(--c-faint)">{m.size}</span>
            </span>
            {m.href ? (
              <a
                href={m.href}
                download={m.file}
                target={m.file ? undefined : "_blank"}
                rel="noopener noreferrer nofollow"
                className="grid size-9 shrink-0 place-items-center text-(--c-accent-ink) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
                aria-label={`${m.title} নামান`}
              >
                <Download className="size-4" aria-hidden />
              </a>
            ) : (
              <span className="shrink-0 text-[11px] text-(--c-faint)">নমুনা</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Homework({ course, enrollment }: { course: Course; enrollment?: Enrollment }) {
  const set = course.lessons.filter((l) => l.homework);
  if (set.length === 0) return <p className="border border-(--c-line) p-4 text-sm text-(--c-muted)">এই কোর্সে আলাদা হোমওয়ার্ক নেই — প্রজেক্টেই সব।</p>;
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
    <div className="border border-(--c-line) p-3">
      <p className="hud text-(--c-accent-ink)">
        সপ্তাহ <Num value={lesson.week} />
      </p>
      <p className="mt-0.5 text-sm font-bold text-(--c-ink-strong)">{lesson.homework}</p>
      {done ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-(--c-good)">
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
            <input
              id={`hw-${code}-${lesson.week}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              placeholder="কী করলেন, বা লিংক"
              className="h-9 min-w-0 flex-1 border border-(--c-line-strong) bg-(--c-bg-sunken) px-3 text-sm text-(--c-ink-strong) placeholder:text-(--c-faint) focus:border-(--c-signal) focus:outline-none"
            />
            <button type="submit" className={cn(primaryBtn, "h-9 px-3")}>
              জমা
            </button>
          </form>
        )
      )}
    </div>
  );
}
