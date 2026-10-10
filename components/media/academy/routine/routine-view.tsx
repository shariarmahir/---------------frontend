"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, CalendarPlus, DoorOpen, Landmark, Radio } from "lucide-react";
import { departments } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { CLASS_MINUTES, courseTimeline, type Course } from "@/lib/media/academy";
import { WEEKDAYS, calendarFile, classSessions, slotOf, type Batch } from "@/lib/media/batch";
import { bnDigits } from "@/lib/media/format";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { Band, BandTitle, Turn } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueFooter } from "../catalogue/catalogue-footer";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CatalogueRuler } from "../catalogue/ruler";
import { toneStyle } from "../catalogue/tones";
import { useMyRooms } from "../classroom/use-batches";

/** The academy week runs Saturday to Friday, like the country's. */
const WEEK = [6, 0, 1, 2, 3, 4, 5];
const FRIDAY = 5;

type Row = { batch: Batch; course: Course; tone: number };

/**
 * রুটিন — step six, the class routine a university pins on the notice
 * board, in the catalogue's bands: the week from Saturday with a row for
 * every class hour, each course in its department's colour; the classes
 * coming up; each course's forty days; and a file that puts every class
 * into the phone's calendar.
 */
export function RoutineView() {
  const hydrated = useHydrated();
  const rooms = useMyRooms();
  const rows: Row[] = useMemo(() => rooms.map((r) => ({ ...r, tone: departments.findIndex((d) => d.id === r.course.dept) })), [rooms]);

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

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band id="intro" n={1} label="রুটিন" now note="ঢাকার সময়ে, শনিবার থেকে">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            আপনার ক্লাস <Turn>রুটিন</Turn>।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            প্রতি কোর্সে সপ্তাহে একটা <Num value={CLASS_MINUTES} /> মিনিটের লাইভ ক্লাস — ব্যাচের ঠিক করা দিনে, ঢাকার সময়ে।
          </p>
          {hydrated && rows.length > 0 && (
            <div data-reveal data-in className="mt-8 flex flex-wrap gap-3">
              {upcoming[0] && (
                <Link href={`/media/academy/classroom/${encodeURIComponent(upcoming[0].batch.id)}/live`} className={primaryBtn}>
                  <Radio className="size-4" aria-hidden />
                  পরের ক্লাসে যোগ দিন
                </Link>
              )}
              <button type="button" onClick={download} className={secondaryBtn}>
                <CalendarPlus className="size-4" aria-hidden />
                ফোনের ক্যালেন্ডারে নিন
              </button>
            </div>
          )}
        </div>
      </Band>

      {!hydrated ? (
        <Band id="week" n={2} label="সপ্তাহ">
          <span aria-hidden className="block h-80 animate-pulse bg-(--c-bg-sunken)" />
        </Band>
      ) : rows.length === 0 ? (
        <Band id="empty" n={2} label="রুটিন" note="ভর্তির পর">
          <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
            <span className="grid size-16 place-items-center border border-(--c-line) text-(--c-accent-ink)">
              <CalendarDays className="size-7" aria-hidden />
            </span>
            <h2 className="display mt-6 text-3xl text-(--c-ink-strong)">
              রুটিন আসে <Turn>ভর্তির</Turn> পর।
            </h2>
            <p className="mt-3 max-w-sm leading-relaxed text-(--c-muted)">কোনো কোর্সে ভর্তি হলে সেই ব্যাচের সব ক্লাস দিন-তারিখসহ এখানে বসে যাবে।</p>
            <Link href="/media/academy/courses" className={cn(primaryBtn, "mt-8")}>
              <Landmark className="size-4" aria-hidden />
              কোর্স বাছুন
            </Link>
          </div>
        </Band>
      ) : (
        <>
          <Band id="week" n={2} label="সপ্তাহ" note="শুক্রবার ছুটি">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-(--c-line)">
                    <th scope="col" className="hud w-24 px-6 py-3 text-left font-medium text-(--c-faint) md:pl-10">
                      সময়
                    </th>
                    {WEEK.map((d) => (
                      <th key={d} scope="col" className={cn("display border-l border-(--c-line) px-2 py-3 text-center text-base", d === FRIDAY ? "text-(--c-faint)" : "text-(--c-ink-strong)")}>
                        {WEEKDAYS[d].replace("বার", "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map((t) => (
                    <tr key={t} className="border-b border-(--c-line)">
                      <th scope="row" className="hud px-6 py-4 text-left align-top font-medium text-(--c-muted) md:pl-10">
                        {slotOf(0, t).split(" · ")[1]}
                      </th>
                      {WEEK.map((d) => {
                        const here = rows.filter((r) => r.batch.day === d && r.batch.time === t);
                        return (
                          <td key={d} className={cn("border-l border-(--c-line) p-1.5 align-top", d === FRIDAY && "bg-(--c-bg-sunken)")}>
                            {here.map((r) => (
                              <Link
                                key={r.batch.id}
                                href={`/media/academy/classroom/${encodeURIComponent(r.batch.id)}`}
                                style={toneStyle(r.tone)}
                                className="tone group block border-l-4 border-(--c-app) bg-(--c-bg-raised) px-2.5 py-2 transition-colors duration-150 hover:bg-(--c-app) hover:text-black"
                              >
                                <span className="block text-xs leading-snug font-bold text-(--c-ink-strong) group-hover:text-black">{r.course.title.split(" — ")[0]}</span>
                                <span className="hud mt-0.5 block text-(--c-app-ink) group-hover:text-black">
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
          </Band>

          <Band id="next" n={3} label="সামনের ক্লাস" note="প্রথমটা লাইভে যোগ দেওয়ার">
            {upcoming.length === 0 ? (
              <p className="px-6 py-10 text-(--c-muted) md:px-10">ক্লাসের সপ্তাহগুলো শেষ — এখন প্রজেক্ট আর প্যানেলের সময়।</p>
            ) : (
              <ol>
                {upcoming.slice(0, 6).map((s, i) => (
                  <li key={`${s.batch.id}-${s.week}`} data-reveal style={toneStyle(s.tone)} className={cn("tone flex items-center gap-5 border-b border-(--c-line) px-6 py-5 last:border-b-0 md:px-10", i === 0 && "bg-(--c-bg-raised)")}>
                    <span className="display grid w-20 shrink-0 place-items-center bg-(--c-app) py-2.5 text-center text-sm text-black">
                      <DateText iso={s.at} weekday />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="hud block text-(--c-app-ink)">
                        সপ্তাহ <Num value={s.week} /> · <DateText iso={s.at} time />
                      </span>
                      <span className="display mt-0.5 block truncate text-lg text-(--c-ink-strong)">{s.lesson?.title}</span>
                      <span className="block truncate text-sm text-(--c-muted)">{s.course.title}</span>
                    </span>
                    <Link href={`/media/academy/classroom/${encodeURIComponent(s.batch.id)}${i === 0 ? "/live" : ""}`} className={cn(i === 0 ? primaryBtn : secondaryBtn, "h-11 shrink-0 px-4")}>
                      {i === 0 ? <Radio className="size-4" aria-hidden /> : <DoorOpen className="size-4" aria-hidden />}
                      <span className="hidden sm:inline">{i === 0 ? "লাইভে যোগ দিন" : "ক্লাসরুম"}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Band>

          <Band id="span" n={4} label="চল্লিশ দিন" note="ক্লাস, প্যানেল, শেষ">
            <ul data-reveal-group className="grid gap-px bg-(--c-line) md:grid-cols-2">
              {rows.map((r) => {
                const t = courseTimeline(r.batch.starts);
                return (
                  <li key={r.batch.id} data-reveal style={toneStyle(r.tone)} className="tone bg-(--c-bg) p-6 md:p-8">
                    <p className="display text-xl text-(--c-ink-strong)">{r.course.title.split(" — ")[0]}</p>
                    <p className="hud mt-1 text-(--c-faint)">
                      ব্যাচ <Num value={r.batch.n} /> · {slotOf(r.batch.day, r.batch.time)}
                    </p>
                    <div className="mt-5 flex gap-px" aria-hidden>
                      {t.weeks.map((w) => (
                        <span key={w.week} className="h-2 flex-1 bg-(--c-app)" />
                      ))}
                      <span className="h-2 w-10 bg-(--c-signal)" />
                    </div>
                    <p className="hud mt-3 flex justify-between text-(--c-faint)">
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
              {rows.length % 2 === 1 && <li aria-hidden className="hidden bg-(--c-bg) md:block" />}
            </ul>
          </Band>
        </>
      )}

      <CatalogueFooter />
    </CatalogueRoot>
  );
}
