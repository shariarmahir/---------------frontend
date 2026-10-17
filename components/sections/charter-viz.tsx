"use client";

import { useId, type CSSProperties } from "react";
import { impactCharts, missionReach, type CharterViz } from "@/data/charter";
import { cn } from "@/lib/utils";

/*
 * The charter's motion graphics, one per slide, drawn only in the card's
 * own three-colour world (Mahir, 2026-10-17: navy, ink green and gold, no
 * light green): `--accent` (gold on a dark card, navy on a gold one),
 * `--accent-2` (white, or ink on gold), `--accent-3` (a soft tint of the
 * field) and the card's text colour (`--ink`, drawn as currentColor). The
 * card sets them. The loops live in globals.css (`ch-*`): they pause while
 * their card is off screen and stand still under reduced motion.
 */

const ACCENT = "var(--accent)";
const ALT = "var(--accent-2)";
const SOFT = "var(--accent-3)";
const INK = "currentColor";
/** Labels and codes: the body face, with figures that keep their columns. */
const BODY = "var(--font-inter), sans-serif";
const DISPLAY = "var(--font-grotesk)";

const at = (n: number) => ({ "--i": n }) as CSSProperties;

/** Square drawings: full width when narrow, the card's inner height (280px) in the wide layout, never wider than their column. */
const SQUARE = "h-auto w-full max-w-full overflow-visible xl:h-[17.5rem] xl:w-auto";

/** A point on a circle round (cx, cy), rounded-md so the server and browser render the same digits. */
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [Math.round((cx + r * Math.cos(a)) * 100) / 100, Math.round((cy + r * Math.sin(a)) * 100) / 100];
};

/** `active`: the card is on screen, so the loops run; `grow`: it is mostly in view, so the impact bars draw in. */
export function CharterVisual({ kind, active, grow = active }: { kind: CharterViz; active: boolean; grow?: boolean }) {
  return (
    <div data-paused={!active} className="ch-viz relative mx-auto flex w-full max-w-88 items-center justify-center text-(--ink) xl:h-full xl:max-w-none">
      {kind === "orbit" && <Orbit />}
      {kind === "forces" && <Forces />}
      {kind === "loop" && <Loop />}
      {kind === "network" && <Network />}
      {kind === "kinetic" && <Kinetic />}
      {kind === "impact" && <Impact active={grow} />}
    </div>
  );
}

