"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { growthFilm, milestones } from "@/data/bangladesh";
import { WB_SOURCE_URL, growthSeries } from "@/data/bangladesh-growth";
import { cn } from "@/lib/utils";
import { StoryHeading } from "./story-heading";
import { StoryPhoto } from "./story-photo";
import { StoryVideo } from "./story-video";

const bn = (n: number, digits = 0) =>
  n.toLocaleString("bn-BD", { maximumFractionDigits: digits, minimumFractionDigits: digits });

interface ChartSpec {
  key: keyof typeof growthSeries;
  title: string;
  unit: string;
  color: string;
  /** Display transform (e.g. dollars → billions). */
  scale?: number;
  digits?: number;
  /** "down" means falling is the good news — the badge reads that way. */
  good: "up" | "down";
  note?: string;
}

const CHARTS: ChartSpec[] = [
  { key: "gdpPerCapita", title: "মাথাপিছু জিডিপি", unit: "ডলার", color: "#006747", good: "up" },
  { key: "lifeExpectancy", title: "গড় আয়ু", unit: "বছর", color: "#0f766e", good: "up", digits: 1, note: "১৯৭১-এর ২৬.৫ বছর যুদ্ধের বছরের হিসাব" },
  { key: "under5Mortality", title: "পাঁচ বছরের নিচে শিশুমৃত্যু", unit: "প্রতি হাজারে", color: "#da291c", good: "down", digits: 1 },
  { key: "electricity", title: "বিদ্যুৎ সুবিধা", unit: "% মানুষ", color: "#ea580c", good: "up", digits: 1 },
  { key: "poverty", title: "চরম দারিদ্র্য ($৩/দিন)", unit: "% মানুষ", color: "#b45309", good: "down", digits: 1 },
  { key: "literacy", title: "প্রাপ্তবয়স্ক সাক্ষরতা", unit: "%", color: "#4338ca", good: "up", digits: 1 },
  // Millions, not billions: 1976's $18.8M would read "0.0" in billions.
  { key: "remittances", title: "প্রবাসী আয়", unit: "মিলিয়ন ডলার", color: "#059669", good: "up", scale: 1e-6 },
  { key: "population", title: "জনসংখ্যা", unit: "কোটি", color: "#334155", good: "up", scale: 1e-7, digits: 1 },
];

const W = 560;
const H = 220;
const PAD = { l: 8, r: 8, t: 16, b: 34 };

