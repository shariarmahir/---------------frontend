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
/** The history line draws itself first; the projections follow once it is in. */
const DRAW_MS = 1400;

/** World Bank GDP per person from 2000 to the latest year; the projections start from its last point. */
const HISTORY = growthSeries.gdpPerCapita.points.filter(([year]) => year >= 2000) as Point[];
const LATEST = HISTORY.at(-1)!;

const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

/** A figure that counts to its new value whenever it changes. */
function Count({ value, format }: { value: number; format: (v: number) => string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduced) return;
    const start = from.current;
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 700);
      const v = start + (value - start) * (1 - (1 - p) ** 3);
      from.current = v;
      setShown(v);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);

  return <>{format(reduced ? value : shown)}</>;
}

/**
 * Business & Investment, the working part, at a medium size: on the left the sectors to back
 * (small toggles), three levers and the buttons; on the right the figures and the graph. The
 * figures count to each new value; when the graph first comes into view its World Bank line draws
 * itself, then the two projections run out year by year to the horizon. "Run the simulation"
 * plays the projections again. Every number is also in a table under the graph.
 */
export function InvestLab() {
  const [sectors, setSectors] = useState<string[]>(INVEST.startSectors);
  const [levers, setLevers] = useState(START);
  const [reveal, setReveal] = useState(0);
  const frame = useRef<number>(0);
  const graph = useRef<HTMLDivElement>(null);
  const seen = useInView(graph, "0px 0px -20% 0px");
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
    const wait = window.setTimeout(play, reduced ? 0 : DRAW_MS);
    return () => window.clearTimeout(wait);
  });
  useEffect(() => {
    if (seen) return playOnce();
  }, [seen]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const toggle = (id: string) => setSectors((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const reset = () => {
    setSectors(INVEST.startSectors);
    setLevers(START);
  };

  const figures = [
    { label: `Income per person, ${INVEST.horizon}`, value: series.plan.at(-1)![1], format: usd, note: `today's pace ${usd(series.pace.at(-1)![1])}` },
    { label: "Growth a year", value: growthRate(plan) * 100, format: (v: number) => `${v.toFixed(1)}%`, note: `today's pace ${(growthRate(pacePlan) * 100).toFixed(1)}%` },
    { label: `Exports, ${INVEST.horizon}`, value: exportsAfter(plan, INVEST.exportsToday, years), format: (v: number) => `$${Math.round(v)}bn`, note: `today about $${INVEST.exportsToday}bn` },
    { label: `${upper.label} line`, value: reached ?? INVEST.horizon + 1, format: (v: number) => (reached ? String(Math.round(v)) : `After ${INVEST.horizon}`), note: `about ${usd(upper.value)} per person` },
  ];

  const panel = "flex flex-col gap-7 rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8";

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
      <div className={panel}>
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 text-lg font-bold">1. Back the sectors you believe in</legend>
          <ul className="grid gap-2 sm:grid-cols-2">
            {INVEST.sectors.map((s) => {
              const on = sectors.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    title={s.text}
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold ring-1 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                      on ? "bg-signal-orange text-ml-navy ring-signal-orange" : "bg-white/5 text-white ring-white/15 hover:bg-white/10",
                    )}
                  >
                    <Icon name={s.icon} className="text-xl" />
                    <span className="flex-1 leading-tight">
                      {s.name}
                      <span className="sr-only">: {s.text}</span>
                    </span>
                    <Icon name={on ? "check" : "add"} className="text-lg" />
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <fieldset className="flex flex-col gap-6">
          <legend className="mb-4 text-lg font-bold">2. Set the pace</legend>
          {LEVERS.map(([id, l]) => (
            <label key={id} className="flex flex-col gap-2.5">
              <span className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-semibold">{l.label}</span>
                <span className="text-xl font-extrabold text-signal-orange tabular-nums">
                  {levers[id]}
                  <span className="ml-1 text-xs font-medium text-white/65">{l.unit}</span>
                </span>
              </span>
              <input
                name={id}
                type="range"
                min={l.min}
                max={l.max}
                step={l.step}
                value={levers[id]}
                onChange={(e) => setLevers((v) => ({ ...v, [id]: Number(e.target.value) }))}
                className="h-1.5 w-full cursor-pointer accent-signal-orange"
              />
              <span className="flex justify-between text-xs text-white/50 tabular-nums">
                <span>{l.min}</span>
                <span>today {l.start}</span>
                <span>{l.max}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div className="mt-auto grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={play}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-signal-orange px-5 font-semibold text-ml-navy transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Icon name="play_arrow" className="text-xl" />
            Run the simulation
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold ring-1 ring-white/30 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Icon name="restart_alt" className="text-xl" />
            Today&apos;s pace
          </button>
        </div>
      </div>

      <div ref={graph} className={panel}>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-white/10 pb-6 sm:grid-cols-4" aria-live="polite">
          {figures.map((f) => (
            <div key={f.label} className="flex min-w-0 flex-col gap-1">
              <dt className="text-xs font-medium text-white/60">{f.label}</dt>
              <dd className="text-[clamp(1.5rem,2.2vw,2.1rem)] leading-none font-extrabold tracking-[-0.03em] whitespace-nowrap text-white tabular-nums">
                <Count value={f.value} format={f.format} />
              </dd>
              <dd className="text-xs text-white/50">{f.note}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-bold">Income per person, US$</h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80" aria-label="Legend">
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

        <FutureChart history={HISTORY} pace={series.pace} plan={series.plan} thresholds={INVEST.thresholds} reveal={reveal} drawn={seen} />

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

        <p className="text-xs leading-relaxed text-white/55">{INVEST.note}</p>
      </div>
    </div>
  );
}