/** Problem: 32 at the core, the dossier's codes circling it on two rings. */
function Orbit() {
  const id = useId();
  const outer = [
    { a: 0, code: "BD-001", c: ACCENT, r: 6 },
    { a: 120, code: "BD-014", c: ALT, r: 5 },
    { a: 235, code: "BD-028", c: SOFT, r: 6 },
  ];
  const inner = [
    { a: 30, c: ALT, r: 4 },
    { a: 110, c: SOFT, r: 5 },
    { a: 200, c: ACCENT, r: 3.5 },
    { a: 290, c: SOFT, r: 6 },
  ];
  const pt = (a: number, r: number) => polar(200, 200, r, a);
  return (
    <svg viewBox="0 0 400 400" className={SQUARE} aria-hidden>
      <defs>
        <radialGradient id={`${id}core`}>
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.55" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="ch-orbit">
        <circle cx="200" cy="200" r="178" fill="none" stroke={INK} strokeOpacity="0.12" />
        <circle cx="200" cy="200" r="178" fill="none" stroke={ACCENT} strokeOpacity="0.45" strokeDasharray="2 10" />
        {outer.map((n) => {
          const [x, y] = pt(n.a, 178);
          // The label sits just outside the ring, so as the ring turns (and
          // the label turns back to stay upright) it never covers its dot.
          const [lx, ly] = pt(n.a, 214);
          return (
            <g key={n.code}>
              <line x1="200" y1="200" x2={x} y2={y} stroke={n.c} strokeOpacity="0.32" />
              <circle cx={x} cy={y} r={n.r} fill={n.c} />
              <circle cx={x} cy={y} r={n.r + 7} fill="none" stroke={n.c} strokeOpacity="0.45" className="ch-ping" style={at(n.a / 120)} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill={n.c} fontFamily={BODY} fontSize="16" fontWeight="600" className="ch-upright" style={{ fontVariantNumeric: "tabular-nums" }}>
                {n.code}
              </text>
            </g>
          );
        })}
      </g>
      <g className="ch-orbit-rev">
        <circle cx="200" cy="200" r="128" fill="none" stroke={ALT} strokeOpacity="0.3" strokeDasharray="4 6" />
        {inner.map((n) => {
          const [x, y] = pt(n.a, 128);
          return <circle key={n.a} cx={x} cy={y} r={n.r} fill={n.c} />;
        })}
      </g>
      <circle cx="200" cy="200" r="92" fill={`url(#${id}core)`} />
      <circle cx="200" cy="200" r="56" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="2 5" className="ch-spin-slow" />
      <text x="200" y="208" textAnchor="middle" fill={INK} fontFamily={DISPLAY} fontSize="48" fontWeight="800" letterSpacing="-1.5">
        32
      </text>
      <text x="200" y="232" textAnchor="middle" fill={INK} fillOpacity="0.6" fontFamily={BODY} fontSize="12" fontWeight="600" letterSpacing="0.5">
        problems
      </text>
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
  return (
    <svg viewBox="0 0 400 400" className={SQUARE} aria-hidden>
      <defs>
        <marker id={`${id}arrow`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill={ACCENT} />
        </marker>
      </defs>
      {[160, 122, 84].map((r, k) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke={ALT} strokeOpacity={0.12 + k * 0.12} strokeDasharray={k === 2 ? undefined : "2 7"} />
      ))}
      {forces.map((f, k) => {
        const dx = 200 - f.x;
        const dy = 200 - f.y;
        const len = Math.hypot(dx, dy);
        const ux = dx / len;
        const uy = dy / len;
        const r2 = (v: number) => Math.round(v * 100) / 100;
        const sx = r2(f.x + ux * 22);
        const sy = r2(f.y + uy * 22);
        const ex = r2(200 - ux * 54);
        const ey = r2(200 - uy * 54);
        return (
          <g key={f.label}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeDasharray="7 7" markerEnd={`url(#${id}arrow)`} className="ch-flow" style={at(k)} />
            <text x={f.x} y={f.y + 4} textAnchor="middle" fill={INK} fillOpacity="0.62" fontFamily={BODY} fontSize="12" fontWeight="600">
              {f.label}
            </text>
          </g>
        );
      })}
      <circle cx="200" cy="200" r="46" fill={ACCENT} fillOpacity="0.18" className="ch-breathe" />
      <circle cx="200" cy="200" r="36" fill={ACCENT} />
      <text x="200" y="206" textAnchor="middle" fill="var(--accent-on)" fontFamily={DISPLAY} fontSize="18" fontWeight="800">
        NOW
      </text>
    </svg>
  );
}

const INFINITY = "M60 150 C60 90 120 90 150 150 C180 210 240 210 240 150 C240 90 180 90 150 150 C120 210 60 210 60 150 Z";

/** Vision: development as a loop with no end, carrying goods, services and R&D. */
function Loop() {
  return (
    <div className="relative w-full px-4">
      <svg viewBox="36 72 228 172" className="h-auto w-full overflow-visible xl:max-h-52" aria-hidden>
        <path d={INFINITY} fill="none" stroke={INK} strokeOpacity="0.12" strokeWidth="14" strokeLinecap="round" />
        <path d={INFINITY} fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.9" />
        <path d={INFINITY} fill="none" stroke={ALT} strokeWidth="3" strokeLinecap="round" pathLength={100} strokeDasharray="10 90" className="ch-run" />
        {[0, 1].map((k) => (
          <circle key={k} r={k ? 6 : 9} fill={k ? ALT : ACCENT} className="ch-travel" style={{ offsetPath: `path("${INFINITY}")`, ...at(k) } as CSSProperties} />
        ))}
        <text x="150" y="238" textAnchor="middle" fill={INK} fillOpacity="0.6" fontFamily={BODY} fontSize="12" fontWeight="600" letterSpacing="0.5">
          Continuous
        </text>
      </svg>
      {/* Inside the drawing's own box, so none of them crosses into the figures beside it. */}
      <Chip className="top-0 right-[6%]">Goods</Chip>
      <Chip className="top-[42%] right-0">R&amp;D</Chip>
      <Chip className="bottom-[12%] left-0">Services</Chip>
    </div>
  );
}

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("absolute rounded-full bg-(--ink)/8 px-3 py-1 font-grotesk text-xs font-semibold text-(--ink) ring-1 ring-(--accent)/50", className)}>
      {children}
    </span>
  );
}

