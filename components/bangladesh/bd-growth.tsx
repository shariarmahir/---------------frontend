"use client";

import { useState } from "react";
import { Card, LINK, Section } from "@/components/bangladesh-landing/kit";
import { P, milestones } from "@/data/bangladesh-history";
import { WB_SOURCE_URL, growthSeries } from "@/data/bangladesh-growth";
import { PhotoCredit, StoryPhoto } from "./story-photo";

const fmt = (n: number, digits = 0) => n.toLocaleString("en-GB", { maximumFractionDigits: digits, minimumFractionDigits: digits });

interface ChartSpec {
  key: keyof typeof growthSeries;
  title: string;
  unit: string;
  /** Display transform (e.g. people → millions). */
  scale?: number;
  digits?: number;
  /** "down" means falling is the good news, and the badge reads that way. */
  good: "up" | "down";
  note?: string;
}

const CHARTS: ChartSpec[] = [
  { key: "gdpPerCapita", title: "GDP per person", unit: "US dollars", good: "up" },
  { key: "lifeExpectancy", title: "Life expectancy", unit: "years", good: "up", digits: 1, note: "1971's 26.5 years is the estimate for the war year." },
  { key: "under5Mortality", title: "Deaths before age five", unit: "per 1,000 live births", good: "down", digits: 1 },
  { key: "electricity", title: "Access to electricity", unit: "% of people", good: "up", digits: 1 },
  { key: "poverty", title: "Extreme poverty ($3 a day)", unit: "% of people", good: "down", digits: 1 },
  { key: "literacy", title: "Adult literacy", unit: "% of adults", good: "up", digits: 1 },
  { key: "remittances", title: "Money sent home from abroad", unit: "million US dollars", good: "up", scale: 1e-6 },
  { key: "population", title: "Population", unit: "million people", good: "up", scale: 1e-6, digits: 1 },
];

const W = 560;
const H = 220;
const PAD = { l: 8, r: 8, t: 16, b: 38 };
const X0 = 1971;
const X1 = 2026;

