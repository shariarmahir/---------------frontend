/*
 * Motion-graphic layers drawn over a showcase card's photo, one per
 * product or service. They live in the corners and along the bottom edge
 * in thin white and gold strokes, so the photograph stays the subject.
 * Everything moves through the .ms-* classes in globals.css (transform,
 * opacity, stroke-dashoffset); the card pauses them off screen.
 */
import type { CSSProperties } from "react";

export type SceneKind = "ecg" | "voice" | "grid" | "neural" | "factory" | "signal" | "code";

/** Delay (ms) and duration (s) for the .ms-* classes. */
const t = (d = 0, dur?: number, extra: Record<string, string | number> = {}) => ({ "--d": d, ...(dur ? { "--dur": dur } : {}), ...extra }) as CSSProperties;

/** A small solid label plate (ink with a white ring), the HUD's one surface. */
function Chip({ x, y, w, label, delay = 0, dot = "fill-signal-orange" }: { x: number; y: number; w: number; label: string; delay?: number; dot?: string }) {
  return (
    <g className="ms-float" style={t(delay, 2.8)}>
      <rect x={x} y={y} width={w} height="22" rx="11" className="fill-text-primary stroke-white/25" strokeWidth="1" />
      <circle cx={x + 12} cy={y + 11} r="3.5" className={`ms-pulse ${dot}`} style={t(delay)} />
      <text x={x + 21} y={y + 15} className="fill-white font-mono" fontSize="10" fontWeight="700">{label}</text>
    </g>
  );
}