/** Mission: the eight divisions, roughly where they sit, all tied to Dhaka. */
function Network() {
  const cities = [
    { name: "Rangpur", x: 120, y: 56 },
    { name: "Rajshahi", x: 73, y: 135 },
    { name: "Mymensingh", x: 204, y: 108 },
    { name: "Sylhet", x: 310, y: 104 },
    { name: "Dhaka", x: 204, y: 167, hub: true },
    { name: "Khulna", x: 138, y: 224 },
    { name: "Barishal", x: 214, y: 236 },
    { name: "Chattogram", x: 305, y: 249 },
  ];
  const hub = cities.find((c) => c.hub)!;
  const ring: [number, number][] = [
    [0, 1], [0, 2], [2, 3], [1, 5], [5, 6], [6, 7], [3, 7],
  ];
  return (
    <div className="w-full">
      <svg viewBox="0 0 380 290" className="mx-auto h-auto w-full overflow-visible xl:h-53 xl:w-auto" aria-hidden>
        {ring.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={cities[a].x} y1={cities[a].y} x2={cities[b].x} y2={cities[b].y} stroke={INK} strokeOpacity="0.16" />
        ))}
        {cities.filter((c) => !c.hub).map((c, k) => (
          <g key={c.name}>
            <line x1={hub.x} y1={hub.y} x2={c.x} y2={c.y} stroke={ACCENT} strokeOpacity="0.35" />
            <line x1={hub.x} y1={hub.y} x2={c.x} y2={c.y} stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" pathLength={100} strokeDasharray="8 92" className="ch-signal" style={at(k)} />
          </g>
        ))}
        {cities.map((c, k) => (
          <g key={c.name}>
            <circle cx={c.x} cy={c.y} r={c.hub ? 16 : 9} fill={c.hub ? ALT : ACCENT} fillOpacity="0.2" className="ch-breathe" style={at(k)} />
            <circle cx={c.x} cy={c.y} r={c.hub ? 8 : 5} fill={c.hub ? ALT : ACCENT} />
            <text x={c.x} y={c.y + (c.hub ? 30 : 22)} textAnchor="middle" fill={INK} fillOpacity={c.hub ? 0.9 : 0.6} fontFamily={DISPLAY} fontSize={12} fontWeight={c.hub ? 700 : 500}>
              {c.name}
            </text>
          </g>
        ))}
      </svg>
      <ul className="mt-2.5 grid grid-cols-4 gap-1.5">
        {missionReach.map((r) => (
          <li key={r.label} className="rounded-xl bg-(--ink)/6 px-1.5 py-1.5 text-center ring-1 ring-(--ink)/10 backdrop-blur-sm">
            <p className="font-grotesk text-sm font-bold text-(--accent)">{r.value}</p>
            <p className="text-xs text-(--ink)/80">{r.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Goal: the kinetic loop — problems circling a process that never stops. */
function Kinetic() {
  const dots = [ACCENT, ALT, SOFT, ACCENT, INK, SOFT];
  return (
    <div>
      <svg viewBox="0 0 300 300" className="mx-auto h-auto w-full overflow-visible xl:h-60 xl:w-auto" aria-hidden>
        <circle cx="150" cy="150" r="132" fill="none" stroke={INK} strokeOpacity="0.1" />
        <circle cx="150" cy="150" r="102" fill="none" stroke={ACCENT} strokeOpacity="0.3" strokeDasharray="3 7" />
        <circle cx="150" cy="150" r="70" fill="none" stroke={INK} strokeOpacity="0.12" strokeWidth="5" />
        <g className="ch-spin">
          <path d="M150 80 A70 70 0 0 1 220 150" fill="none" stroke={ACCENT} strokeWidth="5" strokeLinecap="round" />
        </g>
        <g className="ch-spin-rev">
          <path d="M150 220 A70 70 0 0 1 80 150" fill="none" stroke={ALT} strokeWidth="5" strokeLinecap="round" />
        </g>
        <g className="ch-orbit">
          {dots.map((c, k) => {
            const [x, y] = polar(150, 150, 132, (k / dots.length) * 360);
            return <circle key={k} cx={x} cy={y} r="5" fill={c} />;
          })}
        </g>
        <circle cx="150" cy="150" r="30" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} strokeWidth="1.5" />
        <text x="150" y="162" textAnchor="middle" fill={ACCENT} fontFamily={DISPLAY} fontSize="36" fontWeight="800">
          ∞
        </text>
      </svg>
      <p className="mt-2 text-center font-sans tabular-nums text-xs text-(--ink)/80">Problem → solved → next problem</p>
    </div>
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
    <div className="w-full rounded-2xl bg-(--ink)/5 px-4 py-2.5 ring-1 ring-(--ink)/10 backdrop-blur-sm">
      <p className="text-xs text-(--ink)/80">Pollution burden avoided, % of GDP a year</p>
      <ul className="mt-1.5 space-y-1">
        {impactCharts.pollution.map((p, i) => (
          <li key={p.cut} className="grid grid-cols-[3.75rem_minmax(0,1fr)_2.75rem] items-center gap-2.5">
            <span className="text-xs text-(--ink)/80">cut {p.cut}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-(--ink)/8">
              <span style={grow((p.avoided / max) * 100, 200 + i * 160)} className={cn("ch-bar block h-full rounded-full bg-(--accent)", bar)} />
            </span>
            <span className="text-right font-sans tabular-nums text-xs font-semibold text-(--ink)">{p.avoided}%</span>
          </li>
        ))}
      </ul>

      <p className="mt-2.5 text-xs text-(--ink)/80">Ten-year-olds reading well, +10-point scenario</p>
      <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_5.25rem] items-center gap-2.5">
        <span className="relative h-1.5 overflow-hidden rounded-full bg-(--ink)/8">
          <span style={grow(scenario, 700)} className={cn("absolute inset-y-0 left-0 rounded-full bg-(--ink)/35", bar)} />
          <span style={grow(now, 500)} className={cn("ch-bar absolute inset-y-0 left-0 rounded-full bg-(--accent)", bar)} />
        </span>
        <span className="text-right font-sans tabular-nums text-xs font-semibold text-(--ink)">
          {now}% → {scenario}%
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-3 border-t border-(--ink)/10 pt-2.5">
        <p className="font-grotesk text-3xl leading-none font-extrabold tracking-tight text-(--accent)">100×</p>
        <p className="text-xs leading-snug text-(--ink)/80">fewer cyclone deaths since 1970</p>
      </div>
      <p className="mt-2 text-xs leading-snug text-(--ink)/80">{impactCharts.source}</p>
    </div>
  );
}
