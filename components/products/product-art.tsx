import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * The looping motion graphic that runs behind each product hero
 * (decorative). One per product, in the same stroke language as the home
 * page's Pixel-Map cards: a heartbeat for the wearable, a voice waveform for
 * the app, a packet running a network of nodes for the village pharmacy.
 * Colour comes from `currentColor`; keyframes are the pxc-* and voice-bar
 * rules in globals.css, which rest still under reduced motion.
 */
export function ProductArt({ slug, className }: { slug: string; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: cn("pointer-events-none", className),
  };

  if (slug === "swasti") {
    return (
      <svg viewBox="0 0 600 160" {...common}>
        {Array.from({ length: 34 }, (_, i) => {
          // A bell-shaped envelope so the middle "speaks" loudest.
          const h = 30 + 100 * Math.exp(-(((i - 16.5) / 9) ** 2));
          return (
            <rect
              key={i}
              x={8 + i * 17}
              y={80 - h / 2}
              width="9"
              height={h}
              rx="4.5"
              fill="currentColor"
              stroke="none"
              className="voice-bar"
              style={{ "--i": i } as CSSProperties}
            />
          );
        })}
      </svg>
    );
  }

  if (slug === "smart-pharmacy") {
    const nodes = [
      [40, 110],
      [130, 50],
      [230, 100],
      [330, 40],
      [430, 96],
      [520, 46],
    ] as const;
    const route = nodes.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
    return (
      <svg viewBox="0 0 600 160" {...common}>
        <path d={route} strokeWidth="2" opacity="0.35" />
        <path d="M130 50 L330 40 M40 110 L230 100 M230 100 L520 46" strokeWidth="1.5" opacity="0.2" strokeDasharray="3 5" />
        <path d={route} pathLength={100} strokeWidth="4.5" className="pxc-packet" />
        {nodes.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="13" strokeWidth="1.5" opacity="0.3" />
            <circle cx={x} cy={y} r="6.5" fill="currentColor" stroke="none" className="pxc-node" style={{ "--i": i } as CSSProperties} />
          </g>
        ))}
      </svg>
    );
  }

  // Aponjon (and any future product without its own art): a heartbeat.
  return (
    <svg viewBox="0 0 600 160" {...common}>
      <path d="M0 84 H600" strokeWidth="1" opacity="0.3" />
      <path
        className="pxc-trace"
        pathLength={100}
        strokeWidth="3.5"
        d="M0 84 H150 L170 84 L186 52 L208 118 L232 16 L262 136 L286 84 H380 L398 66 L416 84 H600"
      />
      <circle cx="232" cy="16" r="5.5" fill="currentColor" stroke="none" className="pxc-node" />
    </svg>
  );
}
