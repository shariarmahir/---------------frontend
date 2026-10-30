"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { MAP_HEIGHT, MAP_WIDTH, divisionShapes, type DivisionId } from "@/data/bangladesh-map";
import { districtShapes } from "@/data/tv-wall/districts-map";
import { DIVISIONS } from "@/data/tv-wall/sources";
import type { RiskLevel } from "@/lib/tv-wall/core";
import { ZONE_HEX, type MapLayerProps } from "@/lib/tv-wall/geo";
import { cn } from "@/lib/utils";
import { LEVEL_NAME } from "./labels";

const BY_ID = new Map(districtShapes.map((d) => [d.id, d]));

/** Each division's bounding box in map units, read from its districts' outlines. */
const DIVISION_BOX = (() => {
  const box = new Map<DivisionId, { x0: number; y0: number; x1: number; y1: number }>();
  for (const d of districtShapes) {
    const b = box.get(d.division) ?? { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (const [, x, y] of d.d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)) {
      b.x0 = Math.min(b.x0, Number(x));
      b.y0 = Math.min(b.y0, Number(y));
      b.x1 = Math.max(b.x1, Number(x));
      b.y1 = Math.max(b.y1, Number(y));
    }
    box.set(d.division, b);
  }
  return box;
})();

/** The transform that frames a division (or the whole country), and its scale. */
function zoomFor(division: DivisionId | null): { transform: string; k: number } {
  const b = division ? DIVISION_BOX.get(division) : null;
  if (!b) return { transform: "translate(0px, 0px) scale(1)", k: 1 };
  const pad = 24;
  const w = b.x1 - b.x0 + pad * 2;
  const h = b.y1 - b.y0 + pad * 2;
  const k = Math.min(MAP_WIDTH / w, MAP_HEIGHT / h, 4);
  const tx = (MAP_WIDTH - w * k) / 2 - (b.x0 - pad) * k;
  const ty = (MAP_HEIGHT - h * k) / 2 - (b.y0 - pad) * k;
  return { transform: `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${k.toFixed(3)})`, k };
}

/** The four zone colours with their names, for any map's legend. */
export function ZoneLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans text-xs text-white/80", className)} aria-label="Map key">
      {([3, 2, 1, 0] as RiskLevel[]).map((l) => (
        <li key={l} className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-[3px] ring-1 ring-white/20" style={{ background: ZONE_HEX[l] }} />
          {LEVEL_NAME[l]}
        </li>
      ))}
    </ul>
  );
}

/**
 * Bangladesh's 64 districts on their real boundaries (geoBoundaries), each
 * filled by how much crime and corruption is being reported from it. A
 * district with a violent report in the last six hours pings. Choosing a
 * division zooms into it; clicking a district selects it. Works offline
 * and on any phone, so it is also the fallback for the 3D and Google layers.
 */
export function RiskMapSvg({ readings, pings, selected, onSelect, division = null, className }: MapLayerProps & { division?: DivisionId | null }) {
  const [hover, setHover] = useState<string | null>(null);
  const zoom = zoomFor(division);
  const byId = useMemo(() => new Map(readings.map((r) => [r.id, r])), [readings]);
  const redZones = readings.filter((r) => r.level === 3).length;

  const focus = hover ?? selected;
  const focused = focus ? BY_ID.get(focus) : null;
  const reading = focus ? byId.get(focus) : undefined;

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <div aria-live="polite" className="pointer-events-none mb-2 rounded-xl bg-black/70 px-3.5 py-2.5 ring-1 ring-white/12 sm:absolute sm:top-3 sm:left-3 sm:z-10 sm:mb-0 sm:max-w-[min(19rem,70%)]">
        {focused ? (
          <>
            <p className="font-sans text-base font-bold text-white">
              {focused.en} <span className="font-bengali text-xs font-medium text-white/60">{focused.bn}</span>
            </p>
            <p className="font-sans text-xs text-white/75">
              {reading ? `${reading.count} crime and corruption report${reading.count === 1 ? "" : "s"} · ${LEVEL_NAME[reading.level]}` : "No crime reported in this window"}
            </p>
            {reading?.top && <p className="mt-1 line-clamp-2 font-bengali text-xs leading-snug text-white/90">{reading.top.title}</p>}
          </>
        ) : (
          <>
            <p className="font-sans text-base font-bold text-white">{division ? `${DIVISIONS.find((d) => d.id === division)?.en} division` : "All Bangladesh"}</p>
            <p className="font-sans text-xs text-white/75">
              {redZones} red-zone district{redZones === 1 ? "" : "s"} · reports from {readings.length} district{readings.length === 1 ? "" : "s"}
            </p>
          </>
        )}
      </div>

      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="mx-auto block h-full max-h-full min-h-80 w-full"
        role="img"
        aria-label="Map of Bangladesh's districts by reported crime"
        onPointerLeave={() => setHover(null)}
      >
        <g className="wall-zoom" style={{ transform: zoom.transform } as CSSProperties}>
          {districtShapes.map((d) => {
            const r = byId.get(d.id);
            const chosen = selected === d.id;
            return (
              <path
                key={d.id}
                d={d.d}
                fill={ZONE_HEX[r?.level ?? 0]}
                fillOpacity={division && d.division !== division ? 0.35 : 1}
                stroke={chosen ? "var(--color-signal-orange)" : "rgb(0 0 0 / 0.55)"}
                strokeWidth={chosen ? 2.5 : 0.8}
                vectorEffect="non-scaling-stroke"
                className="cursor-pointer transition-[fill,fill-opacity] duration-500 hover:brightness-125"
                onPointerEnter={() => setHover(d.id)}
                onClick={() => onSelect(chosen ? null : d.id)}
              >
                <title>{`${d.en}${r ? `: ${r.count} reports` : ""}`}</title>
              </path>
            );
          })}
          {divisionShapes.map((v) => (
            <path
              key={v.id}
              d={v.d}
              fill="none"
              stroke={division === v.id ? "var(--color-signal-orange)" : "rgb(255 255 255 / 0.45)"}
              strokeWidth={division === v.id ? 2 : 1.1}
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          ))}
          {pings.map((id, i) => {
            const d = BY_ID.get(id);
            if (!d) return null;
            return (
              <g key={id} pointerEvents="none">
                <circle cx={d.cx} cy={d.cy} r={7 / zoom.k} fill="none" stroke="var(--color-crimson-bright)" strokeWidth={2} vectorEffect="non-scaling-stroke" className="zone-ping" style={{ "--d": `${(i % 6) * 400}ms` } as CSSProperties} />
                <circle cx={d.cx} cy={d.cy} r={3.5 / zoom.k} fill="#fff" stroke="var(--color-national-crimson)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
          {districtShapes
            .filter((d) => (division ? d.division === division : (byId.get(d.id)?.level ?? 0) >= 2))
            .map((d) => (
              <text
                key={d.id}
                x={d.cx}
                y={d.cy - 9 / zoom.k}
                textAnchor="middle"
                pointerEvents="none"
                className="font-sans font-semibold"
                style={{ fontSize: 14 / zoom.k, strokeWidth: 3 / zoom.k, paintOrder: "stroke", stroke: "rgb(0 0 0 / 0.85)", fill: "#fff" }}
              >
                {d.en}
              </text>
            ))}
        </g>
      </svg>
    </div>
  );
}
