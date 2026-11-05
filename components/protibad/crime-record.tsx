"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { SOURCES, YEARS, change, crimeSeries, early2026, murderByMonth2025, perMonth, type CrimeSeries } from "@/data/protibad";
import { cn } from "@/lib/utils";
import { CountUp, fmt, useSeen } from "./kit";

/** "+36%" in red when cases rose, "−15%" in light blue when they fell. */
function Change({ pct, className }: { pct: number | null; className?: string }) {
  if (pct === null) return <span className={cn("text-white/40", className)}>—</span>;
  const up = pct > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-semibold tabular-nums", up ? "text-crimson-bright" : "text-bdnavy-300", className)}>
      <Icon name={up ? "arrow_upward" : pct < 0 ? "arrow_downward" : "remove"} className="text-base" />
      {Math.abs(pct)}%<span className="sr-only">{up ? " more" : " fewer"}</span>
    </span>
  );
}

/**
 * "Crime on the police record": cases filed with the police, 2020–2024 and
 * the first half of 2025, from Police Headquarters figures as the press
 * published them (data/protibad.ts names each report). Pick a crime and its
 * columns grow to the new heights; the table beside it holds every crime at
 * once, its figures running up when it comes on screen, and a row picks
 * that crime for the chart. Under them, murder month by month in 2025 and
 * the first four months of 2026 against 2024's monthly pace.
 */
