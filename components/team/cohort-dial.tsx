import type { CSSProperties } from "react";
import { PHASES } from "@/data/fellowship";
import { fellowship } from "@/data/team";

/** The four phases as shares of the ten weeks, and the solid colour each is drawn in. */
const ARCS = [
  { weeks: 2, color: "var(--color-signal-orange)" },
  { weeks: 5, color: "var(--color-bdnavy-300)" },
  { weeks: 2, color: "var(--color-link-blue)" },
  { weeks: 1, color: "#ffffff" },
];
const WEEKS = 10;
const GAP = 0.8;
/** Where each arc starts on the ring, as a share of 100. */
const STARTS = ARCS.map((_, i) =>
  ARCS.slice(0, i).reduce((sum, a) => sum + (a.weeks / WEEKS) * 100, 0),
);

/**
 * A cohort as a dial: ten week marks round a ring, the four phases drawn on
 * it in solid colour (they sweep in when the page opens), a gold dot going
 * round like the cohort's own clock, and "2.5 months" at the centre. The
 * legend under it names the phases. Under reduced motion it is drawn still.
 */
export function CohortDial() {
  return (
    <figure className="mx-auto w-full max-w-md">
      <div className="relative aspect-square w-full">
        <svg viewBox="0 0 320 320" className="size-full -rotate-90" aria-hidden>
          <circle
            cx="160"
            cy="160"
            r="130"
            fill="none"
            stroke="rgb(255 255 255 / 0.1)"
            strokeWidth="14"
          />
          {ARCS.map((a, i) => (
            <circle
              key={i}
              cx="160"
              cy="160"
              r="130"
              fill="none"
              stroke={a.color}
              strokeWidth="14"
              strokeLinecap="butt"
              pathLength={100}
              className="dial-arc"
              style={
                {
                  "--len": `${(a.weeks / WEEKS) * 100 - GAP}`,
                  strokeDashoffset: -STARTS[i],
                  animationDelay: `${200 + i * 180}ms`,
                } as CSSProperties
              }
            />
          ))}
          {Array.from({ length: WEEKS }, (_, w) => {
            const t = (w / WEEKS) * Math.PI * 2;
            return (
              <line
                key={w}
                x1={160 + Math.cos(t) * 100}
                y1={160 + Math.sin(t) * 100}
                x2={160 + Math.cos(t) * 110}
                y2={160 + Math.sin(t) * 110}
                stroke="rgb(255 255 255 / 0.35)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
          <g className="dial-orbit">
            <circle
              cx="290"
              cy="160"
              r="9"
              fill="var(--color-signal-orange)"
              stroke="#000"
              strokeWidth="4"
            />
          </g>
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-grotesk text-6xl leading-none font-bold text-signal-orange tabular-nums sm:text-7xl">
              2.5
            </p>
            <p className="mt-2 font-grotesk text-lg font-bold text-white">
              months
            </p>
            <p className="mt-1 font-sans text-sm text-white/70">
              one cohort, about ten weeks
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
        <span className="sr-only">
          A {fellowship.cycle} cohort in four phases:
        </span>
        {PHASES.map((p, i) => (
          <span
            key={p.title}
            className="flex items-start gap-2.5 font-sans text-sm"
          >
            <span
              aria-hidden
              className="mt-1 size-3 shrink-0 rounded-full"
              style={{ background: ARCS[i].color }}
            />
            <span>
              <span className="block font-semibold text-white">{p.title}</span>
              <span className="block text-white/65">{p.weeks}</span>
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
