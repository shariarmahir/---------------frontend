import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const APONJON_FEATURES = [
  { title: "✓ BIO-IMPEDANCE", note: "Sub-dermal vascular track" },
  { title: "✓ 7-DAY BATTERY", note: "Ultra-low power Nordic SoC" },
  { title: "✓ OFFLINE AI CHIP", note: "Edge inference on device" },
  { title: "✓ IP68 RESILIENT", note: "Monsoon & dust certified" },
];

const SWASTI_BULLETS = [
  {
    lead: "Dialect-aware Bengali voice interaction:",
    rest: "Tailored specifically for rural elders & low-literacy citizens across 64 districts.",
  },
  {
    lead: "Real-time synchronization:",
    rest: "Seamlessly pairs with Aponjon hardware band and rural smart pharmacy diagnostic kiosks.",
  },
  {
    lead: "Instant digital prescription & cold-chain delivery:",
    rest: "Direct link to specialized doctors and rapid emergency ambulance dispatch.",
  },
];

const SWASTI_HIGHLIGHTS = [
  {
    title: "5-STEP RISK ANALYSIS",
    note: "Hemodynamic CNN diagnostic pass & automated triage.",
    wrap: "bg-mint-subtle border-emerald-100",
    titleClass: "text-bd-green",
    accent: "var(--color-bd-green)",
  },
  {
    title: "GOLDEN 2-HR ALERT",
    note: "Autonomous pre-stroke & cardiac anomaly detection.",
    wrap: "bg-orange-50/70 border-orange-200/80",
    titleClass: "text-signal-orange",
    accent: "var(--color-signal-orange)",
  },
  {
    title: "OFFLINE BENGALI RAG",
    note: "On-device medical guidance without cloud dependence.",
    wrap: "bg-slate-50 border-slate-200",
    titleClass: "text-text-primary",
    accent: "var(--color-slate-600)",
  },
];

