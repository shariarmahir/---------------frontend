"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Card } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { DAILY_CHECKS } from "@/data/nagorik";
import { cn } from "@/lib/utils";

/*
 * The pledge and tonight's check live in this browser only (localStorage):
 * a private mirror, never sent anywhere. Every read and write is guarded;
 * when storage is blocked the ticks last until the page closes.
 */
const KEY = "kandari-nagorik-pledge-v1";
const EVENT = "kandari-nagorik-pledge";

interface Saved {
  pledged: number[];
  /** The day `done` belongs to (local YYYY-MM-DD). */
  day: string;
  done: number[];
  /** Days on which every pledge was kept. */
  kept: string[];
}

let memory = "";

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function write(next: Saved) {
  memory = JSON.stringify(next);
  try {
    window.localStorage.setItem(KEY, memory);
  } catch {
    /* Storage is blocked: `memory` carries the ticks until the page closes. */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const nums = (v: unknown) => (Array.isArray(v) ? v.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < DAILY_CHECKS.length) : []);

function parse(raw: string): Saved {
  try {
    const v = JSON.parse(raw) as Partial<Saved>;
    return {
      pledged: nums(v.pledged),
      day: typeof v.day === "string" ? v.day : "",
      done: nums(v.done),
      kept: Array.isArray(v.kept) ? v.kept.filter((d): d is string => typeof d === "string") : [],
    };
  } catch {
    return { pledged: [], day: "", done: [], kept: [] };
  }
}

/** A local calendar day, `offset` days from today, as YYYY-MM-DD. */
function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Days in a row with every pledge kept, counting from today, or from yesterday while tonight is still open. */
function streakOf(kept: string[]) {
  const days = new Set(kept);
  let offset = days.has(dayKey()) ? 0 : -1;
  let n = 0;
  while (days.has(dayKey(offset))) {
    n++;
    offset--;
  }
  return n;
}

function verdict(kept: number, pledged: number) {
  if (pledged === 0) return "Choose at least one pledge to begin.";
  if (kept === pledged) return "Every pledge kept tonight. This is how a country is rebuilt.";
  if (kept / pledged >= 0.5) return "A strong day. Keep one more tomorrow.";
  if (kept > 0) return "A start. Tomorrow, keep one more.";
  return "Nothing kept yet tonight. Be honest with yourself: tomorrow is a fresh page.";
}

const toggle = (list: number[], i: number) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i].sort((a, b) => a - b));

/** Choose pledges, tick tonight what was kept, and watch the run of days grow. */
export function Pledge() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const { saved, today, done, streak } = useMemo(() => {
    const saved = parse(raw);
    const today = dayKey();
    return { saved, today, done: saved.day === today ? saved.done : [], streak: streakOf(saved.kept) };
  }, [raw]);

  const save = (pledged: number[], nextDone: number[]) => {
    const all = pledged.length > 0 && pledged.every((p) => nextDone.includes(p));
    const kept = saved.kept.filter((d) => d !== today).concat(all ? [today] : []).slice(-400);
    write({ pledged, day: today, done: nextDone, kept });
  };

  const pledged = saved.pledged;
  const keptTonight = pledged.filter((p) => done.includes(p)).length;
  const pct = pledged.length ? (keptTonight / pledged.length) * 100 : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-6">
      <Card surface="ink" className="hover:translate-y-0 hover:shadow-none lg:sticky lg:top-[calc(var(--spacing-header-lg)+1.5rem)] lg:self-start">
        <div className="flex items-center gap-6">
          <svg viewBox="0 0 36 36" className="size-28 shrink-0 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="3" />
            {pct > 0 && (
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="var(--color-signal-orange)"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${pct} 100`}
                className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-500"
              />
            )}
          </svg>
          <div aria-live="polite">
            <p className="font-grotesk text-4xl font-bold text-signal-orange tabular-nums">
              {keptTonight}/{pledged.length}
            </p>
            <p className="mt-1 text-sm text-white/65">pledges kept tonight</p>
            <p className="mt-3 text-base leading-relaxed text-white">{verdict(keptTonight, pledged.length)}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4 border-t border-white/12 pt-5">
          <Icon name="local_fire_department" filled className={cn("text-3xl!", streak > 0 ? "text-signal-orange" : "text-white/40")} />
          <p>
            <span className="block font-grotesk text-xl font-bold text-white tabular-nums">
              {streak} {streak === 1 ? "day" : "days"} in a row
            </span>
            <span className="text-sm text-white/65">Every pledge kept, night after night. Saved only on this device.</span>
          </p>
        </div>
      </Card>

      <div className="grid gap-4 lg:gap-6">
        <Card surface="navy" className="hover:translate-y-0 hover:shadow-none">
          <h3 className="font-grotesk text-xl font-bold text-signal-orange">1. Choose your pledges</h3>
          <p className="mt-1 text-sm text-white/65">Pick the ones you mean to keep every day. You can change them any time.</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {DAILY_CHECKS.map((c, i) => {
              const on = pledged.includes(i);
              return (
                <li key={c.pledge}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => save(toggle(pledged, i), done)}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none",
                      on ? "bg-signal-orange text-text-primary ring-signal-orange" : "bg-black text-white/80 ring-white/20 hover:text-white hover:ring-white/40",
                    )}
                  >
                    <Icon name={on ? "check" : "add"} className="text-lg!" />
                    {c.pledge}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card surface="cobalt" className="hover:translate-y-0 hover:shadow-none">
          <h3 className="font-grotesk text-xl font-bold text-signal-orange">2. Tonight&rsquo;s check</h3>
          <p className="mt-1 text-sm text-white/80">Before you sleep, tick what you kept today. Only you see it.</p>
          {pledged.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-black/30 px-4 py-4 text-sm text-white/80">Your pledges will appear here once you choose them.</p>
          ) : (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {pledged.map((i) => {
                const on = done.includes(i);
                return (
                  <li key={i} className="flex">
                    <label
                      className={cn(
                        "flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm leading-snug ring-1 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-signal-orange motion-reduce:transition-none",
                        on ? "bg-black/40 text-white ring-signal-orange" : "bg-black/20 text-white/80 ring-white/20 hover:ring-white/40",
                      )}
                    >
                      <input type="checkbox" className="sr-only" checked={on} onChange={() => save(pledged, toggle(done, i))} />
                      <span aria-hidden className={cn("grid size-6 shrink-0 place-items-center rounded-md ring-2", on ? "bg-signal-orange text-text-primary ring-signal-orange" : "ring-white/40")}>
                        {on && <Icon name="check" className="text-base! font-bold" />}
                      </span>
                      {DAILY_CHECKS[i].check}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
