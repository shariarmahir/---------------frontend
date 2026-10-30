/*
 * Motion layers for the product poster cards, drawn over the photograph in
 * the card's hill (a 416 × 395 box). The hill is a dome, so every mark sits
 * in its lower half, where the picture runs the card's full width, and
 * leaves the lower left free for the status chips. Thin gold and white
 * strokes only, so the photograph stays the subject. Movement comes from
 * the .ms-* classes in globals.css, which pause off screen and stand still
 * under reduced motion.
 */
import type { CSSProperties } from "react";

export type PosterSceneKind = "ecg" | "voice" | "grid";

/** Delay (ms) and duration (s) for the .ms-* classes. */
const t = (d = 0, dur?: number) => ({ "--d": d, ...(dur ? { "--dur": dur } : {}) }) as CSSProperties;

/** Aponjon: a heartbeat traced across the wrist, a faint copy under it. */
function Ecg() {
  const d = "M-10 286 H128 L140 286 L150 258 L164 314 L178 236 L194 318 L206 286 H286 L298 274 L310 286 H430";
  return (
    <g>
      <path d={d} className="fill-none stroke-white/25" strokeWidth="2" strokeLinejoin="round" />
      <path pathLength={100} d={d} className="ms-dash fill-none stroke-signal-orange" style={t(0, 2.6)} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="178" cy="236" r="6" className="ms-ring fill-none stroke-signal-orange" strokeWidth="2" style={t(400, 2.6)} />
    </g>
  );
}

/** SWASTI: a Bangla voice note — the mic, two rings, and a live waveform. */
function Voice() {
  const bars = [16, 28, 42, 24, 50, 32, 20, 38, 26, 46, 18, 30, 22];
  return (
    <g>
      <g transform="translate(372 300)">
        <circle r="22" className="ms-ring fill-none stroke-white" strokeWidth="2" style={t(0, 2.2)} />
        <circle r="22" className="ms-ring fill-none stroke-signal-orange" strokeWidth="2" style={t(1100, 2.2)} />
        <circle r="18" className="fill-signal-orange" />
        <rect x="-5" y="-10" width="10" height="15" rx="5" className="fill-text-primary" />
        <path d="M-8 1 A8 8 0 0 0 8 1 M0 9 V13" className="fill-none stroke-text-primary" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform="translate(196 300)">
        {bars.map((h, i) => (
          <rect key={i} x={i * 12} y={-h / 2} width="6" height={h} rx="3" className="ms-bar fill-white" style={t(i * 90, 1.1)} />
        ))}
      </g>
    </g>
  );
}

/** Smart Pharmacy: one centre, the villages around it, care flowing out. */
const VILLAGES = [
  [196, 250],
  [298, 238],
  [384, 266],
  [356, 336],
  [238, 330],
] as const;

function Grid() {
  const hub = [300, 292] as const;
  return (
    <g>
      {VILLAGES.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${hub[0]} ${hub[1]} L${x} ${y}`} className="stroke-white/40" strokeWidth="1.5" />
          <path pathLength={100} d={`M${hub[0]} ${hub[1]} L${x} ${y}`} className="ms-flow fill-none stroke-signal-orange" strokeWidth="3" strokeLinecap="round" style={t(i * 260, 2.6)} />
          <circle cx={x} cy={y} r="4.5" className="fill-white" />
          <circle cx={x} cy={y} r="11" className="ms-ring fill-none stroke-white" strokeWidth="1.5" style={t(i * 400, 2.6)} />
        </g>
      ))}
      <circle cx={hub[0]} cy={hub[1]} r="10" className="ms-pulse fill-signal-orange" />
      <path d={`M${hub[0] - 4} ${hub[1]} H${hub[0] + 4} M${hub[0]} ${hub[1] - 4} V${hub[1] + 4}`} className="stroke-text-primary" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

const SCENES = { ecg: Ecg, voice: Voice, grid: Grid } satisfies Record<PosterSceneKind, () => React.ReactElement>;

export function PosterScene({ kind }: { kind: PosterSceneKind }) {
  const Scene = SCENES[kind];
  return (
    <svg aria-hidden viewBox="0 0 416 395" className="pointer-events-none absolute inset-0 h-full w-full">
      <Scene />
    </svg>
  );
}
