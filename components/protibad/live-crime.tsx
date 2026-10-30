"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { DISTRICT_NAMES } from "@/data/tv-wall/district-names";
import { DIVISIONS } from "@/data/tv-wall/sources";
import type { CrimeKind, RiskLevel, WireItem } from "@/lib/tv-wall/core";
import type { DistrictReading } from "@/lib/tv-wall/geo";
import { cn } from "@/lib/utils";
import { CountUp, KIND_LABEL, ago, fmt, kindIcon, kindLabel, perHour, sourceName, tally, useClock, useSeen } from "./kit";
import { useWire } from "./wire";

// The district map and the TV player load when this section does, not with the page's first view.
const RiskMapSvg = dynamic(() => import("@/components/tv-wall/crime-map").then((m) => m.RiskMapSvg), {
  ssr: false,
  loading: () => <div className="pb-shimmer min-h-80 flex-1 rounded-2xl" />,
});
const LiveTv = dynamic(() => import("@/components/tv-wall/live-tv").then((m) => m.LiveTv), {
  ssr: false,
  loading: () => <div className="pb-shimmer aspect-video w-full" />,
});

type Filter = CrimeKind | "corruption" | "all";
const LIST_STEP = 8;
const VIOLENT = new Set<CrimeKind>(["murder", "rape", "abduction"]);

/** Severity-weighted score per day → map zone, as the TV wall reads it (lib/tv-wall/core.ts, riskLevel). */
const levelOf = (score: number): RiskLevel => (score >= 6 ? 3 : score >= 3 ? 2 : score > 0 ? 1 : 0);
const filterOf = (i: WireItem): Filter => (i.category === "corruption" ? "corruption" : (i.crimeKind ?? "other"));

/**
 * "Across the country, right now": the last 24 hours of crime and corruption news on
 * the TV wall's real wire, read four ways: the district map (zones by how
 * much is being reported, a ping where a life was lost in the last six
 * hours), the reports themselves (filter by kind or by tapping a district),
 * the hour-by-hour line, and the kinds and divisions as bars that grow in
 * when they come on screen. A live news channel plays beside them. Every
 * figure is headline-derived and says so; the police's own counts are in
 * the next section.
 */
