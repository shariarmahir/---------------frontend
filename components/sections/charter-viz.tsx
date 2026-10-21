"use client";

import { useId, type CSSProperties, type SVGProps } from "react";
import { sourcePoints } from "@/data/amar-bangladesh";
import { impactCharts, missionReach, type CharterViz } from "@/data/charter";
import { cn } from "@/lib/utils";

/*
 * The charter's motion graphics, one per slide, each drawing what its
 * figures say rather than decorating them:
 *
 *   problem    the 32 mapped problems as 32 pixels of one image, repaired
 *              in a sweep; verified ones solid, urgent ones marked red
 *   challenge  the forces bearing in on one point marked NOW
 *   vision     development as a loop with no end, through goods, services
 *              and R&D
 *   mission    the eight divisions, each sending to Dhaka and back out
 *   goal       one process going round: problem, solved, next problem
 *   impact     the dossier's scenarios, drawn in when the card comes round
 *
 * Drawn only in the card's own colours: `--accent` (gold), `--accent-2`
 * (white), the card's text
 * colour (`--ink`, drawn as currentColor), and red only for urgency.
 * Labels carry a halo of the card's field, so a line never runs through
 * a word. The loops live in globals.css (`ch-*`): they pause while their
 * card is off screen and stand still under reduced motion.
 */

const ACCENT = "var(--accent)";
const ALT = "var(--accent-2)";
const INK = "currentColor";
const URGENT = "var(--color-national-crimson)";
const FIELD = "var(--field)";
/** Labels, codes and figures: the display face, bold, so they hold their own beside the heavy strokes. */
const DISPLAY = "var(--font-grotesk)";

const at = (n: number) => ({ "--i": n }) as CSSProperties;

/** A bold label with a halo of the card's field, for text that sits on or beside lines. */
function Label({ children, size = 14, opacity = 0.9, ...rest }: SVGProps<SVGTextElement> & { size?: number; opacity?: number }) {
  return (
    <text
      fill={INK}
      fillOpacity={opacity}
      fontFamily={DISPLAY}
      fontSize={size}
      fontWeight="700"
      stroke={FIELD}
      strokeWidth="5"
      strokeLinejoin="round"
      paintOrder="stroke"
      {...rest}
    >
      {children}
    </text>
  );
}

/** Square drawings: full width when narrow, a steady 19rem in the wide layout, never wider than their column. */
const SQUARE = "h-auto w-full max-w-full overflow-visible xl:h-68 xl:w-auto";

/** A point on a circle round (cx, cy), rounded so the server and browser render the same digits. */
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [Math.round((cx + r * Math.cos(a)) * 100) / 100, Math.round((cy + r * Math.sin(a)) * 100) / 100] as const;
};

/** `active`: the card is on screen, so the loops run; `grow`: it is mostly in view, so the impact bars draw in. */
export function CharterVisual({ kind, active, grow = active }: { kind: CharterViz; active: boolean; grow?: boolean }) {
  return (
    <div data-paused={!active} className="ch-viz relative mx-auto flex w-full max-w-88 items-center justify-center text-(--ink) xl:h-full xl:max-w-none">
      {kind === "orbit" && <Pixels />}
      {kind === "forces" && <Forces />}
      {kind === "loop" && <Loop />}
      {kind === "network" && <Network />}
      {kind === "kinetic" && <Cycle />}
      {kind === "impact" && <Impact active={grow} />}
    </div>
  );
}

/**
 * Problem: Bangladesh as one image of 32 pixels, one per mapped problem
 * (BD-001 to BD-032, in the dossier's order). Solid where the evidence is
 * verified, outlined where it is not yet; a red mark where urgency is very
 * high. A repair sweep runs across the image from left to right, again and
 * again: the map is fixed one pixel at a time.
 */
