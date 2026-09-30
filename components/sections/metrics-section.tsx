import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { PixelMark, SignalSeam, tileLift } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

const CAPABILITIES = [
  {
    icon: "solar_power",
    tile: "bg-signal-orange text-text-primary",
    title: "Solar Powered Grid",
    note: "Uninterrupted 24/7 cold-chain & telemetry during rural grid shedding.",
  },
  {
    icon: "switch_video",
    tile: "bg-bd-green text-white",
    title: "Tele-Consultation",
    note: "Sub-second encrypted video connection directly to Dhaka specialized doctors.",
  },
];

/**
 * The rural pharmacy grid — a full-bleed bottle-green band, the page's one
 * drenched green field, with white tiles carrying the detail.
 */
export function MetricsSection() {
  return (
    <section id="rural-network" className="section-band-tinted relative isolate overflow-hidden bg-bd-green text-white">
      <SignalSeam className="top-0" />

      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Pharmacy photograph, no frame: it fills the whole left side
              (stretched to the copy's height on desktop, 4:3 on phones). */}
          <div className="story-reveal relative lg:col-span-6 lg:self-stretch">
            <div className="group relative aspect-4/3 h-full overflow-hidden rounded-3xl shadow-[0_30px_60px_-28px_var(--color-text-primary)] lg:aspect-auto lg:min-h-112">
              <Image
                src="/sections/smartpharmacy.png"
                alt="গ্রামীণ স্মার্ট ফার্মেসিতে স্বস্তি ইউনিফর্ম পরা একজন স্বাস্থ্যকর্মী এক প্রবীণ রোগীর রক্তচাপ মাপছেন; পাশে টেলিমেডিসিন স্ক্রিনে চিকিৎসক ও তাকভর্তি ওষুধ"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                quality={90}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
              />

              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-mono text-xs font-bold text-bd-green shadow-tile">
                <span className="size-2 animate-pulse rounded-full bg-bd-green" />
                LIVE PILOT: MANIKGANJ UNION #3
              </div>

              {/* Capability tags the schematic used to carry. */}
              <div className="absolute right-3 bottom-3 left-3 flex flex-wrap gap-1.5 font-mono text-[9px] text-white">
                {["DIAG KIOSK", "TELE-LINK", "COLD CHAIN", "SOLAR CELL"].map((tag) => (
                  <span key={tag} className="rounded bg-text-primary/80 px-2 py-0.5 whitespace-nowrap ring-1 ring-white/25 backdrop-blur-sm">
                    ◦ {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Narrative. */}
          <div className="story-reveal space-y-5 lg:col-span-6">
            <PixelMark tone="dark" />
            <h2 className="font-grotesk text-2xl font-bold tracking-tight text-balance text-signal-orange uppercase sm:text-3xl lg:text-4xl">
              &lsquo;One Village, One Medical Healthcare Center&rsquo; — Rural
              Pharmacy Grid
            </h2>

            <p className="font-sans text-base leading-relaxed text-white/85">
              In remote upazilas, the local drug store is the de facto hospital.
              Kandari-Lab upgrades this existing community touchpoint:
              transforming traditional retail pharmacies into solar-powered,
              AI-connected diagnostic clinics equipped with Aponjon hardware,
              automated tele-consultation, and SWASTI digital records.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              {CAPABILITIES.map((c) => (
                <div key={c.title} className={cn("group rounded-2xl bg-white p-4 text-text-primary", tileLift)}>
                  <div className="mb-2 flex items-center gap-2.5 font-grotesk text-sm font-bold uppercase">
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0",
                        c.tile,
                      )}
                    >
                      <Icon name={c.icon} className="text-xl" />
                    </span>
                    {c.title}
                  </div>
                  <p className="font-sans text-xs leading-relaxed text-text-secondary">{c.note}</p>
                </div>
              ))}
            </div>

            {/* Phase readout on an ink strip, values in the page's signal colours. */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-text-primary px-4 py-3 font-mono text-xs text-white/70 shadow-ink">
              <span>
                TARGET PHASE 1: <strong className="text-white">1,200 PHARMACIES</strong>
              </span>
              <span>
                TIMELINE: <strong className="text-signal-orange">Q3–Q4 2025</strong>
              </span>
              <span>
                COVERAGE: <strong className="text-emerald-300">ALL 8 DIVISIONS</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