function GrowthChart({ spec }: { spec: ChartSpec }) {
  const gradId = useId();
  const series = growthSeries[spec.key];
  const pts = series.points.map(([y, v]) => [y, v * (spec.scale ?? 1)] as [number, number]);
  const [hover, setHover] = useState<number | null>(null);

  const x0 = 1971;
  const x1 = 2026;
  const vmax = Math.max(...pts.map((p) => p[1])) * 1.08;
  const X = (y: number) => PAD.l + ((y - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);
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

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const year = x0 + ((e.clientX - r.left) / r.width) * (x1 - x0);
    let best = 0;
    pts.forEach((p, i) => {
      if (Math.abs(p[0] - year) < Math.abs(pts[best][0] - year)) best = i;
    });
    setHover(best);
  };

  const badge =
    spec.good === "up"
      ? `${bn(ratio, ratio < 10 ? 1 : 0)} গুণ`
      : `${bn((1 - ratio) * 100)}% কম`;

  return (
    <figure
      className="glass-card story-reveal flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      style={{ "--card-accent": spec.color } as React.CSSProperties}
    >
      <figcaption className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bengali text-base font-bold text-text-primary">{spec.title}</p>
          <p className="font-bengali text-xs text-slate-500">{spec.unit}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 font-bengali text-xs font-bold text-white"
          style={{ backgroundColor: spec.color }}
        >
          {badge}
        </span>
      </figcaption>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-bengali text-3xl font-bold tabular-nums" style={{ color: spec.color }}>
          {bn(shown[1], digits)}
        </span>
        <span className="font-bengali text-sm text-slate-500">({bn(shown[0])})</span>
      </div>
      <p className="font-bengali text-xs text-slate-500">
        {bn(first[0])} সালে {bn(first[1], digits)} → {bn(last[0])} সালে {bn(last[1], digits)}
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 h-auto w-full touch-none rounded-lg focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
        role="img"
        tabIndex={0}
        aria-label={`${spec.title}: ${bn(first[0])} সালে ${bn(first[1], digits)}, ${bn(last[0])} সালে ${bn(last[1], digits)} ${spec.unit}। বছর বদলাতে বাম-ডান তীর চাপুন।`}
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
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={spec.color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={spec.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Decade grid. */}
        {[1971, 1991, 2011].map((y) => (
          <g key={y}>
            <line x1={X(y)} x2={X(y)} y1={PAD.t} y2={H - PAD.b} className="stroke-slate-100" />
            <text x={X(y) + (y === 1971 ? 4 : 0)} y={H - 6} textAnchor={y === 1971 ? "start" : "middle"} className="fill-slate-500 font-bengali text-[22px]">
              {bn(y)}
            </text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} className="stroke-slate-200" />
        <path d={area} fill={`url(#${gradId})`} className="story-reveal" />
        <path d={line} pathLength={1} fill="none" stroke={spec.color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" className="story-draw" />
        <circle cx={X(last[0])} cy={Y(last[1])} r={5} fill={spec.color} className="stroke-white" strokeWidth={2} />
        {hover !== null && (
          <g>
            <line x1={X(shown[0])} x2={X(shown[0])} y1={PAD.t} y2={H - PAD.b} stroke={spec.color} strokeDasharray="4 4" />
            <circle cx={X(shown[0])} cy={Y(shown[1])} r={6} fill="white" stroke={spec.color} strokeWidth={3} />
          </g>
        )}
      </svg>
      {spec.note && <p className="mt-1 font-bengali text-[11px] text-slate-400">{spec.note}</p>}
    </figure>
  );
}

export function BdGrowth() {
  return (
    <section id="growth" className="section-band scroll-mt-40">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          index="০৭"
          kicker="অগ্রযাত্রা · ১৯৭১ → ২০২৬"
          title="যুদ্ধবিধ্বস্ত দেশ থেকে উঠে দাঁড়ানোর গল্প"
          accent="উঠে দাঁড়ানোর"
          lede="সংখ্যাগুলো বিশ্বব্যাংকের প্রকাশিত তথ্য — কোনোটিই অনুমান নয়। গ্রাফের ওপর আঙুল বা মাউস রাখলে যেকোনো বছরের মান দেখা যাবে।"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {CHARTS.map((c) => (
            <GrowthChart key={c.key} spec={c} />
          ))}
        </div>
        <p className="mt-4 text-right font-mono text-[11px] text-slate-500">
          Source:{" "}
          <a href={WB_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-bd-green hover:underline">
            World Bank — World Development Indicators
          </a>{" "}
          · fetched Sept 2026
        </p>

        {/* Milestones. */}
        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <StoryVideo film={growthFilm} size="tall" />
          </div>
          <ol className="relative space-y-4 lg:col-span-7">
            <span aria-hidden className="absolute top-2 bottom-2 left-[1.1rem] w-0.5 bg-linear-to-b from-bd-green to-signal-orange" />
            {milestones.map((m) => (
              <li key={m.year + m.title} className="story-reveal relative flex gap-4 pl-0">
                <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-bd-green">
                  <Icon name="flag" filled className="text-[18px]! text-bd-green" />
                </span>
                <div
                  className={cn(
                    "glass-card flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs",
                    "photo" in m && m.photo && "grid grid-cols-1 sm:grid-cols-[1fr_12rem]",
                  )}
                  style={{ "--card-accent": "var(--color-bd-green)" } as React.CSSProperties}
                >
                  <div className="p-4">
                    <span className="font-bengali text-lg font-bold text-signal-orange">{m.year}</span>
                    <h3 className="font-bengali text-lg font-bold text-text-primary">{m.title}</h3>
                    <p className="font-bengali text-sm leading-relaxed text-text-secondary">{m.body}</p>
                  </div>
                  {"photo" in m && m.photo && (
                    <StoryPhoto photo={m.photo} sizes="200px" className="min-h-32" />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
