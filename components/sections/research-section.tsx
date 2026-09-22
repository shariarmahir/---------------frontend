import { Icon } from "@/components/ui/icon";

const LABS = [
  {
    icon: "blind",
    iconClass: "text-teal-600",
    badge: "[ PROJECT NETRO ]",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    title: "Eye-Consciousness AI Agent for Visually Impaired",
    description:
      "A wearable 2-meter real-time LiDAR and optical sensor array providing spatial audio mapping. Translates physical street obstacles, pedestrian movements, and Bengali road signage into low-latency haptic pulses.",
    footLabel: "LATENCY PROFILE",
    footValue: "11 MILLISECONDS",
    footClass: "text-teal-700",
    hoverBorder: "hover:border-teal-500",
  },
  {
    icon: "recycling",
    iconClass: "text-bd-green",
    badge: "[ PROJECT MATI ]",
    badgeClass: "bg-emerald-50 text-bd-green border-emerald-200",
    title: "Biochemical Circular Automation",
    description:
      "Autonomous computer vision and robotic sorting chassis that categorizes organic refuse into nitrogen-rich agricultural compost within 48 hours, while segregating valuable e-waste and industrial polymers.",
    footLabel: "SOIL RATING",
    footValue: "GRADE-A BIO SOIL",
    footClass: "text-bd-green",
    hoverBorder: "hover:border-bd-green",
  },
  {
    icon: "developer_board",
    iconClass: "text-signal-orange",
    badge: "[ PROJECT SILICON ]",
    badgeClass: "bg-orange-50 text-signal-orange border-orange-200",
    title: "Semiconductor Fabrication & 10-Crore Data Engine",
    description:
      "Pioneering native RISC-V edge chip tape-outs tailored for localized bio-telemetry. Fed by an unprecedented 100-million Bengali multimodal corpus for sovereign AI execution without reliance on foreign LLMs.",
    footLabel: "ARCH STACK",
    footValue: "RISC-V NATIVE / 28NM",
    footClass: "text-signal-orange",
    hoverBorder: "hover:border-signal-orange",
  },
];

export function ResearchSection() {
  return (
    <section
      id="rd-labs"
      className="section-band mx-auto max-w-7xl px-gutter-x"
    >
      <div className="mb-10 flex flex-col gap-2">
        <span className="w-fit rounded border border-orange-200 bg-orange-50 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-signal-orange uppercase">
          [ 06 // Kandari autonomous lab division ]
        </span>
        <h2 className="font-grotesk text-2xl font-bold tracking-tight text-text-primary uppercase sm:text-3xl lg:text-4xl">
          Advanced R&amp;D Cleanroom Initiatives
        </h2>
        <p className="max-w-2xl font-sans text-base text-text-secondary">
          Engineering deep-tech intellectual property at the intersection of
          microchip silicon, sensory edge robotics, and circular biochemical
          automation.
        </p>
      </div>

      <div className="-m-3 flex flex-wrap">
        {LABS.map((lab) => (
          <div key={lab.badge} className="flex w-full p-3 md:w-1/3">
            <div
              className={`group flex w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-elevated ${lab.hoverBorder}`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <Icon
                    name={lab.icon}
                    className={`text-3xl ${lab.iconClass}`}
                  />
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-xs font-bold ${lab.badgeClass}`}
                  >
                    {lab.badge}
                  </span>
                </div>

                <h3 className="mb-2 font-grotesk text-lg font-bold text-text-primary uppercase">
                  {lab.title}
                </h3>

                <p className="font-sans text-sm leading-relaxed text-text-secondary">
                  {lab.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 font-mono text-xs">
                <span className="text-text-muted">{lab.footLabel}</span>
                <span className={`font-bold ${lab.footClass}`}>
                  {lab.footValue}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
