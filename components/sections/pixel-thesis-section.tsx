import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

type ArtKind = "pulse" | "network" | "radar" | "cycle";

interface Pillar {
  art: ArtKind;
  title: string;
  description: string;
  /** The product or research page that tells the whole story. */
  href: string;
  /** Solid card fill and the ink that reads on it. */
  surface: string;
  /** A gold card takes a navy button; the dark ones a gold one. */
  onGold?: boolean;
  /** Motion-graphic stroke colour, chosen to contrast with the fill. */
  artClass: string;
  /** Hover glow, a CSS colour value. */
  glow: string;
}

/**
 * Four pixels Kandari-Lab is repairing now, each a real problem matched to
 * the product or research line that answers it, linked to its own page.
 * Facts follow data/products.ts and CLAUDE.md §2; nothing here claims more
 * than the product pages do. Fields are navy, gold and ink only (Mahir,
 * 2026-10-17), no two neighbours alike; white text on navy and ink, ink on
 * gold.
 */
const PILLARS: Pillar[] = [
  {
    art: "pulse",
    title: "Early Warning Care",
    description:
      "SWASTI gives every family a doctor’s first opinion in Bangla, by voice, on any phone. Aponjon, a wearable band, watches heart rhythm, oxygen and stress, and raises the alarm while there is still time to act.",
    href: "/products/swasti",
    surface: "bg-bdnavy-900 text-white ring-1 ring-white/12",
    artClass: "text-signal-orange",
    glow: "var(--color-bdnavy-400)",
  },
  {
    art: "network",
    title: "Care in Every Village",
    description:
      "One Village, One Medical Health Care Center. The village drug shop becomes a solar-powered Smart Pharmacy with a diagnostic kiosk, verified medicine and a doctor on video.",
    href: "/products/smart-pharmacy",
    surface: "bg-signal-orange text-text-primary",
    onGold: true,
    artClass: "text-bdnavy-900",
    glow: "var(--color-signal-orange)",
  },
  {
    art: "radar",
    title: "Independent Mobility",
    description:
      "A wearable for blind and visually impaired citizens that senses obstacles up to two metres away in real time and turns them into guidance, so the wearer can move without depending on a guide.",
    href: "/research/blind-assist-wearable",
    surface: "bg-text-primary text-white ring-1 ring-white/12",
    artClass: "text-signal-orange",
    glow: "var(--color-signal-orange)",
  },
  {
    art: "cycle",
    title: "Waste Into Soil",
    description:
      "AI that separates organic waste from the rest so it can return to farmland as soil nutrient, reducing what ends up in open dumps, drains and rivers.",
    href: "/research/organic-waste-to-soil",
    surface: "bg-bdnavy-900 text-white ring-1 ring-white/12",
    artClass: "text-signal-orange",
    glow: "var(--color-bdnavy-400)",
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
          title="The Pixel-Map: Repairing Bangladesh Pixel by Pixel"
          lead="Picture Bangladesh as a high-resolution image with corrupted pixels. Each one is a real failure: a patient who reaches care too late, a village without a clinic, a citizen the system leaves behind. We take them one at a time, with hardware, software and AI built here for the people who live here. When one pixel is clear, we move to the next."
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

                <h3 className="mb-1.5 font-grotesk text-xs leading-tight font-bold sm:mb-2 sm:text-lg">
                  {pillar.title}
                </h3>

                <p className="mb-4 font-sans text-xs leading-relaxed opacity-90 sm:mb-5 sm:text-sm">
                  {pillar.description}
                </p>

                {/* Pinned to the foot, so the four buttons line up. */}
                <Link
                  href={pillar.href}
                  className={cn(pillar.onGold ? btn.navy : btn.gold, "mt-auto self-start")}
                >
                  Learn more
                  <span className="sr-only">: {pillar.title}</span>
                  <Icon name="arrow_forward" className="text-lg" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
