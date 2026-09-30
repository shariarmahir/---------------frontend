import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Solar System — an orbit of nodes around a core, on a plane tilted in 3D.
 *
 * Adapted from VengeanceUI's "Solar System" by Ashutoshx7
 * (github.com/Ashutoshx7/VengeanceUI, src/components/ui/solar-system.tsx;
 * vendored by hand). Kept: the tilted plane, per-ring orbit speeds, evenly
 * phased nodes, billboarded cards and the core-to-node beam.
 *
 * Redrawn in the home page's language (2026-09-30): every ring is a solid
 * theme colour — gold, orange, green — with a bright comet arc running
 * round it; the waves broadcast from the core in gold; each planet is a
 * face on a solid colour ring with its name on an ink chip that opens on
 * hover or focus. No gradients, no textures. All motion lives in
 * globals.css (`.orbit-*`), so this stays a server component; hovering or
 * focusing a planet pauses the system so it can be clicked; reduced motion
 * leaves every planet at rest in its phased position.
 */

export type OrbitRadius = "inner" | "mid" | "outer";

export interface SolarSystemItem {
  id: string;
  label: string;
  sublabel?: string;
  /** Solid colour (a CSS colour or theme var) for the planet ring, beam and glow. */
  color: string;
  /** The node's face — an avatar, logo or icon. */
  avatar: ReactNode;
  href?: string;
  /** Accessible name; defaults to "label — sublabel". */
  ariaLabel?: string;
}

export interface OrbitConfig {
  id: string;
  name: string;
  radius: OrbitRadius;
  /** Seconds for one full revolution. */
  speed: number;
  /** Solid colour of the ring and its comet. */
  color: string;
  items: SolarSystemItem[];
}

export interface SolarSystemProps {
  core: ReactNode;
  orbits: OrbitConfig[];
  /** Travelling signal pulses on the beams (on by default). */
  signals?: boolean;
  className?: string;
}

type Vars = CSSProperties & Record<`--${string}`, string>;

const RADIUS: Record<OrbitRadius, string> = {
  inner: "var(--r-inner)",
  mid: "var(--r-mid)",
  outer: "var(--r-outer)",
};

const mix = (c: string, pct: number) => `color-mix(in oklab, ${c} ${pct}%, transparent)`;

export function SolarSystem({ core, orbits, signals = true, className }: SolarSystemProps) {
  let node = 0;

  return (
    <div className={cn("orbit-stage relative flex w-full items-center justify-center overflow-visible select-none", className)}>
      <div className="orbit-plane absolute flex items-center justify-center">
        {/* Waves broadcast from the core across the plane, gold then green. */}
        {signals &&
          [
            { delay: "0s", c: "border-signal-orange" },
            { delay: "-1.8s", c: "border-bdgreen-500" },
            { delay: "-3.6s", c: "border-signal-orange" },
          ].map(({ delay, c }) => (
            <span
              key={delay}
              aria-hidden
              className={cn("orbit-wave pointer-events-none absolute top-1/2 left-1/2 rounded-full border-2", c)}
              style={{ width: "calc(2 * var(--r-outer))", height: "calc(2 * var(--r-outer))", animationDelay: delay }}
            />
          ))}

        {/* Rings: a solid colour line, and a bright comet arc running round it. */}
        {orbits.map((orbit, i) => {
          const size = `calc(2 * ${RADIUS[orbit.radius]})`;
          return (
            <span key={orbit.id} aria-hidden className="pointer-events-none">
              <span
                className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full border-[1.5px]"
                style={{ width: size, height: size, borderColor: mix(orbit.color, 45) }}
              />
              <span
                className="orbit-comet absolute top-1/2 left-1/2 -translate-1/2 rounded-full border-[3px] border-transparent"
                style={
                  {
                    width: size,
                    height: size,
                    borderTopColor: orbit.color,
                    borderRightColor: mix(orbit.color, 35),
                    filter: `drop-shadow(0 0 6px ${orbit.color})`,
                    "--spin": `${orbit.speed / 3}s`,
                    animationDelay: `${-i * 1.7}s`,
                  } as Vars
                }
              />
            </span>
          );
        })}

        {/* The core — faces the viewer. */}
        <div className="orbit-face absolute top-1/2 left-1/2 z-20">{core}</div>

        {/* Planets. */}
        {orbits.flatMap((orbit) =>
          orbit.items.map((item, i, arr) => {
            const delay = `${-(orbit.speed / arr.length) * i}s`;
            const pulseDelay = `${(node++ * 0.47).toFixed(2)}s`;
            const armVars: Vars = {
              "--orbit-radius": RADIUS[orbit.radius],
              "--orbit-duration": `${orbit.speed}s`,
              "--orbit-delay": delay,
              "--pulse-delay": pulseDelay,
              "--c": item.color,
            };
            const name = item.ariaLabel ?? (item.sublabel ? `${item.label} — ${item.sublabel}` : item.label);
            const cardClass =
              "orbit-card group/planet absolute top-1/2 left-1/2 flex flex-col items-center rounded-full outline-none [-webkit-tap-highlight-color:transparent]";
            const face = (
              <>
                <span className="block rounded-full bg-(--c) p-[3px] shadow-[0_0_18px_-2px_var(--c)] transition-[scale,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/planet:scale-125 group-hover/planet:shadow-[0_0_28px_2px_var(--c)] group-focus-visible/planet:scale-125 group-focus-visible/planet:ring-2 group-focus-visible/planet:ring-white motion-reduce:transition-none">
                  {item.avatar}
                </span>
                <span className="pointer-events-none absolute top-full mt-2 flex scale-90 flex-col items-center rounded-lg bg-text-primary px-2.5 py-1 leading-tight opacity-0 shadow-[0_10px_24px_-10px_var(--c)] ring-1 ring-white/15 transition-[opacity,scale] duration-200 group-hover/planet:scale-100 group-hover/planet:opacity-100 group-focus-visible/planet:scale-100 group-focus-visible/planet:opacity-100">
                  <span className="font-grotesk text-[11px] font-bold whitespace-nowrap text-white">{item.label}</span>
                  {item.sublabel && <span className="font-mono text-[9px] whitespace-nowrap text-signal-orange uppercase">{item.sublabel}</span>}
                </span>
              </>
            );

            return (
              <div key={item.id} className="orbit-arm group/arm pointer-events-none absolute top-1/2 left-1/2 size-0" style={armVars}>
                {/* Beam from the core to this planet, with its signal. */}
                <span
                  aria-hidden
                  className="absolute top-0 right-0 h-[1.5px] origin-right -translate-y-1/2 opacity-50 transition-opacity duration-300 group-has-[.orbit-card:hover]/arm:opacity-100 group-has-[.orbit-card:focus-visible]/arm:opacity-100"
                  style={{ width: RADIUS[orbit.radius], background: mix(item.color, 40) }}
                >
                  {signals && (
                    <span
                      className="orbit-pulse absolute top-1/2 left-0 -mt-[3px] size-1.5 rounded-[2px]"
                      style={{ background: item.color, boxShadow: `0 0 10px 2px ${item.color}` }}
                    />
                  )}
                </span>

                {item.href ? (
                  <Link href={item.href} aria-label={name} className={cn(cardClass, "pointer-events-auto")}>
                    {face}
                  </Link>
                ) : (
                  <div aria-label={name} role="img" className={cn(cardClass, "pointer-events-auto")}>
                    {face}
                  </div>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
