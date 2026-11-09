"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Course } from "@/lib/media/academy";
import type { Batch } from "@/lib/media/batch";
import type { PlanNode } from "@/lib/media/plan";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Tx } from "../../ui/language";
import { Num } from "../../ui/numerals";
import { updateAcademy, useAcademy } from "../use-academy";

const NONE: PlanNode[] = [];
const WEEK_R = 210;
const PLAN_R = 360;
const point = (r: number, a: number) => ({ x: Math.round(r * Math.cos(a)), y: Math.round(r * Math.sin(a)) });

/** A short label that never cuts a Bangla letter in half. */
function short(text: string, max: number): string {
  const g = [...new Intl.Segmenter("bn", { granularity: "grapheme" }).segment(text)].map((s) => s.segment);
  return g.length > max ? `${g.slice(0, max - 1).join("")}…` : text;
}

/**
 * The course as a living map: its name in the middle, one node per week around
 * it coloured by where you stand, and your own plan hung beyond each week.
 * Signals run along the links; click a week to open its lesson.
 */
export function MindMap({
  batch,
  course,
  current,
  done,
  onOpenWeek,
}: {
  batch: Batch;
  course: Course;
  current: number;
  done: (week: number) => boolean;
  onOpenWeek: (week: number) => void;
}) {
  const plan = useAcademy((a) => a.plans?.[batch.id] ?? NONE);
  const [text, setText] = useState("");
  const [week, setWeek] = useState(Math.min(Math.max(current, 1), course.lessons.length));
  const lessons = course.lessons;
  const at = (i: number) => -Math.PI / 2 + (i / lessons.length) * Math.PI * 2;
  const save = (fn: (list: PlanNode[]) => PlanNode[]) => updateAcademy((a) => ({ ...a, plans: { ...a.plans, [batch.id]: fn(a.plans?.[batch.id] ?? []) } }));

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 3) return toast.error("পরিকল্পনাটা এক লাইনে লিখুন");
    save((list) => [...list, { id: newId("pn"), text: text.trim(), week }]);
    setText("");
  }

  const tone = (w: number) => (done(w) ? "var(--c-good)" : w === current ? "var(--c-signal)" : w < current ? "var(--c-bad)" : "var(--c-line-strong)");

  return (
    <div className="space-y-5 p-4 md:p-6">
      <header>
        <h2 className="display text-3xl text-(--c-ink-strong)">
          <Tx k="মাইন্ড ম্যাপ" />
        </h2>
        <p className="mt-1 text-(--c-muted)">
          <Tx k="কোর্সের সপ্তাহগুলো আর আপনার নিজের পরিকল্পনা এক ম্যাপে। সপ্তাহে চাপ দিলে পাঠ খুলবে।" />
        </p>
      </header>

      <div className="overflow-x-auto rounded-3xl bg-(--c-bg-raised) ring-1 ring-(--c-line)">
        <svg viewBox="-460 -460 920 920" role="img" aria-label={course.title} className="mx-auto block max-h-[44rem] min-w-[36rem] w-full">
          {lessons.map((l, i) => {
            const p = point(WEEK_R, at(i));
            return (
              <path
                key={`l${l.week}`}
                d={`M0 0 L${p.x} ${p.y}`}
                pathLength={1}
                stroke={tone(l.week)}
                strokeWidth={2}
                fill="none"
                className="mind-link"
                style={{ animationDelay: `${i * 0.08}s` }}
              ></path>
            );
          })}
          {plan.map((n) => {
            const i = lessons.findIndex((l) => l.week === n.week);
            const sibs = plan.filter((x) => x.week === n.week);
            const k = sibs.findIndex((x) => x.id === n.id);
            const a = at(Math.max(i, 0)) + (k - (sibs.length - 1) / 2) * 0.28;
            const from = point(WEEK_R, at(Math.max(i, 0)));
            const to = point(PLAN_R, a);
            return (
              <g key={n.id}>
                <path d={`M${from.x} ${from.y} L${to.x} ${to.y}`} pathLength={1} stroke="var(--c-accent-ink)" strokeWidth={1.5} strokeDasharray="4 6" fill="none" opacity={0.7} />
                <circle r={4} fill="var(--c-signal)" className="mind-pulse">
                  <animateMotion dur={`${3 + (k % 3)}s`} repeatCount="indefinite" path={`M${from.x} ${from.y} L${to.x} ${to.y}`} />
                </circle>
              </g>
            );
          })}
          {lessons.map((l, i) => {
            const p = point(WEEK_R, at(i));
            return (
              <circle key={`s${l.week}`} r={4} fill={tone(l.week)} className="mind-pulse">
                <animateMotion dur={`${2.4 + (i % 4) * 0.5}s`} repeatCount="indefinite" path={`M0 0 L${p.x} ${p.y}`} />
              </circle>
            );
          })}

          <g className="mind-breathe">
            <circle r={78} fill="var(--c-blue)" />
            <foreignObject x={-70} y={-48} width={140} height={96}>
              <p className="grid h-full place-items-center text-center text-[15px] leading-tight font-extrabold text-(--c-signal)">{short(course.title, 28)}</p>
            </foreignObject>
          </g>

          {lessons.map((l, i) => {
            const p = point(WEEK_R, at(i));
            return (
              <g key={`n${l.week}`} transform={`translate(${p.x} ${p.y})`} onClick={() => onOpenWeek(l.week)} className="mind-node cursor-pointer">
                <circle r={46} fill={tone(l.week)} opacity={0.95} />
                <text y={-6} textAnchor="middle" className="fill-black text-[13px] font-extrabold">
                  <Tx k="সপ্তাহ {0}" v={[l.week]} />
                </text>
                <text y={12} textAnchor="middle" className="fill-black text-[11px] font-semibold">
                  {short(l.title, 9)}
                </text>
              </g>
            );
          })}

          {plan.map((n) => {
            const i = lessons.findIndex((l) => l.week === n.week);
            const sibs = plan.filter((x) => x.week === n.week);
            const k = sibs.findIndex((x) => x.id === n.id);
            const p = point(PLAN_R, at(Math.max(i, 0)) + (k - (sibs.length - 1) / 2) * 0.28);
            return (
              <g
                key={`p${n.id}`}
                transform={`translate(${p.x} ${p.y})`}
                onClick={() => save((list) => list.map((x) => (x.id === n.id ? { ...x, done: !x.done } : x)))}
                className="mind-node cursor-pointer"
              >
                <rect x={-58} y={-17} width={116} height={34} rx={17} fill={n.done ? "var(--c-good)" : "var(--c-bg-sunken)"} stroke="var(--c-accent-ink)" strokeWidth={1.5} />
                <text textAnchor="middle" y={5} className={cn("text-[12px] font-bold", n.done ? "fill-black" : "fill-(--c-ink-strong)")}>
                  {short(n.text, 14)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <form onSubmit={add} className="grid grid-cols-1 gap-3 rounded-3xl bg-(--c-bg-raised) p-5 ring-1 ring-(--c-line) md:grid-cols-[10rem_minmax(0,1fr)_auto]">
        <label className="block">
          <span className="hud text-(--c-faint)">
            <Tx k="কোন সপ্তাহে" />
          </span>
          <select value={week} onChange={(e) => setWeek(Number(e.target.value))} className="h-10 w-full border border-(--c-line-strong) bg-(--c-bg-sunken) px-3 text-(--c-ink-strong)">
            {lessons.map((l) => (
              <option key={l.week} value={l.week}>
                {l.week}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="hud text-(--c-faint)">
            <Tx k="আমার পরিকল্পনা" />
          </span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={60}
            className="h-10 w-full border border-(--c-line-strong) bg-(--c-bg-sunken) px-3 text-(--c-ink-strong) focus:border-(--c-signal) focus:outline-none"
          />
        </label>
        <button type="submit" className="mt-auto inline-flex h-10 items-center gap-2 bg-(--c-signal) px-5 font-bold text-black hover:opacity-85">
          <Plus className="size-4" aria-hidden /> <Tx k="যোগ করুন" />
        </button>
      </form>

      {plan.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {plan.map((n) => (
            <li key={n.id} className="flex items-center gap-3 rounded-xl bg-(--c-bg-raised) px-4 py-2.5 ring-1 ring-(--c-line)">
              <button
                type="button"
                onClick={() => save((list) => list.map((x) => (x.id === n.id ? { ...x, done: !x.done } : x)))}
                aria-label={n.done ? "অসম্পূর্ণ করুন" : "হয়ে গেছে"}
                className={cn("grid size-6 shrink-0 place-items-center rounded-full border", n.done ? "border-transparent bg-(--c-good) text-black" : "border-(--c-line-strong)")}
              >
                {n.done && <Check className="size-3.5" aria-hidden />}
              </button>
              <span className={cn("min-w-0 flex-1 truncate", n.done && "text-(--c-faint) line-through")}>{n.text}</span>
              <span className="hud shrink-0 text-(--c-faint)">
                <Tx k="সপ্তাহ {0}" v={[<Num key="n" value={n.week} />]} />
              </span>
              <button type="button" onClick={() => save((list) => list.filter((x) => x.id !== n.id))} aria-label="মুছুন" className="text-(--c-muted) hover:text-(--c-bad)">
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
