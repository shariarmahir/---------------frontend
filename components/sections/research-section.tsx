import type { CSSProperties } from "react";
import { AccessRequestButton } from "@/components/research/access-request";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

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
    surface: "bg-bdnavy-900 text-white ring-1 ring-white/12",
    block: "bg-signal-orange text-text-primary",
    glow: "var(--color-bdnavy-400)",
    title: "Eye-Consciousness AI Agent for Visually Impaired",
    description:
      "A wearable 2-meter real-time LiDAR and optical sensor array providing spatial audio mapping. Translates physical street obstacles, pedestrian movements, and Bengali road signage into low-latency haptic pulses.",
  },
  {
    id: "circular",
    href: "/research/organic-waste-to-soil",
    icon: "recycling",
    surface: "bg-text-primary text-white ring-1 ring-white/12",
    block: "bg-signal-orange text-text-primary",
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
    surface: "bg-cobalt text-white ring-1 ring-white/12",
    block: "bg-signal-orange text-text-primary",
    heading: "text-signal-orange",
    glow: "var(--color-cobalt)",
    title: "Semiconductor Fabrication & 10-Crore Data Engine",
    description:
      "Pioneering native RISC-V edge chip tape-outs tailored for localized bio-telemetry. Fed by an unprecedented 100-million Bengali multimodal corpus for sovereign AI execution without reliance on foreign LLMs.",
  },
];

export function ResearchSection() {
  return (
    <section id="rd-labs" className="section-band mx-auto max-w-7xl px-gutter-x">
      <SectionHeading
        tone="dark"
        title={<>Advanced R&amp;D Cleanroom Initiatives</>}
        lead="Engineering deep-tech intellectual property at the intersection of microchip silicon, sensory edge robotics, and circular biochemical automation."
      />

      <ol className="flex flex-col gap-4">
        {LABS.map((lab) => (
          <li key={lab.id} className="story-reveal">
            <article
              style={{ "--glow": lab.glow } as CSSProperties}
              className={cn(
                "group grid grid-cols-[auto_1fr] items-start gap-5 md:grid-cols-[auto_1fr_auto] rounded-3xl p-5 shadow-sm sm:p-6 md:items-center md:gap-8",
                "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-1.5 active:shadow-[0_28px_48px_-22px_var(--glow)] active:scale-[0.98] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                lab.surface,
              )}
            >
              {/* The project's pixel: a solid block with a slow orbit. */}
              <span
                className={cn(
                  "relative grid size-16 shrink-0 place-items-center rounded-2xl sm:size-20",
                  "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                  lab.block,
                )}
              >
                <span
                  aria-hidden
                  className="absolute inset-2 animate-[spin_14s_linear_infinite] rounded-full border border-dashed border-current opacity-40 motion-reduce:animate-none"
                />
                <Icon name={lab.icon} className="text-3xl sm:text-4xl" />
              </span>

              <div className="min-w-0">
                <h3 className={cn("mb-2 font-grotesk text-lg font-bold", "heading" in lab && lab.heading)}>{lab.title}</h3>
                <p className="max-w-[68ch] font-sans text-sm leading-relaxed">{lab.description}</p>
              </div>

              <div className="col-start-2 md:col-start-auto">
                <AccessRequestButton project={lab.id} title={lab.title} href={lab.href} />
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
