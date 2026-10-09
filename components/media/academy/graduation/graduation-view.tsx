"use client";

import Link from "next/link";
import { ArrowRight, Award, Check, Flag, GraduationCap, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { board, getCourse, getDepartment } from "@/data/media/academy";
import { MIN_ATTENDANCE, MIN_HOMEWORK, progressOf, type Course, type Enrollment } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { DateText, Num } from "../../ui/numerals";
import { useAcademy } from "../use-academy";

const pct = (n: number) => Math.round(n * 100);
const mean = (m: number[]) => Math.round(m.reduce((a, b) => a + b, 0) / m.length);

/**
 * সমাবর্তন — the gown and the cap. For each course the learner is in, the
 * five things between them and graduating, ticked as they happen, with the
 * goal they wrote at the start; then the graduates wall from the public
 * board, the way a convocation reads out its names.
 */
export function GraduationView() {
  const hydrated = useHydrated();
  const enrolled = useAcademy((a) => a.enrolled);
  const dreams = useAcademy((a) => a.dreams);
  const mine = Object.entries(enrolled).flatMap(([id, e]) => {
    const c = getCourse(id);
    return c ? [{ course: c, e }] : [];
  });
  const wall = board.filter((s) => s.certificate && s.marks).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="pb-16">
      <section aria-labelledby="grad-title" className="blue-band relative -mx-3 -mt-6 overflow-hidden sm:-mx-6">
        <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-m-yellow/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <span className="mx-auto grid size-20 place-items-center rounded-[1.6rem] bg-m-yellow text-m-ink shadow-m-lift">
            <GraduationCap className="size-10" aria-hidden />
          </span>
          <p className="mt-5 text-sm font-bold text-m-yellow">ধাপ ৯ · সমাবর্তন</p>
          <h1 id="grad-title" className="mt-1 text-[clamp(2rem,4.4vw,3.2rem)] leading-tight font-bold text-balance">
            গাউন-টুপির দিন — নাম উঠবে প্রকাশ্য বোর্ডে
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-white/85">হাজিরা, হোমওয়ার্ক, নিজের প্রজেক্ট আর প্যানেল — পাঁচটা ঘর পূরণ হলেই যাচাইযোগ্য সনদ। কোথায় আছেন, নিচে দেখুন।</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl">
        {!hydrated ? (
          <Skeleton className="mt-10 h-72 rounded-3xl bg-m-ink/6" />
        ) : mine.length === 0 ? (
          <section className="mt-10 grid place-items-center rounded-3xl bg-white px-6 py-14 text-center shadow-m-tile ring-1 ring-m-ink/8">
            <h2 className="text-xl font-bold text-m-ink">সমাবর্তনের পথ শুরু হয় ভর্তি দিয়ে</h2>
            <p className="mt-1 max-w-sm text-[15px] text-m-ink/70">একটা একাডেমি বেছে কোর্সে ভর্তি হলে এখানে আপনার পাঁচটা ঘর দেখা যাবে।</p>
            <Link href="/media/academy" className={mediaButton({ className: "mt-6" })}>
              একাডেমি খুঁজুন <ArrowRight aria-hidden />
            </Link>
          </section>
        ) : (
          <ul className="mt-10 space-y-6">
            {mine.map(({ course, e }) => (
              <li key={course.id}>
                <Road course={course} e={e} dream={dreams?.[getDepartment(course.dept)?.academy.id ?? ""]?.line} />
              </li>
            ))}
          </ul>
        )}

        <section aria-labelledby="wall-title" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-m-blue">গ্র্যাজুয়েটদের দেয়াল</p>
              <h2 id="wall-title" className="mt-1 text-2xl font-bold text-m-ink">
                যাঁরা সম্প্রতি সনদ পেলেন
              </h2>
            </div>
            <Link href="/media/academy/exam#board" className="inline-flex items-center gap-1.5 font-semibold text-m-blue hover:underline">
              প্রকাশ্য বোর্ড <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {wall.map((s) => {
              const c = getCourse(s.course);
              return (
                <li key={s.id} className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-m-tile ring-1 ring-m-ink/7">
                  <Medal aria-hidden className="absolute -top-2 -right-2 size-24 text-m-yellow/20" />
                  <p className="text-xs font-semibold text-m-ink/55">
                    {s.district} · <DateText iso={s.at} />
                  </p>
                  <p className="mt-1 text-lg font-bold text-m-ink">{s.learner}</p>
                  <p className="text-sm text-m-blue">{c?.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-m-ink/70">{s.project}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-m-amber-soft px-2.5 py-1 font-bold text-m-gold">
                      গড় নম্বর <Num value={mean(s.marks!)} />
                    </span>
                    <span className="font-mono text-m-ink/60">{s.certificate}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

/** One course's road to graduation: five boxes, ticked as they fill. */
function Road({ course, e, dream }: { course: Course; e: Enrollment; dream?: string }) {
  const p = progressOf(course, e);
  const att = p.attended / course.lessons.length;
  const hw = p.homeworkSet ? p.homeworkDone / p.homeworkSet : 1;
  const boxes = [
    { done: att >= MIN_ATTENDANCE, title: "হাজিরা", body: <><Num value={pct(att)} />% / লক্ষ্য <Num value={pct(MIN_ATTENDANCE)} />%</>, href: `/media/academy/classroom/${encodeURIComponent(e.batch ?? course.id)}` },
    { done: hw >= MIN_HOMEWORK, title: "হোমওয়ার্ক", body: <><Num value={pct(hw)} />% / লক্ষ্য <Num value={pct(MIN_HOMEWORK)} />%</>, href: `/media/academy/classroom/${encodeURIComponent(e.batch ?? course.id)}` },
    { done: Boolean(e.project), title: "প্রজেক্ট", body: e.project ? e.project.title : "শেষ পাঁচ দিনে জমা", href: `/media/academy/course/${course.id}#curriculum` },
    { done: Boolean(e.interview), title: "প্যানেল", body: e.interview ? <DateText iso={e.interview} time /> : "প্রজেক্টের পর সময় বাছুন", href: `/media/academy/course/${course.id}#curriculum` },
    { done: false, title: "সনদ", body: "প্যানেলের ফলের পর", href: "/media/academy/exam" },
  ];
  const filled = boxes.filter((b) => b.done).length;

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-m-tile ring-1 ring-m-ink/8">
      <div className="flex flex-wrap items-center gap-4 border-b border-m-ink/6 p-5 sm:p-6">
        <span className="relative grid size-16 shrink-0 place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15.5" className="fill-none stroke-m-ink/8" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.5" className="fill-none stroke-m-blue transition-[stroke-dashoffset] duration-700" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={97.4} strokeDashoffset={97.4 * (1 - filled / boxes.length)} />
          </svg>
          <span className="text-sm font-bold text-m-ink">
            <Num value={filled} />/<Num value={boxes.length} />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-m-blue">{getDepartment(course.dept)?.academy.name}</p>
          <h2 className="text-lg font-bold text-m-ink">{course.title}</h2>
          {dream && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-m-ink/75">
              <Flag className="mt-0.5 size-4 shrink-0 text-m-gold" aria-hidden /> আপনার লক্ষ্য: “{dream}”
            </p>
          )}
        </div>
      </div>
      <ol className="grid divide-y divide-m-ink/6 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        {boxes.map((b, i) => (
          <li key={b.title}>
            <Link href={b.href} className="group flex h-full gap-3 p-4 hover:bg-m-ground/60 sm:flex-col">
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold", b.done ? "bg-m-green text-m-on" : i === filled ? "bg-m-yellow text-m-ink" : "bg-m-ink/6 text-m-ink/55")}>
                {b.done ? <Check className="size-4.5" strokeWidth={3} aria-label="হয়েছে" /> : i === boxes.length - 1 ? <Award className="size-4.5" aria-hidden /> : <Num value={i + 1} />}
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-m-ink group-hover:text-m-blue">{b.title}</span>
                <span className="block text-xs leading-relaxed text-m-ink/60">{b.body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
