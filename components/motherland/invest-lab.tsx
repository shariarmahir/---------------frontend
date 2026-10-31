"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { growthSeries } from "@/data/bangladesh-growth";
import { INVEST, type LeverId } from "@/data/motherland";
import { exportsAfter, growthRate, project, yearReaching, type Plan, type Point } from "@/lib/motherland-future";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import { FutureChart, SERIES } from "./future-chart";
import { useInView } from "./use-in-view";

const LEVERS = Object.entries(INVEST.levers) as [LeverId, (typeof INVEST.levers)[LeverId]][];
const START: Record<LeverId, number> = { investment: INVEST.levers.investment.start, exports: INVEST.levers.exports.start, skills: INVEST.levers.skills.start };
const PLAY_MS = 2600;

/** World Bank GDP per person from 2000 to the latest year; the projections start from its last point. */
const HISTORY = growthSeries.gdpPerCapita.points.filter(([year]) => year >= 2000) as Point[];
const LATEST = HISTORY.at(-1)!;

const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

/**
 * Business & Investment, the working part: back sectors, move three
 * levers, and watch income per person to 2041 redraw at once against
 * today's pace. "Run the simulation" draws the years out one by one (it
 * plays by itself the first time the graph comes into view). Every number
 * is also in a table under the graph.
 */
