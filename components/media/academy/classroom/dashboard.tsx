"use client";

import Link from "next/link";
import { BellRing, CalendarDays, CheckCircle2, ChevronRight, Clock, MessagesSquare, PlayCircle, Radio, Trophy, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MODES, type Course } from "@/lib/media/academy";
import { classSessions, dhakaDay, slotOf, type Batch } from "@/lib/media/batch";
import { nextExam, type BatchExam } from "@/lib/media/batch-exam";
import { NOTICE_KINDS, onBoard, type Notice } from "@/lib/media/notices";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { Tx } from "../../ui/language";
import { primaryBtn } from "../catalogue/buttons";

/** A round face: the profile picture when there is one, else the first letter. */
function Face({ name, photo, className }: { name: string; photo?: string; className?: string }) {
  return (
    <Avatar className={cn("size-10 ring-2 ring-(--c-bg-raised)", className)}>
      {photo && <AvatarImage src={photo} alt="" />}
      <AvatarFallback className="bg-(--c-signal) font-bengali font-bold text-black">{name.trim().slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
}

const SURFACE = "border-0 bg-(--c-bg-raised) text-(--c-ink) ring-1 ring-(--c-line)";

export interface DashboardProps {
  batch: Batch;
  course: Course;
  /** The week of the next or running class; past the last week once the classes are over. */
  current: number;
  done: (week: number) => boolean;
  me: string;
  photo?: string;
  teacher: string;
  leader?: string;
  roster: { id: string; name: string }[];
  academy?: string;
  /** The teacher sees the classes held, not the classes attended. */
  teacherView?: boolean;
  /** The batch's notices; the dashboard shows what is still up. */
  notices: Notice[];
  exams: BatchExam[];
  onOpenExams: () => void;

  onOpenBoard: () => void;

  onOpenWeek: (week: number) => void;
  onOpenChat: () => void;
}

/**
 * The classroom's home, as one board: where the course stands, how many classes
 * were attended, missed and are still ahead, the next classes, the calendar and
 * every week as a row to open. Every figure is counted from the batch's own
 * lessons, sessions and attendance.
 */
export function Dashboard({
  batch,
  course,
  current,
  done,
  me,
  photo,
  teacher,
  leader,
  roster,
  academy,
  teacherView,
  notices,
  exams,
  onOpenExams,
  onOpenBoard,
  onOpenWeek,
  onOpenChat,
}: DashboardProps) {
  const lessons = course.lessons;
  const total = lessons.length;
  const attended = lessons.filter((l) => done(l.week)).length;
  const missed = lessons.filter((l) => l.week < current && !done(l.week)).length;
  const ahead = lessons.filter((l) => l.week >= current && !done(l.week)).length;
  const pct = total ? Math.round((attended / total) * 100) : 0;
  const share = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const sessions = classSessions(batch);
  const upcoming = sessions.filter((s) => s.week >= current).slice(0, 4);
  const first = me.trim().split(/\s+/)[0];
  const up = onBoard(notices, dhakaDay(new Date()));
  const exam = nextExam(exams, dhakaDay(new Date()));
  const emergency = up.find((n) => n.kind === "emergency");

  const tiles = [
    { label: teacherView ? "ক্লাস নিয়েছেন" : "ক্লাস করেছেন", n: attended, bg: "bg-(--c-good)", Icon: CheckCircle2 },
    { label: "সামনে আছে", n: ahead, bg: "bg-(--c-signal)", Icon: Clock },
    { label: "মিস হয়েছে", n: missed, bg: "bg-(--c-bad)", Icon: CalendarDays },
  ];

  return (
    <div className="mx-auto w-full max-w-[100rem] space-y-5 p-3 sm:p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="hud text-(--c-faint)">
            <Tx k="ব্যাচ {0}" v={[<Num key="n" value={batch.n} />]} /> · {slotOf(batch.day, batch.time)}
            {academy ? ` · ${academy}` : ""}
          </p>
          <h1 className="display mt-1 text-3xl text-(--c-ink-strong) md:text-4xl">{course.title}</h1>
        </div>
        <span className="flex items-center gap-3">
          <span className="flex -space-x-2" aria-hidden>
            {roster.map((s) => (
              <Face key={s.id} name={s.name} />
            ))}
            <Face name={me} photo={photo} />
          </span>
          <span className="hud inline-flex items-center gap-1 text-(--c-muted)">
            <UsersRound className="size-3.5" aria-hidden /> <Num value={batch.enrolled} />/<Num value={batch.seats} />
          </span>
        </span>
      </header>

      {emergency && (
        <button type="button" onClick={onOpenBoard} className="flex w-full items-center gap-3 rounded-2xl bg-(--c-bad) px-5 py-3 text-left font-bold text-black">
          <BellRing className="size-5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate">
            {emergency.title}
            {emergency.body ? ` — ${emergency.body}` : ""}
          </span>
        </button>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Card className={cn(SURFACE, "rounded-3xl p-6")}>
          <CardContent className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm text-(--c-muted)">
                <Tx k="কোর্সের অগ্রগতি" />
              </p>
              <p className="display mt-1 text-4xl text-(--c-ink-strong) sm:text-5xl">
                <Num value={pct} />%
              </p>
              <p className="hud mt-3 text-(--c-faint)">
                <Tx k="{0}টি ক্লাসের {1}টি" v={[<Num key="t" value={total} />, <Num key="a" value={attended} />]} />
              </p>
            </div>
            <Trophy className="size-16 shrink-0 sm:size-24 text-(--c-good)" strokeWidth={1.25} aria-hidden />
          </CardContent>
          <Progress value={pct} className="h-3 bg-(--c-bg-sunken)" indicatorClassName="bg-(--c-good)" aria-label="অগ্রগতি" />
        </Card>

        <ul className="grid grid-cols-1 gap-3 min-[26rem]:grid-cols-3 md:gap-4">
          {tiles.map(({ label, n, bg, Icon }) => (
            <li key={label} className={cn("flex min-h-28 flex-col justify-between gap-3 rounded-3xl p-4 text-black min-[26rem]:min-h-40 md:p-5", bg)}>
              <Icon className="size-6" aria-hidden />
              <div>
                <p className="display text-4xl leading-none sm:text-5xl">
                  <Num value={n} />
                </p>
                <p className="mt-2 text-sm font-bold">
                  <Tx k={label} />
                </p>
                <p className="hud opacity-75">
                  <Num value={share(n)} />% <Tx k="ক্লাসের" />
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
        <Card className={cn(SURFACE, "justify-between rounded-3xl p-5 sm:p-6 lg:col-span-2 xl:col-span-2")}>
          <CardHeader className="px-0">
            <CardTitle className="display text-2xl text-(--c-ink-strong)">
              <Tx k="স্বাগতম, {0}" v={[first]} />
            </CardTitle>
            <CardDescription className="max-w-md text-(--c-muted)">
              <Tx k="আপনার ক্লাসের সব কিছু এক জায়গায় — পরের ক্লাস, রেকর্ডিং, ব্যাচের আড্ডা আর সপ্তাহের কাজ।" />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6 px-0">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              <li className="flex items-center gap-3">
                <Face name={teacher} className="size-12" />
                <span className="flex flex-col leading-tight">
                  <span className="hud text-(--c-faint)">
                    <Tx k="ক্লাস শিক্ষক" />
                  </span>
                  <span className="font-semibold text-(--c-ink-strong)">{teacher}</span>
                </span>
              </li>
              {leader && (
                <li className="flex items-center gap-3">
                  <Face name={leader} className="size-12" />
                  <span className="flex flex-col leading-tight">
                    <span className="hud text-(--c-faint)">
                      <Tx k="ব্যাচ লিডার" />
                    </span>
                    <span className="font-semibold text-(--c-ink-strong)">{leader}</span>
                  </span>
                </li>
              )}
              <li className="flex items-center gap-3">
                <Face name={me} photo={photo} className="size-12" />
                <span className="flex flex-col leading-tight">
                  <span className="hud text-(--c-faint)">
                    <Tx k="আপনি" />
                  </span>
                  <span className="font-semibold text-(--c-ink-strong)">{me}</span>
                </span>
              </li>
            </ul>
            <span className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onOpenWeek(Math.min(Math.max(current, 1), total))}
                className="inline-flex h-11 items-center gap-2 border border-(--c-line-strong) px-4 text-sm font-bold text-(--c-ink-strong) transition-colors hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
              >
                <PlayCircle className="size-4" aria-hidden /> <Tx k="এই সপ্তাহের পাঠ" />
              </button>
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex h-11 items-center gap-2 border border-(--c-line-strong) px-4 text-sm font-bold text-(--c-ink-strong) transition-colors hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
              >
                <MessagesSquare className="size-4" aria-hidden /> <Tx k="ব্যাচের আড্ডা" />
              </button>
              <Link href={`/media/academy/classroom/${encodeURIComponent(batch.id)}/live`} className={primaryBtn}>
                <Radio className="size-4" aria-hidden /> <Tx k={teacherView ? "লাইভ ক্লাস শুরু করুন" : "লাইভ ক্লাসে যোগ দিন"} />
              </Link>
            </span>
          </CardContent>
        </Card>

        <MonthCard batch={batch} sessions={sessions} />

        <Card className={cn(SURFACE, "rounded-3xl p-5 sm:p-6 lg:col-span-2 xl:col-span-3")}>
          <CardHeader className="px-0">
            <CardTitle className="display text-xl text-(--c-ink-strong)">
              <Tx k="নোটিশ বোর্ড" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {exam && (
              <button type="button" onClick={onOpenExams} className="mb-2 flex w-full items-center gap-3 rounded-xl bg-(--c-blue) px-4 py-2.5 text-left text-(--c-signal)">
                <span className="hud shrink-0 font-bold">
                  <Tx k="পরের পরীক্ষা" />
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{exam.title}</span>
                <span className="hud shrink-0">
                  <DateText iso={exam.on} />
                </span>
              </button>
            )}
            {up.length === 0 ? (
              <p className="text-sm text-(--c-muted)">
                <Tx k="আজ বোর্ড ফাঁকা — কোনো নোটিশ নেই।" />
              </p>
            ) : (
              <ul className="space-y-2">
                {up.slice(0, 3).map((n) => (
                  <li key={n.id}>
                    <button type="button" onClick={onOpenBoard} className="flex w-full items-center gap-3 rounded-xl bg-(--c-bg-sunken) px-4 py-2.5 text-left">
                      <span className={cn("hud shrink-0 px-1.5 py-0.5 font-bold", n.kind === "emergency" ? "bg-(--c-bad) text-black" : "bg-(--c-signal) text-black")}>
                        {NOTICE_KINDS[n.kind].bn}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold text-(--c-ink-strong)">{n.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className={cn(SURFACE, "rounded-3xl p-5 sm:p-6 lg:col-span-2 xl:col-span-3")}>
          <CardHeader className="px-0">
            <CardTitle className="display text-xl text-(--c-ink-strong)">
              <Tx k="সামনের ক্লাস" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-(--c-line) sm:grid-cols-2 xl:grid-cols-4">
              {upcoming.length === 0 && (
                <li className="bg-(--c-bg-raised) p-4 text-sm text-(--c-muted) sm:col-span-2 xl:col-span-4">
                  <Tx k="ক্লাসের সপ্তাহ শেষ — এখন প্রজেক্ট আর প্যানেল।" />
                </li>
              )}
              {upcoming.map((s) => {
                const lesson = lessons.find((l) => l.week === s.week);
                return (
                  <li key={s.week} className="flex gap-4 bg-(--c-bg-raised) p-4">
                    <span className="display w-10 shrink-0 text-center text-4xl leading-none text-(--c-signal)">
                      <Num value={Number(dhakaDay(new Date(s.at)).slice(8))} />
                    </span>
                    <span className="min-w-0">
                      <span className="hud block text-(--c-faint)">
                        <DateText iso={dhakaDay(new Date(s.at))} />
                      </span>
                      <span className="mt-1 block truncate font-semibold text-(--c-ink-strong)">{lesson?.title}</span>
                      <span className="hud block text-(--c-muted)">{lesson ? MODES[lesson.mode] : ""}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className={cn(SURFACE, "rounded-3xl p-4 md:p-6")}>
        <CardHeader className="px-2">
          <CardTitle className="display text-xl text-(--c-ink-strong)">
            <Tx k="সপ্তাহের অগ্রগতি" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="grid gap-3">
            {lessons.map((l) => {
              const was = done(l.week);
              const now = l.week === current;
              const miss = l.week < current && !was;
              return (
                <li key={l.week}>
                  <button
                    type="button"
                    onClick={() => onOpenWeek(l.week)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-2xl px-3 py-3 text-left sm:gap-4 sm:px-4 text-black transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none",
                      was ? "bg-(--c-good)/85" : now ? "bg-(--c-signal)" : miss ? "bg-(--c-bad)/85" : "bg-(--c-bg-sunken) text-(--c-ink)",
                    )}
                  >
                    <span className="display w-14 shrink-0 text-base sm:w-16 sm:text-lg">
                      <Tx k="সপ্তাহ {0}" v={[<Num key="n" value={l.week} />]} />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{l.title}</span>
                    <span className="hud hidden shrink-0 sm:block">{MODES[l.mode]}</span>
                    <span className="hud w-16 shrink-0 text-right font-bold sm:w-24">
                      <Tx k={was ? "করেছেন" : now ? "এই সপ্তাহ" : miss ? "মিস" : "সামনে"} />
                    </span>
                    <ChevronRight className="size-4 shrink-0" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

const DAYS = ["র", "সো", "ম", "বু", "বৃ", "শু", "শ"];

/** The month of the next class, with every class day marked. */
function MonthCard({ batch, sessions }: { batch: Batch; sessions: { week: number; at: string }[] }) {
  const classDays = new Set(sessions.map((s) => dhakaDay(new Date(s.at))));
  const anchor = new Date(`${batch.starts}T00:00:00Z`);
  const y = anchor.getUTCFullYear();
  const m = anchor.getUTCMonth();
  const lead = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const length = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const iso = (d: number) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);

  return (
    <Card className={cn(SURFACE, "rounded-3xl p-5 sm:p-6 lg:col-span-2 xl:col-span-1")}>
      <CardHeader className="px-0">
        <CardTitle className="display text-xl text-(--c-ink-strong)">
          <DateText iso={iso(1)} />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {DAYS.map((d) => (
            <li key={d} className="hud py-1 text-(--c-faint)">
              {d}
            </li>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <li key={`b${i}`} aria-hidden />
          ))}
          {Array.from({ length }, (_, i) => {
            const on = classDays.has(iso(i + 1));
            return (
              <li key={i} className={cn("mx-auto grid size-8 place-items-center rounded-full", on ? "bg-(--c-blue) font-bold text-(--c-signal)" : "text-(--c-muted)")}>
                <Num value={i + 1} />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