function Ecg() {
  return (
    <g>
      <path pathLength={100} className="ms-dash fill-none stroke-signal-orange" style={t(0, 2.4)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        d="M0 214 H120 L134 214 L144 192 L158 236 L172 176 L188 240 L200 214 H270 L282 204 L294 214 H400" />
    </g>
  );
}

function Voice() {
  const bars = [14, 26, 40, 22, 48, 30, 18, 36, 24, 44, 16, 28];
  return (
    <g>
      <g transform="translate(330 46)">
        <circle r="26" className="ms-ring fill-none stroke-white" strokeWidth="2" style={t(0, 2.2)} />
        <circle r="26" className="ms-ring fill-none stroke-signal-orange" strokeWidth="2" style={t(1100, 2.2)} />
        <circle r="18" className="fill-signal-orange" />
        <rect x="-5" y="-10" width="10" height="15" rx="5" className="fill-text-primary" />
        <path d="M-8 1 A8 8 0 0 0 8 1 M0 9 V13" className="fill-none stroke-text-primary" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform="translate(250 230)">
        {bars.map((h, i) => (
          <rect key={i} x={i * 12} y={-h} width="6" height={h * 2} rx="3" className="ms-bar fill-white" style={t(i * 90, 1.1)} />
        ))}
      </g>
    </g>
  );
}

const VILLAGES = [
  [40, 60], [90, 200], [170, 44], [300, 210], [360, 70], [240, 130],
] as const;

function Grid() {
  const hub = [200, 150] as const;
  return (
    <g>
      {VILLAGES.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${hub[0]} ${hub[1]} L${x} ${y}`} className="stroke-white/40" strokeWidth="1.5" />
          <path pathLength={100} d={`M${hub[0]} ${hub[1]} L${x} ${y}`} className="ms-flow fill-none stroke-signal-orange" strokeWidth="3" strokeLinecap="round" style={t(i * 260, 2.6)} />
          <circle cx={x} cy={y} r="5" className="fill-white" />
          <circle cx={x} cy={y} r="12" className="ms-ring fill-none stroke-white" strokeWidth="1.5" style={t(i * 400, 2.6)} />
        </g>
      ))}
      <circle cx={hub[0]} cy={hub[1]} r="11" className="ms-pulse fill-signal-orange" />
    </g>
  );
}

function Neural() {
  const layers = [[60, 90, 120, 150], [190, 70, 110, 150, 190], [320, 100, 140]] as const;
  const nodes = layers.map(([x, ...ys]) => ys.map((y) => [x, y] as const));
  const edges: [number, number, number, number][] = [];
  for (let l = 0; l < nodes.length - 1; l++) for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push([a[0], a[1], b[0], b[1]]);
  return (
    <g transform="translate(0 6)">
      {edges.map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <path d={`M${x1} ${y1} L${x2} ${y2}`} className="stroke-white/30" strokeWidth="1" />
          {i % 3 === 0 && <path pathLength={100} d={`M${x1} ${y1} L${x2} ${y2}`} className="ms-flow fill-none stroke-signal-orange" strokeWidth="2.5" strokeLinecap="round" style={t(i * 120, 2.2)} />}
        </g>
      ))}
      {nodes.flat().map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" className={i % 4 === 0 ? "ms-pulse fill-signal-orange" : "fill-white"} style={t(i * 150, 2)} />
      ))}
      <g className="ms-float" style={t(0, 3)}>
        <rect x="236" y="196" width="148" height="34" rx="17" className="fill-text-primary stroke-white/25" strokeWidth="1" />
        <text x="252" y="217" className="fill-white" fontSize="11" fontWeight="700">এজেন্ট কাজ করছে</text>
        <rect x="352" y="209" width="2" height="12" className="ms-blink fill-signal-orange" />
      </g>
    </g>
  );
}

function Gear({ cx, cy, r, teeth, cls, spin, dur }: { cx: number; cy: number; r: number; teeth: number; cls: string; spin: string; dur: number }) {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.8;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return (
    <g className={spin} style={t(0, dur)}>
      <polygon points={pts.join(" ")} className={cls} />
      <circle cx={cx} cy={cy} r={r * 0.32} className="fill-text-primary" />
    </g>
  );
}

function Factory() {
  return (
    <g>
      <Gear cx={348} cy={52} r={30} teeth={10} cls="fill-signal-orange" spin="ms-spin" dur={7} />
      <Gear cx={306} cy={90} r={20} teeth={8} cls="fill-white" spin="ms-spin-rev" dur={4.7} />
      <rect x="0" y="222" width="400" height="10" className="fill-text-primary" />
      <g className="ms-belt" style={t(0, 2.4, { "--belt": "80px" })}>
        {[-80, 0, 80, 160, 240, 320, 400].map((x) => (
          <rect key={x} x={x + 18} y="198" width="34" height="24" rx="4" className="fill-white stroke-text-primary" strokeWidth="2" />
        ))}
      </g>
    </g>
  );
}

function Signal() {
  const nodes = [[60, 180], [150, 90], [250, 200]] as const;
  const hub = [340, 70] as const;
  return (
    <g>
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y} Q ${(x + hub[0]) / 2} ${Math.min(y, hub[1]) - 40} ${hub[0]} ${hub[1]}`} className="stroke-white/35" strokeWidth="1.5" fill="none" />
          <path pathLength={100} d={`M${x} ${y} Q ${(x + hub[0]) / 2} ${Math.min(y, hub[1]) - 40} ${hub[0]} ${hub[1]}`} className="ms-flow fill-none stroke-signal-orange" strokeWidth="3" strokeLinecap="round" style={t(i * 500, 2.8)} />
          <circle cx={x} cy={y} r="9" className="ms-ring fill-none stroke-signal-orange" strokeWidth="2" style={t(i * 600)} />
          <circle cx={x} cy={y} r="9" className="ms-ring fill-none stroke-white" strokeWidth="2" style={t(i * 600 + 1200)} />
          <rect x={x - 6} y={y - 6} width="12" height="12" rx="3" className="fill-white" />
        </g>
      ))}
      <g transform={`translate(${hub[0]} ${hub[1]})`}>
        <circle r="20" className="ms-pulse fill-signal-orange" />
        <path d="M-9 3 A10 10 0 0 1 9 3 M-5 7 A5 5 0 0 1 5 7" className="fill-none stroke-text-primary" strokeWidth="2.4" strokeLinecap="round" />
        <circle cy="10" r="2" className="fill-text-primary" />
      </g>
    </g>
  );
}