export function LiveCrime() {
  const wire = useWire();
  const [filter, setFilter] = useState<Filter>("all");
  const [district, setDistrict] = useState<string | null>(null);
  const [shown, setShown] = useState(LIST_STEP);
  const clock = useClock();
  const now = Math.max(clock ?? 0, wire.at);

  const readings = useMemo<DistrictReading[]>(() => {
    const by = new Map<string, DistrictReading>();
    for (const i of wire.harm) {
      if (!i.district) continue;
      const r = by.get(i.district) ?? {
        id: i.district,
        name: DISTRICT_NAMES[i.district]?.en ?? i.district,
        score: 0,
        count: 0,
        level: 0 as RiskLevel,
        top: { title: i.title, url: i.url, source: i.source },
      };
      r.score += i.severity;
      r.count += 1;
      by.set(i.district, r);
    }
    return [...by.values()].map((r) => ({ ...r, level: levelOf(r.score) }));
  }, [wire.harm]);
  const pings = useMemo(
    () => [...new Set(wire.harm.filter((i) => i.district && i.severity === 3 && now - i.publishedAt <= 6 * 3_600_000).map((i) => i.district!))],
    [wire.harm, now],
  );

  const kinds = useMemo(() => tally(wire.harm, filterOf), [wire.harm]);
  const list = wire.harm.filter((i) => (filter === "all" || filterOf(i) === filter) && (!district || i.district === district));

  const pick = (f: Filter) => {
    setFilter(f);
    setShown(LIST_STEP);
  };
  const label = (f: Filter) => (f === "all" ? "All" : f === "corruption" ? "Corruption" : KIND_LABEL[f]);

  return (
    <section id="live" aria-labelledby="live-title" className="section-band w-full scroll-mt-40 bg-black">
      <div className="mx-auto max-w-384 px-gutter-x">
        <SectionHeading
          tone="dark"
          title={<span id="live-title">Across the country, right now</span>}
          lead="Crime and corruption reported by the news in the last 24 hours, by district, kind and hour. Updated every two minutes."
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* The map. */}
          <div className="story-reveal flex h-[32rem] flex-col overflow-hidden rounded-3xl bg-bdnavy-900 p-4 ring-1 ring-white/12 ring-inset sm:p-5 lg:h-[42rem]">
            {wire.status === "loading" && !wire.harm.length ? (
              <div className="pb-shimmer min-h-80 flex-1 rounded-2xl" />
            ) : (
              <RiskMapSvg readings={readings} pings={pings} selected={district} onSelect={(id) => (setDistrict(id), setShown(LIST_STEP))} />
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-sans text-xs text-white/65">
              <span className="flex flex-wrap items-center gap-3">
                {(["Quiet", "Reported", "Watch", "Red zone"] as const).map((name, l) => (
                  <span key={name} className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="size-3 rounded-[3px] ring-1 ring-white/20"
                      style={{
                        background: ["#1a2c7a", "#3d56b8", "#a8231b", "#da291c"][l],
                      }}
                    />
                    {name}
                  </span>
                ))}
              </span>
              <span>Tap a district to see only its reports</span>
            </div>
          </div>

          {/* The reports. */}
          <div className="story-reveal flex max-h-[40rem] min-h-[24rem] flex-col overflow-hidden rounded-3xl bg-text-primary ring-1 ring-white/12 ring-inset lg:h-[42rem] lg:max-h-none">
            <div role="group" aria-label="Kind of report" className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/10 p-4">
              {(["all", ...kinds.map((k) => k.key)] as Filter[]).map((f) => {
                const count = f === "all" ? wire.harm.length : (kinds.find((k) => k.key === f)?.count ?? 0);
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={filter === f}
                    onClick={() => pick(f)}
                    className={cn(
                      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 font-sans text-sm font-semibold whitespace-nowrap transition-[background-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none active:scale-95",
                      filter === f ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white ring-1 ring-white/15 hover:bg-white/15",
                    )}
                  >
                    {label(f)}
                    <span className={cn("tabular-nums", filter === f ? "text-text-primary/75" : "text-white/60")}>{fmt(count)}</span>
                  </button>
                );
              })}
            </div>

            {district && (
              <p className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-2.5 font-sans text-sm text-white/80">
                <span>
                  Only <strong className="text-signal-orange">{DISTRICT_NAMES[district]?.en}</strong> district
                </span>
                <button
                  type="button"
                  onClick={() => setDistrict(null)}
                  className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-white/80 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                >
                  <Icon name="close" className="text-lg" /> Whole country
                </button>
              </p>
            )}

            <ul className="flex min-h-0 flex-1 flex-col divide-y divide-white/8 overflow-y-auto overscroll-contain px-2">
              {list.slice(0, shown).map((item) => (
                <li key={item.id} className={cn(wire.fresh.has(item.id) && "live-in")}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 rounded-xl px-3 py-3.5 transition-colors duration-200 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1 h-10 w-1 shrink-0 rounded-full",
                        item.severity === 3 ? "bg-national-crimson" : item.severity === 2 ? "bg-signal-orange" : "bg-bdnavy-400",
                      )}
                    />
                    <Icon name={kindIcon(item)} className={cn("mt-0.5 shrink-0 text-xl", item.severity === 3 ? "text-crimson-bright" : "text-bdnavy-300")} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bengali text-base leading-snug font-semibold text-white group-hover:text-signal-orange">{item.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-sans text-xs text-white/65">
                        <span className={item.severity === 3 ? "text-crimson-bright" : "text-bdnavy-300"}>{kindLabel(item)}</span>
                        {item.district && <span>{DISTRICT_NAMES[item.district]?.en}</span>}
                        <span>{ago(item.publishedAt, now)}</span>
                        <span>{sourceName(item.source)}</span>
                        {item.alsoIn.length > 0 && <span>+{item.alsoIn.length} more outlet{item.alsoIn.length === 1 ? "" : "s"}</span>}
                        {wire.fresh.has(item.id) && <span className="rounded-md bg-signal-orange px-1.5 font-semibold text-text-primary">New</span>}
                      </span>
                    </span>
                    <Icon
                      name="arrow_outward"
                      className="mt-0.5 shrink-0 text-lg text-white/40 transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal-orange"
                    />
                  </a>
                </li>
              ))}
              {!list.length && (
                <li className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center font-sans text-sm text-white/70">
                  <Icon name={wire.status === "offline" ? "cloud_off" : "inbox"} className="text-3xl text-bdnavy-300" />
                  {wire.status === "loading"
                    ? "Loading the news…"
                    : wire.status === "offline"
                      ? "The news sources are not answering. The page tries again in a moment."
                      : "Nothing of this kind in the last 24 hours."}
                </li>
              )}
            </ul>
            {list.length > shown && (
              <button
                type="button"
                onClick={() => setShown((s) => s + LIST_STEP)}
                className="m-3 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-white/8 font-sans text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
              >
                Show {Math.min(LIST_STEP, list.length - shown)} more
                <Icon name="expand_more" className="text-lg" />
              </button>
            )}
          </div>
        </div>

        {/* Three readings and the live channel. */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <HourChart bins={perHour(wire.harm, now)} ready={wire.status === "live"} />
          <KindBars
            kinds={kinds.slice(0, 6).map((k) => ({
              label: label(k.key),
              count: k.count,
              red: k.key !== "corruption" && VIOLENT.has(k.key as CrimeKind),
            }))}
          />
          <DivisionBars items={wire.harm} />
          <div className="story-reveal flex flex-col overflow-hidden rounded-3xl bg-bdnavy-900 ring-1 ring-white/12 ring-inset">
            <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
              <h3 className="font-grotesk text-lg font-bold text-signal-orange">Live news channels</h3>
              <Link
                href="/tv-wall/live"
                className="inline-flex min-h-9 items-center gap-1 rounded-lg font-sans text-sm font-semibold text-white/80 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
              >
                TV wall <Icon name="arrow_outward" className="text-base" />
              </Link>
            </div>
            {wire.channels.length ? <LiveTv channels={wire.channels} /> : <div className="pb-shimmer aspect-video w-full" />}
          </div>
        </div>

        <p className="story-reveal mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-sm text-white/65">
          <span className="flex items-start gap-2">
            <Icon name="info" className="mt-0.5 shrink-0 text-lg text-bdnavy-300" />
            Counted from news headlines, not police records. Sources: Google News and Prothom Alo, collected by the National TV Wall.
          </span>
          <Link href="/tv-wall/crime" className="inline-flex min-h-10 items-center gap-1 font-semibold text-signal-orange hover:underline">
            Full crime analysis on the TV wall <Icon name="arrow_outward" className="text-base" />
          </Link>
        </p>
      </div>
    </section>
  );
}