export function InvestLab() {
  const [sectors, setSectors] = useState<string[]>(INVEST.startSectors);
  const [levers, setLevers] = useState(START);
  const [reveal, setReveal] = useState(0);
  const frame = useRef<number>(0);
  const graph = useRef<HTMLDivElement>(null);
  const seen = useInView(graph, "0px 0px -25% 0px");
  const reduced = useReducedMotion();
  const played = useRef(false);

  const plan: Plan = { ...levers, sectors: sectors.length };
  const pacePlan: Plan = { ...START, sectors: INVEST.startSectors.length };
  const series = { plan: project(plan, LATEST, INVEST.horizon), pace: project(pacePlan, LATEST, INVEST.horizon) };
  const years = INVEST.horizon - LATEST[0];
  const upper = INVEST.thresholds[0];
  const reached = yearReaching(series.plan, upper.value);

  const play = () => {
    cancelAnimationFrame(frame.current);
    if (reduced) return setReveal(1);
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / PLAY_MS);
      setReveal(p);
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  const playOnce = useEffectEvent(() => {
    if (played.current) return;
    played.current = true;
    play();
  });
  useEffect(() => {
    if (seen) playOnce();
  }, [seen]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const toggle = (id: string) => setSectors((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const reset = () => {
    setSectors(INVEST.startSectors);
    setLevers(START);
  };

  const tiles = [
    { label: `Income per person in ${INVEST.horizon}`, value: usd(series.plan.at(-1)![1]), note: `today's pace: ${usd(series.pace.at(-1)![1])}` },
    { label: "Growth a year", value: `${(growthRate(plan) * 100).toFixed(1)}%`, note: `today's pace: ${(growthRate(pacePlan) * 100).toFixed(1)}%` },
    { label: `Exports in ${INVEST.horizon}`, value: `$${Math.round(exportsAfter(plan, INVEST.exportsToday, years))} billion`, note: `today: about $${INVEST.exportsToday} billion` },
    { label: `${upper.label} line reached`, value: reached ? String(reached) : `After ${INVEST.horizon}`, note: `about ${usd(upper.value)} per person` },
  ];

  const panel = "flex flex-col gap-8 rounded-3xl bg-white/4 p-6 ring-1 ring-white/10 sm:p-8 lg:p-10";

  return (
    <div className="flex flex-col gap-12 lg:gap-14">
      <fieldset>
        <legend className="mb-5 text-xl font-bold">1. Back the sectors you believe in</legend>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {INVEST.sectors.map((s) => {
            const on = sectors.includes(s.id);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.id)}
                  className={cn(
                    "flex h-full w-full flex-col gap-3 rounded-2xl p-5 text-left ring-1 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                    on ? "bg-signal-orange text-ml-ink ring-signal-orange" : "bg-white/5 text-white ring-white/15 hover:bg-white/10",
                  )}
                >
                  <span className="flex items-center justify-between">
                    <Icon name={s.icon} className="text-3xl" />
                    <Icon name={on ? "check_circle" : "add_circle"} className="text-2xl" />
                  </span>
                  <span className="text-lg font-bold">{s.name}</span>
                  <span className={cn("text-sm leading-relaxed", on ? "text-ml-ink/85" : "text-white/75")}>{s.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
        <fieldset className={panel}>
          <legend className="float-left mb-1 w-full text-xl font-bold">2. Set the pace</legend>
          <div className="flex flex-col gap-7">
            {LEVERS.map(([id, l]) => (
              <label key={id} className="flex flex-col gap-3">
                <span className="flex items-baseline justify-between gap-4">
                  <span className="font-semibold">{l.label}</span>
                  <span className="font-ml-display text-3xl text-signal-orange tabular-nums">
                    {levers[id]}
                    <span className="ml-1 font-ml-sans text-sm font-medium text-white/70">{l.unit}</span>
                  </span>
                </span>
                <input
                  type="range"
                  min={l.min}
                  max={l.max}
                  step={l.step}
                  value={levers[id]}
                  onChange={(e) => setLevers((v) => ({ ...v, [id]: Number(e.target.value) }))}
                  className="h-2 w-full cursor-pointer accent-signal-orange"
                />
                <span className="flex justify-between text-xs text-white/55 tabular-nums">
                  <span>{l.min}</span>
                  <span>today {l.start}</span>
                  <span>{l.max}</span>
                </span>
              </label>
            ))}
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10" aria-live="polite">
            {tiles.map((t) => (
              <div key={t.label} className="flex flex-col gap-1 bg-ml-ink p-4 sm:p-5">
                <dt className="text-xs font-semibold text-white/65">{t.label}</dt>
                <dd className="font-ml-display text-2xl tracking-[0.01em] whitespace-nowrap text-white tabular-nums sm:text-3xl">{t.value}</dd>
                <dd className="text-xs text-white/60">{t.note}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={play}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-signal-orange px-6 font-semibold text-ml-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Icon name="play_arrow" className="text-xl" />
              Run the simulation
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold ring-1 ring-white/30 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Icon name="restart_alt" className="text-xl" />
              Back to today&apos;s pace
            </button>
          </div>
        </fieldset>

        <div ref={graph} className={panel}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-bold">Income per person, US$</h3>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85" aria-label="Legend">
              {(Object.keys(SERIES) as (keyof typeof SERIES)[]).map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <svg aria-hidden width="22" height="8">
                    <line x1="1" x2="21" y1="4" y2="4" stroke={SERIES[k].color} strokeWidth={k === "plan" ? 3 : 2} strokeDasharray={k === "pace" ? "5 4" : undefined} />
                  </svg>
                  {SERIES[k].label}
                </li>
              ))}
            </ul>
          </div>

          <FutureChart history={HISTORY} pace={series.pace} plan={series.plan} thresholds={INVEST.thresholds} reveal={reveal} />

          <details className="group text-sm">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold text-white/85 hover:text-signal-orange [&::-webkit-details-marker]:hidden">
              Show the numbers
              <Icon name="expand_more" className="text-xl transition-transform group-open:rotate-180" />
            </summary>
            <table className="mt-4 w-full text-left tabular-nums">
              <thead className="text-white/65">
                <tr>
                  <th className="py-1.5 font-semibold">Year</th>
                  <th className="py-1.5 font-semibold">{SERIES.pace.label}</th>
                  <th className="py-1.5 font-semibold">{SERIES.plan.label}</th>
                </tr>
              </thead>
              <tbody>
                {series.plan
                  .filter(([year]) => (year - LATEST[0]) % 4 === 0 || year === INVEST.horizon)
                  .map(([year, v]) => (
                    <tr key={year} className="border-t border-white/10">
                      <td className="py-1.5">{year}</td>
                      <td className="py-1.5">{usd(series.pace.find(([y]) => y === year)![1])}</td>
                      <td className="py-1.5">{usd(v)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </details>

          <p className="mt-auto text-xs leading-relaxed text-white/60">{INVEST.note}</p>
        </div>
      </div>
    </div>
  );
}
