import Image from "next/image";
import { Icon } from "@/components/ui/icon";

export function MetricsSection() {
  return (
    <section
      id="rural-network"
      className="section-band-tinted border-y border-slate-200 bg-mint-subtle/70"
    >
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Pharmacy panel. */}
          <div className="relative lg:col-span-6">
            <div className="group overflow-hidden rounded-2xl shadow-elevated">
              {/* 4:3 matches the source's 1.34 ratio, so the pharmacy
                  interior is shown essentially uncropped. */}
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src="/sections/smartpharmacy.png"
                  alt="গ্রামীণ স্মার্ট ফার্মেসিতে স্বস্তি ইউনিফর্ম পরা একজন স্বাস্থ্যকর্মী এক প্রবীণ রোগীর রক্তচাপ মাপছেন; পাশে টেলিমেডিসিন স্ক্রিনে চিকিৎসক ও তাকভর্তি ওষুধ"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  quality={90}
                  className="object-cover"
                />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/95 px-3 py-1 font-mono text-xs font-bold text-bd-green shadow-sm backdrop-blur-md">
                  <span className="size-2 animate-pulse rounded-full bg-bd-green" />
                  LIVE PILOT: MANIKGANJ UNION #3
                </div>

                {/* Capability tags the schematic used to carry. */}
                <div className="absolute right-3 bottom-3 left-3 flex flex-wrap gap-1.5 font-mono text-[9px] text-white">
                  {["DIAG KIOSK", "TELE-LINK", "COLD CHAIN", "SOLAR CELL"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded border border-white/25 bg-slate-950/70 px-2 py-0.5 whitespace-nowrap backdrop-blur-sm"
                      >
                        ◦ {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Narrative. */}
          <div className="space-y-5 lg:col-span-6">
            <h2 className="font-grotesk text-2xl font-bold tracking-tight text-text-primary uppercase sm:text-3xl lg:text-4xl">
              &lsquo;One Village, One Medical Healthcare Center&rsquo; — Rural
              Pharmacy Grid
            </h2>

            <p className="font-sans text-base leading-relaxed text-text-secondary">
              In remote upazilas, the local drug store is the de facto hospital.
              Kandari-Lab upgrades this existing community touchpoint:
              transforming traditional retail pharmacies into solar-powered,
              AI-connected diagnostic clinics equipped with Aponjon hardware,
              automated tele-consultation, and SWASTI digital records.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              <div
                className="glass-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                style={{ "--card-accent": "var(--color-signal-orange)" } as React.CSSProperties}
              >
                <div className="mb-1 flex items-center gap-2 font-grotesk text-sm font-bold text-signal-orange uppercase">
                  <Icon name="solar_power" className="text-xl" />
                  Solar Powered Grid
                </div>
                <p className="font-sans text-xs leading-relaxed text-text-muted">
                  Uninterrupted 24/7 cold-chain &amp; telemetry during rural
                  grid shedding.
                </p>
              </div>

              <div
                className="glass-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                style={{ "--card-accent": "var(--color-bd-green)" } as React.CSSProperties}
              >
                <div className="mb-1 flex items-center gap-2 font-grotesk text-sm font-bold text-bd-green uppercase">
                  <Icon name="switch_video" className="text-xl" />
                  Tele-Consultation
                </div>
                <p className="font-sans text-xs leading-relaxed text-text-muted">
                  Sub-second encrypted video connection directly to Dhaka
                  specialized doctors.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3.5 font-mono text-xs">
              <span>
                TARGET PHASE 1:{" "}
                <strong className="text-text-primary">1,200 PHARMACIES</strong>
              </span>
              <span>
                TIMELINE:{" "}
                <strong className="text-signal-orange">Q3–Q4 2025</strong>
              </span>
              <span>
                COVERAGE:{" "}
                <strong className="text-bd-green">ALL 8 DIVISIONS</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
