"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Calculator, ChartLine, Check, CircleHelp, Crown, NotebookPen, Package, Plus, Presentation, Printer, Settings2, Shuffle, Sparkles, Trash2, Wrench, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { WEEKDAYS } from "@/lib/media/classroom";
import { newId } from "@/lib/media/store";
import {
  DUTY_NEED_MAX, bdWeekday, doneKey, loadOf, weekDates, weekNo, weekProgress, weekRota, type DayDuty, type Duty, type DutyIcon, type Rota,
} from "@/lib/media/teamwork";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num } from "../ui/numerals";

export const DUTY_ICONS: Record<DutyIcon, LucideIcon> = {
  lead: Crown,
  build: Wrench,
  calc: Calculator,
  data: ChartLine,
  print: Printer,
  tools: Package,
  note: NotebookPen,
  board: Presentation,
  question: CircleHelp,
  clean: Sparkles,
};

/** Duty colours in a fixed order, so a duty keeps its colour across days. */
const TONES = [
  { fill: "var(--color-signal-orange)", ink: "var(--color-text-primary)", chip: "bg-signal-orange text-text-primary" },
  { fill: "var(--color-bd-green)", ink: "white", chip: "bg-bd-green text-white" },
  { fill: "var(--color-bdorange-600)", ink: "var(--color-text-primary)", chip: "bg-bdorange-600 text-text-primary" },
  { fill: "white", ink: "var(--color-text-primary)", chip: "bg-white text-text-primary" },
  { fill: "var(--color-bdgreen-500)", ink: "var(--color-text-primary)", chip: "bg-bdgreen-500 text-text-primary" },
] as const;

const toneOf = (duties: Duty[], id: string) => TONES[Math.max(0, duties.findIndex((d) => d.id === id)) % TONES.length];
const firstWord = (name: string) => name.split(/\s+/)[0] ?? name;
const initial = (name: string) => Array.from(name.trim())[0] ?? "?";

/** Up to two short lines for a label inside the map. */
function lines(text: string, max = 13): string[] {
  const parts = text.includes(" · ") ? text.split(" · ") : (() => {
    const w = text.split(/\s+/);
    if (w.length < 2) return [text];
    let best = 1;
    let gap = Infinity;
    for (let i = 1; i < w.length; i++) {
      const d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length);
      if (d < gap) [gap, best] = [d, i];
    }
    return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
  })();
  return parts.slice(0, 2).map((l) => (l.length > max ? `${l.slice(0, max - 1)}…` : l));
}

export interface DutyBoardProps {
  /** Shown at the centre of the map. */
  team: string;
  members: { id: string; name: string }[];
  rota: Rota;
  /** The room id: same seed, same rota on every device. */
  seed: string;
  now: Date;
  meId?: string;
  member: boolean;
  leader: boolean;
  onChange: (fn: (r: Rota) => Rota) => boolean;
  /** The preset duties a reset goes back to. */
  defaults: Duty[];
}