function Code() {
  const lines = [[0, 62], [12, 88], [12, 50], [24, 76], [12, 40], [0, 30]] as const;
  return (
    <g>
      <g className="ms-float" style={t(0, 3.2)}>
        <rect x="200" y="22" width="184" height="128" rx="12" className="fill-text-primary stroke-white/25" strokeWidth="1" />
        {[0, 1, 2].map((i) => <circle key={i} cx={216 + i * 12} cy="36" r="3.5" className={i === 0 ? "fill-signal-orange" : "fill-white/40"} />)}
        {lines.map(([indent, w], i) => (
          <rect key={i} x={214 + indent} y={52 + i * 15} width={w} height="6" rx="3" className={`ms-type ${i % 3 === 1 ? "fill-signal-orange" : "fill-white/80"}`} style={t(i * 260, 4.2)} />
        ))}
        <rect x="214" y="138" width="2" height="9" className="ms-blink fill-signal-orange" />
      </g>
      <g className="ms-float" style={t(700, 3.6)}>
        <rect x="20" y="96" width="82" height="140" rx="14" className="fill-white stroke-text-primary" strokeWidth="3" />
        <rect x="30" y="112" width="62" height="26" rx="6" className="ms-type fill-signal-orange" style={t(400, 4.2)} />
        <rect x="30" y="146" width="62" height="8" rx="4" className="ms-type fill-text-primary/60" style={t(800, 4.2)} />
        <rect x="30" y="160" width="44" height="8" rx="4" className="ms-type fill-text-primary/40" style={t(1100, 4.2)} />
        <rect x="30" y="200" width="62" height="20" rx="10" className="ms-type fill-bd-green" style={t(1500, 4.2)} />
      </g>
      <text x="300" y="196" textAnchor="middle" className="ms-pulse fill-white font-mono" fontSize="26" fontWeight="800" style={t(0, 2.4)}>{"</>"}</text>
    </g>
  );
}

const SCENES: Record<SceneKind, () => React.ReactElement> = { ecg: Ecg, voice: Voice, grid: Grid, neural: Neural, factory: Factory, signal: Signal, code: Code };

/** Label chips, kept apart from the art so a cropped photo never cuts them: they stay pinned top-left. */
const HUD: Partial<Record<SceneKind, () => React.ReactElement>> = {
  ecg: () => (
    <g>
      <Chip x={16} y={16} w={64} label="ECG" />
      <Chip x={16} y={44} w={66} label="SpO₂" delay={500} dot="fill-bdgreen-500" />
      <Chip x={16} y={72} w={74} label="STRESS" delay={900} />
    </g>
  ),
  voice: () => (
    <g>
      <Chip x={16} y={16} w={104} label="বাংলা ভয়েস" />
    </g>
  ),
  grid: () => (
    <g>
      <Chip x={16} y={16} w={112} label="১ গ্রাম · ১ কেন্দ্র" />
    </g>
  ),
  factory: () => (
    <g>
      <g>{[0, 1, 2].map((i) => <circle key={i} cx={22 + i * 18} cy="22" r="5" className={i === 1 ? "ms-blink fill-bdgreen-500" : "fill-signal-orange"} />)}</g>
      <Chip x={16} y={36} w={88} label="লাইন: চালু" dot="fill-bdgreen-500" />
    </g>
  ),
  signal: () => (
    <g>
      <Chip x={16} y={16} w={96} label="৩ সেন্সর · লাইভ" dot="fill-bdgreen-500" />
    </g>
  ),
};

/**
 * The layer itself, never taking clicks. The art fills the box and may be
 * cropped at its sides on a tall card; the chips sit in their own layer
 * pinned to the top-left corner at the same scale.
 */
export function MotionScene({ kind }: { kind: SceneKind }) {
  const Scene = SCENES[kind];
  const Hud = HUD[kind];
  return (
    <>
      <svg aria-hidden viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
        <Scene />
      </svg>
      {Hud && (
        <svg aria-hidden viewBox="0 0 400 250" preserveAspectRatio="xMinYMin meet" className="pointer-events-none absolute inset-x-0 top-0 h-auto w-full max-w-[40rem]">
          <Hud />
        </svg>
      )}
    </>
  );
}
