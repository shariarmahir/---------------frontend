import { Icon } from "@/components/ui/icon";
import { SectionHeading, tileLift } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/**
 * Each project is a spec-sheet row rather than another card in a grid: a
 * solid colour block (the project's "pixel"), its brief, and its headline
 * measurement set as a chip in the same colour.
 */
const LABS = [
  {
    icon: "blind",
    block: "bg-text-primary text-signal-orange",
    chip: "bg-text-primary text-white",
    badge: "[ PROJECT NETRO ]",
    title: "Eye-Consciousness AI Agent for Visually Impaired",
    description:
      "A wearable 2-meter real-time LiDAR and optical sensor array providing spatial audio mapping. Translates physical street obstacles, pedestrian movements, and Bengali road signage into low-latency haptic pulses.",
    footLabel: "LATENCY PROFILE",
    footValue: "11 MILLISECONDS",
  },
  {
    icon: "recycling",
    block: "bg-bd-green text-white",
    chip: "bg-bd-green text-white",
    badge: "[ PROJECT MATI ]",
    title: "Biochemical Circular Automation",
    description:
      "Autonomous computer vision and robotic sorting chassis that categorizes organic refuse into nitrogen-rich agricultural compost within 48 hours, while segregating valuable e-waste and industrial polymers.",
    footLabel: "SOIL RATING",
    footValue: "GRADE-A BIO SOIL",
  },
  {
    icon: "developer_board",
    block: "bg-signal-orange text-text-primary",
    chip: "bg-signal-orange text-text-primary",
    badge: "[ PROJECT SILICON ]",
    title: "Semiconductor Fabrication & 10-Crore Data Engine",
    description:
      "Pioneering native RISC-V edge chip tape-outs tailored for localized bio-telemetry. Fed by an unprecedented 100-million Bengali multimodal corpus for sovereign AI execution without reliance on foreign LLMs.",
    footLabel: "ARCH STACK",
    footValue: "RISC-V NATIVE / 28NM",
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
          <li key={lab.badge} className="story-reveal">
            <article
              className={cn(
                "group grid grid-cols-[auto_1fr] items-start gap-5 rounded-3xl bg-white p-5 ring-1 ring-text-primary/10 sm:p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8",
                tileLift,
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
                <span className="font-mono text-xs font-bold text-text-muted">{lab.badge}</span>
                <h3 className="mt-1 mb-2 font-grotesk text-lg font-bold text-text-primary uppercase">{lab.title}</h3>
                <p className="max-w-[68ch] font-sans text-sm leading-relaxed text-text-secondary">{lab.description}</p>
              </div>

              {/* Headline measurement. */}
              <div className="col-span-2 flex items-center justify-between gap-3 border-t border-text-primary/10 pt-4 font-mono text-xs md:col-span-1 md:flex-col md:items-end md:border-t-0 md:border-l md:pt-0 md:pl-8">
                <span className="text-text-muted">{lab.footLabel}</span>
                <span className={cn("rounded-lg px-2.5 py-1.5 font-bold whitespace-nowrap", lab.chip)}>{lab.footValue}</span>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
