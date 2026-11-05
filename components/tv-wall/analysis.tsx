"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Icon } from "@/components/ui/icon";
import { ACCOUNTABILITY, CENSUS_SOURCE } from "@/data/tv-wall/sources";
import { balance, crimeKinds, divisionStats, hourly, type CrimeKind, type DivisionStat, type WireItem } from "@/lib/tv-wall/core";
import { cn } from "@/lib/utils";
import { ADVICE, KIND, fmt } from "./labels";

/** A chance as a percentage; a near-certainty reads "99%+", never a false 100%. */
const pct = (p: number) => (p >= 0.995 ? "99%+" : `${Math.round(p * 100)}%`);

/** The day's reading in three plain sentences, built from the window's reports. */
export function verdictLines(items: WireItem[], stats: DivisionStat[], division: string | null): string[] {
  const kinds = crimeKinds(items).filter((k) => k.kind !== "other" && k.kind !== "arrest");
  const bal = balance(items);
  const top = (division && stats.find((s) => s.id === division)) || stats[0];
  const lines: string[] = [];
  if (top?.reports) {
    const lead = division ? `${top.en} division has` : `${top.en} division has the most crime and corruption reports:`;
    lines.push(`${lead} ${top.reports}; for its population that is ${top.index >= 1 ? `${fmt(top.index, 1)}× the national average` : "below the national average"}.`);
  }
  // A count, not a verdict: the collectors ask more about harm than about gains, so the ratio does not measure the day.
  if (bal.harm + bal.loss || bal.gain) lines.push(`${bal.harm + bal.loss} reports of harm and loss, ${bal.gain} of achievement and development.`);
  if (kinds[0]) lines.push(`Most reported: ${KIND[kinds[0].kind].toLowerCase()}, ${kinds[0].count} reports.`);
  return lines;
}

export function Verdict({ lines, large }: { lines: string[]; large?: boolean }) {
  if (!lines.length) return <p className="font-sans text-sm text-white/75">Not enough reports in this window to read the day.</p>;
  return (
    <ul className="space-y-2">
      {lines.map((l) => (
        <li key={l} className={cn("flex gap-2 font-sans leading-snug text-white", large ? "text-lg" : "text-sm")}>
          <Icon name="arrow_right" className="mt-0.5 text-base! text-signal-orange" />
          {l}
        </li>
      ))}
    </ul>
  );
}

