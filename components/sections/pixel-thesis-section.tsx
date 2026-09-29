import type { CSSProperties } from "react";
import { SectionHeading } from "@/components/ui/section-kit";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type ArtKind = "pulse" | "network" | "radar" | "cycle";

interface Pillar {
  art: ArtKind;
  icon: string;
  title: string;
  description: string;
  footLabel: string;
  footValue: string;
  /** Solid card fill and the ink that reads on it. */
  surface: string;
  /** Motion-graphic stroke colour, chosen to contrast with the fill. */
  artClass: string;
  /** Icon tile: its own fill plus the glyph colour. */
  iconTile: string;
  /** Hover glow, a CSS colour value. */
  glow: string;
  /** Only the flagship pillar carries a live status dot. */
  live?: boolean;
}

/**
 * Four solid cards, one brand colour each, like a row of album covers.
 * Every fill comes from the palette in globals.css; the ink on each was
 * picked for contrast (white on green and ink, near-black on gold and
 * orange — white on either would fall under 4.5:1).
 */
const PILLARS: Pillar[] = [
  {
    art: "pulse",
    icon: "monitor_heart",
    title: "Healthcare & Biometrics",
    description:
      "Continuous vitals capture pairing SWASTI Super App with the Aponjon wearable band for early arrhythmia, diabetic spike, and pre-stroke alerts.",
    footLabel: "SYS STATUS",
    footValue: "OPERATIONAL",
    surface: "bg-bd-green text-white",
    artClass: "text-signal-orange",
    iconTile: "bg-signal-orange text-text-primary",
    glow: "var(--color-bd-green)",
    live: true,
  },
  {
    art: "network",
    icon: "local_pharmacy",
    title: "Rural Tele-Network",
    description:
      "'One Village, One Smart Pharmacy' converting 12,000+ union-level medicine dispensaries into solar micro-diagnostic clinical endpoints.",
    footLabel: "GRID REACH",
    footValue: "64 DISTRICTS",
    surface: "bg-signal-orange text-text-primary",
    artClass: "text-bd-green",
    iconTile: "bg-bd-green text-white",
    glow: "var(--color-signal-orange)",
  },
  {
    art: "radar",
    icon: "visibility",
    title: "Assistive Tech Shield",
    description:
      "2-Meter spatial consciousness wearable for visually impaired citizens leveraging ultrasonic LiDAR, haptic feedback, and Bengali spatial voice.",
    footLabel: "DETECTION RAD",
    footValue: "2.0 METERS",
    surface: "bg-bdorange-600 text-text-primary",
    artClass: "text-text-primary",
    iconTile: "bg-text-primary text-signal-orange",
    glow: "var(--color-bdorange-600)",
  },
  {
    art: "cycle",
    icon: "recycling",
    title: "Circular Economy",
    description:
      "AI Waste-to-Soil transformation converting civic municipal refuse into organic agriculture manure and segregated industrial polymers.",
    footLabel: "CYCLE RATE",
    footValue: "48 HR TRANSIT",
    // Ink on the black ground: a faint white ring keeps its edge.
    surface: "bg-text-primary text-white ring-1 ring-white/12",
    artClass: "text-bdgreen-500",
    iconTile: "bg-bdgreen-500 text-text-primary",
    glow: "var(--color-bdgreen-500)",
  },
];