function Pixels() {
  const cols = 8;
  const size = 36;
  const gap = 8;
  const cells = [...sourcePoints].sort((a, b) => a.n - b.n);
  const width = cols * size + (cols - 1) * gap;
  const rows = Math.ceil(cells.length / cols);
  const height = rows * size + (rows - 1) * gap;
  const verified = cells.filter((c) => c.status === "verified").length;
  const urgent = cells.filter((c) => c.urgency === "very-high").length;
  const legendY = height + 34;
  return (
    <svg viewBox={`-4 -4 ${width + 8} ${legendY + 12}`} className="h-auto w-full max-w-88 overflow-visible" aria-hidden>
      {cells.map((c, k) => {
        const col = k % cols;
        const row = Math.floor(k / cols);
        const x = col * (size + gap);
        const y = row * (size + gap);
        const solid = c.status === "verified";
        return (
          <g key={c.n} className="ch-pixel" style={at(col + row * 0.4)}>
            <rect
              x={x}
              y={y}
              width={size}
              height={size}
              rx="8"
              fill={solid ? ACCENT : "none"}
              stroke={ACCENT}
              strokeOpacity={solid ? 1 : 0.6}
              strokeWidth={solid ? 0 : 2.5}
              strokeDasharray={solid ? undefined : "5 4"}
            />
            <text
              x={x + size / 2}
              y={y + size / 2 + 4.5}
              textAnchor="middle"
              fill={solid ? "var(--accent-on)" : INK}
              fillOpacity={solid ? 1 : 0.75}
              fontFamily={DISPLAY}
              fontSize="13"
              fontWeight="800"
            >
              {String(c.n).padStart(2, "0")}
            </text>
            {c.urgency === "very-high" && (
              <circle cx={x + size - 8} cy={y + 8} r="4.5" fill={URGENT} stroke={solid ? "none" : FIELD} strokeWidth="2" />
            )}
          </g>
        );
      })}

      {/* The key, so the image reads on its own. */}
      <g fontFamily={DISPLAY} fontSize="13" fontWeight="700" fill={INK}>
        <rect x="0" y={legendY - 11} width="14" height="14" rx="4" fill={ACCENT} />
        <text x="21" y={legendY}>{verified} verified</text>
        <rect x="112" y={legendY - 11} width="14" height="14" rx="4" fill="none" stroke={ACCENT} strokeWidth="2" strokeDasharray="4 3" />
        <text x="133" y={legendY}>{cells.length - verified} not verified</text>
        <circle cx={width - 92} cy={legendY - 4} r="5.5" fill={URGENT} />
        <text x={width - 82} y={legendY}>{urgent} urgent</text>
      </g>
    </svg>
  );
}

/** Challenge: the forces bearing in on one point marked NOW. */
function Forces() {
  const forces = [
    { label: "Climate", x: 52, y: 70 },
    { label: "Inflation", x: 348, y: 70 },
    { label: "Learning", x: 200, y: 22 },
    { label: "Corruption", x: 52, y: 338 },
    { label: "Pollution", x: 348, y: 338 },
    { label: "Population", x: 200, y: 386 },
  ];
  const id = useId();
  const r2 = (v: number) => Math.round(v * 100) / 100;
  return (
    <svg viewBox="0 0 400 400" className={SQUARE} aria-hidden>
      <defs>
        <marker id={`${id}arrow`} viewBox="0 0 8 8" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="4" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill={ACCENT} />
        </marker>
      </defs>
      {[160, 122, 84].map((r, k) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke={ALT} strokeOpacity={0.16 + k * 0.14} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={k === 2 ? undefined : "1 9"} />
      ))}
      {forces.map((f, k) => {
        const dx = 200 - f.x;
        const dy = 200 - f.y;
        const len = Math.hypot(dx, dy);
        const ux = dx / len;
        const uy = dy / len;
        return (
          <g key={f.label}>
            {/* Dash period 14, so the 28-unit flow loops without a jump. */}
            <line
              x1={r2(f.x + ux * 24)}
              y1={r2(f.y + uy * 24)}
              x2={r2(200 - ux * 56)}
              y2={r2(200 - uy * 56)}
              stroke={ACCENT}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="8 6"
              markerEnd={`url(#${id}arrow)`}
              className="ch-flow"
              style={at(k)}
            />
            <Label x={f.x} y={f.y + 6} textAnchor="middle" size={19}>
              {f.label}
            </Label>
          </g>
        );
      })}
      <circle cx="200" cy="200" r="50" fill={ACCENT} fillOpacity="0.2" className="ch-breathe" />
      <circle cx="200" cy="200" r="40" fill={ACCENT} />
      <text x="200" y="207" textAnchor="middle" fill="var(--accent-on)" fontFamily={DISPLAY} fontSize="20" fontWeight="800">
        NOW
      </text>
    </svg>
  );
}

const INFINITY = "M60 150 C60 90 120 90 150 150 C180 210 240 210 240 150 C240 90 180 90 150 150 C120 210 60 210 60 150 Z";

