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

/** A fixed scatter of cells that catch the gold, so the land reads as lit rather than flat. */
const lit = (x: number, y: number) => (x * 7 + y * 13) % 17 === 0;

/**
 * Bangladesh as a low-resolution image (CLAUDE.md §2): healthy land in
 * navy with a scatter of gold, the 32 problems glowing red on top and
 * flickering (still under reduced motion). `healed` draws every pixel
 * healthy — the end state the page argues for.
 */
export function PixelMap({ className, healed = false, label }: { className?: string; healed?: boolean; label: string }) {
  const bad = (x: number, y: number) => !healed && BAD.has(`${x},${y}`);
  return (
    <svg viewBox="8 0 50 64" role="img" aria-label={label} className={cn("desh-map", className)}>
      {LAND.map(([x, y]) =>
        bad(x, y) ? null : (
          <rect
            key={`${x},${y}`}
            x={x + 0.1}
            y={y + 0.1}
            width={0.8}
            height={0.8}
            rx={0.1}
            className={lit(x, y) ? "desh-px-lit" : "desh-px"}
            style={{ opacity: 0.6 + ((x * 7 + y * 13) % 10) / 25 }}
          />
        ),
      )}
      {!healed && (
        <>
          <filter id="desh-px-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <g filter="url(#desh-px-glow)">
            {LAND.filter(([x, y]) => bad(x, y)).map(([x, y]) => (
              <rect
                key={`${x},${y}`}
                x={x + 0.1}
                y={y + 0.1}
                width={0.8}
                height={0.8}
                rx={0.1}
                className="desh-px-bad"
                style={{ animationDelay: `${(BAD.get(`${x},${y}`)! * 0.37) % 3}s` }}
              />
            ))}
          </g>
        </>
      )}
    </svg>
  );
}

export const BAD_PIXEL_COUNT = BAD.size;
