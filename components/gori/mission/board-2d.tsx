"use client";

import { AnimatePresence, motion } from "framer-motion";
import { codeOf, moduleLinks, moduleOf } from "@/data/gori/modules";
import { PILLARS, pillarDef, pillarOf } from "@/data/gori/mission";
import { PIXEL_MASK } from "@/data/gori/pixel-mask";
import { PILLAR_COLOR, PILLAR_SHAPE, pawnOffset, pillarLabelAngle, PLAYER_COLOR, pixelToBoard, PIXEL_SIZE, PRESSURE_COLOR, SPOTS } from "@/lib/gori/mission/layout";
import { assignPixels } from "@/lib/gori/pixel-map";
import { cn } from "@/lib/utils";
import type { BoardProps } from "./board-types";

/**
 * The same board in SVG: every module is a keyboard-operable button, so this
 * is also the accessible board. Used on phones, low-end devices, with
 * reduced motion, or by choice.
 */

const S = 40;
const pixels = assignPixels(PIXEL_MASK);
const RAMP = ["#1f6f52", "#9c8a2c", "#c8581c", "#da291c"];
const bnDigits = (v: number | string) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
const P = (n: number) => ({ x: SPOTS[n].x * S, y: SPOTS[n].y * S });

const LINKS = moduleLinks.map((l) => {
  const a = Number(l.from.slice(3));
  const b = Number(l.to.slice(3));
  const p = P(a);
  const q = P(b);
  const c = { x: ((p.x + q.x) / 2) * 0.45, y: ((p.y + q.y) / 2) * 0.45 };
  return { a, b, assumption: l.basis === "assumption", d: `M${p.x} ${p.y} Q${c.x} ${c.y} ${q.x} ${q.y}` };
});

function Shape({ n, r, className, style }: { n: number; r: number; className?: string; style?: React.CSSProperties }) {
  const { x, y } = P(n);
  switch (PILLAR_SHAPE[pillarOf(n)]) {
    case "sphere":
      return <circle cx={x} cy={y} r={r} className={className} style={style} />;
    case "box":
      return <rect x={x - r * 0.9} y={y - r * 0.9} width={r * 1.8} height={r * 1.8} rx={3} className={className} style={style} />;
    case "octa":
      return <path d={`M${x} ${y - r * 1.15} L${x + r * 1.15} ${y} L${x} ${y + r * 1.15} L${x - r * 1.15} ${y} Z`} className={className} style={style} />;
    case "cone":
      return <path d={`M${x} ${y - r * 1.15} L${x + r * 1.1} ${y + r * 0.85} L${x - r * 1.1} ${y + r * 0.85} Z`} className={className} style={style} />;
  }
}

