import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { CardIcon } from "@/components/ui/card-icon";
import { cn } from "@/lib/utils";

/** Each card's animated icon (public/lordicon), in the landing page's one icon look. */
type ArtKind = "heart-beat" | "home" | "person-walking" | "plant-pot";

/** What shows while each animation loads. */
const FALLBACK: Record<ArtKind, string> = { "heart-beat": "monitor_heart", home: "home_health", "person-walking": "blind", "plant-pot": "compost" };

interface Pillar {
  art: ArtKind;
  title: string;
  description: string;
  /** The product or research page that tells the whole story. */
  href: string;
  /** Solid card fill and the ink that reads on it. */
  surface: string;
  /** The title's colour, when it differs from the card's text (gold on cobalt). */
  heading?: string;
  /** Motion-graphic stroke colour, chosen to contrast with the fill. */
  /** Hover glow, a CSS colour value. */
  glow: string;
}

/**
 * Four pixels Kandari-Lab is repairing now, each a real problem matched to
 * the product or research line that answers it, linked to its own page.
 * Facts follow data/products.ts and CLAUDE.md §2; nothing here claims more
 * than the product pages do. Fields are navy, cobalt and ink (Mahir,
 * 2026-10-18: cobalt replaced gold), no two neighbours alike; white text,
 * gold titles on cobalt, gold buttons.
 */
const PILLARS: Pillar[] = [
  {
    art: "heart-beat",
    title: "Early Warning Care",
    description:
      "SWASTI gives every family a doctor’s first opinion in Bangla, by voice, on any phone. Aponjon, a wearable band, watches heart rhythm, oxygen and stress, and raises the alarm while there is still time to act.",
    href: "/products/swasti",
    surface: "bg-bdnavy-900 text-white ring-1 ring-white/12",
    glow: "var(--color-bdnavy-400)",
  },
  {
    art: "home",
    title: "Care in Every Village",
    description:
      "One Village, One Medical Health Care Center. The village drug shop becomes a solar-powered Smart Pharmacy with a diagnostic kiosk, verified medicine and a doctor on video.",
    href: "/products/smart-pharmacy",
    surface: "bg-cobalt text-white ring-1 ring-white/12",
    heading: "text-signal-orange",
    glow: "var(--color-cobalt)",
  },
  {
    art: "person-walking",
    title: "Independent Mobility",
    description:
      "A wearable for blind and visually impaired citizens that senses obstacles up to two metres away in real time and turns them into guidance, so the wearer can move without depending on a guide.",
    href: "/research/blind-assist-wearable",
    surface: "bg-text-primary text-white ring-1 ring-white/12",
    glow: "var(--color-signal-orange)",
  },
  {
    art: "plant-pot",
    title: "Waste Into Soil",
    description:
      "AI that separates organic waste from the rest so it can return to farmland as soil nutrient, reducing what ends up in open dumps, drains and rivers.",
    href: "/research/organic-waste-to-soil",
    surface: "bg-bdnavy-900 text-white ring-1 ring-white/12",
    glow: "var(--color-bdnavy-400)",
  },
];

export function PixelThesisSection() {
  return (
    <section
      id="pixel-map"
      className="section-band-tinted relative"
    >
      <div className="mx-auto max-w-384 px-gutter-x">
        <SectionHeading
          tone="dark"
          // From lg the lead keeps the same reading measure as the Products lead below it.
          className="lg:[&>p]:max-w-5xl lg:[&>p]:text-pretty"
          title="The Pixel-Map"
          lead="Each broken pixel is a real failure. We fix them one by one."
        />

        {/*
          * A phone swipes through the four cards (the next one peeking at the
          * edge, the row bleeding to the screen's sides); from sm up they sit
          * two by two, and four across only from 1180px, where each card still
          * has about 16rem (a 4-up row at 1024 squeezed them). The scroll reveal lives on the
          * list, not the cards, so its transform never fights the hover lift
          * and a card waiting off to the side is never left hidden.
          */}
        <ul
          aria-label="Four pixels we are repairing"
          className={cn(
            "story-reveal no-scrollbar -mx-gutter-x -my-3 flex snap-x snap-mandatory scroll-px-gutter-x gap-3 overflow-x-auto px-gutter-x py-3",
            "sm:mx-0 sm:my-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:py-0 min-[73.75rem]:grid-cols-4",
          )}
        >
          {PILLARS.map((pillar) => (
            <li key={pillar.title} className="flex w-[82%] max-w-80 shrink-0 snap-start sm:w-auto sm:max-w-none">
              <article
                style={{ "--glow": pillar.glow } as CSSProperties}
                className={cn(
                  "group relative flex w-full flex-col overflow-hidden rounded-2xl p-5 shadow-sm sm:rounded-3xl sm:p-6",
                  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-2 active:shadow-[0_28px_48px_-22px_var(--glow)] active:scale-[0.98] active:duration-150",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  pillar.surface,
                )}
              >
                {/* The card's animated icon in its well. */}
                <span className="mb-4 grid size-20 place-items-center rounded-2xl bg-black/25 ring-1 ring-white/12 ring-inset sm:size-24">
                  <CardIcon name={pillar.art} fallback={FALLBACK[pillar.art]} size={64} />
                </span>

                <h3 className={cn("mb-2 font-grotesk text-xl leading-tight font-bold", pillar.heading)}>
                  {pillar.title}
                </h3>

                <p className="mb-5 line-clamp-4 font-sans text-sm leading-relaxed opacity-90 sm:line-clamp-none">
                  {pillar.description}
                </p>

                {/* Pinned to the foot, so the four buttons line up; compact on a phone. */}
                <Link
                  href={pillar.href}
                  className={cn(btn.gold, "mt-auto min-h-11 self-start px-5 py-2.5 whitespace-nowrap sm:min-h-12 sm:px-6 sm:py-3")}
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
