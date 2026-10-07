"use client";

import { useState } from "react";
import { AlarmClock, BellRing, BookMarked, CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardList, Plus, ScrollText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DEMO_NOW } from "@/data/media/clock";
import { WEEKDAYS, examAlert, nextExam, syllabusProgress, weekday, type Exam } from "@/lib/media/classroom";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { selectClass } from "../ui/field-styles";
import { Panel } from "../ui/layout";
import { Num } from "../ui/numerals";
import type { ClassTab } from "./room";
import { editClassroom, nameOf } from "./use-classroom";

const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const TODAY = weekday(DEMO_NOW);
const isoOf = (d: Date) => d.toISOString().slice(0, 10);

function bnDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return <><Num value={d.getUTCDate()} /> {MONTHS[d.getUTCMonth()]}</>;
}

export const TodayTab: ClassTab = ({ room, leader, onTab }) => {
  const [topic, setTopic] = useState(room.todayTopic ?? "");
  const classDay = [0, 1, 2, 3, 4, 5, 6].map((k) => (TODAY + k) % 7).find((d) => room.routine.some((s) => s.day === d));
  const slots = room.routine.filter((s) => s.day === classDay);
  const next = nextExam(room.exams, DEMO_NOW);
  const alert = next ? examAlert(next.days) : "calm";
  const homework = room.notes.filter((n) => n.kind === "homework").slice(0, 3);
  const daily = room.papers.find((p) => p.daily);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {next && (
        <section
          className={cn(
            "story-reveal flex flex-col gap-3 rounded-2xl p-5 lg:col-span-3 lg:flex-row lg:items-center lg:justify-between",
            alert === "calm" ? "bg-m-blue-soft text-m-ink" : "bg-m-red text-m-on",
          )}
        >
          <p className="flex items-center gap-3 text-lg font-bold">
            <span className="relative flex size-10 items-center justify-center rounded-xl bg-m-ink/8">
              {alert !== "calm" && <span className="absolute inset-0 animate-ping rounded-xl bg-m-ink/14 motion-reduce:hidden" />}
              <BellRing className="size-5" aria-hidden />
            </span>
            <span>
              {alert === "today" ? "আজ পরীক্ষা: " : alert === "near" ? "পরীক্ষা কাছে: " : "পরের পরীক্ষা: "}
              {next.exam.title}
              <span className="block text-sm font-semibold opacity-85">{bnDate(next.exam.date)} · <Num value={next.days} /> দিন বাকি</span>
            </span>
          </p>
          <button type="button" onClick={() => onTab("plan")} className={mediaButton({ variant: "tile" })}>পরীক্ষার রুটিন দেখুন</button>
        </section>
      )}

      <Panel title={<span className="flex items-center gap-2"><BookMarked className="size-4.5" aria-hidden /> আজকের ক্লাস টপিক</span>}>
        <p className="text-xl font-bold text-m-ink">{room.todayTopic || "এখনো ঠিক হয়নি"}</p>
        {leader && (
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              editClassroom(room.id, (r) => ({ ...r, todayTopic: topic.trim() || undefined }));
            }}
          >
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="আজ কী পড়ানো হবে" />
            <button type="submit" className={mediaButton({ variant: "primary" })}>সেট</button>
          </form>
        )}
      </Panel>

      <Panel title={<span className="flex items-center gap-2"><AlarmClock className="size-4.5" aria-hidden /> {classDay === TODAY ? "আজকের রুটিন" : "পরের ক্লাস"}</span>}>
        {classDay === undefined ? (
          <p className="text-sm text-m-ink/70">রুটিন এখনো দেওয়া হয়নি।</p>
        ) : (
          <>
            {classDay !== TODAY && <p className="mb-3 text-sm text-m-ink/70">আজ ক্লাস নেই — পরের ক্লাস {WEEKDAYS[classDay]}বার।</p>}
            <ul className="space-y-2">
              {slots.map((s, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl bg-white/65 px-3 py-2.5 ring-1 ring-m-ink/9">
                  <span className="w-14 shrink-0 text-xs font-bold text-m-blue">{s.time}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-m-ink">{s.subject}</span>
                    {s.topic && <span className="block truncate text-xs text-m-ink/65">{s.topic}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel title={<span className="flex items-center gap-2"><ClipboardList className="size-4.5" aria-hidden /> হোমওয়ার্ক</span>}>
        {homework.length === 0 ? (
          <p className="text-sm text-m-ink/70">কোনো হোমওয়ার্ক নেই।</p>
        ) : (
          <ul className="space-y-3">
            {homework.map((n) => (
              <li key={n.id} className="text-sm leading-relaxed text-m-ink/90">
                <span className="font-semibold text-m-ink">{n.title}</span>
                <span className="mt-0.5 block text-xs text-m-ink/55">{nameOf(room, n.by)} · {bnDate(n.at)}</span>
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={() => onTab("board")} className="mt-4 text-sm font-bold text-m-blue hover:underline">নোট বোর্ডে যান →</button>
      </Panel>

      {daily && (
        <section className="story-reveal flex flex-col justify-between gap-4 rounded-2xl bg-m-yellow p-5 text-m-ink sm:flex-row sm:items-center lg:col-span-3">
          <p>
            <span className="block text-xs font-bold tracking-wide uppercase opacity-75">আজকের মূল্যায়ন</span>
            <span className="text-lg font-bold">{daily.title}</span>
            <span className="block text-sm opacity-80"><Num value={daily.questions.length} />টি প্রশ্ন · <Num value={Object.keys(daily.scores).length} /> জন দিয়েছে</span>
          </p>
          <button type="button" onClick={() => onTab("papers")} className={mediaButton({ variant: "tile", size: "lg" })}>এখনই দিন</button>
        </section>
      )}
    </div>
  );
};

export const PlanTab: ClassTab = ({ room, leader }) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <Syllabus room={room} leader={leader} />
    <ExamRoutine exams={room.exams} roomId={room.id} leader={leader} />
    <WeekRoutine room={room} leader={leader} />
    <MonthCalendar exams={room.exams} classDays={new Set(room.routine.map((s) => s.day))} />
  </div>
);

function Syllabus({ room, leader }: { room: Parameters<ClassTab>[0]["room"]; leader: boolean }) {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const progress = syllabusProgress(room.topics);
  const subjects = [...new Set(room.topics.map((t) => t.subject))];
  const toggle = (id: string) => editClassroom(room.id, (r) => ({ ...r, topics: r.topics.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));

  return (
    <Panel title={<span className="flex items-center gap-2"><ScrollText className="size-4.5" aria-hidden /> সিলেবাস মিটার</span>} className="lg:row-span-2">
      <div className="mb-5">
        <div className="mb-2 flex items-end justify-between">
          <span className="text-4xl font-bold text-m-ink"><Num value={progress} />%</span>
          <span className="text-sm text-m-ink/70">{progress === 100 ? "সিলেবাস শেষ!" : "শেষ হয়েছে"}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-m-ink/6">
          <div className="h-full rounded-full bg-m-yellow transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="space-y-4">
        {subjects.map((sub) => (
          <div key={sub}>
            <p className="mb-2 text-xs font-bold tracking-wide text-m-blue">{sub}</p>
            <ul className="space-y-1.5">
              {room.topics.filter((t) => t.subject === sub).map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    disabled={!leader}
                    onClick={() => toggle(t.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors enabled:hover:bg-m-ink/3 disabled:cursor-default"
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-lg transition-colors", t.done ? "bg-m-blue-soft text-m-ink" : "ring-1 ring-m-ink/21")}>
                      {t.done && <Check className="live-in size-4" aria-hidden />}
                    </span>
                    <span className={cn(t.done ? "text-m-ink/60 line-through decoration-m-ink/40" : "text-m-ink")}>{t.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {room.topics.length === 0 && <p className="text-sm text-m-ink/70">এখনো কোনো টপিক নেই।</p>}
      </div>
      {leader && (
        <form
          className="mt-5 grid gap-2 border-t border-m-ink/9 pt-4 sm:grid-cols-[1fr_1.4fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!subject.trim() || !title.trim()) return;
            editClassroom(room.id, (r) => ({ ...r, topics: [...r.topics, { id: newId("t"), subject: subject.trim(), title: title.trim(), done: false }] }));
            setTitle("");
          }}
        >
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="বিষয়" aria-label="বিষয়" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="টপিক" aria-label="টপিক" />
          <button type="submit" className={mediaButton({ variant: "primary", size: "icon" })}><Plus aria-hidden /><span className="sr-only">টপিক যোগ</span></button>
        </form>
      )}
    </Panel>
  );
}

function ExamRoutine({ exams, roomId, leader }: { exams: Exam[]; roomId: string; leader: boolean }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<Exam["kind"]>("class");
  const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <Panel title={<span className="flex items-center gap-2"><AlarmClock className="size-4.5" aria-hidden /> পরীক্ষার রুটিন</span>}>
      <ul className="space-y-2">
        {sorted.map((e) => {
          const left = nextExam([e], DEMO_NOW)?.days;
          return (
            <li key={e.id} className={cn("flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ring-1", left === undefined ? "opacity-55 ring-m-ink/9" : "ring-m-ink/13")}>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-m-ink">{e.title}</span>
                <span className="text-xs text-m-ink/65">{bnDate(e.date)} · {e.kind === "public" ? "পাবলিক পরীক্ষা" : "ক্লাস পরীক্ষা"}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold",
                  left === undefined ? "bg-m-ink/6 text-m-ink/70" : examAlert(left) === "calm" ? "bg-m-blue-soft text-m-ink" : "bg-m-red text-m-on",
                )}
              >
                {left === undefined ? "শেষ" : left === 0 ? "আজ" : <><Num value={left} /> দিন</>}
              </span>
            </li>
          );
        })}
        {exams.length === 0 && <p className="text-sm text-m-ink/70">কোনো পরীক্ষা যোগ হয়নি।</p>}
      </ul>
      {leader && (
        <form
          className="mt-4 grid gap-2 border-t border-m-ink/9 pt-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !date) return;
            editClassroom(roomId, (r) => ({ ...r, exams: [...r.exams, { id: newId("e"), title: title.trim(), date, kind }] }));
            setTitle("");
            setDate("");
          }}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="পরীক্ষার নাম" aria-label="পরীক্ষার নাম" className="sm:col-span-2" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="তারিখ" />
          <select value={kind} onChange={(e) => setKind(e.target.value as Exam["kind"])} className={selectClass} aria-label="ধরন">
            <option value="class">ক্লাস পরীক্ষা</option>
            <option value="public">পাবলিক পরীক্ষা</option>
          </select>
          <button type="submit" className={mediaButton({ variant: "primary", className: "sm:col-span-2" })}><Plus aria-hidden /> পরীক্ষা যোগ</button>
        </form>
      )}
    </Panel>
  );
}

function WeekRoutine({ room, leader }: { room: Parameters<ClassTab>[0]["room"]; leader: boolean }) {
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  return (
    <Panel title={<span className="flex items-center gap-2"><CalendarDays className="size-4.5" aria-hidden /> সাপ্তাহিক রুটিন</span>}>
      <ul className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d, i) => {
          const slots = room.routine.filter((s) => s.day === i);
          return (
            <li key={d} className={cn("min-h-24 rounded-xl p-1.5 text-center", i === TODAY ? "bg-m-yellow text-m-ink" : "bg-white/65 text-m-ink ring-1 ring-m-ink/9")}>
              <span className="block text-[11px] font-bold">{d}</span>
              {slots.map((s, k) => (
                <span key={k} className={cn("mt-1 block rounded-md px-0.5 py-1 text-[10px] leading-tight font-semibold", i === TODAY ? "bg-m-card/10" : "bg-m-ink/6")}>{s.subject}</span>
              ))}
            </li>
          );
        })}
      </ul>
      {leader && (
        <form
          className="mt-4 grid grid-cols-[auto_1fr] gap-2 border-t border-m-ink/9 pt-4 sm:grid-cols-[auto_6rem_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!subject.trim()) return;
            editClassroom(room.id, (r) => ({ ...r, routine: [...r.routine, { day, time: time.trim() || "—", subject: subject.trim() }] }));
            setSubject("");
          }}
        >
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} className={cn(selectClass, "w-auto")} aria-label="দিন">
            {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
          <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="সময়" aria-label="সময়" />
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="বিষয়" aria-label="বিষয়" className="col-span-2 sm:col-span-1" />
          <button type="submit" className={mediaButton({ variant: "primary", className: "col-span-2 sm:col-span-1" })}><Plus aria-hidden /> ক্লাস</button>
        </form>
      )}
    </Panel>
  );
}

/** A wall calendar: exam days in colour, class days underlined, today ringed. */
function MonthCalendar({ exams, classDays }: { exams: Exam[]; classDays: Set<number> }) {
  const [offset, setOffset] = useState(0);
  const first = new Date(Date.UTC(DEMO_NOW.getUTCFullYear(), DEMO_NOW.getUTCMonth() + offset, 1));
  const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = weekday(first);
  const examOn = new Map(exams.map((e) => [e.date, e]));
  const todayIso = isoOf(DEMO_NOW);

  return (
    <Panel
      title={<span className="flex items-center gap-2"><CalendarDays className="size-4.5" aria-hidden /> {MONTHS[first.getUTCMonth()]} <Num value={String(first.getUTCFullYear())} /></span>}
      action={
        <span className="flex gap-1">
          <button type="button" onClick={() => setOffset(offset - 1)} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="আগের মাস"><ChevronLeft aria-hidden /></button>
          <button type="button" onClick={() => setOffset(offset + 1)} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="পরের মাস"><ChevronRight aria-hidden /></button>
        </span>
      }
    >
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => <span key={d} className="pb-1 text-[11px] font-bold text-m-ink/60">{d}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`x${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const date = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), i + 1));
          const iso = isoOf(date);
          const exam = examOn.get(iso);
          return (
            <span
              key={iso}
              title={exam?.title}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-lg text-sm font-semibold transition-transform duration-200 hover:scale-110",
                exam ? (exam.kind === "public" ? "bg-m-red text-m-on" : "bg-m-yellow text-m-ink") : "text-m-ink/85",
                iso === todayIso && "ring-2 ring-white",
              )}
            >
              <Num value={i + 1} />
              {!exam && classDays.has(weekday(date)) && <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-m-green-soft" aria-hidden />}
            </span>
          );
        })}
      </div>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-m-ink/65">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-m-yellow" /> ক্লাস পরীক্ষা</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-m-red" /> পাবলিক পরীক্ষা</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 rounded-full bg-m-green-soft" /> ক্লাসের দিন</span>
      </p>
    </Panel>
  );
}