/** The looping illustration at the top of each card (decorative). */
function PillarArt({ kind }: { kind: ArtKind }) {
  const common = {
    viewBox: "0 0 240 120",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className:
      "absolute inset-0 size-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
  };

  if (kind === "pulse") {
    return (
      <svg {...common}>
        <path d="M0 64 H240" strokeWidth="1" opacity="0.3" />
        <path
          className="pxc-trace"
          pathLength={100}
          strokeWidth="3.5"
          d="M0 64 H62 L72 64 L80 44 L90 86 L100 18 L112 104 L122 64 H150 L160 52 L170 64 H240"
        />
        <circle cx="100" cy="18" r="5" fill="currentColor" stroke="none" className="pxc-node" />
      </svg>
    );
  }

  if (kind === "network") {
    const nodes = [
      [36, 76],
      [88, 36],
      [132, 84],
      [184, 42],
      [214, 92],
    ] as const;
    const route = "M36 76 L88 36 L132 84 L184 42 L214 92";
    return (
      <svg {...common}>
        <path d={route} strokeWidth="2" opacity="0.35" />
        <path d="M88 36 L184 42 M36 76 L132 84" strokeWidth="1.5" opacity="0.2" strokeDasharray="3 5" />
        <path d={route} pathLength={100} strokeWidth="4" className="pxc-packet" />
        {nodes.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="11" strokeWidth="1.5" opacity="0.3" />
            <circle
              cx={x}
              cy={y}
              r="5.5"
              fill="currentColor"
              stroke="none"
              className="pxc-node"
              style={{ "--i": i } as CSSProperties}
            />
          </g>
        ))}
      </svg>
    );
  }

  if (kind === "radar") {
    return (
      <svg {...common}>
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="120"
            cy="60"
            r="56"
            strokeWidth="2"
            className="pxc-ring"
            style={{ "--i": i } as CSSProperties}
          />
        ))}
        <circle cx="120" cy="60" r="28" strokeWidth="1" opacity="0.35" />
        <g className="pxc-sweep">
          <path d="M120 60 L120 4 A56 56 0 0 1 168 32 Z" fill="currentColor" stroke="none" opacity="0.18" />
          <path d="M120 60 L120 4" strokeWidth="2.5" />
        </g>
        <circle cx="120" cy="60" r="6" fill="currentColor" stroke="none" />
        <circle cx="158" cy="78" r="3.5" fill="currentColor" stroke="none" className="pxc-node" />
        <circle cx="86" cy="36" r="3.5" fill="currentColor" stroke="none" className="pxc-node" style={{ "--i": 2 } as CSSProperties} />
      </svg>
    );
  }

  // cycle: three chasing arcs over a strip of "soil" pixels.
  return (
    <svg {...common}>
      <g className="pxc-orbit" strokeWidth="4">
        <path d="M120 16 A40 40 0 0 1 154.6 76" />
        <path d="M149.6 84 A40 40 0 0 1 90.4 84" />
        <path d="M85.4 76 A40 40 0 0 1 114 16.4" />
        <path d="M154.6 76 l6-10 M154.6 76 l-11.4-2" />
        <path d="M90.4 84 l-11.6 1.4 M90.4 84 l-4-10.8" />
        <path d="M114 16.4 l7.4-8.8 M114 16.4 l7.6 9" />
      </g>
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={42 + i * 13.5}
          y={108}
          width="9"
          height="9"
          rx="1.5"
          fill="currentColor"
          stroke="none"
          className="pxc-pixel"
          style={{ "--i": i } as CSSProperties}
        />
      ))}
    </svg>
  );
}

export function PixelThesisSection() {
  return (
    <section
      id="pixel-map"
      className="section-band-tinted relative"
    >
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          tone="dark"
          title="The Pixel-Map Framework: Solving Bangladesh Pixel by Pixel"
          lead="Bangladesh has complex systemic challenges across public health, transport, and energy. Like a high-resolution image formed by individual pixels, every national problem is a discrete data coordinate. By engineering native silicon, sensors, and algorithms for each pixel, we auto-enhance the entire digital canvas of Bangladesh."
        />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            // The scroll reveal lives on the <li> so its transform never
            // fights the card's own hover lift.
            <li key={pillar.title} className="story-reveal flex">
              <article
                style={{ "--glow": pillar.glow } as CSSProperties}
                className={cn(
                  "group relative flex w-full flex-col overflow-hidden rounded-3xl p-6 shadow-sm",
                  "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)]",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  pillar.surface,
                )}
              >
                {/* Motion-graphic header. */}
                <div className="relative -mx-6 -mt-6 mb-6 h-40">
                  <div className={cn("absolute inset-x-6 top-6 bottom-10", pillar.artClass)}>
                    <PillarArt kind={pillar.art} />
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-3 left-6 grid size-14 place-items-center rounded-2xl shadow-lg ring-4 ring-current/10",
                      "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 group-hover:scale-110",
                      "motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100",
                      pillar.iconTile,
                    )}
                  >
                    <Icon name={pillar.icon} className="text-[28px]" />
                  </span>
                </div>

                <h3 className="mt-4 mb-2 font-grotesk text-lg font-bold uppercase">
                  {pillar.title}
                </h3>

                <p className="mb-6 font-sans text-sm leading-relaxed">
                  {pillar.description}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-current/20 pt-4 font-mono text-xs">
                  <span className="font-medium">{pillar.footLabel}</span>
                  <span className="flex items-center gap-1.5 font-bold">
                    {pillar.live ? (
                      <span className="relative flex size-2">
                        <span className="absolute inset-0 animate-ping rounded-full bg-signal-orange motion-reduce:hidden" />
                        <span className="relative size-2 rounded-full bg-signal-orange" />
                      </span>
                    ) : null}
                    {pillar.footValue}
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
