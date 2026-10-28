"use client";

import { useState } from "react";
import { Card } from "@/components/bangladesh-landing/kit";
import { TUS, type Sex } from "@/data/nagorik";
import { cn } from "@/lib/utils";

const SEXES: { id: Sex; label: string }[] = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
];

const ROWS: { label: string; hours: (s: Sex) => number }[] = [
  { label: "Paid work", hours: (s) => TUS.day[s].paid },
  { label: "Unpaid care and domestic work", hours: (s) => TUS.day[s].unpaid },
  { label: "Unpaid care and domestic work, ages 25–44", hours: (s) => TUS.prime[s] },
];

const rest = (s: Sex) => 24 - TUS.day[s].paid - TUS.day[s].unpaid;
const MAX = 10;
const TICKS = [0, 2, 4, 6, 8, 10];
const h = (v: number) => `${v.toFixed(1)} h`;

const TOGGLE =
  "min-h-11 rounded-lg px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none";

/**
 * The measured day as one series of bars on a shared hours axis: pick women
 * or men and the bars move to that day; pointing at a bar shows both. The
 * table holds every figure for screen readers and for anyone who prefers it.
 */
export function DayChart() {
  const [sex, setSex] = useState<Sex>("women");
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  return (
    <Card surface="ink" className="hover:translate-y-0 hover:shadow-none">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-grotesk text-xl font-bold text-white sm:text-2xl">An average day, in hours</h3>
          <p className="mt-1 text-sm text-white/65">National average for people aged 15 and over</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Whose day" className="flex rounded-xl bg-black p-1 ring-1 ring-white/12">
            {SEXES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={sex === s.id}
                onClick={() => setSex(s.id)}
                className={cn(TOGGLE, sex === s.id ? "bg-signal-orange text-text-primary" : "text-white/80 hover:text-white")}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button type="button" aria-pressed={table} onClick={() => setTable((v) => !v)} className={cn(TOGGLE, "text-signal-orange ring-1 ring-white/20 hover:ring-signal-orange")}>
            {table ? "Show as chart" : "Show as table"}
          </button>
        </div>
      </div>

      {table ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-md text-left text-sm">
            <caption className="sr-only">Hours per day by activity, women and men aged 15 and over, BBS {TUS.survey}</caption>
            <thead className="text-white/65">
              <tr>
                <th scope="col" className="py-2 pr-4 font-semibold">Activity</th>
                <th scope="col" className="py-2 pl-4 text-right font-semibold">Women</th>
                <th scope="col" className="py-2 pl-4 text-right font-semibold">Men</th>
              </tr>
            </thead>
            <tbody className="text-white tabular-nums">
              {[...ROWS, { label: "Everything else (not split by the survey brief)", hours: rest }].map((r) => (
                <tr key={r.label} className="border-t border-white/12">
                  <th scope="row" className="py-3 pr-4 font-normal">{r.label}</th>
                  <td className="py-3 pl-4 text-right">{h(r.hours("women"))}</td>
                  <td className="py-3 pl-4 text-right">{h(r.hours("men"))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <figure className="mt-8">
          <p aria-live="polite" className="sr-only">
            {sex === "women" ? "Women" : "Men"}, hours per day: {ROWS.map((r) => `${r.label}, ${h(r.hours(sex))}`).join("; ")}.
          </p>
          <div aria-hidden className="grid gap-y-6 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-x-6">
            {ROWS.map((r, i) => {
              const v = r.hours(sex);
              return (
                <div key={r.label} className="contents" onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                  <p className="text-sm leading-snug text-white/80 sm:self-center">{r.label}</p>
                  <div className="relative -mt-4 h-9 sm:mt-0">
                    {TICKS.map((t) => (
                      <span key={t} className="absolute inset-y-0 w-px bg-white/12" style={{ left: `${(t / MAX) * 100}%` }} />
                    ))}
                    <span
                      className="absolute inset-y-1.5 left-0 rounded-r-[4px] bg-signal-orange motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ width: `${(v / MAX) * 100}%` }}
                    />
                    <span
                      className="absolute top-1/2 -translate-y-1/2 pl-2 text-sm font-bold text-white tabular-nums motion-safe:transition-[left] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ left: `${(v / MAX) * 100}%` }}
                    >
                      {h(v)}
                    </span>
                    {hover === i && (
                      <span className="pointer-events-none absolute -top-9 right-0 z-10 rounded-lg bg-black px-3 py-1.5 text-xs whitespace-nowrap text-white ring-1 ring-white/20">
                        Women {h(r.hours("women"))} · Men {h(r.hours("men"))}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <span className="hidden sm:block" />
            <div className="relative -mt-3 h-5 text-xs text-white/65 tabular-nums">
              {TICKS.map((t) => (
                <span key={t} className={cn("absolute", t === 0 ? "left-0" : t === MAX ? "right-0" : "-translate-x-1/2")} style={t > 0 && t < MAX ? { left: `${(t / MAX) * 100}%` } : undefined}>
                  {t} h
                </span>
              ))}
            </div>
          </div>
          <figcaption className="mt-6 border-t border-white/12 pt-5 text-sm leading-relaxed text-white/80">
            That leaves <strong className="font-semibold text-white">{h(rest(sex))}</strong> of {sex === "women" ? "a woman’s" : "a man’s"} day for everything else: sleep, meals,
            learning and leisure. The survey brief does not split those hours further.
          </figcaption>
        </figure>
      )}
    </Card>
  );
}
