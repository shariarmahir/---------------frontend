"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { Award, BookOpen, Building2, CalendarDays, Check, ClipboardCheck, DoorOpen, Landmark, Search, Ticket, type LucideIcon } from "lucide-react";
import { getAcademy, getCourse, getDepartment } from "@/data/media/academy";
import { PHASES, STEPS, doneSteps, frontierOf, stepOfPath, type Phase, type StepId } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { useRecentAcademies, useRecentCourses, useRecentDepts } from "../departments/recent";
import { useAcademy } from "../use-academy";

export const STEP_ICON: Record<StepId, LucideIcon> = {
  find: Search,
  academy: Landmark,
  dept: Building2,
  course: BookOpen,
  admit: Ticket,
  routine: CalendarDays,
  class: DoorOpen,
  exam: ClipboardCheck,
  graduate: Award,
};

/**
 * Where the learner is on the university road: the step this page is, the
 * steps already behind them (from their own enrolments), and where each
 * step leads — every department side by side, and the academy and course
 * they last looked at or joined, so "back to my course" is always one tap.
 */
export function useJourney() {
  const hydrated = useHydrated();
  const path = usePathname();
  const enrolled = useAcademy((a) => a.enrolled);
  const recentAcademy = useRecentAcademies()[0];
  const recentDept = useRecentDepts()[0];
  const recentCourse = useRecentCourses()[0];

  return useMemo(() => {
    const here = stepOfPath(path);
    const frontier = hydrated ? frontierOf(Object.values(enrolled)) : "find";
    const done = doneSteps(frontier);
    // A course the learner joined beats one they only looked at.
    const joined = Object.keys(enrolled).map((id) => getCourse(id)).find(Boolean);
    const course = hydrated ? (joined ?? recentCourse) : undefined;
    const dept = (course && getDepartment(course.dept)) ?? (hydrated ? recentDept : undefined);
    const academy = (dept && getAcademy(dept.academy.id)) ?? (hydrated ? recentAcademy : undefined);
    const href: Record<StepId, string | null> = {
      find: "/media/academy",
      academy: academy ? `/media/academy/a/${academy.id}` : null,
      // Choosing a department means seeing them all side by side.
      dept: "/media/academy/departments",
      // Choosing a course too: every course of every academy, by level.
      course: "/media/academy/courses",
      admit: "/media/academy/checkout",
      routine: "/media/academy/routine",
      class: "/media/academy/classroom",
      exam: "/media/academy/exam",
      graduate: "/media/academy/graduation",
    };
    const sub: Partial<Record<StepId, string>> = { academy: academy?.name, dept: dept?.name, course: course?.title.split(" — ")[0] };
    return { here, frontier, done, href, sub };
  }, [hydrated, path, enrolled, recentAcademy, recentDept, recentCourse]);
}

const PHASE_ORDER: Phase[] = ["choose", "admit", "study"];

/**
 * The sidebar as the road itself: three phases, nine numbered steps, a tick
 * on every step behind you, the step you are on lit, and under the first
 * four the academy, department and course you are looking at.
 */
