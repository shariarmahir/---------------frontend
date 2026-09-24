import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Solar System — an orbit of nodes around a core, on a plane tilted in 3D.
 *
 * Adapted from VengeanceUI's "Solar System" by Ashutoshx7
 * (github.com/Ashutoshx7/VengeanceUI, src/components/ui/solar-system.tsx;
 * the registry URL for the shadcn CLI returned 404, so it was vendored by
 * hand). Kept: the tilted plane, per-ring orbit speeds, evenly phased
 * nodes, billboarded cards and the core-to-node beam. Changed for this
 * project:
 *  - all motion lives in globals.css (`.orbit-*`) instead of a <style> tag
 *    that rewrote `:root` on every render, so it is a server component;
 *  - typed custom properties instead of `as any`;
 *  - nodes can be links, with an accessible name, and hovering or focusing
 *    any node pauses the system so it can be clicked;
 *  - beams carry a travelling "signal" from the core, and rings broadcast
 *    outward from it;
 *  - reduced motion leaves every node at rest in its phased position.
 */

export type OrbitRadius = "inner" | "mid" | "outer";

export interface SolarSystemItem {
  id: string;
  label: string;
  sublabel?: string;
  /** Accent for the beam, glow and hover border. */
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

export function SolarSystem({ core, orbits, signals = true, className }: SolarSystemProps) {
  let node = 0;

  return (
    <div
      className={cn(
        "orbit-stage relative flex h-[340px] w-full items-center justify-center overflow-visible select-none sm:h-[470px] lg:h-[580px] xl:h-[640px]",
        className,
      )}
    >
      <div className="orbit-plane absolute flex items-center justify-center">
        {/* Brain waves broadcast from the core across the plane. */}
        {signals &&
          ["0s", "-1.8s", "-3.6s"].map((delay) => (
            <span
              key={delay}
              aria-hidden
              className="orbit-wave pointer-events-none absolute top-1/2 left-1/2 rounded-full border border-signal-orange/40"
              style={{ width: "calc(2 * var(--r-outer))", height: "calc(2 * var(--r-outer))", animationDelay: delay }}
            />
          ))}

        {/* Orbit rings. */}
        {orbits.map((orbit) => (
          <span
            key={orbit.id}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 rounded-full border border-dashed border-white/20"
            style={{ width: `calc(2 * ${RADIUS[orbit.radius]})`, height: `calc(2 * ${RADIUS[orbit.radius]})` }}
          />
        ))}

        {/* The core — faces the viewer. */}
        <div className="orbit-face absolute top-1/2 left-1/2 z-20">{core}</div>

        {/* Nodes. */}
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
              "orbit-card absolute top-1/2 left-1/2 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 p-1 text-white shadow-[0_6px_24px_rgb(0_0_0/0.45)] backdrop-blur-md transition-[border-color,box-shadow,scale] duration-300 hover:scale-110 hover:border-(--c) hover:shadow-[0_0_24px_var(--c)] focus-visible:scale-110 focus-visible:border-(--c) focus-visible:outline-none sm:pr-4";
            const face = (
              <>
                {item.avatar}
                <span className="hidden flex-col leading-tight sm:flex">
                  <span className="text-[12px] font-semibold whitespace-nowrap lg:text-[13px]">{item.label}</span>
                  {item.sublabel && (
                    <span className="text-[10px] whitespace-nowrap text-white/60 lg:text-[11px]">{item.sublabel}</span>
                  )}
                </span>
              </>
            );

            return (
              <div
                key={item.id}
                className="orbit-arm group/arm pointer-events-none absolute top-1/2 left-1/2 size-0"
                style={armVars}
              >
                {/* Beam from the core to this node, with its signal. */}
                <span
                  aria-hidden
                  className="absolute top-0 right-0 h-[1.5px] origin-right -translate-y-1/2 opacity-35 transition-opacity duration-300 group-has-[.orbit-card:hover]/arm:opacity-100 group-has-[.orbit-card:focus-visible]/arm:opacity-100"
                  style={{
                    width: RADIUS[orbit.radius],
                    background: `linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 0.12) 25%, ${item.color} 100%)`,
                  }}
                >
                  {signals && (
                    <span
                      className="orbit-pulse absolute top-1/2 left-0 -mt-[3px] size-1.5 rounded-full"
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