/** One World Bank series as a line from 1971: the latest value large, any year on pointer or arrow keys. */
function GrowthChart({ spec }: { spec: ChartSpec }) {
  const pts = growthSeries[spec.key].points.map(([y, v]) => [y, v * (spec.scale ?? 1)] as [number, number]);
  const [hover, setHover] = useState<number | null>(null);

  const vmax = Math.max(...pts.map((p) => p[1])) * 1.08;
  const X = (y: number) => PAD.l + ((y - X0) / (X1 - X0)) * (W - PAD.l - PAD.r);
  const Y = (v: number) => PAD.t + (1 - v / vmax) * (H - PAD.t - PAD.b);
  const line = pts.map(([y, v], i) => `${i ? "L" : "M"}${X(y).toFixed(1)},${Y(v).toFixed(1)}`).join("");
  const area = `${line}L${X(pts[pts.length - 1][0]).toFixed(1)},${H - PAD.b}L${X(pts[0][0]).toFixed(1)},${H - PAD.b}Z`;

  // Comparisons start in 1972: 1971 is the war year, and measuring the
  // recovery against it would overstate every change. The line still
  // draws 1971.
  const first = pts.find((p) => p[0] >= 1972) ?? pts[0];
  const last = pts[pts.length - 1];
  const ratio = last[1] / first[1];
  const shown = hover !== null ? pts[hover] : last;
  const digits = spec.digits ?? 0;
  const badge = spec.good === "up" ? `${fmt(ratio, ratio < 10 ? 1 : 0)}× since ${first[0]}` : `${fmt((1 - ratio) * 100)}% lower since ${first[0]}`;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const year = X0 + ((e.clientX - r.left) / r.width) * (X1 - X0);
    let best = 0;
    pts.forEach((p, i) => {
      if (Math.abs(p[0] - year) < Math.abs(pts[best][0] - year)) best = i;
    });
    setHover(best);
  };

  return (
    <Card className="story-reveal flex h-full flex-col p-5 sm:p-6">
      <figure className="flex h-full flex-col">
        <figcaption>
          <span className="block text-base font-semibold text-white">{spec.title}</span>
          <span className="block text-sm text-white/80">{spec.unit}</span>
        </figcaption>
        <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
          <span className="font-grotesk text-3xl font-bold text-signal-orange tabular-nums">{fmt(shown[1], digits)}</span>
          <span className="text-sm text-white/80 tabular-nums">in {shown[0]}</span>
        </p>
        <p className="mt-1 text-sm text-white/80 tabular-nums">
          {first[0]}: {fmt(first[1], digits)} · <span className="font-semibold text-white">{badge}</span>
        </p>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-4 h-auto w-full touch-none rounded-lg focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
          role="img"
          tabIndex={0}
          aria-label={`${spec.title}: ${fmt(first[1], digits)} in ${first[0]}, ${fmt(last[1], digits)} in ${last[0]} (${spec.unit}). Use the left and right arrow keys to read other years.`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onBlur={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            const cur = hover ?? pts.length - 1;
            setHover(Math.min(pts.length - 1, Math.max(0, cur + (e.key === "ArrowRight" ? 1 : -1))));
          }}
        >
          {[1971, 1991, 2011].map((y) => (
            <g key={y}>
              <line x1={X(y)} x2={X(y)} y1={PAD.t} y2={H - PAD.b} className="stroke-white/12" />
              <text x={X(y) + (y === X0 ? 4 : 0)} y={H - 8} textAnchor={y === X0 ? "start" : "middle"} className="fill-white/80 text-2xl">
                {y}
              </text>
            </g>
          ))}
          <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} className="stroke-white/25" />
          <path d={area} className="fill-bdnavy-400/20" />
          <path d={line} pathLength={1} fill="none" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" className="story-draw stroke-signal-orange" />
          <circle cx={X(last[0])} cy={Y(last[1])} r={6} strokeWidth={2} className="fill-signal-orange stroke-black" />
          {hover !== null && (
            <g>
              <line x1={X(shown[0])} x2={X(shown[0])} y1={PAD.t} y2={H - PAD.b} strokeDasharray="4 4" className="stroke-white/65" />
              <circle cx={X(shown[0])} cy={Y(shown[1])} r={7} strokeWidth={3} className="fill-black stroke-signal-orange" />
            </g>
          )}
        </svg>
        {spec.note && <p className="mt-2 text-xs text-white/80">{spec.note}</p>}
      </figure>
    </Card>
  );
}

/** Half a century in eight World Bank series, then the milestones beside the Padma Bridge. */
export function BdGrowth() {
  return (
    <Section
      id="growth"
      title="From a war-torn start to a country on the rise"
      lede="These figures are the World Bank's published data, not estimates of ours. Point at a chart, or focus it and use the arrow keys, to read any year."
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
        {CHARTS.map((c) => (
          <li key={c.key}>
            <GrowthChart spec={c} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-white/65">
        Source:{" "}
        <a href={WB_SOURCE_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
          World Bank, World Development Indicators<span className="sr-only"> (opens in a new tab)</span>
        </a>
        , fetched September 2026.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-16">
        <div className="story-reveal self-start lg:sticky lg:top-[calc(var(--spacing-header-lg)+2rem)] lg:col-span-5">
          <h3 className="font-grotesk text-2xl font-bold text-signal-orange sm:text-3xl">Milestones since 1971</h3>
          <StoryPhoto photo={P.padmabridge} sizes="(min-width: 1024px) 38vw, 100vw" className="mt-6 aspect-4/3 rounded-3xl ring-1 ring-white/12" hideCredit />
          <p className="mt-4 text-sm font-semibold text-white">{P.padmabridge.alt}</p>
          <PhotoCredit photo={P.padmabridge} className="mt-1.5" />
        </div>
        <ol className="lg:col-span-7">
          {milestones.map((m) => (
            <li key={m.year} className="story-reveal grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-t border-white/12 py-6 first:border-t-0 first:pt-0 sm:grid-cols-[6rem_minmax(0,1fr)] lg:first:pt-2">
              <span className="font-grotesk text-2xl font-bold text-signal-orange tabular-nums">{m.year}</span>
              <div>
                <h4 className="font-grotesk text-lg font-bold text-white">{m.title}</h4>
                <p className="mt-1 text-base leading-relaxed text-white/80">{m.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
