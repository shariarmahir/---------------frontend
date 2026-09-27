import { PIXEL_MASK } from "@/data/gori/pixel-mask";
import { cn } from "@/lib/utils";

/** Land cells of the 64 × 64 Bangladesh mask, row-major. */
const LAND: [x: number, y: number][] = PIXEL_MASK.flatMap((row, y) =>
  [...row].flatMap((c, x) => (c === "#" ? [[x, y] as [number, number]] : [])),
);

/**
 * The 32 bad pixels — one per dossier problem, spread evenly through the
 * land cells so every region carries some. Deterministic, so the server
 * and client draw the same map.
 */
const BAD = new Map(
  Array.from({ length: 32 }, (_, i) => {
    const cell = LAND[Math.floor(((i + 0.5) * LAND.length) / 32)];
    return [`${cell[0]},${cell[1]}`, i + 1] as const;
  }),
);

/**
 * Bangladesh as a low-resolution image (CLAUDE.md §2): healthy land glows
 * green-gold, the 32 problems flicker red. `healed` draws every pixel
 * healthy — the end state the page argues for.
 */
export function PixelMap({ className, healed = false, label }: { className?: string; healed?: boolean; label: string }) {
  return (
    <svg viewBox="8 0 50 64" role="img" aria-label={label} className={cn("desh-map", className)}>
      <defs>
        <filter id={healed ? "px-glow-h" : "px-glow"} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${healed ? "px-glow-h" : "px-glow"})`}>
        {LAND.map(([x, y]) => {
          const bad = !healed && BAD.get(`${x},${y}`);
          return (
            <rect
              key={`${x},${y}`}
              x={x + 0.08}
              y={y + 0.08}
              width={0.84}
              height={0.84}
              rx={0.12}
              className={bad ? "desh-px-bad" : "desh-px"}
              style={bad ? { animationDelay: `${(bad * 0.37) % 3}s` } : { opacity: 0.55 + ((x * 7 + y * 13) % 10) / 22 }}
            />
          );
        })}
      </g>
    </svg>
  );
}

export const BAD_PIXEL_COUNT = BAD.size;