export function CrimeRecord() {
  const [id, setId] = useState(crimeSeries[0].id);
  const series = crimeSeries.find((s) => s.id === id) ?? crimeSeries[0];

  return (
    <section id="crime-data" aria-labelledby="crime-data-title" className="section-band-tinted relative w-full scroll-mt-40 bg-text-primary">
      <div className="mx-auto max-w-384 px-gutter-x">
        <SectionHeading
          tone="dark"
          title={<span id="crime-data-title">Crime on the police record</span>}
          lead="Cases filed with the police each year since 2020, from Police Headquarters figures, with the first half of 2025."
        />

        <div role="group" aria-label="Kind of crime" className="no-scrollbar story-reveal -mx-gutter-x mb-4 flex gap-2 overflow-x-auto px-gutter-x">
          {crimeSeries.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === id}
              onClick={() => setId(s.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 font-sans text-sm font-semibold whitespace-nowrap transition-[background-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
                s.id === id ? "bg-signal-orange text-text-primary" : "bg-black/30 text-white ring-1 ring-white/15 hover:bg-black/50",
              )}
            >
              <Icon name={s.icon} className="text-lg" />
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <ColumnChart series={series} />
          <RecordTable selected={id} onPick={setId} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <MonthLine />
          <Early2026 />
        </div>

        <div className="story-reveal mt-6 flex flex-col gap-2 font-sans text-sm leading-relaxed text-white/65">
          <p className="flex items-start gap-2">
            <Icon name="info" className="mt-0.5 shrink-0 text-lg text-bdnavy-300" />
            These are cases filed, not every crime that happened. A rise can mean more people went to the police; a fall can mean fewer dared to.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 pl-7">
            Sources:
            {Object.values(SOURCES).map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-signal-orange hover:underline" title={s.note}>
                {s.name}
                <Icon name="arrow_outward" className="text-sm" />
              </a>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Five whole years and the 2025 half-year as columns that grow to their height. */
function ColumnChart({ series }: { series: CrimeSeries }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const cols = [
    ...YEARS.map((y, i) => ({ key: String(y), label: String(y), value: series.years[i], half: false })),
    { key: "2025", label: "2025*", value: series.h1_2025, half: true },
  ];
  const max = Math.max(1, ...cols.map((c) => c.value ?? 0));
  const last = series.years[4];

  return (
    <div ref={ref} className="story-reveal flex flex-col rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 ring-inset sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-sans text-base text-white/80">{series.label}: cases filed in 2024</p>
          <p className="mt-1 font-grotesk text-5xl font-bold text-signal-orange tabular-nums">{last === null ? "—" : <CountUp key={series.id} to={last} run={seen} />}</p>
        </div>
        <p className="flex items-center gap-2 font-sans text-sm text-white/65">
          Compared with 2023 <Change pct={change(series.years[3], last)} className="text-base" />
        </p>
      </div>

      <div
        className="mt-6 grid h-64 grid-cols-6 items-end gap-2 border-b border-white/15 sm:gap-4"
        role="img"
        aria-label={`${series.label}: ${cols.map((c) => `${c.key}${c.half ? " (January to June)" : ""} ${c.value ?? "no figure"}`).join(", ")}`}
      >
        {cols.map((c, i) => (
          <div key={c.key} className="flex h-full flex-col items-center justify-end gap-2">
            <span className={cn("font-sans text-xs font-semibold tabular-nums transition-opacity duration-500", seen ? "opacity-100" : "opacity-0", c.value === null ? "text-white/40" : "text-white")}>
              {c.value === null ? "No figure" : fmt(c.value)}
            </span>
            <span
              className={cn(
                "w-full max-w-16 rounded-t-lg transition-[height] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                c.half ? "bg-signal-orange/10 ring-2 ring-signal-orange ring-inset" : c.key === "2024" ? "bg-signal-orange" : "bg-cobalt",
              )}
              style={{ height: seen && c.value !== null ? `${Math.max(2, (c.value / max) * 82)}%` : "0%", transitionDelay: `${i * 70}ms` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-6 gap-2 text-center font-sans text-xs text-white/65 sm:gap-4">
        {cols.map((c) => (
          <span key={c.key}>{c.label}</span>
        ))}
      </div>
      <p className="mt-4 font-sans text-xs leading-relaxed text-white/65">
        * 2025 covers January to June only.{series.caveat && <span className="mt-1 block">{series.caveat}</span>}
      </p>
    </div>
  );
}

/** Every crime by year; the figures run up when the table comes on screen, and a row picks that crime. */
function RecordTable({ selected, onPick }: { selected: string; onPick: (id: string) => void }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="story-reveal overflow-hidden rounded-3xl bg-black/35 ring-1 ring-white/12 ring-inset">
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full min-w-[40rem] border-collapse font-sans text-sm">
          <caption className="sr-only">Cases filed with the police by year, 2020–2024, and January–June 2025</caption>
          <thead>
            <tr className="border-b border-white/12 text-white/65">
              <th scope="col" className="px-4 py-3.5 text-left font-semibold">
                Crime
              </th>
              {YEARS.map((y) => (
                <th key={y} scope="col" className={cn("px-3 py-3.5 text-right font-semibold", y === 2024 && "text-signal-orange")}>
                  {y}
                </th>
              ))}
              <th scope="col" className="px-3 py-3.5 text-right font-semibold">
                2025*
              </th>
              <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                2023→24
              </th>
            </tr>
          </thead>
          <tbody>
            {crimeSeries.map((s, r) => (
              <tr
                key={s.id}
                className={cn("border-b border-white/8 transition-colors duration-200 last:border-0 hover:bg-white/5", s.id === selected && "bg-signal-orange/10", seen && "pb-row-in")}
                style={{ animationDelay: `${r * 70}ms` }}
              >
                <th scope="row" className="px-4 py-3 text-left font-semibold whitespace-nowrap text-white">
                  <button
                    type="button"
                    onClick={() => onPick(s.id)}
                    aria-pressed={s.id === selected}
                    className="inline-flex min-h-9 items-center gap-2 rounded focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                  >
                    <Icon name={s.icon} className={cn("text-lg", s.id === selected ? "text-signal-orange" : "text-bdnavy-300")} />
                    {s.label}
                  </button>
                </th>
                {s.years.map((v, i) => (
                  <td key={YEARS[i]} className={cn("px-3 py-3 text-right tabular-nums", i === 4 ? "font-semibold text-white" : "text-white/80")}>
                    {v === null ? <span className="text-white/35">—</span> : <CountUp to={v} run={seen} ms={1100} />}
                  </td>
                ))}
                <td className="px-3 py-3 text-right text-white/80 tabular-nums">
                  {s.h1_2025 === null ? <span className="text-white/35">—</span> : <CountUp to={s.h1_2025} run={seen} ms={1100} />}
                </td>
                <td className="px-4 py-3 text-right">
                  <Change pct={change(s.years[3], s.years[4])} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-white/10 px-4 py-3 font-sans text-xs text-white/65">* January to June 2025. Pick a crime to see it in the chart.</p>
    </div>
  );
}

/** Murder cases month by month, January–June 2025, as a line that draws itself. */
function MonthLine() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const W = 520;
  const H = 210;
  const vals = murderByMonth2025.map((m) => m.cases);
  const lo = Math.min(...vals) - 20;
  const hi = Math.max(...vals) + 10;
  const pts = vals.map((v, i) => [20 + (i * (W - 40)) / (vals.length - 1), H - 26 - ((v - lo) / (hi - lo)) * (H - 64)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  return (
    <div ref={ref} className="story-reveal flex flex-col rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 ring-inset sm:p-6">
      <h3 className="font-grotesk text-lg font-bold text-signal-orange">Murder cases in 2025, month by month</h3>
      <p className="mt-1 font-sans text-sm text-white/65">Every month from January to June was higher than the one before.</p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full overflow-visible"
        role="img"
        aria-label={`Murder cases per month in 2025: ${murderByMonth2025.map((m) => `${m.month} ${m.cases}`).join(", ")}`}
      >
        <path
          d={line}
          fill="none"
          stroke="var(--color-signal-orange)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={seen ? 0 : 1}
          className="transition-[stroke-dashoffset] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        />
        {pts.map(([x, y], i) => (
          <g key={murderByMonth2025[i].month} className="transition-opacity duration-500" style={{ opacity: seen ? 1 : 0, transitionDelay: `${300 + i * 180}ms` }}>
            <circle cx={x} cy={y} r="4" fill="#fff" stroke="var(--color-signal-orange)" strokeWidth="2" />
            <text x={x} y={y - 10} textAnchor="middle" className="fill-white font-sans font-semibold" style={{ fontSize: 14 }}>
              {vals[i]}
            </text>
            <text x={x} y={H - 2} textAnchor="middle" className="fill-white/65 font-sans" style={{ fontSize: 13 }}>
              {murderByMonth2025[i].month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** January–April 2026, each as a monthly average beside 2024's, where 2024 has the same crime. */
function Early2026() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const base = new Map(crimeSeries.map((s) => [s.id, s.years[4]]));
  return (
    <div ref={ref} className="story-reveal flex flex-col rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 ring-inset sm:p-6">
      <h3 className="font-grotesk text-lg font-bold text-signal-orange">January to April 2026</h3>
      <p className="mt-1 font-sans text-sm text-white/65">Cases filed in four months, with the monthly average against 2024&apos;s.</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {early2026.map((row, i) => {
          const was = base.get(row.id);
          const pct = was == null ? null : change(perMonth(was, 12), perMonth(row.cases, 4));
          return (
            <li key={row.id} className={cn("flex flex-col gap-1 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 ring-inset", seen && "pb-row-in")} style={{ animationDelay: `${i * 80}ms` }}>
              <span className="font-sans text-sm text-white/80">{row.label}</span>
              <span className="font-grotesk text-2xl font-bold text-white tabular-nums">
                <CountUp to={row.cases} run={seen} />
              </span>
              <span className="flex items-center gap-2 font-sans text-xs text-white/65">
                {fmt(perMonth(row.cases, 4))} a month
                {pct !== null && <Change pct={pct} className="text-xs" />}
              </span>
            </li>
          );
        })}
      </ul>
      <a href={SOURCES.tribune.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 w-fit items-center gap-1 font-sans text-xs text-white/65 hover:text-signal-orange">
        {SOURCES.tribune.name} <Icon name="arrow_outward" className="text-sm" />
      </a>
    </div>
  );
}
