import { Icon } from "@/components/ui/icon";
import { PixelMark, SignalSeam, btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/** Colours are set for the ink console: light tints, never the dark brand shades. */
const FEED = [
  {
    head: "> DRUG_TRACE_RANGPUR // PROPOSAL",
    headClass: "text-signal-orange",
    time: "2 mins ago",
    body: "New smart-packaging barcode RFID firmware uploaded to counter spurious medicine distribution in Rangpur division.",
    meta: [
      { text: "By: LabFellow_Tanvir", class: "" },
      { text: "Branch: v1.0.3", class: "text-emerald-300 font-semibold" },
      { text: "+148 Commits", class: "text-signal-orange" },
    ],
  },
  {
    head: "> VISUAL_CONSCIOUSNESS // RADAR CALIBRATION",
    headClass: "text-teal-300",
    time: "18 mins ago",
    body: "Urban Dhaka sidewalk telemetry dataset uploaded: 120,000 labeled obstacle points for visually impaired sensory belt.",
    meta: [
      { text: "By: Safia_Mubassara", class: "" },
      { text: "Dataset: 8.4 GB", class: "text-emerald-300 font-semibold" },
      { text: "Status: Verified", class: "text-signal-orange font-semibold" },
    ],
  },
  {
    head: "> BIO_ALARM // SYLHET TEA-GARDEN PILOT",
    headClass: "text-red-400",
    time: "42 mins ago",
    body: "Aponjon Band deployed on 250 tea plantation workers; detected 4 asymptomatic heat-stroke pre-cursors within 2 hours.",
    meta: [
      { text: "By: Lead_Mahir", class: "" },
      { text: "Telemetry: 100% OK", class: "text-emerald-300 font-semibold" },
      { text: "Alerts Saved: 4", class: "text-red-400 font-bold" },
    ],
  },
];

const STATS = [
  { label: "VERIFIED INNOVATORS", value: "14,280+ MEMBERS", valueClass: "text-emerald-300" },
  { label: "COMMERCIALIZED HARDWARE", value: "19 PATENTS", valueClass: "text-signal-orange" },
];

/** The innovation drive — a full-bleed ink band around a live console. */
export function NodeTerminalSection() {
  return (
    <section id="innovation" className="section-band-tinted relative isolate overflow-hidden bg-text-primary text-white">
      <SignalSeam className="top-0" />

      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Narrative. */}
          <div className="story-reveal space-y-5 lg:col-span-5">
            <PixelMark tone="dark" />
            <h2 className="font-grotesk text-2xl font-bold tracking-tight text-balance uppercase sm:text-3xl lg:text-4xl">
              The Bangladesh Innovation Drive
            </h2>

            <p className="font-sans text-base leading-relaxed text-white/80">
              GitHub meets open democracy for national problem-solving. Citizens
              register district pain-points, university engineers submit
              open-source firmware, and Kandari-Lab provides venture hardware
              grants and cleanroom manufacturing access.
            </p>

            <div className="space-y-2.5 font-mono text-xs">
              {STATS.map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-white/6 p-3.5 ring-1 ring-white/10">
                  <span className="font-medium text-white/85">{s.label}</span>
                  <span className={cn("font-bold", s.valueClass)}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <a href="#kandari-profile" className={btn.gold}>
                <span>Submit a National Problem</span>
                <Icon name="send" className="text-base" />
              </a>
            </div>
          </div>

          {/* Live feed console. */}
          <div className="story-reveal overflow-hidden rounded-3xl bg-white/4 ring-1 ring-white/12 shadow-2xl lg:col-span-7">
            {/* Window bar. */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/4 px-5 py-3 font-mono text-xs sm:px-6">
              <span className="flex items-center gap-3 font-bold text-emerald-300">
                <span aria-hidden className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-national-crimson" />
                  <span className="size-2.5 rounded-full bg-signal-orange" />
                  <span className="size-2.5 rounded-full bg-bdgreen-500" />
                </span>
                <span className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 motion-reduce:hidden" />
                    <span className="relative size-2 rounded-full bg-emerald-400" />
                  </span>
                  REAL-TIME INNOVATION STREAM
                </span>
              </span>
              <span className="hidden text-white/55 sm:inline">FEED // BD-880-STREAM</span>
            </div>

            <div className="divide-y divide-white/8 px-5 font-sans text-sm sm:px-6">
              {FEED.map((item) => (
                <div key={item.head} className="flex flex-col gap-1.5 py-4 transition-colors duration-300 hover:bg-white/3">
                  <div className="flex items-center justify-between gap-3 font-mono text-xs">
                    <span className={cn("font-bold", item.headClass)}>{item.head}</span>
                    <span className="shrink-0 text-white/50">{item.time}</span>
                  </div>

                  <p className="font-medium text-white/90">{item.body}</p>

                  <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-white/55">
                    {item.meta.map((m, i) => (
                      <span key={m.text} className="flex items-center gap-3">
                        {i > 0 ? <span aria-hidden>•</span> : null}
                        <span className={m.class}>{m.text}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* The prompt waiting for the next entry (decorative). */}
              <div aria-hidden className="flex items-center gap-2 py-4 font-mono text-xs text-signal-orange">
                &gt;
                <span className="caret-blink inline-block h-4 w-2 rounded-[1px] bg-signal-orange" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