/** Each division's reports against its population, and the chance of another violent-crime report within 24 hours. */
export function DivisionRisk({ stats, division, onDivision }: { stats: DivisionStat[]; division: string | null; onDivision?: (id: DivisionStat["id"]) => void }) {
  const maxIndex = Math.max(1, ...stats.map((s) => s.index));
  return (
    <div>
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="text-left text-xs text-white/60">
            <th className="pb-1.5 font-medium">Division</th>
            <th className="pb-1.5 text-right font-medium">Reports</th>
            <th className="pb-1.5 pl-3 font-medium">Per person</th>
            <th className="pb-1.5 text-right font-medium whitespace-nowrap" title="Chance of another violent-crime report in the next 24 hours">Next 24 h</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.id} className={cn("border-t border-white/8", division === s.id && "bg-black/30")}>
              <th scope="row" className="py-1.5 pr-2 text-left font-semibold">
                {onDivision ? (
                  <button type="button" onClick={() => onDivision(s.id)} className={cn("hover:underline", division === s.id ? "text-signal-orange" : "text-white")}>
                    {s.en}
                  </button>
                ) : (
                  <span className={division === s.id ? "text-signal-orange" : "text-white"}>{s.en}</span>
                )}
              </th>
              <td className="w-12 py-1.5 pr-2 text-right text-white/80 tabular-nums">{s.reports}</td>
              <td className="py-1.5 pr-3 pl-3">
                <span className="block h-2 w-full overflow-hidden rounded-full bg-black/35" title={`${fmt(s.index, 1)}× the national average`}>
                  <span
                    className={cn("block h-full rounded-full transition-[width] duration-700", s.index > 1.5 ? "bg-national-crimson" : s.index > 1 ? "bg-zone-2" : "bg-bdnavy-300")}
                    style={{ width: `${Math.max(3, (s.index / maxIndex) * 100)}%` }}
                  />
                </span>
              </td>
              <td className="w-14 py-1.5 text-right font-semibold text-white tabular-nums">{pct(s.chance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 font-sans text-xs leading-relaxed text-white/60">
        Bar: share of reports ÷ share of population ({CENSUS_SOURCE.name}). Next 24 h: Poisson estimate from the window&apos;s rate of murder, rape and abduction reports.
      </p>
    </div>
  );
}

/** Reports per hour over the last day: harm and loss in red, achievement in gold. */
export function HourlyChart({ items, now, height = "h-32" }: { items: WireItem[]; now: number; height?: string }) {
  const hours = hourly(items, now, 24).map((b, i) => ({ ...b, label: i === 23 ? "now" : `-${23 - i}h` }));
  return (
    <div>
      <div className="flex gap-3 font-sans text-xs text-white/75">
        <span className="flex items-center gap-1">
          <span aria-hidden className="size-2 rounded-[2px] bg-national-crimson" />
          Harm and loss
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden className="size-2 rounded-[2px] bg-signal-orange" />
          Achievement
        </span>
      </div>
      <div className={cn("mt-2", height)} aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hours} barGap={1} margin={{ top: 4, right: 0, bottom: 0, left: -12 }}>
            <XAxis dataKey="label" interval={5} tick={{ fill: "rgb(255 255 255 / 0.6)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "rgb(255 255 255 / 0.6)", fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip
              cursor={{ fill: "rgb(255 255 255 / 0.06)" }}
              contentStyle={{ background: "#000", border: "1px solid rgb(255 255 255 / 0.15)", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "#fff" }}
              formatter={(v, name) => [String(v), name === "harm" ? "Harm and loss" : "Achievement"]}
            />
            <Bar dataKey="harm" fill="var(--color-national-crimson)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="gain" fill="var(--color-signal-orange)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** What crime is being reported, as bars. */
export function CrimeMix({ items, onKind, active }: { items: WireItem[]; onKind?: (k: CrimeKind | null) => void; active?: CrimeKind | null }) {
  const kinds = crimeKinds(items);
  const max = Math.max(1, ...kinds.map((k) => k.count));
  if (!kinds.length) return <p className="font-sans text-sm text-white/70">No crime reports in this window.</p>;
  return (
    <ul className="space-y-2">
      {kinds.map((k) => {
        const on = active === k.kind;
        const row = (
          <>
            <span className="flex justify-between gap-2 font-sans text-sm">
              <span className={on ? "font-semibold text-signal-orange" : "text-white"}>{KIND[k.kind]}</span>
              <span className="text-white/75 tabular-nums">{k.count}</span>
            </span>
            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/35">
              <span className="block h-full rounded-full bg-zone-2" style={{ width: `${(k.count / max) * 100}%` }} />
            </span>
          </>
        );
        return (
          <li key={k.kind}>
            {onKind ? (
              <button type="button" aria-pressed={on} onClick={() => onKind(on ? null : k.kind)} className="block w-full rounded-md text-left focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                {row}
              </button>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function RiskAdvice({ items, max = 4 }: { items: WireItem[]; max?: number }) {
  const kinds = crimeKinds(items).filter((k) => k.kind !== "other" && k.kind !== "arrest");
  const list = kinds.length ? kinds.slice(0, max) : [{ kind: "other" as CrimeKind, count: 0 }];
  return (
    <ul className="space-y-2">
      {list.map((k) => (
        <li key={k.kind} className="font-sans text-sm leading-snug">
          {k.kind !== "other" && <span className="font-semibold text-white">{KIND[k.kind]}: </span>}
          <span className="text-white/85">{ADVICE[k.kind]}</span>
        </li>
      ))}
    </ul>
  );
}

/** Who answers for crime, corruption and loss, with the number to call. */
export function Accountability({ columns }: { columns?: boolean }) {
  return (
    <ul className={cn("grid gap-2", columns && "sm:grid-cols-3")}>
      {(["crime", "corruption", "loss"] as const).map((c) => {
        const a = ACCOUNTABILITY[c];
        return (
          <li key={c} className="flex items-center gap-3 rounded-xl bg-black/30 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm leading-snug font-semibold text-white">{a.whoEn}</p>
              <p className="font-sans text-xs text-white/60">{a.callLabelEn}</p>
            </div>
            <a
              href={`tel:${a.call}`}
              className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg bg-signal-orange px-3 font-sans text-sm font-bold text-text-primary tabular-nums transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              aria-label={`${a.callLabelEn}: call ${a.call}`}
            >
              <Icon name="call" className="text-base!" />
              {a.call}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function Method() {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none font-sans text-xs font-semibold text-link-blue hover:underline focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
        <Icon name="info" className="mr-1 align-[-3px] text-base!" />
        How this is worked out
      </summary>
      <p className="mt-2 max-w-[75ch] font-sans text-xs leading-relaxed text-white/70">
        Collectors read Google News and Prothom Alo every two minutes. A headline&apos;s own words decide its kind, and the district or upazila it names decides its place; one story told by several outlets is counted once. This measures what the press is reporting, not police crime statistics: places with more reporters produce more reports. Read each report at its source before acting on it.
      </p>
    </details>
  );
}

/**
 * The whole analysis in one panel, for the TV screen and the kiosk:
 * verdict, divisions, the day by hour, advice and accountability.
 */
export function AnalysisPanel({
  items,
  national,
  all,
  now,
  windowHours,
  division,
  large,
}: {
  items: WireItem[];
  national: WireItem[];
  all: WireItem[];
  now: number;
  windowHours: number;
  division: string | null;
  large?: boolean;
}) {
  const stats = divisionStats(national, windowHours);
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", large && "mx-auto w-full max-w-6xl")}>
      <div className={cn("grid gap-4 p-5", large && "lg:grid-cols-2 lg:gap-6")}>
        <section aria-label="Today's reading" className="rounded-xl bg-black/30 p-4">
          <h3 className="mb-2 font-grotesk text-sm font-bold text-signal-orange">Today&apos;s reading</h3>
          <Verdict lines={verdictLines(items, stats, division)} />
        </section>
        <section aria-label="Division risk" className={cn(large && "lg:row-span-2")}>
          <h3 className="mb-2 font-grotesk text-sm font-bold text-signal-orange">Division risk</h3>
          <DivisionRisk stats={stats} division={division} />
        </section>
        <section aria-label="Last 24 hours" className="rounded-xl bg-black/30 p-4">
          <h3 className="mb-2 font-grotesk text-sm font-bold text-signal-orange">Last 24 hours</h3>
          <HourlyChart items={all} now={now} />
        </section>
        <section aria-label="Lower the risk and who answers" className={cn("rounded-xl bg-black/30 p-4", large && "lg:col-span-2")}>
          <h3 className="mb-2 font-grotesk text-sm font-bold text-signal-orange">Lower the risk</h3>
          <RiskAdvice items={items} max={large ? 4 : 2} />
          <h3 className="mt-4 mb-2 font-grotesk text-sm font-bold text-signal-orange">Who answers for it</h3>
          <Accountability columns={large} />
          <div className="mt-3">
            <Method />
          </div>
        </section>
      </div>
    </div>
  );
}
