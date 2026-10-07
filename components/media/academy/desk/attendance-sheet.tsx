"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import { rosterOf } from "@/data/media/academy";
import { MIN_ATTENDANCE, attendanceOf, payoutOf, type Course } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num, useFormat } from "../../ui/numerals";
import { ModeTag } from "../parts";
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
                    "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors",
                    on ? "border-m-blue bg-m-yellow text-m-ink" : held[l.week] ? "border-m-green/50 text-m-green" : "border-m-ink/10 text-m-ink/80 hover:border-m-ink/26",
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

      <div className="rounded-2xl bg-m-card ring-1 ring-m-ink/10 shadow-m-tile">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-m-ink/9 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-m-blue">সপ্তাহ <Num value={week} />{saved && " · জমা হয়েছে"}</p>
            <h3 className="text-lg font-bold text-m-ink">{lesson.title}</h3>
            <ModeTag mode={lesson.mode} className="mt-1" />
          </div>
          <p className="text-right text-sm text-m-ink/80">
            <span className="block text-2xl font-bold text-m-ink tabular-nums"><Num value={present.size} /> / <Num value={roster.length} /></span>
            উপস্থিত
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-m-ink/9 p-3 sm:px-5">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">নাম খুঁজুন</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-m-ink/60" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="নাম খুঁজুন" className="h-10 w-full rounded-lg border border-m-ink/10 bg-m-canvas pr-3 pl-9 text-sm focus-visible:border-m-blue focus-visible:outline-none" />
          </label>
          <button type="button" onClick={() => setPresent(new Set(roster.map((s) => s.id)))} className={mediaButton({ variant: "quiet", size: "sm" })}>সবাই উপস্থিত</button>
          <button type="button" onClick={() => setPresent(new Set())} className={mediaButton({ variant: "ghost", size: "sm" })}>সব মুছুন</button>
        </div>

        <ul className="max-h-[28rem] divide-y divide-m-ink/7 overflow-y-auto scrollbar-gold">
          {shown.map((s) => {
            const on = present.has(s.id);
            const rec = attendanceOf(held, s.id);
            const risk = rec.held >= 2 && rec.rate < MIN_ATTENDANCE;
            return (
              <li key={s.id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-m-ink/3 sm:px-5">
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(s.id)} />
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg border-2 transition-colors", on ? "border-m-green bg-m-green-soft text-m-ink" : "border-m-ink/21")} aria-hidden>
                    {on && <Check className="size-4" strokeWidth={3} />}
                  </span>
                  <span className="w-7 shrink-0 text-xs text-m-ink/55 tabular-nums"><Num value={position.get(s.id) ?? 0} /></span>
                  <span className="min-w-0 flex-1 truncate text-[15px] text-m-ink">{s.name}</span>
                  {rec.held > 0 && (
                    <span className={cn("shrink-0 text-xs font-semibold tabular-nums", risk ? "text-m-blue" : "text-m-ink/65")}>
                      {risk && "ঝুঁকিতে · "}
                      <Num value={Math.round(rec.rate * 100)} />%
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-m-ink/9 p-4 sm:px-5">
          <p className="text-xs text-m-ink/65">হাজিরা <Num value={Math.round(MIN_ATTENDANCE * 100)} />%-এর নিচে নামলে শিক্ষার্থী ফাইনালে বসতে পারে না — ঝুঁকিতে থাকা কাউকে আগে একটা বার্তা দিন।</p>
          <button type="button" onClick={save} className={mediaButton({ variant: "primary" })}>
            {saved ? "হাজিরা হালনাগাদ করুন" : "হাজিরা জমা দিন"}
          </button>
        </div>
      </div>
    </div>
  );
}