/** Vision: development as a loop with no end; the work passes through goods, services and R&D, and comes round again. */
function Loop() {
  // Points on the loop itself (the curves' midpoints and the right end), with where each label sits.
  const stations = [
    { label: "Goods", x: 94, y: 195, lx: 94, ly: 226, anchor: "middle" as const },
    { label: "Services", x: 206, y: 105, lx: 206, ly: 84, anchor: "middle" as const },
    { label: "R&D", x: 240, y: 150, lx: 258, ly: 155, anchor: "start" as const },
  ];
  return (
    <svg viewBox="40 62 260 178" className="h-auto w-full max-w-88 overflow-visible" aria-hidden>
      <path d={INFINITY} fill="none" stroke={INK} strokeOpacity="0.14" strokeWidth="20" strokeLinecap="round" />
      <path d={INFINITY} fill="none" stroke={ACCENT} strokeWidth="7" strokeLinecap="round" />
      <path d={INFINITY} fill="none" stroke={ALT} strokeWidth="7" strokeLinecap="round" pathLength={100} strokeDasharray="12 88" className="ch-run" />
      {stations.map((s, k) => (
        <g key={s.label}>
          <circle cx={s.x} cy={s.y} r="12" fill={ACCENT} fillOpacity="0.22" className="ch-breathe" style={at(k * 2)} />
          <circle cx={s.x} cy={s.y} r="7" fill={FIELD} stroke={ACCENT} strokeWidth="3.5" />
          <Label x={s.lx} y={s.ly} textAnchor={s.anchor} size={15} opacity={1}>
            {s.label}
          </Label>
        </g>
      ))}
      {[0, 1].map((k) => (
        <circle key={k} r={k ? 7 : 10} fill={k ? ALT : ACCENT} stroke={FIELD} strokeWidth="3" className="ch-travel" style={{ offsetPath: `path("${INFINITY}")`, ...at(k) } as CSSProperties} />
      ))}
    </svg>
  );
}

