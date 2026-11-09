"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { Point } from "@/lib/motherland-future";
import { cn } from "@/lib/utils";

/*
 * The bright-future graph: income per person, one axis, three lines. The
 * years to 2025 are World Bank data (white); from 2025 two projections run
 * to the horizon: today's pace (blue, dashed) and the visitor's plan (gold,
 * with a soft fill). The World Bank's income lines are drawn for scale.
 * Hovering shows every value for the year under the pointer; `reveal`
 * (0–1) draws the projections out year by year when the simulation plays; `drawn` draws the
 * World Bank line in and fades the grid up the first time the graph is seen (.ml-chart).
 * Palette checked with the dataviz validator on the ink surface.
 */

export const SERIES = {
  history: { label: "World Bank data", color: "#ffffff" },
  pace: { label: "Today's pace", color: "#45a1c4" },
  plan: { label: "Your plan", color: "#c08a12" },
};

/** Drawn at the size it is shown (it fills its panel), so its 12px labels stay 12px on a phone. */
const NARROW = 560;

const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
const short = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `$${v}`);

/** A round top for the axis: 1, 2 or 5 times a power of ten, with room above the highest point. */
function niceMax(v: number) {
  const step = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * step).find((m) => m >= v * 1.06) ?? v;
}

export function FutureChart({
  history,
  pace,
  plan,
  thresholds,
  reveal,
  drawn = true,
}: {
  history: Point[];
  pace: Point[];
  plan: Point[];
  thresholds: { value: number; label: string }[];
  reveal: number;
  drawn?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [size, setSize] = useState({ w: 800, h: 420 });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: Math.max(300, Math.round(entry.contentRect.width)), h: Math.max(260, Math.round(entry.contentRect.height)) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w: W, h: H } = size;
  const narrow = W < NARROW;
  const PAD = { top: 20, right: narrow ? 52 : 104, bottom: 36, left: narrow ? 46 : 58 };

  const x0 = history[0][0];
  const x1 = plan.at(-1)![0];
  const today = pace[0][0];
  const yMax = niceMax(Math.max(plan.at(-1)![1], pace.at(-1)![1], thresholds[0].value));
  const x = (year: number) => PAD.left + ((year - x0) / (x1 - x0)) * (W - PAD.left - PAD.right);
  const y = (v: number) => H - PAD.bottom - (v / yMax) * (H - PAD.top - PAD.bottom);
  const line = (pts: Point[]) => pts.map(([yr, v], i) => `${i ? "L" : "M"}${x(yr).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  const area = (pts: Point[]) => `${line(pts)}L${x(pts.at(-1)![0])} ${y(0)}L${x(pts[0][0])} ${y(0)}Z`;

  const ticks = useMemo(() => [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax), [yMax]);
  const label = (t: { value: number; label: string }) => (narrow ? short(t.value) : `${t.label} (${short(t.value)})`);
  const years = (narrow ? [2000, today, x1] : [2000, 2010, 2020, today, 2030, x1]).filter((v, i, a) => a.indexOf(v) === i);
  const revealX = x(today) + reveal * (x(x1) - x(today));

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const year = Math.round(x0 + ((svgX - PAD.left) / (W - PAD.left - PAD.right)) * (x1 - x0));
    setHover(year < x0 || year > x1 ? null : year);
  };

  const at = (pts: Point[], year: number) => pts.find(([yr]) => yr === year)?.[1];
  const tip = hover === null ? null : { history: at(history, hover), pace: at(pace, hover), plan: at(plan, hover) };
  const end = { plan: plan.at(-1)![1], pace: pace.at(-1)![1] };

  return (
    <div ref={box} data-drawn={drawn} className="ml-chart relative min-h-72 flex-1 lg:min-h-80" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Income per person: World Bank data to ${today}, then today's pace reaching ${usd(end.pace)} and your plan reaching ${usd(end.plan)} by ${x1}.`} className="absolute inset-0 size-full touch-none overflow-visible">
        <defs>
          <clipPath id="future-reveal">
            <rect x="0" y="0" width={revealX} height={H} />
          </clipPath>
        </defs>

        {ticks.map((t) => (
          <g key={t} className="ml-chart-grid">
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="white" strokeOpacity={t ? 0.08 : 0.25} />
            <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" className="fill-white/60 text-[12px]">
              {short(t)}
            </text>
          </g>
        ))}
        {years.map((yr) => (
          <text key={yr} x={x(yr)} y={H - 12} textAnchor="middle" className={cn("text-[12px]", yr === today ? "fill-white" : "fill-white/60")}>
            {yr}
          </text>
        ))}

        {thresholds
          .filter((t) => t.value < yMax)
          .map((t) => (
            <g key={t.label}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t.value)} y2={y(t.value)} stroke="white" strokeOpacity="0.35" strokeDasharray="2 5" />
              <text x={PAD.left + 8} y={y(t.value) - 7} className="fill-white/70 text-[11px]">
                {label(t)}
              </text>
            </g>
          ))}

        <line x1={x(today)} x2={x(today)} y1={PAD.top} y2={y(0)} stroke="white" strokeOpacity="0.2" />

        <path d={line(history)} pathLength={1} className="ml-chart-draw" fill="none" stroke={SERIES.history.color} strokeWidth="2" strokeLinejoin="round" />
        <g clipPath="url(#future-reveal)">
          <path d={area(plan)} fill={SERIES.plan.color} fillOpacity="0.16" />
          <path d={line(pace)} fill="none" stroke={SERIES.pace.color} strokeWidth="2" strokeDasharray="6 5" />
          <path d={line(plan)} fill="none" stroke={SERIES.plan.color} strokeWidth="2.5" strokeLinejoin="round" />
        </g>

        {reveal >= 1 && (
          <g className="text-[12px] font-semibold">
            {[
              { key: "plan" as const, v: end.plan },
              { key: "pace" as const, v: end.pace },
            ].map(({ key, v }, i, all) => {
              // Keep the two end labels at least 18 units apart.
              const other = all[1 - i].v;
              const dy = Math.abs(y(v) - y(other)) < 18 ? (v > other ? -9 : 9) : 0;
              return (
                <g key={key}>
                  {key === "plan" && <circle cx={x(x1)} cy={y(v)} r="4.5" fill={SERIES.plan.color} className="ml-chart-pulse" />}
                  <circle cx={x(x1)} cy={y(v)} r="4.5" fill={SERIES[key].color} stroke="var(--color-ml-ink)" strokeWidth="2" />
                  <text x={x(x1) + 10} y={y(v) + 4 + dy} className="fill-white">
                    {short(Math.round(v / 100) * 100)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} stroke="white" strokeOpacity="0.5" />
            {(["history", "pace", "plan"] as const).map((k) => {
              const v = tip?.[k];
              return v === undefined ? null : <circle key={k} cx={x(hover)} cy={y(v)} r="4.5" fill={SERIES[k].color} stroke="var(--color-ml-ink)" strokeWidth="2" />;
            })}
          </g>
        )}
      </svg>

      {hover !== null && tip && (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-xl bg-white px-4 py-3 text-sm text-ml-ink shadow-xl"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > (x0 + x1) / 2 ? "calc(-100% - 12px)" : "12px"})` }}
        >
          <p className="mb-1.5 font-bold">{hover}</p>
          {(["history", "pace", "plan"] as const).map((k) =>
            tip[k] === undefined ? null : (
              <p key={k} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="size-2.5 rounded-full" style={{ background: k === "history" ? "var(--color-ml-ink)" : SERIES[k].color }} />
                  {SERIES[k].label}
                </span>
                <span className="font-semibold tabular-nums">{usd(tip[k]!)}</span>
              </p>
            ),
          )}
        </div>
      )}
    </div>
  );
}
