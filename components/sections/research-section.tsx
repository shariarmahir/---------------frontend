import Link from "next/link";
import type { CSSProperties } from "react";
import { AccessRequestButton } from "@/components/research/access-request";
import { TrackLink } from "@/components/showcase/showcase";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";
import { CardIcon } from "@/components/ui/card-icon";

/**
 * Each project is a spec-sheet row rather than another card in a grid, on the
 * same solid colour fields as the Pixel-Map cards (navy for vision, ink
 * for the circular economy, cobalt for silicon). White text throughout,
 * the title gold on cobalt; the icon tile takes the contrasting colour. Each row ends
 * in its access button: request to read the research, wait for approval,
 * then read it (`href`).
 */
const LABS = [
  {
    id: "eye-agent",
    href: "/research/blind-assist-wearable",
    icon: "blind",
    lordicon: "person-walking",
    surface: "bg-bdnavy-900 text-white ring-1 ring-white/12",
    block: "bg-black/25 text-signal-orange ring-1 ring-white/12 ring-inset",
    glow: "var(--color-bdnavy-400)",
    title: "Eye-Consciousness AI Agent for Visually Impaired",
    description:
      "A wearable 2-meter real-time LiDAR and optical sensor array providing spatial audio mapping. Translates physical street obstacles, pedestrian movements, and Bengali road signage into low-latency haptic pulses.",
  },
  {
    id: "circular",
    href: "/research/organic-waste-to-soil",
    icon: "recycling",
    lordicon: "recycling",
    surface: "bg-text-primary text-white ring-1 ring-white/12",
    block: "bg-black/25 text-signal-orange ring-1 ring-white/12 ring-inset",
    glow: "var(--color-signal-orange)",
    title: "Biochemical Circular Automation",
    description:
      "Autonomous computer vision and robotic sorting chassis that categorizes organic refuse into nitrogen-rich agricultural compost within 48 hours, while segregating valuable e-waste and industrial polymers.",
  },
  {
    id: "silicon",
    // No paper of its own yet: approval opens the research library.
    href: "/research",
    icon: "developer_board",
    lordicon: "server",
    surface: "bg-cobalt text-white ring-1 ring-white/12",
    block: "bg-black/25 text-signal-orange ring-1 ring-white/12 ring-inset",
    heading: "text-signal-orange",
    glow: "var(--color-cobalt)",
    title: "Semiconductor Fabrication & 10-Crore Data Engine",
    description:
      "Pioneering native RISC-V edge chip tape-outs tailored for localized bio-telemetry. Fed by an unprecedented 100-million Bengali multimodal corpus for sovereign AI execution without reliance on foreign LLMs.",
  },
];

export function ResearchSection() {
  return (
    <section id="rd-labs" className="section-band mx-auto max-w-384 px-gutter-x">
      {/* From sm the way to the whole library sits level with the title (under the lead on a tablet). */}
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 sm:mb-10 sm:gap-x-12">
        <SectionHeading
          tone="dark"
          className="mb-0 sm:mb-0"
          title={<>R&amp;D Cleanroom</>}
          lead="Silicon, sensing and circular automation, in research."
        />
        <div className="story-reveal">
          <TrackLink href="/research">Research library</TrackLink>
        </div>
      </div>

      {/* On a phone the three projects are a swipeable row bled to the screen
          edges, the next card peeking; from sm, stacked spec-sheet rows: the
          button under the text on a tablet, at the row's end from lg, and from
          an 80rem row the title and paragraph in columns of their own. */}
      <ol
        aria-label="R&D projects"
        className="flex flex-col gap-4 max-sm:-mx-gutter-x max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-px-gutter-x max-sm:flex-row max-sm:gap-3 max-sm:overflow-x-auto max-sm:px-gutter-x max-sm:pt-2 max-sm:pb-6 max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden sm:@container"
      >
        {LABS.map((lab) => (
          <li key={lab.id} className="story-reveal max-sm:flex max-sm:w-[82%] max-sm:max-w-88 max-sm:shrink-0 max-sm:snap-start">
            <article
              style={{ "--glow": lab.glow } as CSSProperties}
              className={cn(
                // A compact card in the phone swipe; a spec-sheet row from sm.
                "group flex w-full flex-col items-start gap-4 rounded-3xl p-5 shadow-sm",
                "sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-6 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-8",
                "@min-[80rem]:grid-cols-[auto_minmax(13rem,22rem)_minmax(0,1fr)_auto] @min-[80rem]:gap-x-10",
                "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-1.5 active:shadow-[0_28px_48px_-22px_var(--glow)] active:scale-[0.98] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                lab.surface,
              )}
            >
              {/* The project's pixel: a solid block with a slow orbit. */}
              <span
                className={cn(
                  "relative grid size-12 shrink-0 place-items-center rounded-xl sm:size-16 sm:rounded-2xl lg:size-20",
                  "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                  lab.block,
                )}
              >
                <span
                  aria-hidden
                  className="absolute inset-2 animate-[spin_14s_linear_infinite] rounded-full border border-dashed border-current opacity-40 motion-reduce:animate-none"
                />
                <CardIcon name={lab.lordicon} fallback={lab.icon} size={44} />
              </span>

              <div className="min-w-0 @min-[80rem]:contents">
                <h3 className={cn("mb-2 font-grotesk text-xl font-bold @min-[80rem]:mb-0 @min-[80rem]:text-balance", "heading" in lab && lab.heading)}>
                  {lab.title}
                </h3>
                <p className="max-w-[68ch] font-sans text-sm leading-relaxed max-sm:line-clamp-4">{lab.description}</p>
              </div>

              <div className="mt-auto sm:col-start-2 sm:mt-0 lg:col-start-auto">
                <AccessRequestButton
                  project={lab.id}
                  title={lab.title}
                  href={lab.href}
                  className="max-lg:min-h-11 max-lg:px-4 max-lg:whitespace-nowrap"
                />
              </div>
            </article>
          </li>
        ))}
      </ol>

      {/* The way onward on a phone, where the rows have become a swipe (from sm it sits by the title). */}
      <Link
        href="/research"
        className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-md font-grotesk text-sm font-bold text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:hidden"
      >
        Explore the research library
        <Icon name="arrow_forward" className="text-lg!" />
      </Link>
    </section>
  );
}
