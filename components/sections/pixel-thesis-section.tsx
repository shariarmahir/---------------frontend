import { Icon } from "@/components/ui/icon";

interface Pillar {
  badge: string;
  badgeClass: string;
  icon: string;
  iconClass: string;
  title: string;
  description: string;
  footLabel: string;
  footValue: string;
  footClass: string;
  hoverBorder: string;
  /** Only pillar 01 carries a status dot beside its value. */
  statusDot?: boolean;
}

const PILLARS: Pillar[] = [
  {
    badge: "PIXEL 01 // BIO",
    badgeClass: "bg-emerald-50 text-bd-green border-emerald-200",
    icon: "monitor_heart",
    iconClass: "text-signal-orange",
    title: "Healthcare & Biometrics",
    description:
      "Continuous vitals capture pairing SWASTI Super App with the Aponjon wearable band for early arrhythmia, diabetic spike, and pre-stroke alerts.",
    footLabel: "SYS STATUS",
    footValue: "OPERATIONAL",
    footClass: "text-bd-green",
    hoverBorder: "hover:border-bd-green/50",
    statusDot: true,
  },
  {
    badge: "PIXEL 02 // NODE",
    badgeClass: "bg-orange-50 text-signal-orange border-orange-200",
    icon: "local_pharmacy",
    iconClass: "text-bd-green",
    title: "Rural Tele-Network",
    description:
      "'One Village, One Smart Pharmacy' converting 12,000+ union-level medicine dispensaries into solar micro-diagnostic clinical endpoints.",
    footLabel: "GRID REACH",
    footValue: "64 DISTRICTS",
    footClass: "text-signal-orange",
    hoverBorder: "hover:border-signal-orange/50",
  },
  {
    badge: "PIXEL 03 // VISION",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    icon: "visibility",
    iconClass: "text-teal-600",
    title: "Assistive Tech Shield",
    description:
      "2-Meter spatial consciousness wearable for visually impaired citizens leveraging ultrasonic LiDAR, haptic feedback, and Bengali spatial voice.",
    footLabel: "DETECTION RAD",
    footValue: "2.0 METERS",
    footClass: "text-teal-700",
    hoverBorder: "hover:border-teal-500/50",
  },
  {
    badge: "PIXEL 04 // BIO-CYCLE",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: "recycling",
    iconClass: "text-emerald-700",
    title: "Circular Economy",
    description:
      "AI Waste-to-Soil transformation converting civic municipal refuse into organic agriculture manure and segregated industrial polymers.",
    footLabel: "CYCLE RATE",
    footValue: "48 HR TRANSIT",
    footClass: "text-emerald-800",
    hoverBorder: "hover:border-emerald-600/50",
  },
];

export function PixelThesisSection() {
  return (
    <section
      id="pixel-map"
      className="relative border-y border-slate-200/80 bg-white py-section-y"
    >
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="mb-12 flex max-w-3xl flex-col gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="rounded border border-orange-200 bg-orange-50 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-signal-orange uppercase">
              [ 03 // Methodology: Pixel-Map Vision ]
            </span>
            <span className="h-px w-12 bg-slate-300" />
          </div>

          <h2 className="font-grotesk text-2xl font-bold tracking-tight text-text-primary uppercase sm:text-3xl lg:text-4xl">
            The Pixel-Map Framework: Solving Bangladesh Pixel by Pixel
          </h2>

          <p className="font-sans text-base leading-relaxed text-text-secondary">
            Bangladesh has complex systemic challenges across public health,
            transport, and energy. Like a high-resolution image formed by
            individual pixels, every national problem is a discrete data
            coordinate. By engineering native silicon, sensors, and algorithms
            for each pixel, we auto-enhance the entire digital canvas of
            Bangladesh.
          </p>
        </div>

        <div className="-m-3 flex flex-wrap">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.badge}
              className="flex w-full p-3 sm:w-1/2 lg:w-1/4"
            >
              <div
                className={`group flex w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-elevated ${pillar.hoverBorder}`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`rounded border px-2 py-1 font-mono text-xs font-bold ${pillar.badgeClass}`}
                    >
                      {pillar.badge}
                    </span>
                    <Icon
                      name={pillar.icon}
                      className={`text-2xl transition-transform group-hover:scale-110 ${pillar.iconClass}`}
                    />
                  </div>

                  <h3 className="mb-2 font-grotesk text-lg font-bold text-text-primary uppercase">
                    {pillar.title}
                  </h3>

                  <p className="font-sans text-sm leading-relaxed text-text-secondary">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 font-mono text-xs">
                  <span className="text-text-muted">{pillar.footLabel}</span>
                  <span
                    className={`flex items-center gap-1 font-bold ${pillar.footClass}`}
                  >
                    {pillar.statusDot ? (
                      <span className="size-1.5 rounded-full bg-bd-green" />
                    ) : null}
                    {pillar.footValue}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