export function DutyBoard({ team, members, rota, seed, now, meId, member, leader, onChange, defaults }: DutyBoardProps) {
  const today = bdWeekday(now);
  const [ahead, setAhead] = useState(0);
  const week = weekNo(now) + ahead;
  const dates = weekDates(week);
  const days = useMemo(() => weekRota(members.map((m) => m.id), rota.duties, week, `${seed}:${rota.salt}`), [members, rota.duties, rota.salt, week, seed]);
  const firstBusy = (from: number) => [...Array(7).keys()].map((i) => (from + i) % 7).find((d) => days[d].length > 0) ?? from;
  const [picked, setPicked] = useState<number | null>(null);
  const day = picked ?? firstBusy(ahead ? 0 : today);
  const [editing, setEditing] = useState(false);
  const name = (id: string) => members.find((m) => m.id === id)?.name ?? "সদস্য";
  const canTick = (d: number) => member && ahead === 0 && d <= today;
  const progress = ahead === 0 ? weekProgress(days, dates, rota.done, today) : null;
  const load = loadOf(days);

  function toggle(d: number, duty: Duty, who: string) {
    const key = doneKey(dates[d], duty.id, who);
    const was = Boolean(rota.done[key]);
    const ok = onChange((r) => {
      const done = { ...r.done };
      if (was) delete done[key];
      else done[key] = true;
      return { ...r, done };
    });
    if (ok && !was) toast.success("দায়িত্ব শেষ", { description: `${duty.title} — দলের অগ্রগতিতে যোগ হলো।` });
  }

  const mine = meId
    ? days.flatMap((list, d) => list.filter((x) => x.members.includes(meId)).map((x) => ({ d, duty: x.duty })))
    : [];

  return (
    <section aria-labelledby="duty-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="duty-title" className="text-xl font-bold text-white">দায়িত্বের পালা</h2>
          <p className="text-sm text-white/65">প্রতি শনিবার নতুন করে ভাগ হয় — কেউ এক কাজে আটকে থাকে না, সবাই সব কাজ শেখে।</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="সপ্তাহ" className="flex rounded-xl bg-text-primary p-1 ring-1 ring-white/12">
            {["এই সপ্তাহ", "পরের সপ্তাহ"].map((label, i) => (
              <button key={label} type="button" aria-pressed={ahead === i} onClick={() => { setAhead(i); setPicked(null); }} className={cn("min-h-9 rounded-lg px-3 text-sm font-bold transition-colors", ahead === i ? "bg-signal-orange text-text-primary" : "text-white/75 hover:text-white")}>
                {label}
              </button>
            ))}
          </div>
          {leader && (
            <>
              <button type="button" onClick={() => onChange((r) => ({ ...r, salt: r.salt + 1 })) && toast.success("নতুন করে ভাগ হলো", { description: "সবাইকে নতুন পালা দেখতে বলুন।" })} className={mediaButton({ variant: "quiet", size: "sm" })}>
                <Shuffle aria-hidden /> আবার শাফল
              </button>
              <button type="button" onClick={() => setEditing(true)} className={mediaButton({ variant: "outline", size: "sm" })}>
                <Settings2 aria-hidden /> দায়িত্ব সাজান
              </button>
            </>
          )}
        </div>
      </div>

      <ol className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="সপ্তাহের দিন">
        {dates.map((iso, d) => {
          const on = d === day;
          const isToday = ahead === 0 && d === today;
          const busy = days[d].length > 0;
          const mineToday = meId ? days[d].some((x) => x.members.includes(meId)) : false;
          return (
            <li key={iso}>
              <button
                type="button"
                onClick={() => setPicked(d)}
                aria-pressed={on}
                className={cn(
                  "relative flex w-full flex-col items-center rounded-xl px-1 py-2 text-center transition-[background-color,color,scale] duration-200 active:scale-95",
                  on ? "bg-signal-orange text-text-primary" : busy ? "bg-text-primary text-white ring-1 ring-white/12 hover:ring-white/30" : "bg-white/5 text-white/45",
                )}
              >
                <span className="text-xs font-bold">{WEEKDAYS[d]}</span>
                <span className="text-[11px] opacity-80"><Num value={Number(iso.slice(8))} /></span>
                <span className={cn("mt-1 rounded-full px-1.5 text-[10px] font-semibold", isToday ? (on ? "bg-text-primary text-signal-orange" : "bg-signal-orange text-text-primary") : "opacity-80")}>
                  {isToday ? "আজ" : busy ? <><Num value={days[d].length} />টি</> : "ছুটি"}
                </span>
                {mineToday && <span className={cn("absolute top-1.5 right-1.5 size-1.5 rounded-full", on ? "bg-text-primary" : "bg-signal-orange")} aria-label="আপনার দায়িত্ব আছে" />}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <div className="story-reveal overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12">
          <p className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 text-sm font-bold text-white">
            <span>টিম ম্যাপ · {WEEKDAYS[day]}বার</span>
            <span className="text-xs font-medium text-white/60"><DateText iso={dates[day]} /></span>
          </p>
          {days[day].length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-white/65">এই দিনে কোনো দায়িত্ব নেই — বিশ্রাম আর নিজে পড়ার দিন।</p>
          ) : (
            <DutyMap key={`${week}:${day}:${rota.salt}`} team={team} list={days[day]} duties={rota.duties} name={name} meId={meId} done={(dutyId, who) => Boolean(rota.done[doneKey(dates[day], dutyId, who)])} />
          )}
        </div>

        <div className="space-y-3">
          {days[day].map(({ duty, members: who }) => {
            const Icon = DUTY_ICONS[duty.icon];
            const tone = toneOf(rota.duties, duty.id);
            return (
              <article key={duty.id} className="story-reveal rounded-2xl bg-text-primary p-4 ring-1 ring-white/12">
                <h3 className="flex items-center gap-2.5 font-bold text-white">
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tone.chip)}><Icon className="size-4" aria-hidden /></span>
                  <span className="min-w-0 flex-1">{duty.title}</span>
                  <span className="text-xs font-medium text-white/55"><Num value={duty.need} /> জন</span>
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {who.map((id) => {
                    const done = Boolean(rota.done[doneKey(dates[day], duty.id, id)]);
                    const me = id === meId;
                    const tick = me && canTick(day);
                    const body = (
                      <>
                        <span className={cn("flex size-6 items-center justify-center rounded-full text-xs font-bold", done ? "bg-bd-green text-white" : me ? "bg-text-primary text-signal-orange" : "bg-white/15 text-white")}>
                          {done ? <Check className="size-3.5" aria-hidden /> : initial(name(id))}
                        </span>
                        {me ? "আপনি" : firstWord(name(id))}
                        {tick && <span className="text-[11px] font-semibold opacity-80">{done ? "· শেষ" : "· শেষ হলে চাপুন"}</span>}
                      </>
                    );
                    const cls = cn("inline-flex min-h-9 items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-sm font-semibold", me ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white ring-1 ring-white/10");
                    return (
                      <li key={id}>
                        {tick ? (
                          <button type="button" aria-pressed={done} onClick={() => toggle(day, duty, id)} className={cn(cls, "transition-[scale] duration-150 active:scale-95")}>{body}</button>
                        ) : (
                          <span className={cls}>{body}{done && <span className="sr-only">(শেষ)</span>}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
          {days[day].length === 0 && <p className="rounded-2xl bg-text-primary p-4 text-sm text-white/65 ring-1 ring-white/12">অন্য দিন বেছে নিন, অথবা লিডার দায়িত্ব সাজিয়ে এই দিনেও কাজ দিতে পারেন।</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <div className="story-reveal rounded-2xl bg-bd-green p-4 text-white sm:p-5">
          <h3 className="font-bold">{ahead ? "পরের সপ্তাহে আমার দায়িত্ব" : "এই সপ্তাহে আমার দায়িত্ব"}</h3>
          {!member || !meId ? (
            <p className="mt-2 text-sm text-white/80">যোগ দিলে আপনার নামও পালায় উঠবে।</p>
          ) : mine.length === 0 ? (
            <p className="mt-2 text-sm text-white/80">এই সপ্তাহে আপনার ভাগে কিছু পড়েনি — দলের কাউকে সাহায্য করুন।</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {mine.map(({ d, duty }) => {
                const Icon = DUTY_ICONS[duty.icon];
                const done = Boolean(rota.done[doneKey(dates[d], duty.id, meId)]);
                return (
                  <li key={`${d}:${duty.id}`} className="flex items-center gap-3 rounded-xl bg-black/20 px-3 py-2 text-sm">
                    <Icon className="size-4 shrink-0 text-signal-orange" aria-hidden />
                    <span className="w-12 shrink-0 font-bold">{WEEKDAYS[d]}</span>
                    <span className="min-w-0 flex-1 truncate">{duty.title}</span>
                    {done ? <span className="inline-flex items-center gap-1 text-xs font-bold"><Check className="size-3.5" aria-hidden /> শেষ</span> : ahead === 0 && d < today ? <span className="text-xs font-bold text-signal-orange">বাকি</span> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="story-reveal rounded-2xl bg-text-primary p-4 ring-1 ring-white/12 sm:p-5">
          <h3 className="flex items-center justify-between gap-2 font-bold text-white">
            দলের ভারসাম্য
            {progress && progress.of > 0 && (
              <span className="text-xs font-semibold text-signal-orange">এ পর্যন্ত <Num value={progress.done} />/<Num value={progress.of} /> কাজ শেষ</span>
            )}
          </h3>
          {progress && progress.of > 0 && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={progress.of} aria-valuenow={progress.done} aria-label="দলের অগ্রগতি">
              <div className="h-full rounded-full bg-signal-orange transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${(progress.done / progress.of) * 100}%` }} />
            </div>
          )}
          <ul className="mt-4 space-y-2">
            {members.map((m) => {
              const n = load.get(m.id) ?? 0;
              const max = Math.max(1, ...load.values());
              return (
                <li key={m.id} className="flex items-center gap-3 text-sm">
                  <span className={cn("w-20 shrink-0 truncate", m.id === meId ? "font-bold text-signal-orange" : "text-white/85")}>{m.id === meId ? "আপনি" : firstWord(m.name)}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full transition-[width] duration-700 motion-reduce:transition-none rounded-full bg-bdgreen-500" style={{ width: `${(n / max) * 100}%` }} />
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs text-white/65"><Num value={n} />টি</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-white/55">সবার কাজ প্রায় সমান — কারো ভাগে বড়জোর একটি বেশি।</p>
        </div>
      </div>

      {leader && <DutyEditor open={editing} onOpenChange={setEditing} duties={rota.duties} defaults={defaults} max={Math.max(1, Math.min(DUTY_NEED_MAX, members.length))} onSave={(duties) => onChange((r) => ({ ...r, duties }))} />}
    </section>
  );
}

const CX = 220;
const CY = 205;
/** The team circle's radius. */
const R = 54;

const PHONE = "(max-width: 639px)";
const usePhone = () =>
  useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(PHONE);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(PHONE).matches,
    () => false,
  );

/** On a phone the map grows downwards: team on top, duties branching off a trunk, people under each. */
function treeNodes(list: DayDuty[]) {
  let y = CY + R + 44;
  return list.map((x, i) => {
    const ls = lines(x.duty.title, 16);
    const w = Math.max(...ls.map((l) => l.length)) * 7.2 + 22;
    const h = ls.length * 15 + 14;
    const dx = CX + (i % 2 === 0 ? -58 : 58);
    const dy = y + h / 2;
    const row = (x.members.length - 1) * 54;
    // Keep each row of people inside the trunk's width.
    const mid = Math.max(CX - 150 + row / 2 + 20, Math.min(CX + 150 - row / 2 - 20, dx));
    y = dy + h / 2 + 96;
    return {
      ...x,
      ls,
      w,
      h,
      x: dx,
      y: dy,
      bend: { x: CX, y: dy },
      leaves: x.members.map((id, k) => ({ id, x: mid + (k - (x.members.length - 1) / 2) * 54, y: dy + h / 2 + 42 })),
    };
  });
}

/** Team at the centre, today's duties around it, the people on each duty at the edge. */
function DutyMap({ team, list, duties, name, meId, done }: { team: string; list: DayDuty[]; duties: Duty[]; name: (id: string) => string; meId?: string; done: (dutyId: string, who: string) => boolean }) {
  const reduce = useReducedMotion();
  const phone = usePhone();
  const n = list.length;
  const nodes = phone ? treeNodes(list) : list.map((x, i) => {
    // One or two duties lie sideways, so a quiet day stays a short, wide map.
    const a = n === 1 ? 0 : n === 2 ? i * Math.PI : -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const ls = lines(x.duty.title);
    const w = Math.max(...ls.map((l) => l.length)) * 7.2 + 22;
    const h = ls.length * 15 + 14;
    const [cos, sin] = [Math.cos(a), Math.sin(a)];
    // How far the label reaches along its branch, so nothing sits on top of it.
    const reach = Math.abs(cos) * (w / 2) + Math.abs(sin) * (h / 2);
    const dx = CX + (R + 34 + reach) * cos;
    const dy = CY + (R + 34 + reach) * sin;
    return {
      ...x,
      ls,
      w,
      h,
      x: dx,
      y: dy,
      bend: { x: (CX + dx) / 2 + 26 * Math.cos(a + Math.PI / 2), y: (CY + dy) / 2 + 26 * Math.sin(a + Math.PI / 2) },
      // People fan out across the branch, beyond the label's edge.
      leaves: x.members.map((id, k) => {
        const side = (k - (x.members.length - 1) / 2) * 54;
        return { id, x: dx + (reach + 42) * cos - side * sin, y: dy + (reach + 42) * sin + side * cos };
      }),
    };
  });
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 20 };
  const draw = (delay: number) => (reduce ? { duration: 0 } : { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const });
  const summary = list.map((x) => `${x.duty.title}: ${x.members.map(name).join(", ")}`).join("; ");
  // Crop to what is drawn: centre, duty labels and the people round them.
  const xs = [CX - R - 12, CX + R + 12, ...nodes.flatMap((d) => [d.x - d.w / 2, d.x + d.w / 2, ...d.leaves.flatMap((l) => [l.x - 34, l.x + 34])])];
  const ys = [CY - R - 12, CY + R + 12, ...nodes.flatMap((d) => [d.y - d.h / 2, d.y + d.h / 2, ...d.leaves.flatMap((l) => [l.y - 24, l.y + 38])])];
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];

  return (
    <svg viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} className={cn("mx-auto block h-auto w-full p-3", !phone && "max-h-[30rem]")} style={{ maxWidth: (x1 - x0) * 1.25 }} role="img" aria-label={`আজকের দায়িত্ব — ${summary}`}>
      {nodes.map((d, i) => {
        const tone = toneOf(duties, d.duty.id);
        const path = `M${CX},${CY} Q${d.bend.x},${d.bend.y} ${d.x},${d.y}`;
        const mine = Boolean(meId && d.members.includes(meId));
        return (
          <g key={d.duty.id}>
            <motion.path d={path} fill="none" stroke={tone.fill} strokeOpacity={0.55} strokeWidth={mine ? 3 : 2} initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={draw(0.1 + i * 0.08)} />
            {!reduce && (
              <motion.path d={path} fill="none" stroke={tone.fill} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="3 14" initial={{ strokeDashoffset: 0, opacity: 0 }} animate={{ strokeDashoffset: -34, opacity: 0.9 }} transition={{ strokeDashoffset: { duration: 1.6, repeat: Infinity, ease: "linear" }, opacity: { delay: 0.8 } }} />
            )}
            {d.leaves.map((l, k) => (
              <motion.line key={l.id} x1={d.x} y1={d.y} x2={l.x} y2={l.y} stroke="white" strokeOpacity={0.22} strokeWidth={1.5} initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={draw(0.45 + i * 0.08 + k * 0.05)} />
            ))}
          </g>
        );
      })}

      {nodes.map((d, i) =>
        d.leaves.map((l, k) => {
          const me = l.id === meId;
          const ok = done(d.duty.id, l.id);
          return (
            <motion.g key={`${d.duty.id}:${l.id}`} initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: reduce ? 0 : 0.55 + i * 0.08 + k * 0.05 }} style={{ transformOrigin: `${l.x}px ${l.y}px` }}>
              <motion.g animate={reduce ? undefined : { y: [0, -3, 0] }} transition={reduce ? undefined : { duration: 3.2 + ((i + k) % 3) * 0.6, repeat: Infinity, ease: "easeInOut", delay: (i + k) * 0.2 }}>
                <circle cx={l.x} cy={l.y} r={17} fill={me ? "var(--color-signal-orange)" : "var(--color-text-primary)"} stroke={me ? "white" : "rgb(255 255 255 / 0.5)"} strokeWidth={me ? 2.5 : 1.5} />
                <text x={l.x} y={l.y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={me ? "var(--color-text-primary)" : "white"}>{initial(name(l.id))}</text>
                {ok && (
                  <g>
                    <circle cx={l.x + 13} cy={l.y - 13} r={7} fill="var(--color-bd-green)" stroke="white" strokeWidth={1.5} />
                    <path d={`M${l.x + 9.5},${l.y - 13} l2.5,2.5 l4.5,-4.5`} fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                )}
                <text x={l.x} y={l.y + 32} textAnchor="middle" fontSize={11.5} fontWeight={me ? 700 : 500} fill={me ? "var(--color-signal-orange)" : "rgb(255 255 255 / 0.8)"}>{me ? "আপনি" : firstWord(name(l.id))}</text>
              </motion.g>
            </motion.g>
          );
        }),
      )}

      {nodes.map((d, i) => {
        const tone = toneOf(duties, d.duty.id);
        const { ls, w, h } = d;
        return (
          <motion.g key={d.duty.id} initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: reduce ? 0 : 0.25 + i * 0.08 }} style={{ transformOrigin: `${d.x}px ${d.y}px` }}>
            <rect x={d.x - w / 2} y={d.y - h / 2} width={w} height={h} rx={12} fill={tone.fill} />
            <text x={d.x} y={d.y - (ls.length - 1) * 7.5 + 4.5} textAnchor="middle" fontSize={12} fontWeight={700} fill={tone.ink}>
              {ls.map((l, j) => <tspan key={j} x={d.x} dy={j === 0 ? 0 : 15}>{l}</tspan>)}
            </text>
          </motion.g>
        );
      })}

      <motion.g initial={{ scale: reduce ? 1 : 0.5, opacity: reduce ? 1 : 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring} style={{ transformOrigin: `${CX}px ${CY}px` }}>
        {!reduce && (
          <motion.circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-signal-orange)" strokeWidth={2} initial={{ opacity: 0.5, scale: 1 }} animate={{ opacity: 0, scale: 1.35 }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }} style={{ transformOrigin: `${CX}px ${CY}px` }} />
        )}
        <circle cx={CX} cy={CY} r={R} fill="var(--color-text-primary)" stroke="var(--color-signal-orange)" strokeWidth={3} />
        <text x={CX} textAnchor="middle" fontSize={12} fontWeight={700} fill="white">
          {lines(team, 14).map((l, j, all) => <tspan key={j} x={CX} y={CY - (all.length - 1) * 8 + j * 16 - 2}>{l}</tspan>)}
        </text>
        <text x={CX} y={CY + 32} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--color-signal-orange)">এক দল</text>
      </motion.g>
    </svg>
  );
}

const ICON_KEYS = Object.keys(DUTY_ICONS) as DutyIcon[];

function DutyEditor({ open, onOpenChange, duties, defaults, max, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; duties: Duty[]; defaults: Duty[]; max: number; onSave: (d: Duty[]) => boolean }) {
  const [draft, setDraft] = useState(duties);
  const [tried, setTried] = useState(false);
  const set = (id: string, patch: Partial<Duty>) => setDraft((all) => all.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const bad = (d: Duty) => d.title.trim().length < 3 || d.days.length === 0;

  function save() {
    setTried(true);
    if (draft.length === 0 || draft.some(bad)) return;
    if (onSave(draft.map((d) => ({ ...d, title: d.title.trim(), need: Math.min(max, d.need) })))) {
      toast.success("দায়িত্ব সাজানো হলো", { description: "এই সপ্তাহের পালা নতুন তালিকায় ভাগ হলো।" });
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) { setDraft(duties); setTried(false); } onOpenChange(o); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-2xl">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="text-xl font-bold text-white">দায়িত্ব সাজান</DialogTitle>
          <DialogDescription>কোন কাজ, কতজন, কোন কোন দিন — নাম বসানো হয় নিজে থেকে, প্রতি সপ্তাহে নতুন করে, সবার মধ্যে সমান ভাগে।</DialogDescription>
        </DialogHeader>
        <ul className="space-y-3">
          {draft.map((d) => (
            <li key={d.id} className={cn("space-y-3 rounded-2xl bg-white/5 p-3 ring-1", tried && bad(d) ? "ring-crimson-bright" : "ring-white/10")}>
              <div className="flex items-center gap-2">
                <Input value={d.title} onChange={(e) => set(d.id, { title: e.target.value })} aria-label="দায়িত্বের নাম" placeholder="যেমন: রিপোর্ট প্রিন্ট" />
                <div className="flex shrink-0 items-center rounded-lg ring-1 ring-white/15" role="group" aria-label="কতজন লাগবে">
                  <button type="button" onClick={() => set(d.id, { need: Math.max(1, d.need - 1) })} className="size-10 text-lg font-bold text-white hover:text-signal-orange" aria-label="একজন কম">−</button>
                  <span className="w-12 text-center text-sm font-bold text-white"><Num value={Math.min(max, d.need)} /> জন</span>
                  <button type="button" onClick={() => set(d.id, { need: Math.min(max, d.need + 1) })} className="size-10 text-lg font-bold text-white hover:text-signal-orange" aria-label="একজন বেশি">+</button>
                </div>
                <button type="button" onClick={() => setDraft((all) => all.filter((x) => x.id !== d.id))} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label={`${d.title || "দায়িত্ব"} মুছুন`}><Trash2 aria-hidden /></button>
              </div>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="কোন দিন">
                {WEEKDAYS.map((w, i) => {
                  const on = d.days.includes(i);
                  return (
                    <button key={w} type="button" aria-pressed={on} onClick={() => set(d.id, { days: on ? d.days.filter((x) => x !== i) : [...d.days, i].sort() })} className={cn("min-h-8 rounded-lg px-2.5 text-xs font-bold transition-colors", on ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/70 hover:text-white")}>
                      {w}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="চিহ্ন">
                {ICON_KEYS.map((k) => {
                  const Icon = DUTY_ICONS[k];
                  return (
                    <button key={k} type="button" aria-pressed={d.icon === k} onClick={() => set(d.id, { icon: k })} className={cn("flex size-8 items-center justify-center rounded-lg transition-colors", d.icon === k ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/70 hover:text-white")} aria-label={k}>
                      <Icon className="size-4" aria-hidden />
                    </button>
                  );
                })}
              </div>
              {tried && bad(d) && <p className="text-xs font-semibold text-crimson-bright">নাম (অন্তত ৩ অক্ষর) আর অন্তত একটি দিন দিন।</p>}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setDraft((all) => [...all, { id: newId("d"), title: "", need: 1, days: [...(all[0]?.days ?? [0])], icon: "build" }])} className={mediaButton({ variant: "quiet", size: "sm" })}>
            <Plus aria-hidden /> নতুন দায়িত্ব
          </button>
          <button type="button" onClick={() => setDraft(defaults)} className={mediaButton({ variant: "ghost", size: "sm" })}>শুরুর তালিকায় ফিরুন</button>
        </div>
        {tried && draft.length === 0 && <p className="text-xs font-semibold text-crimson-bright">অন্তত একটি দায়িত্ব রাখুন।</p>}
        <button type="button" onClick={save} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>সংরক্ষণ করুন</button>
      </DialogContent>
    </Dialog>
  );
}
