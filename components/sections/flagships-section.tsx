import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { SectionHeading, btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

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

/** White tiles on the gold panel; the title colour names the job. */
const SWASTI_HIGHLIGHTS = [
  {
    title: "5-STEP RISK ANALYSIS",
    note: "Hemodynamic CNN diagnostic pass & automated triage.",
    titleClass: "text-bd-green",
  },
  {
    // Golden-hours content: the one place red belongs (CLAUDE.md §4.1).
    title: "GOLDEN 2-HR ALERT",
    note: "Autonomous pre-stroke & cardiac anomaly detection.",
    titleClass: "text-national-crimson",
  },
  {
    title: "OFFLINE BENGALI RAG",
    note: "On-device medical guidance without cloud dependence.",
    titleClass: "text-text-primary",
  },
];

const PANEL_LIFT =
  "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export function FlagshipsSection() {
  return (
    <section id="flagship" className="section-band mx-auto max-w-7xl px-gutter-x">
      <SectionHeading
        tone="dark"
        title="Sovereign Healthcare Deep-Tech"
        lead="Designed, engineered, and clinically verified inside Bangladesh to eliminate diagnostic bottlenecks before emergency hospital transit."
      />

      {/* Product 1 — Aponjon wearable, on an ink panel. */}
      <article
        className={cn(
          "story-reveal relative isolate mb-8 grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[2rem] bg-text-primary p-6 text-white ring-1 ring-white/12 sm:p-8 lg:grid-cols-12 lg:p-10",
        )}
      >
        {/* A heartbeat running under the copy (decorative). */}
        <svg
          aria-hidden
          viewBox="0 0 600 120"
          fill="none"
          className="pointer-events-none absolute bottom-6 left-0 -z-10 w-[70%] text-signal-orange opacity-25"
        >
          <path
            className="pxc-trace"
            pathLength={100}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 70 H180 L200 70 L215 40 L235 100 L255 12 L280 112 L300 70 H380 L395 55 L410 70 H600"
          />
        </svg>

        <div className="space-y-5 lg:col-span-6">
          <h3 className="font-grotesk text-2xl font-bold uppercase sm:text-3xl">
            আপনজন — Aponjon Wearable AI Neuro-Device
          </h3>

          <p className="font-sans text-base leading-relaxed text-white/80">
            An ultra-affordable medical smart neuro-band designed specifically
            for Bangladesh. Collects continuous real-time ECG, EMG, SpO2, body
            temperature, glucose trends, and daily stress/energy scores
            calibrated to South Asian physiology.
          </p>

          {/* The Golden Two Hours — urgency, so the brand red, solid. */}
          <div className="flex gap-3 rounded-2xl bg-national-crimson p-4 shadow-[0_14px_30px_-16px_var(--color-national-crimson)]">
            <span className="relative mt-0.5 flex size-3 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/70 motion-reduce:hidden" />
              <span className="relative size-3 rounded-full bg-white" />
            </span>
            <div>
              <span className="block font-mono text-xs font-bold tracking-wider uppercase">
                [ Protocol: The Golden Two Hours ]
              </span>
              <p className="mt-1 font-sans text-xs font-medium sm:text-sm">
                Autonomous risk-factor detection ensuring critical
                cardio-pulmonary patients receive urgent triage within the crucial
                two-hour window before permanent organ failure occurs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 font-mono text-xs">
            {APONJON_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white/6 p-3 ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/10"
              >
                <span className="block text-sm font-bold text-signal-orange">{feature.title}</span>
                <span className="text-white/65">{feature.note}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <a href="#kandari-profile" className={btn.gold}>
              <span>Read Hardware Whitepaper</span>
              <Icon name="arrow_forward" className="text-base" />
            </a>
          </div>
        </div>

        {/* Device photograph, no frame: it fills the whole right side of the
            panel (stretched to the copy's height on desktop, 4:3 on phones). */}
        <div className="lg:col-span-6 lg:self-stretch">
          <div className="group relative aspect-4/3 h-full overflow-hidden rounded-2xl shadow-tile-lift lg:aspect-auto lg:min-h-112">
            <Image
              src="/sections/device.png"
              alt="আপনজন AI নিউরো ব্যান্ড পরা এক নারীর কব্জি থেকে পালস, SpO₂ ও স্ট্রেস রিডিং ভেসে উঠছে; পেছনে হেলথকেয়ার সেন্টারে একজন চিকিৎসক"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={90}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
            />

            {/* Live readout pinned over the render. */}
            <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-text-primary/85 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-emerald-200 shadow-md backdrop-blur-sm">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-300" />
              APONJON · 72 BPM
            </span>

            <span className="absolute right-3 bottom-3 flex gap-1.5 font-mono text-[9px] text-white">
              {["ECG", "SpO₂", "EMG"].map((tag) => (
                <span key={tag} className="rounded bg-text-primary/80 px-2 py-0.5 ring-1 ring-white/25 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </span>
          </div>
        </div>
      </article>

      {/* Product 2 — SWASTI super app, on a gold panel. */}
      <article
        id="swasti-section"
        className={cn(
          "story-reveal relative isolate grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[2rem] bg-signal-orange p-6 text-text-primary shadow-[0_30px_60px_-30px_var(--color-bdorange-600)] sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10",
        )}
      >

        {/* App render, no frame: it fills the whole left side of the panel
            (stretched to the copy's height on desktop, 3:4 on phones). */}
        <div className="lg:col-span-5 lg:self-stretch">
          <div className={cn("group relative mx-auto aspect-3/4 h-full w-full max-w-90 overflow-hidden rounded-3xl shadow-tile-lift lg:aspect-auto lg:max-w-none lg:min-h-112", PANEL_LIFT, "hover:-rotate-1")}>
            <Image
              src="/sections/mobileapp.png"
              alt="SWASTI স্বস্তি অ্যাপের হোম স্ক্রিন — হার্ট রেট ৭৪ BPM, SpO₂ ৯৮%, রক্তচাপ ১২০/৮০ ও দ্রুত অ্যাকশন বোতাম"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              quality={90}
              className="object-cover"
            />
          </div>
        </div>

        <div className="space-y-5 lg:col-span-7">
          <div>
            <h3 className="font-grotesk text-2xl font-bold tracking-tight uppercase sm:text-3xl lg:text-4xl">
              SWASTI — স্বস্তি Super App
            </h3>
            {/* Dark green, not the brand green: that reads at only ~3.5:1 on gold. */}
            <p className="mt-1 font-grotesk text-sm font-semibold text-bd-green-dark sm:text-base">
              স্বদেশী স্বাস্থ্য প্ল্যাটফর্ম • এআই ডায়াগনস্টিক ও টেলিমেডিসিন
              নেটওয়ার্ক
            </p>
          </div>

          <p className="font-sans text-base leading-relaxed text-text-primary/85">
            The national unified health interface integrating automated risk
            factor analysis inside every citizen&apos;s profile. Features a
            built-in Voice Assistant bot with native Bengali dialect support,
            RAG-based clinical AI agents, and CNN diagnostic models accessible
            from any basic smartphone.
          </p>

          <ul className="space-y-3 font-sans text-sm text-text-primary/85">
            {SWASTI_BULLETS.map((bullet) => (
              <li key={bullet.lead} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-text-primary text-signal-orange">
                  <Icon name="check" className="text-[14px]" />
                </span>
                <span>
                  <strong className="text-text-primary">{bullet.lead}</strong> {bullet.rest}
                </span>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 gap-3 pt-1 font-mono text-xs sm:grid-cols-3">
            {SWASTI_HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className={cn("rounded-xl bg-white p-3 ring-1 ring-text-primary/10", PANEL_LIFT, "shadow-tile hover:shadow-tile-lift")}
              >
                <span className={cn("mb-1 block font-bold", item.titleClass)}>{item.title}</span>
                <span className="text-[11px] text-text-secondary">{item.note}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a href="#kandari-profile" className={btn.ink}>
              <Icon name="download" className="text-lg text-signal-orange" />
              Download SWASTI App APK / Play Store
            </a>
            <span className="rounded-xl bg-white px-3.5 py-2.5 font-mono text-xs font-bold text-bd-green shadow-tile">
              FREE NATIONAL CITIZEN ACCESS
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}
