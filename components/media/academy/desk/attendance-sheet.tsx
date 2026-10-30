"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import { rosterOf } from "@/data/media/academy";
import { MIN_ATTENDANCE, MODES, attendanceOf, payoutOf, type Course } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Num, useFormat } from "../../ui/numerals";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { updateAcademy, useAcademy } from "../use-academy";

const EMPTY: Record<number, string[]> = {};

/**
 * Roll call for one week. Saving it records the class as held, which
 * releases that week's share of the fees from escrow to the teacher.
 */
export function AttendanceSheet({ course }: { course: Course }) {
  const { num, taka } = useFormat();
  const held = useAcademy((a) => a.attendance[course.id] ?? EMPTY);
  const roster = useMemo(() => rosterOf(course), [course]);
  const position = useMemo(() => new Map(roster.map((s, i) => [s.id, i + 1])), [roster]);
  const firstOpen = course.lessons.find((l) => !held[l.week])?.week ?? course.lessons[0].week;
  const [week, setWeek] = useState(firstOpen);
  const [present, setPresent] = useState<Set<string>>(() => new Set(held[firstOpen] ?? []));
  const [q, setQ] = useState("");
  const lesson = course.lessons.find((l) => l.week === week)!;
  const saved = Boolean(held[week]);
  const shown = q.trim() ? roster.filter((s) => s.name.includes(q.trim())) : roster;

  function pick(w: number) {
    setWeek(w);
    setPresent(new Set(held[w] ?? []));
  }

  function toggle(id: string) {
    setPresent((p) => {
      const next = new Set(p);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    const ids = roster.filter((s) => present.has(s.id)).map((s) => s.id);
    updateAcademy((a) => ({ ...a, attendance: { ...a.attendance, [course.id]: { ...a.attendance[course.id], [week]: ids } } }));
    const share = course.fee > 0 && !saved ? payoutOf(course, 1).released : 0;
    toast.success(`সপ্তাহ ${num(week)}-এর হাজিরা জমা — ${num(ids.length)} জন উপস্থিত`, {
      description: share ? `ক্লাস হয়েছে: ${taka(share)} এসক্রো থেকে আপনার কাছে ছাড় পেল।` : "ক্লাসের রেকর্ড শিক্ষার্থীদের অগ্রগতিতে যোগ হলো।",
    });
    const next = course.lessons.find((l) => l.week > week && !held[l.week]);
    if (next) pick(next.week);
  }

  return (
    <div className="space-y-5">
      <nav aria-label="সপ্তাহ" className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2">
          {course.lessons.map((l) => {
            const on = l.week === week;
            return (
              <li key={l.week}>
                <button
                  type="button"
                  onClick={() => pick(l.week)}
                  aria-pressed={on}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 border px-3 text-sm font-semibold transition-colors duration-150",
                    on ? "border-transparent bg-(--c-signal) text-black" : held[l.week] ? "border-(--c-good) text-(--c-good)" : "border-(--c-line) text-(--c-ink) hover:border-(--c-line-strong)",
                  )}
                >
                  {held[l.week] && <Check className="size-4" aria-label="হয়েছে" />}
                  সপ্তাহ <Num value={l.week} />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border border-(--c-line) bg-(--c-bg)">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-(--c-line) p-4 sm:p-5">
          <div className="min-w-0">
            <p className="hud text-(--c-accent-ink)">
              সপ্তাহ <Num value={week} />
              {saved && " · জমা হয়েছে"}
            </p>
            <h3 className="display mt-1 text-lg text-(--c-ink-strong)">{lesson.title}</h3>
            <p className="hud mt-1 text-(--c-faint)">{MODES[lesson.mode]}</p>
          </div>
          <p className="text-right text-sm text-(--c-ink)">
            <span className="display block text-3xl text-(--c-ink-strong) tabular-nums">
              <Num value={present.size} /> / <Num value={roster.length} />
            </span>
            উপস্থিত
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-(--c-line) p-3 sm:px-5">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">নাম খুঁজুন</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--c-muted)" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="নাম খুঁজুন"
              className="h-10 w-full border border-(--c-line-strong) bg-(--c-bg-sunken) pr-3 pl-9 text-sm text-(--c-ink-strong) placeholder:text-(--c-faint) focus-visible:border-(--c-signal) focus-visible:outline-none"
            />
          </label>
          <button type="button" onClick={() => setPresent(new Set(roster.map((s) => s.id)))} className={cn(secondaryBtn, "h-10 px-4")}>
            সবাই উপস্থিত
          </button>
          <button type="button" onClick={() => setPresent(new Set())} className="hud h-10 px-3 font-bold text-(--c-muted) underline-offset-4 hover:text-(--c-ink-strong) hover:underline">
            সব মুছুন
          </button>
        </div>

        <ul className="max-h-[28rem] divide-y divide-(--c-line) overflow-y-auto scrollbar-gold">
          {shown.map((s) => {
            const on = present.has(s.id);
            const rec = attendanceOf(held, s.id);
            const risk = rec.held >= 2 && rec.rate < MIN_ATTENDANCE;
            return (
              <li key={s.id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-(--c-bg-raised) sm:px-5">
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(s.id)} />
                  <span className={cn("grid size-7 shrink-0 place-items-center border-2 transition-colors", on ? "border-(--c-good) bg-(--c-good) text-black" : "border-(--c-line-strong)")} aria-hidden>
                    {on && <Check className="size-4" strokeWidth={3} />}
                  </span>
                  <span className="w-7 shrink-0 text-xs text-(--c-faint) tabular-nums">
                    <Num value={position.get(s.id) ?? 0} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] text-(--c-ink-strong)">{s.name}</span>
                  {rec.held > 0 && (
                    <span className={cn("shrink-0 text-xs font-semibold tabular-nums", risk ? "text-(--c-accent-ink)" : "text-(--c-muted)")}>
                      {risk && "ঝুঁকিতে · "}
                      <Num value={Math.round(rec.rate * 100)} />%
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--c-line) p-4 sm:px-5">
          <p className="text-xs text-(--c-muted)">
            হাজিরা <Num value={Math.round(MIN_ATTENDANCE * 100)} />
            %-এর নিচে নামলে শিক্ষার্থী ফাইনালে বসতে পারে না — ঝুঁকিতে থাকা কাউকে আগে একটা বার্তা দিন।
          </p>
          <button type="button" onClick={save} className={primaryBtn}>
            {saved ? "হাজিরা হালনাগাদ করুন" : "হাজিরা জমা দিন"}
          </button>
        </div>
      </div>
    </div>
  );
}