export default function Board2D({ state, current, selected, focus, highlight, pulses, reduce, onSelect, onHover }: BoardProps) {
  const f = focus ?? selected ?? null;
  const chain = new Set(highlight?.collapsed ?? []);
  const hit = new Set(highlight?.hit ?? []);

  return (
    <svg viewBox="-410 -330 820 660" className="h-full w-full select-none" role="group" aria-label="মিশনের বোর্ড: ৩২টি মডিউল, সংযোগ আর খেলোয়াড়দের অবস্থান">
      <defs>
        <radialGradient id="m2d-bg" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#0a3a2e" />
          <stop offset="100%" stopColor="#03201a" />
        </radialGradient>
      </defs>
      <rect x={-410} y={-330} width={820} height={660} fill="url(#m2d-bg)" />

      {/* Map: each pixel shows its module's pressure. */}
      <g aria-hidden>
        {pixels.map((p, i) => {
          const n = p.module + 1;
          const { x, y } = pixelToBoard(p.x, p.y);
          const restored = state.reforms[pillarOf(n)] === "restored";
          return (
            <rect
              key={i}
              x={x * S - (PIXEL_SIZE * S) / 2}
              y={y * S - (PIXEL_SIZE * S) / 2}
              width={PIXEL_SIZE * S * 0.86}
              height={PIXEL_SIZE * S * 0.86}
              fill={restored ? "#46d39a" : RAMP[state.pressure[n]]}
              opacity={f === n ? 1 : f !== null ? 0.45 : 0.85}
              className="transition-[fill,opacity] duration-500"
            />
          );
        })}
      </g>

      <g aria-hidden>
        {LINKS.map((l, i) => {
          const hot = chain.has(l.a);
          const up = f !== null && l.b === f;
          const down = f !== null && l.a === f;
          const quiet = (f !== null || chain.size > 0) && !hot && !up && !down;
          return (
            <path
              key={i}
              d={l.d}
              fill="none"
              stroke={hot ? "#ff5a4a" : up ? "#ffb454" : down ? "#6ee7b7" : "#a8dcc6"}
              strokeWidth={hot || up || down ? 2.6 : 1.1}
              strokeDasharray={l.assumption ? "6 5" : undefined}
              opacity={quiet ? 0.06 : hot || up || down ? 0.95 : 0.2}
              className="transition-[opacity,stroke] duration-300"
            />
          );
        })}
      </g>

      {PILLARS.map((p) => {
        const a = (pillarLabelAngle(p.id) * Math.PI) / 180;
        return (
          <text key={p.id} x={Math.sin(a) * 9.3 * S} y={-Math.cos(a) * 7.55 * S} textAnchor="middle" dominantBaseline="central" className="font-bengali text-[15px] font-bold" fill={PILLAR_COLOR[p.id]} aria-hidden>
            {p.bn}
          </text>
        );
      })}

      {SPOTS.slice(1).map((s) => {
        const n = s.n;
        const { x, y } = P(n);
        const p = state.pressure[n];
        const pillar = pillarOf(n);
        const on = f === n;
        const hub = state.hubs.includes(n);
        const m = moduleOf(codeOf(n))!;
        const who = state.players.filter((pl) => pl.at === n).map((pl) => pl.name);
        return (
          <g
            key={n}
            role="button"
            tabIndex={0}
            aria-label={`${bnDigits(n)} ${codeOf(n)} ${m.titleBn}, ${pillarDef(pillar).bn}, চাপ ${bnDigits(p)}${hub ? ", সমন্বয় কেন্দ্র" : ""}${who.length ? `, এখানে: ${who.join(", ")}` : ""}`}
            aria-pressed={selected === n}
            onClick={() => onSelect(n)}
            onMouseEnter={() => onHover(n)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(n)}
            onBlur={() => onHover(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(n);
              }
            }}
            className="group cursor-pointer outline-none"
          >
            <circle cx={x} cy={y} r={26} fill="transparent" />
            {hub && <circle cx={x} cy={y} r={23} fill="none" stroke="#ffb454" strokeWidth={4} />}
            {(p === 3 || chain.has(n)) && (
              <circle cx={x} cy={y} r={27} fill="none" stroke={PRESSURE_COLOR} strokeWidth={2.5} className={reduce ? "" : "animate-pulse"} />
            )}
            {hit.has(n) && !chain.has(n) && <circle cx={x} cy={y} r={27} fill="none" stroke="#ffb454" strokeWidth={2} strokeDasharray="4 3" />}
            <Shape
              n={n}
              r={15}
              className="transition-[fill,stroke] duration-300 group-focus-visible:stroke-white"
              style={{ fill: state.reforms[pillar] === "restored" ? "#bff5dc" : PILLAR_COLOR[pillar], stroke: on ? "#ffffff" : "#03201a", strokeWidth: on ? 3 : 2 }}
            />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" className="pointer-events-none font-bengali text-[13px] font-bold" fill={state.reforms[pillar] === "restored" ? "#062d25" : "#ffffff"}>
              {bnDigits(String(n).padStart(2, "0"))}
            </text>
            <AnimatePresence>
              {Array.from({ length: p }, (_, k) => (
                <motion.rect
                  key={k}
                  x={x - 15 + k * 11}
                  y={y + 20}
                  width={8}
                  height={8}
                  rx={1.5}
                  fill={PRESSURE_COLOR}
                  stroke="#03201a"
                  initial={reduce ? false : { opacity: 0, y: y + 4 }}
                  animate={{ opacity: 1, y: y + 20 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 20 }}
                />
              ))}
            </AnimatePresence>
          </g>
        );
      })}

      {/* Collapse and treatment ripples. */}
      {!reduce && (
        <g aria-hidden>
          <AnimatePresence>
            {pulses.map((p) => {
              const c = p.kind === "reform" ? { x: 0, y: 0 } : P(p.n);
              return (
                <motion.circle
                  key={p.key}
                  cx={c.x}
                  cy={c.y}
                  fill="none"
                  stroke={p.kind === "collapse" ? PRESSURE_COLOR : p.kind === "reform" ? "#ffd166" : "#6ee7b7"}
                  strokeWidth={3}
                  initial={{ r: 16, opacity: 0.9 }}
                  animate={{ r: p.kind === "reform" ? 320 : p.kind === "collapse" ? 90 : 40, opacity: 0 }}
                  transition={{ duration: p.kind === "reform" ? 1.6 : 1.1, ease: "easeOut" }}
                />
              );
            })}
          </AnimatePresence>
        </g>
      )}

      <g aria-hidden>
        {state.players.map((pl, i) => {
          const here = state.players.map((q, j) => ({ q, j })).filter(({ q }) => q.at === pl.at);
          const off = pawnOffset(here.findIndex((x) => x.j === i), here.length);
          const { x, y } = P(pl.at);
          const active = i === current && !state.outcome;
          return (
            <motion.g
              key={i}
              initial={false}
              animate={{ x: x + off.x * 44, y: y - 30 + off.y * 20 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 18 }}
            >
              <circle r={active ? 11 : 9} fill={PLAYER_COLOR[i]} stroke="#03201a" strokeWidth={2} />
              {active && <circle r={15} fill="none" stroke={PLAYER_COLOR[i]} strokeWidth={2} className={cn(!reduce && "animate-ping")} style={{ transformOrigin: "center" }} />}
              <text textAnchor="middle" dominantBaseline="central" className="font-bengali text-[11px] font-extrabold" fill="#062d25">
                {bnDigits(i + 1)}
              </text>
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
}
