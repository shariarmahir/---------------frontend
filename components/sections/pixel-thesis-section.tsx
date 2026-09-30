import type { CSSProperties } from "react";
import { SectionHeading } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

type ArtKind = "pulse" | "network" | "radar" | "cycle";

interface Pillar {
  art: ArtKind;
  title: string;
  description: string;
  /** Solid card fill and the ink that reads on it. */
  surface: string;
  /** Motion-graphic stroke colour, chosen to contrast with the fill. */
  artClass: string;
  /** Hover glow, a CSS colour value. */
  glow: string;
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
    title: "Healthcare & Biometrics",
    description:
      "Continuous vitals capture pairing SWASTI Super App with the Aponjon wearable band for early arrhythmia, diabetic spike, and pre-stroke alerts.",
    surface: "bg-bd-green text-white",
    artClass: "text-signal-orange",
    glow: "var(--color-bd-green)",
  },
  {
    art: "network",
    title: "Rural Tele-Network",
    description:
      "'One Village, One Smart Pharmacy' converting 12,000+ union-level medicine dispensaries into solar micro-diagnostic clinical endpoints.",
    surface: "bg-signal-orange text-text-primary",
    artClass: "text-bd-green",
    glow: "var(--color-signal-orange)",
  },
  {
    art: "radar",
    title: "Assistive Tech Shield",
    description:
      "2-Meter spatial consciousness wearable for visually impaired citizens leveraging ultrasonic LiDAR, haptic feedback, and Bengali spatial voice.",
    surface: "bg-bdorange-600 text-text-primary",
    artClass: "text-text-primary",
    glow: "var(--color-bdorange-600)",
  },
  {
    art: "cycle",
    title: "Circular Economy",
    description:
      "AI Waste-to-Soil transformation converting civic municipal refuse into organic agriculture manure and segregated industrial polymers.",
    // Ink on the black ground: a faint white ring keeps its edge.
    surface: "bg-text-primary text-white ring-1 ring-white/12",
    artClass: "text-bdgreen-500",
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
      "absolute inset-0 size-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-active:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100",
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

        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            // The scroll reveal lives on the <li> so its transform never
            // fights the card's own hover lift.
            <li key={pillar.title} className="story-reveal flex">
              <article
                style={{ "--glow": pillar.glow } as CSSProperties}
                className={cn(
                  "group relative flex w-full flex-col overflow-hidden rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-6",
                  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-2 active:shadow-[0_28px_48px_-22px_var(--glow)] active:scale-[0.98] active:duration-150",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  pillar.surface,
                )}
              >
                {/* Motion-graphic header. */}
                <div className="relative -mx-4 -mt-4 mb-2 h-24 sm:-mx-6 sm:-mt-6 sm:mb-4 sm:h-36">
                  <div className={cn("absolute inset-x-4 top-4 bottom-1 sm:inset-x-6 sm:top-6 sm:bottom-2", pillar.artClass)}>
                    <PillarArt kind={pillar.art} />
                  </div>
                </div>

                <h3 className="mb-1.5 font-grotesk text-[0.8rem] leading-tight font-bold uppercase sm:mb-2 sm:text-lg">
                  {pillar.title}
                </h3>

                <p className="font-sans text-xs leading-relaxed sm:text-sm">
                  {pillar.description}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
