"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, useSyncExternalStore } from "react";
import { codeOf, moduleLinks, modules } from "@/data/gori/modules";
import { branchPath, buildLayout, CENTER_R, LEAF_DOT, LEAF_R, polar, radialText, THEME_R, trunkPath, VIEW } from "@/lib/gori/layout";
import { cn } from "@/lib/utils";
import { useT } from "../provider";

const layout = buildLayout();
const leafAt = new Map(layout.flatMap((t) => t.leaves.map((l) => [l.n, l])));
const EASE = [0.16, 1, 0.3, 1] as const;

const PHONE = "(max-width: 767px)";
const usePhone = () =>
  useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(PHONE);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(PHONE).matches,
    () => false,
  );

/** A chord between two modules, bowing toward the centre. */
function chord(a: number, b: number): string {
  const p = leafAt.get(a)!;
  const q = leafAt.get(b)!;
  const pa = polar(LEAF_R - LEAF_DOT - 4, p.angle);
  const pb = polar(LEAF_R - LEAF_DOT - 4, q.angle);
  const mid = { x: ((pa.x + pb.x) / 2) * 0.2, y: ((pa.y + pb.y) / 2) * 0.2 };
  return `M${pa.x} ${pa.y} Q${mid.x} ${mid.y} ${pb.x} ${pb.y}`;
}

/**
 * The 32 modules and their dependency hypotheses. Hover or focus a module:
 * what it depends on lights orange, what it feeds lights green.
 */
export function ModuleNetwork({ shares, selected, onSelect }: { shares: number[]; selected?: number | null; onSelect: (n: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const phone = usePhone();
  const { n: fmt } = useT();
  const focus = hover ?? selected ?? null;
  const view = phone ? LEAF_R + LEAF_DOT + 12 : VIEW;
  const avg = shares.reduce((a, b) => a + b, 0) / shares.length;
  const arc = polar(CENTER_R - 7, -90 + avg * 359.9);

  const links = useMemo(
    () =>
      moduleLinks.map((l) => {
        const a = Number(l.from.slice(3));
        const b = Number(l.to.slice(3));
        return { ...l, a, b, d: chord(a, b) };
      }),
    [],
  );

  return (
    <svg viewBox={`${-view} ${-view} ${view * 2} ${view * 2}`} className="h-auto w-full select-none" role="group" aria-label="৩২টি মডিউল ও তাদের নির্ভরতা">
      <defs>
        <radialGradient id="net-core" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#0b7a55" />
          <stop offset="100%" stopColor="#004731" />
        </radialGradient>
      </defs>
      <circle r={THEME_R} className="fill-none stroke-white/8" strokeDasharray="2 7" />
      <circle r={LEAF_R} className="fill-none stroke-white/8" strokeDasharray="2 7" />

      {/* Dependency chords. */}
      {links.map((l, i) => {
        const up = focus !== null && l.b === focus;
        const down = focus !== null && l.a === focus;
        const dim = focus !== null && !up && !down;
        return (
          <path
            key={i}
            d={l.d}
            className={cn(
              "fill-none transition-[stroke,opacity] duration-300",
              up ? "stroke-signal-orange" : down ? "stroke-emerald-300" : "stroke-white",
              dim ? "opacity-[0.04]" : focus !== null ? "opacity-100" : "opacity-[0.12]",
            )}
            strokeWidth={up || down ? 2.5 : 1.2}
            strokeDasharray={l.basis === "assumption" ? "5 5" : undefined}
          />
        );
      })}

      {layout.map((t, ti) => {
        const done = t.leaves.every((l) => (shares[l.n - 1] ?? 0) >= 0.75);
        const label = radialText(CENTER_R + 18, t.angle);
        return (
          <g key={t.id}>
            <motion.path
              d={trunkPath(t)}
              className={cn("fill-none", done ? "stroke-emerald-400/70" : "stroke-white/18")}
              strokeWidth={2}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: ti * 0.03, ease: EASE }}
            />
            {t.leaves.map((l) => (
              <path key={l.n} d={branchPath(t, l)} className="fill-none stroke-white/10" strokeWidth={1.2} />
            ))}
            <circle cx={t.x} cy={t.y} r={7} className={done ? "fill-emerald-400" : "fill-gori-deep stroke-white/50"} strokeWidth={2} />
            <text transform={label.transform} textAnchor={label.anchor} dominantBaseline="central" className="fill-emerald-100 font-bengali text-[19px] font-semibold [paint-order:stroke] stroke-gori-deep" strokeWidth={6}>
              {t.bn}
            </text>
          </g>
        );
      })}

      {modules.map((m) => {
        const l = leafAt.get(m.n)!;
        const share = shares[m.n - 1] ?? 0;
        const solved = share >= 0.75;
        const tried = share > 0 && !solved;
        const on = focus === m.n;
        const label = radialText(LEAF_R + LEAF_DOT + 10, l.angle);
        return (
          <g
            key={m.n}
            role="button"
            tabIndex={0}
            aria-label={`${fmt(m.n)} ${m.code} ${m.titleBn}${solved ? " — পুনর্গঠিত" : tried ? ` — ${fmt(Math.round(share * 100))}%` : ""}`}
            onClick={() => onSelect(m.n)}
            onMouseEnter={() => setHover(m.n)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(m.n)}
            onBlur={() => setHover(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(m.n);
              }
            }}
            className="group cursor-pointer outline-none"
          >
            <circle cx={l.x} cy={l.y} r={LEAF_DOT + 11} className="fill-transparent" />
            <circle
              cx={l.x}
              cy={l.y}
              r={LEAF_DOT}
              strokeWidth={on ? 3.5 : 2}
              className={cn(
                "transition-[fill,stroke] duration-500 group-focus-visible:stroke-white",
                solved ? "fill-emerald-400" : tried ? "fill-signal-orange/30" : "fill-gori-deep",
                on ? "stroke-white" : solved ? "stroke-emerald-300" : "stroke-signal-orange",
              )}
            />
            <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="central" className={cn("pointer-events-none font-bengali text-[17px] font-bold", solved ? "fill-gori-deep" : "fill-white")}>
              {fmt(m.n)}
            </text>
            <text
              transform={label.transform}
              textAnchor={label.anchor}
              dominantBaseline="central"
              className={cn("pointer-events-none font-bengali text-[17px] max-md:hidden", on ? "fill-signal-orange font-bold" : solved ? "fill-emerald-200" : "fill-white/80")}
            >
              {codeOf(m.n)}
            </text>
          </g>
        );
      })}

      <circle r={CENTER_R} fill="url(#net-core)" className="stroke-white/20" strokeWidth={1.5} />
      <circle r={CENTER_R - 7} className="fill-none stroke-white/12" strokeWidth={5} />
      {avg > 0 && (
        <path d={`M0 ${-(CENTER_R - 7)} A${CENTER_R - 7} ${CENTER_R - 7} 0 ${avg > 0.5 ? 1 : 0} 1 ${arc.x} ${arc.y}`} className="fill-none stroke-signal-orange" strokeWidth={5} strokeLinecap="round" />
      )}
      <text y={-14} textAnchor="middle" className="fill-white font-bengali text-[20px] font-bold">
        বাংলাদেশ
      </text>
      <text y={16} textAnchor="middle" className="fill-signal-orange font-bengali text-[26px] font-extrabold">
        {fmt(Math.round(avg * 100))}%
      </text>
      <text y={38} textAnchor="middle" className="fill-emerald-100/80 font-bengali text-[12px]">
        পুনর্গঠিত
      </text>
    </svg>
  );
}
