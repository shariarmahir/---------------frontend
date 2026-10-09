"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, CalendarPlus, DoorOpen, Radio } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_NOW } from "@/data/media/clock";
import { CLASS_MINUTES, courseTimeline, type Course } from "@/lib/media/academy";
import { WEEKDAYS, calendarFile, classSessions, slotOf, type Batch } from "@/lib/media/batch";
import { bnDigits } from "@/lib/media/format";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { DateText, Num } from "../../ui/numerals";
import { useMyRooms } from "../classroom/use-batches";

/** The academy week runs Saturday to Friday, like the country's. */
const WEEK = [6, 0, 1, 2, 3, 4, 5];
/** One tint per course in the table, from the brand's soft colours. */
const TINTS = ["bg-m-blue-soft text-m-blue ring-m-blue/20", "bg-m-amber-soft text-m-gold ring-m-yellow/40", "bg-m-green-soft text-m-green ring-m-green/25", "bg-m-mist text-m-ink ring-m-ink/10"];

type Row = { batch: Batch; course: Course; tint: string };

/**
 * রুটিন — the class routine a university pins on the notice board: the
 * week from Saturday, a row for every class hour, each course in its own
 * colour; then the classes coming up, each course's forty days, and a file
 * that puts every class into the phone's calendar.
 */