/** The last 24 hours as a line that draws itself in when it comes on screen. */
function HourChart({ bins, ready }: { bins: number[]; ready: boolean }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const W = 300;
  const H = 120;
  const max = Math.max(1, ...bins);
  const step = W / (bins.length - 1);
  const pts = bins.map((v, i) => [i * step, H - 8 - (v / max) * (H - 24)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const area = `${line}L${W},${H}L0,${H}Z`;
  const peak = bins.indexOf(max);
  const total = bins.reduce((s, v) => s + v, 0);
  return (
    <div ref={ref} className="story-reveal flex flex-col rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 ring-inset">
      <h3 className="font-grotesk text-lg font-bold text-signal-orange">Reports by the hour</h3>
      <p className="mt-1 font-sans text-sm text-white/65">
        <span className="font-semibold text-white">{ready ? <CountUp to={total} run={seen} /> : "—"}</span> reports in 24 hours
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full overflow-visible"
        role="img"
        aria-label={`Reports per hour over the last 24 hours; the busiest hour had ${max}.`}
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgb(255 255 255 / 0.08)" />
        ))}
        <path
          d={area}
          fill="var(--color-signal-orange)"
          className={cn("transition-opacity delay-500 duration-700", seen && ready ? "opacity-15" : "opacity-0")}
        />
        <path
          d={line}
          fill="none"
          stroke="var(--color-signal-orange)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={seen && ready ? 0 : 1}
          className="transition-[stroke-dashoffset] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        />
        {ready && max > 0 && (
          <g className={cn("transition-opacity delay-1000 duration-500", seen ? "opacity-100" : "opacity-0")}>
            <circle cx={pts[peak][0]} cy={pts[peak][1]} r="4.5" fill="#fff" stroke="var(--color-signal-orange)" strokeWidth="2" />
          </g>
        )}
      </svg>
      <div className="mt-2 flex justify-between font-sans text-xs text-white/65">
        <span>24 hours ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}

/** Bars that grow from the left when they come on screen. */
function Bars({ title, rows, note }: { title: string; rows: { label: string; count: number; red?: boolean; sub?: string }[]; note?: string }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div ref={ref} className="story-reveal flex flex-col rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 ring-inset">
      <h3 className="font-grotesk text-lg font-bold text-signal-orange">{title}</h3>
      {rows.length ? (
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((r, i) => (
            <li key={r.label}>
              <span className="flex items-baseline justify-between gap-2 font-sans text-sm">
                <span className="truncate text-white/85">{r.label}</span>
                <span className="shrink-0 font-semibold text-white tabular-nums">
                  {fmt(r.count)}
                  {r.sub && <span className="ml-1.5 text-xs font-normal text-white/60">{r.sub}</span>}
                </span>
              </span>
              <span aria-hidden className="mt-1.5 block h-2 overflow-hidden rounded-full bg-white/8">
                <span
                  className={cn(
                    "block h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                    r.red ? "bg-national-crimson" : "bg-signal-orange",
                  )}
                  style={{
                    width: seen ? `${(r.count / max) * 100}%` : "0%",
                    transitionDelay: `${i * 90}ms`,
                  }}
                />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 font-sans text-sm text-white/65">Shows here as the news comes in.</p>
      )}
      {note && <p className="mt-auto pt-4 font-sans text-xs text-white/65">{note}</p>}
    </div>
  );
}

function KindBars({ kinds }: { kinds: { label: string; count: number; red: boolean }[] }) {
  return <Bars title="What kind of crime" rows={kinds} note="Red: a life or a body harmed" />;
}

/** Reports per division, with the rate per million people (BBS census 2022) beside each. */
function DivisionBars({ items }: { items: WireItem[] }) {
  const rows = DIVISIONS.map((d) => {
    const count = items.filter((i) => i.division === d.id).length;
    return {
      label: d.en,
      count,
      sub: `${((count / d.population) * 1_000_000).toFixed(1)} per million`,
    };
  })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  return <Bars title="By division" rows={rows} note="Population: BBS Census 2022" />;
}