export function FlagshipsSection() {
  return (
    <section
      id="flagship"
      className="section-band mx-auto max-w-7xl px-gutter-x"
    >
      <div className="mb-10 flex flex-col gap-2">
        <h2 className="font-grotesk text-2xl font-bold tracking-tight text-text-primary uppercase sm:text-3xl lg:text-4xl">
          Sovereign Healthcare Deep-Tech
        </h2>
        <p className="max-w-2xl font-sans text-base text-text-secondary">
          Designed, engineered, and clinically verified inside Bangladesh to
          eliminate diagnostic bottlenecks before emergency hospital transit.
        </p>
      </div>

      {/* Product 1 — Aponjon wearable. */}
      <div className="mb-12 grid grid-cols-1 items-center gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-elevated sm:p-8 lg:grid-cols-12 lg:p-10">
        <div className="space-y-5 lg:col-span-6">

          <h3 className="font-grotesk text-2xl font-bold text-text-primary uppercase sm:text-3xl">
            আপনজন — Aponjon Wearable AI Neuro-Device
          </h3>

          <p className="font-sans text-base leading-relaxed text-text-secondary">
            An ultra-affordable medical smart neuro-band designed specifically
            for Bangladesh. Collects continuous real-time ECG, EMG, SpO2, body
            temperature, glucose trends, and daily stress/energy scores
            calibrated to South Asian physiology.
          </p>

          <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 shadow-xs">
            <span className="block font-mono text-xs font-bold tracking-wider text-national-crimson uppercase">
              [ Protocol: The Golden Two Hours ]
            </span>
            <p className="mt-1 font-sans text-xs font-medium text-text-primary sm:text-sm">
              Autonomous risk-factor detection ensuring critical
              cardio-pulmonary patients receive urgent triage within the crucial
              two-hour window before permanent organ failure occurs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
            {APONJON_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <span className="block text-sm font-bold text-text-primary">
                  {feature.title}
                </span>
                <span className="text-text-muted">{feature.note}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <a
              href="#kandari-profile"
              className="inline-flex items-center gap-2 rounded-xl bg-bd-green-light px-5 py-2.5 font-mono text-xs font-bold text-bd-green uppercase transition-all hover:bg-bd-green hover:text-white"
            >
              <span>Read Hardware Whitepaper</span>
              <Icon name="arrow_forward" className="text-sm" />
            </a>
          </div>
        </div>

        {/* Device panel — schematic rendering of the band. */}
        <div className="lg:col-span-6">
          <div className="group relative overflow-hidden rounded-2xl shadow-md">
            {/* 4:3 matches the source's 1.34 ratio almost exactly, so the
                photograph is shown essentially uncropped. */}
            <div className="relative aspect-4/3 overflow-hidden">
              <Image
                src="/sections/device.png"
                alt="আপনজন AI নিউরো ব্যান্ড পরা এক নারীর কব্জি থেকে পালস, SpO₂ ও স্ট্রেস রিডিং ভেসে উঠছে; পেছনে হেলথকেয়ার সেন্টারে একজন চিকিৎসক"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                quality={90}
                className="object-cover"
              />

              {/* Live readout pinned over the render. */}
              <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-slate-950/80 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-emerald-200 shadow-md backdrop-blur-sm">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-300" />
                APONJON · 72 BPM
              </span>

              <span className="absolute right-3 bottom-3 flex gap-1.5 font-mono text-[9px] text-white">
                {["ECG", "SpO₂", "EMG"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-white/25 bg-slate-950/70 px-2 py-0.5 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product 2 — SWASTI super app. */}
      <div
        id="swasti-section"
        className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-elevated sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10"
      >
        <div className="flex items-center justify-center lg:col-span-5">
          <div className="group relative w-full max-w-[360px]">
            {/* 3:4 matches the source's 0.75 ratio exactly — no crop. The
                render already includes the handset and a hand, so it needs
                no drawn phone chrome or padded frame around it. */}
            <div className="relative aspect-3/4 overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/sections/mobileapp.png"
                alt="SWASTI স্বস্তি অ্যাপের হোম স্ক্রিন — হার্ট রেট ৭৪ BPM, SpO₂ ৯৮%, রক্তচাপ ১২০/৮০ ও দ্রুত অ্যাকশন বোতাম"
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                quality={90}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-7">

          <div>
            <h3 className="font-grotesk text-2xl font-bold tracking-tight text-text-primary uppercase sm:text-3xl lg:text-4xl">
              SWASTI — স্বস্তি Super App
            </h3>
            <p className="mt-1 font-grotesk text-sm font-semibold text-bd-green sm:text-base">
              স্বদেশী স্বাস্থ্য প্ল্যাটফর্ম • এআই ডায়াগনস্টিক ও টেলিমেডিসিন
              নেটওয়ার্ক
            </p>
          </div>

          <p className="font-sans text-base leading-relaxed text-text-secondary">
            The national unified health interface integrating automated risk
            factor analysis inside every citizen&apos;s profile. Features a
            built-in Voice Assistant bot with native Bengali dialect support,
            RAG-based clinical AI agents, and CNN diagnostic models accessible
            from any basic smartphone.
          </p>

          <ul className="space-y-3 font-sans text-sm text-text-secondary">
            {SWASTI_BULLETS.map((bullet) => (
              <li key={bullet.lead} className="flex items-start gap-2.5">
                <Icon
                  name="check_circle"
                  className="mt-0.5 shrink-0 text-xl text-bd-green"
                />
                <span>
                  <strong className="text-text-primary">{bullet.lead}</strong>{" "}
                  {bullet.rest}
                </span>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 gap-3 pt-2 font-mono text-xs sm:grid-cols-3">
            {SWASTI_HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className={`glass-card rounded-xl border p-3 shadow-xs ${item.wrap}`}
                style={{ "--card-accent": item.accent } as React.CSSProperties}
              >
                <span className={`mb-1 block font-bold ${item.titleClass}`}>
                  {item.title}
                </span>
                <span className="text-[11px] text-text-muted">
                  {item.note}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <a
              href="#kandari-profile"
              className="inline-flex items-center gap-2 rounded-xl bg-signal-orange px-6 py-3.5 font-grotesk text-xs font-bold text-white uppercase shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-amber-600 sm:text-sm"
            >
              <Icon name="download" className="text-lg" />
              Download SWASTI App APK / Play Store
            </a>
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 font-mono text-xs font-bold text-bd-green">
              FREE NATIONAL CITIZEN ACCESS
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