export function JourneyNav() {
  const j = useJourney();
  return (
    <nav aria-label="আপনার যাত্রা" className="mb-6">
      <p className="mb-3 px-3 text-xs font-bold text-m-blue">আপনার যাত্রা</p>
      <ol className="relative space-y-4">
        {PHASE_ORDER.map((phase) => (
          <li key={phase}>
            <p className="mb-1.5 px-3 text-[11px] font-bold tracking-wide text-m-ink/45">{PHASES[phase]}</p>
            <ol className="relative">
              {/* The thread that joins the steps. */}
              <span aria-hidden className="absolute top-4 bottom-4 left-[1.6rem] w-px bg-m-ink/10" />
              {STEPS.filter((s) => s.phase === phase).map((s) => {
                const on = j.here === s.id;
                const done = j.done.has(s.id);
                const next = j.frontier === s.id;
                const href = j.href[s.id];
                const Icon = STEP_ICON[s.id];
                const body = (
                  <>
                    <span
                      className={cn(
                        "relative z-10 grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ring-2 transition-colors",
                        on ? "bg-m-blue text-m-on ring-m-blue-soft" : done ? "bg-m-green text-m-on ring-white" : next ? "bg-m-yellow text-m-ink ring-white" : "bg-white text-m-ink/60 ring-m-ink/10",
                      )}
                    >
                      {done && !on ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <Num value={s.n} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[14px] leading-tight font-semibold">
                        <Icon className={cn("size-3.5 shrink-0", on ? "text-m-blue" : "text-m-ink/45")} aria-hidden />
                        {s.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-m-ink/50">{j.sub[s.id] ?? s.hint}</span>
                    </span>
                    {next && !on && <span className="shrink-0 rounded-full bg-m-amber-soft px-1.5 py-0.5 text-[10px] font-bold text-m-gold">এখন</span>}
                  </>
                );
                const cls = cn("group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors", on ? "bg-m-blue-soft text-m-ink" : href ? "text-m-ink/80 hover:bg-m-ink/4 hover:text-m-ink" : "cursor-default text-m-ink/45");
                return (
                  <li key={s.id}>
                    {href ? (
                      <Link href={href} aria-current={on ? "step" : undefined} className={cls}>
                        {body}
                      </Link>
                    ) : (
                      <span className={cls} title="আগে একাডেমি খুঁজে নিন">
                        {body}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * The same road as a slim strip under the header, for phones and when the
 * sidebar is hidden: the nine steps as pills, the current one scrolled into
 * view, a thin bar showing how far along you are.
 */
export function JourneyBar({ className }: { className?: string }) {
  const j = useJourney();
  const strip = useRef<HTMLOListElement>(null);
  const at = STEPS.findIndex((s) => s.id === (j.here ?? j.frontier));

  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>("[data-on='true']");
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [j.here]);

  if (!j.here) return null;
  const progress = ((STEPS.findIndex((s) => s.id === j.frontier) + 0.5) / STEPS.length) * 100;

  return (
    <nav aria-label="আপনার যাত্রা" className={cn("relative shrink-0 border-b border-m-ink/6 bg-white/80 backdrop-blur-md", className)}>
      <ol ref={strip} className="flex items-center gap-1 overflow-x-auto px-3 py-2 scrollbar-none sm:px-4">
        {STEPS.map((s, i) => {
          const on = j.here === s.id;
          const done = j.done.has(s.id);
          const href = j.href[s.id];
          const pill = cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full pr-3 pl-1 text-xs font-semibold transition-colors",
            on ? "bg-m-blue text-m-on shadow-m-tile" : done ? "text-m-green hover:bg-m-green-soft" : "text-m-ink/60 hover:bg-m-ink/5",
          );
          const dot = <span className={cn("grid size-6 place-items-center rounded-full text-[10px] font-bold", on ? "bg-white/20" : done ? "bg-m-green-soft" : "bg-m-ink/6")}>{done && !on ? <Check className="size-3" strokeWidth={3} aria-hidden /> : <Num value={s.n} />}</span>;
          return (
            <li key={s.id} data-on={on} className="flex shrink-0 items-center">
              {i > 0 && <span aria-hidden className={cn("mx-0.5 h-px w-3 sm:w-4", i <= at ? "bg-m-blue/40" : "bg-m-ink/10")} />}
              {href ? (
                <Link href={href} aria-current={on ? "step" : undefined} className={pill}>
                  {dot}
                  {s.label}
                </Link>
              ) : (
                <span className={pill}>
                  {dot}
                  {s.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <span aria-hidden className="absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-m-blue to-m-yellow transition-[width] duration-700" style={{ width: `${progress}%` }} />
    </nav>
  );
}