export function RoutineView() {
  const hydrated = useHydrated();
  const rooms = useMyRooms();
  const rows: Row[] = useMemo(() => rooms.map((r, i) => ({ ...r, tint: TINTS[i % TINTS.length] })), [rooms]);

  const upcoming = useMemo(() => {
    const now = DEMO_NOW.getTime();
    return rows
      .flatMap((r) => classSessions(r.batch).map((s) => ({ ...s, ...r, lesson: r.course.lessons[s.week - 1] })))
      .filter((s) => Date.parse(s.at) + CLASS_MINUTES * 60_000 > now)
      .sort((a, b) => a.at.localeCompare(b.at));
  }, [rows]);

  const times = [...new Set(rows.map((r) => r.batch.time))].sort();

  function download() {
    const events = rows.flatMap((r) =>
      classSessions(r.batch).map((s) => ({
        uid: `${r.batch.id}-w${s.week}`,
        title: `${r.course.title.split(" — ")[0]} · সপ্তাহ ${bnDigits(s.week)}: ${r.course.lessons[s.week - 1]?.title ?? ""}`,
        at: s.at,
        minutes: CLASS_MINUTES,
        where: "কাণ্ডারী একাডেমি · লাইভ ক্লাস",
      })),
    );
    const url = URL.createObjectURL(new Blob([calendarFile(events, new Date().toISOString())], { type: "text/calendar;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "kandari-routine.ics" });
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!hydrated) return <Skeleton className="mx-auto h-96 max-w-6xl rounded-3xl bg-m-ink/6" />;

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-m-blue">ধাপ ৬ · রুটিন</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3.6vw,2.6rem)] leading-tight font-bold text-m-ink">আপনার ক্লাস রুটিন</h1>
          <p className="mt-1.5 text-[15px] text-m-ink/65">
            প্রতি কোর্সে সপ্তাহে একটা <Num value={CLASS_MINUTES} /> মিনিটের লাইভ ক্লাস — ব্যাচের ঠিক করা দিনে, ঢাকার সময়ে।
          </p>
        </div>
        {rows.length > 0 && (
          <button type="button" onClick={download} className={mediaButton({ variant: "outline" })}>
            <CalendarPlus aria-hidden /> ফোনের ক্যালেন্ডারে নিন
          </button>
        )}
      </header>

      {rows.length === 0 ? (
        <section className="mt-8 grid place-items-center rounded-3xl bg-white px-6 py-16 text-center shadow-m-tile ring-1 ring-m-ink/8">
          <span className="grid size-16 place-items-center rounded-2xl bg-m-blue-soft text-m-blue">
            <CalendarDays className="size-7" aria-hidden />
          </span>
          <h2 className="mt-4 text-xl font-bold text-m-ink">রুটিন আসে ভর্তির পর</h2>
          <p className="mt-1 max-w-sm text-[15px] text-m-ink/70">কোনো কোর্সে ভর্তি হলে সেই ব্যাচের সব ক্লাস দিন-তারিখসহ এখানে বসে যাবে।</p>
          <Link href="/media/academy" className={mediaButton({ className: "mt-6" })}>
            একাডেমি খুঁজুন
          </Link>
        </section>
      ) : (
        <>
          {/* The week, from Saturday. */}
          <section aria-label="সাপ্তাহিক রুটিন" className="mt-8 overflow-hidden rounded-3xl bg-white shadow-m-tile ring-1 ring-m-ink/8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] border-collapse text-sm">
                <thead>
                  <tr className="bg-m-blue-night text-white">
                    <th scope="col" className="w-24 px-3 py-3 text-left text-xs font-semibold text-white/70">
                      সময়
                    </th>
                    {WEEK.map((d) => (
                      <th key={d} scope="col" className={cn("px-2 py-3 text-center font-bold", d === 5 && "text-white/50")}>
                        {WEEKDAYS[d].replace("বার", "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map((t) => (
                    <tr key={t} className="border-t border-m-ink/6">
                      <th scope="row" className="px-3 py-3 text-left align-top text-xs font-bold text-m-ink/70">
                        {slotOf(0, t).split(" · ")[1]}
                      </th>
                      {WEEK.map((d) => {
                        const here = rows.filter((r) => r.batch.day === d && r.batch.time === t);
                        return (
                          <td key={d} className={cn("px-1.5 py-2 align-top", d === 5 && "bg-m-ground/50")}>
                            {here.map((r) => (
                              <Link key={r.batch.id} href={`/media/academy/classroom/${encodeURIComponent(r.batch.id)}`} className={cn("block rounded-xl px-2.5 py-2 ring-1 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none", r.tint)}>
                                <span className="block text-xs leading-snug font-bold">{r.course.title.split(" — ")[0]}</span>
                                <span className="mt-0.5 block text-[11px] opacity-75">
                                  ব্যাচ <Num value={r.batch.n} /> · <Num value={CLASS_MINUTES} /> মিনিট
                                </span>
                              </Link>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            {/* What comes next. */}
            <section aria-labelledby="next-title">
              <h2 id="next-title" className="text-xl font-bold text-m-ink">
                সামনের ক্লাস
              </h2>
              {upcoming.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-white p-5 text-sm text-m-ink/70 shadow-m-tile ring-1 ring-m-ink/8">ক্লাসের সপ্তাহগুলো শেষ — এখন প্রজেক্ট আর প্যানেলের সময়।</p>
              ) : (
                <ol className="mt-4 space-y-3">
                  {upcoming.slice(0, 6).map((s, i) => (
                    <li key={`${s.batch.id}-${s.week}`} className={cn("flex items-center gap-4 rounded-2xl bg-white p-4 shadow-m-tile ring-1 ring-m-ink/8", i === 0 && "ring-2 ring-m-blue/40")}>
                      <span className={cn("grid w-16 shrink-0 place-items-center rounded-xl py-2 text-center ring-1", s.tint)}>
                        <span className="text-[11px] font-semibold">
                          <DateText iso={s.at} weekday />
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-m-blue">
                          সপ্তাহ <Num value={s.week} /> · <DateText iso={s.at} time />
                        </span>
                        <span className="block truncate font-bold text-m-ink">{s.lesson?.title}</span>
                        <span className="block truncate text-xs text-m-ink/60">{s.course.title}</span>
                      </span>
                      <Link href={`/media/academy/classroom/${encodeURIComponent(s.batch.id)}${i === 0 ? "/live" : ""}`} className={mediaButton({ variant: i === 0 ? "green" : "quiet", size: "sm", className: "shrink-0" })}>
                        {i === 0 ? <Radio aria-hidden /> : <DoorOpen aria-hidden />}
                        <span className="hidden sm:inline">{i === 0 ? "লাইভে যোগ দিন" : "ক্লাসরুম"}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* Each course's forty days. */}
            <section aria-labelledby="span-title">
              <h2 id="span-title" className="text-xl font-bold text-m-ink">
                কোর্সের চল্লিশ দিন
              </h2>
              <ul className="mt-4 space-y-3">
                {rows.map((r) => {
                  const t = courseTimeline(r.batch.starts);
                  return (
                    <li key={r.batch.id} className="rounded-2xl bg-white p-4 shadow-m-tile ring-1 ring-m-ink/8">
                      <p className="font-bold text-m-ink">{r.course.title.split(" — ")[0]}</p>
                      <p className="text-xs text-m-ink/60">
                        ব্যাচ <Num value={r.batch.n} /> · {slotOf(r.batch.day, r.batch.time)}
                      </p>
                      <div className="mt-3 flex gap-1" aria-hidden>
                        {t.weeks.map((w) => (
                          <span key={w.week} className="h-2 flex-1 rounded-full bg-m-blue/70" />
                        ))}
                        <span className="h-2 w-8 rounded-full bg-m-yellow" />
                      </div>
                      <p className="mt-2 flex justify-between text-[11px] text-m-ink/60">
                        <span>
                          শুরু <DateText iso={r.batch.starts} />
                        </span>
                        <span>
                          প্যানেল <DateText iso={t.final.from} />
                        </span>
                        <span>
                          শেষ <DateText iso={t.ends} />
                        </span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