/** Mission: the eight divisions, roughly where they sit, each sending to Dhaka; the reach below. */
function Network() {
  const cities = [
    { name: "Rangpur", x: 120, y: 56, label: "above" },
    { name: "Rajshahi", x: 70, y: 138, label: "left" },
    { name: "Mymensingh", x: 204, y: 104, label: "above" },
    { name: "Sylhet", x: 314, y: 100, label: "above" },
    { name: "Dhaka", x: 204, y: 170, label: "right", hub: true },
    { name: "Khulna", x: 136, y: 230, label: "below" },
    { name: "Barishal", x: 214, y: 246, label: "below" },
    { name: "Chattogram", x: 310, y: 236, label: "below" },
  ];
  const hub = cities.find((c) => c.hub)!;
  const ring: [number, number][] = [
    [0, 1], [0, 2], [2, 3], [1, 5], [5, 6], [6, 7], [3, 7],
  ];
  const place = (c: (typeof cities)[number]) =>
    c.label === "above" ? { x: c.x, y: c.y - 16, anchor: "middle" as const }
    : c.label === "below" ? { x: c.x, y: c.y + 26, anchor: "middle" as const }
    : c.label === "left" ? { x: c.x - 15, y: c.y + 5, anchor: "end" as const }
    : { x: c.x + 20, y: c.y + 5, anchor: "start" as const };
  return (
    <div className="@container w-full">
      <svg viewBox="0 20 380 250" className="mx-auto h-auto w-full max-w-88 overflow-visible" aria-hidden>
        {ring.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={cities[a].x} y1={cities[a].y} x2={cities[b].x} y2={cities[b].y} stroke={INK} strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
        ))}
        {cities.filter((c) => !c.hub).map((c, k) => (
          <g key={c.name}>
            <line x1={hub.x} y1={hub.y} x2={c.x} y2={c.y} stroke={ACCENT} strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
            {/* A signal from the division to Dhaka. */}
            <circle r="4.5" fill={ACCENT} className="ch-send" style={{ offsetPath: `path("M${c.x} ${c.y} L${hub.x} ${hub.y}")`, ...at(k) } as CSSProperties} />
          </g>
        ))}
        {cities.map((c, k) => {
          const l = place(c);
          return (
            <g key={c.name}>
              <circle cx={c.x} cy={c.y} r={c.hub ? 20 : 12} fill={c.hub ? ALT : ACCENT} fillOpacity="0.2" className="ch-breathe" style={at(k)} />
              <circle cx={c.x} cy={c.y} r={c.hub ? 10 : 6.5} fill={c.hub ? ALT : ACCENT} stroke={FIELD} strokeWidth="2.5" />
              <Label x={l.x} y={l.y} textAnchor={l.anchor} size={c.hub ? 16 : 13} opacity={c.hub ? 1 : 0.9}>
                {c.name}
              </Label>
            </g>
          );
        })}
      </svg>
      {/* Four across only when each figure has room for its word; two by two otherwise. */}
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 @min-[22rem]:grid-cols-4 @min-[22rem]:gap-2">
        {missionReach.map((r) => (
          <li key={r.label} className="text-center">
            <p className="font-grotesk text-xl leading-tight font-extrabold tracking-tight text-(--accent)">{r.value}</p>
            <p className="font-grotesk text-xs font-bold text-(--ink)/80">{r.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Goal: one process going round and round — a problem, solved, then the next problem. */
function Cycle() {
  const R = 92;
  const stations = [
    { label: "Problem", deg: -90 },
    { label: "Solved", deg: 30 },
    { label: "Next problem", deg: 150 },
  ];
  return (
    <svg viewBox="0 6 300 262" className="mx-auto h-auto w-full max-w-80 overflow-visible xl:h-68 xl:w-auto xl:max-w-full" aria-hidden>
      <circle cx="150" cy="150" r={R + 30} fill="none" stroke={ACCENT} strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" strokeDasharray="0.5 11" className="ch-spin-slow" />
      <circle cx="150" cy="150" r={R} fill="none" stroke={INK} strokeOpacity="0.14" strokeWidth="12" />
      {/* The work, going round: a gold arc that never stops. */}
      <g className="ch-spin">
        <path d={`M150 ${150 - R} A${R} ${R} 0 0 1 ${150 + R} 150`} fill="none" stroke={ACCENT} strokeWidth="12" strokeLinecap="round" />
      </g>
      {stations.map((s, k) => {
        const [x, y] = polar(150, 150, R, s.deg);
        const top = s.deg === -90;
        return (
          <g key={s.label}>
            <circle cx={x} cy={y} r="16" fill={ACCENT} fillOpacity="0.2" className="ch-breathe" style={at(k * 3)} />
            <circle cx={x} cy={y} r="9" fill={FIELD} stroke={ALT} strokeWidth="3.5" />
            <Label x={x} y={top ? y - 22 : y + 34} textAnchor="middle" size={15} opacity={1}>
              {s.label}
            </Label>
          </g>
        );
      })}
      <circle cx="150" cy="150" r="34" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} strokeWidth="3.5" />
      <text x="150" y="163" textAnchor="middle" fill={ACCENT} fontFamily={DISPLAY} fontSize="40" fontWeight="800">
        ∞
      </text>
    </svg>
  );
}

/** Impact: the dossier's scenarios, drawn in when the card comes round. */
function Impact({ active }: { active: boolean }) {
  const max = Math.max(...impactCharts.pollution.map((p) => p.avoided));
  const { now, scenario } = impactCharts.reading;
  const grow = (pct: number, delay: number) =>
    ({ width: active ? `${pct}%` : "0%", transitionDelay: active ? `${delay}ms` : "0ms" }) as CSSProperties;
  const bar = "transition-[width] duration-1400 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none";
  return (
    // Compact: small type and thin bars, so the three charts and their note fit the card's height.
    <div className="w-full max-w-md">
      <p className="font-grotesk text-xs font-bold text-(--ink)/90">Pollution burden avoided, % of GDP a year</p>
      <ul className="mt-2 space-y-1.5">
        {impactCharts.pollution.map((p, i) => (
          <li key={p.cut} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
            <span className="w-14 font-grotesk text-xs font-bold whitespace-nowrap text-(--ink)/80">cut {p.cut}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-(--ink)/12">
              <span style={grow((p.avoided / max) * 100, 200 + i * 160)} className={cn("ch-bar block h-full rounded-full bg-(--accent)", bar)} />
            </span>
            <span className="w-11 text-right font-grotesk tabular-nums text-xs font-bold text-(--ink)">{p.avoided}%</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 font-grotesk text-xs font-bold text-(--ink)/90">Ten-year-olds reading well, +10-point scenario</p>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5">
        <span className="relative h-1.5 overflow-hidden rounded-full bg-(--ink)/12">
          <span style={grow(scenario, 700)} className={cn("absolute inset-y-0 left-0 rounded-full bg-(--ink)/35", bar)} />
          <span style={grow(now, 500)} className={cn("ch-bar absolute inset-y-0 left-0 rounded-full bg-(--accent)", bar)} />
        </span>
        <span className="text-right font-grotesk tabular-nums text-xs font-bold whitespace-nowrap text-(--ink)">
          {now}% → {scenario}%
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <p className="font-grotesk text-2xl leading-none font-extrabold tracking-tight text-(--accent)">100×</p>
        <p className="font-grotesk text-xs leading-snug font-bold text-(--ink)/90">fewer cyclone deaths since 1970</p>
      </div>
      <p className="mt-2 text-xs leading-snug text-(--ink)/70">{impactCharts.source}</p>
    </div>
  );
}
