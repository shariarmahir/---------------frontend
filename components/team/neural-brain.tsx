import { cn } from "@/lib/utils";

/**
 * A brain seen from above, drawn as a neural network: two hemispheres of
 * nodes linked to their nearest neighbours, a few links across the
 * midline, and sparks running along a subset of the links. Sits behind
 * the team orbit — the founder's "signal" rising out of it.
 *
 * Generated once at module load from a fixed seed, so server and client
 * render identical markup. SVG + CSS only (CLAUDE.md §6).
 */

const W = 800;
const H = 620;
const CX = 298; // left hemisphere centre; the right one is mirrored
const CY = 310;
const RX = 190;
const RY = 240;
const MID = 392; // hemisphere edge at the fissure

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Wavy outline of the left hemisphere — the waves suggest gyri. */
function hemisphere(mirror: boolean): string {
  const t0 = Math.acos((MID - CX) / RX);
  const pts: string[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((2 * Math.PI - 2 * t0) * i) / steps;
    const wobble = 1 + 0.03 * Math.sin(t * 11);
    const x = CX + RX * wobble * Math.cos(t);
    const y = CY - RY * wobble * Math.sin(t);
    pts.push(`${r1(mirror ? W - x : x)},${r1(y)}`);
  }
  return `M${pts.join(" L")} Q${mirror ? W - MID + 12 : MID - 12},${CY} ${pts[0]} Z`;
}

type Pt = { x: number; y: number; d: number };

const rand = mulberry32(1971);
const nodes: Pt[] = [];
for (const mirror of [false, true]) {
  let placed = 0;
  while (placed < 42) {
    const x = CX - RX + rand() * RX * 2;
    const y = CY - RY + rand() * RY * 2;
    const inside = ((x - CX) / (RX * 0.9)) ** 2 + ((y - CY) / (RY * 0.9)) ** 2 < 1 && x < MID - 14;
    if (!inside) continue;
    nodes.push({ x: r1(mirror ? W - x : x), y: r1(y), d: r1(rand() * 4) });
    placed++;
  }
}

const edges: [Pt, Pt][] = [];
const seen = new Set<string>();
nodes.forEach((a, i) => {
  const sameSide = nodes
    .map((b, j) => ({ b, j, dist: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
    .filter(({ j, b }) => j !== i && a.x < W / 2 === b.x < W / 2)
    .sort((p, q) => p.dist - q.dist)
    .slice(0, 2);
  for (const { b, j } of sameSide) {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (!seen.has(key)) {
      seen.add(key);
      edges.push([a, b]);
    }
  }
});

// A few links across the midline (the corpus callosum).
const nearMid = nodes.filter((n) => Math.abs(n.x - W / 2) < 90);
const left = nearMid.filter((n) => n.x < W / 2).sort((a, b) => a.y - b.y);
const right = nearMid.filter((n) => n.x >= W / 2).sort((a, b) => a.y - b.y);
for (let i = 0; i < Math.min(left.length, right.length, 5); i++) edges.push([left[i], right[i]]);

const OUTLINES = [hemisphere(false), hemisphere(true)];

/** `id` names the glow gradient — give each copy on a page its own. */
export function NeuralBrain({ className, id = "brain-core" }: { className?: string; id?: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      className={cn("pointer-events-none", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff9100" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#006747" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#006747" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx={W / 2} cy={CY} rx={W / 2} ry={H / 2} fill={`url(#${id})`} />

      {OUTLINES.map((d) => (
        <path key={d.slice(0, 16)} d={d} fill="rgb(16 185 129 / 0.04)" stroke="rgb(52 211 153 / 0.35)" strokeWidth="1.5" />
      ))}

      <g stroke="rgb(167 243 208 / 0.16)" strokeWidth="1">
        {edges.map(([a, b]) => (
          <line key={`${a.x},${a.y}-${b.x},${b.y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        ))}
      </g>

      {/* Sparks travelling along every third link. */}
      <g stroke="#ffb454" strokeWidth="2" strokeLinecap="round" fill="none">
        {edges
          .filter((_, i) => i % 3 === 0)
          .map(([a, b], i) => (
            <path
              key={`s${a.x},${a.y}-${b.x},${b.y}`}
              d={`M${a.x},${a.y} L${b.x},${b.y}`}
              pathLength={100}
              className="neural-spark"
              style={{ animationDelay: `${-((i * 0.61) % 3.6).toFixed(2)}s` }}
            />
          ))}
      </g>

      <g fill="#6ee7b7">
        {nodes.map((n) => (
          <circle key={`${n.x},${n.y}`} cx={n.x} cy={n.y} r={2.4} className="neural-node" style={{ animationDelay: `-${n.d}s` }} />
        ))}
      </g>
    </svg>
  );
}
