import { Icon } from "@/components/ui/icon";

const FEED = [
  {
    head: "> DRUG_TRACE_RANGPUR // PROPOSAL",
    headClass: "text-signal-orange",
    time: "2 mins ago",
    body: "New smart-packaging barcode RFID firmware uploaded to counter spurious medicine distribution in Rangpur division.",
    meta: [
      { text: "By: LabFellow_Tanvir", class: "" },
      { text: "Branch: v1.0.3", class: "text-bd-green font-semibold" },
      { text: "+148 Commits", class: "text-signal-orange" },
    ],
  },
  {
    head: "> VISUAL_CONSCIOUSNESS // RADAR CALIBRATION",
    headClass: "text-teal-700",
    time: "18 mins ago",
    body: "Urban Dhaka sidewalk telemetry dataset uploaded: 120,000 labeled obstacle points for visually impaired sensory belt.",
    meta: [
      { text: "By: Safia_Mubassara", class: "" },
      { text: "Dataset: 8.4 GB", class: "text-bd-green font-semibold" },
      { text: "Status: Verified", class: "text-signal-orange font-semibold" },
    ],
  },
  {
    head: "> BIO_ALARM // SYLHET TEA-GARDEN PILOT",
    headClass: "text-national-crimson",
    time: "42 mins ago",
    body: "Aponjon Band deployed on 250 tea plantation workers; detected 4 asymptomatic heat-stroke pre-cursors within 2 hours.",
    meta: [
      { text: "By: Lead_Mahir", class: "" },
      { text: "Telemetry: 100% OK", class: "text-bd-green font-semibold" },
      { text: "Alerts Saved: 4", class: "text-national-crimson font-bold" },
    ],
  },
];

export function NodeTerminalSection() {
  return (
    <section
      id="innovation"
      className="border-y border-slate-200 bg-white py-section-y"
    >
      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Narrative. */}
          <div className="space-y-5 lg:col-span-5">
            <span className="inline-block rounded border border-orange-200 bg-orange-50 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-signal-orange uppercase">
              [ 07 // Democratized R&amp;D // Open source ]
            </span>

            <h2 className="font-grotesk text-2xl font-bold tracking-tight text-text-primary uppercase sm:text-3xl lg:text-4xl">
              The Bangladesh Innovation Drive
            </h2>

            <p className="font-sans text-base leading-relaxed text-text-secondary">
              GitHub meets open democracy for national problem-solving. Citizens
              register district pain-points, university engineers submit
              open-source firmware, and Kandari-Lab provides venture hardware
              grants and cleanroom manufacturing access.
            </p>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="font-medium text-text-primary">
                  VERIFIED INNOVATORS
                </span>
                <span className="font-bold text-bd-green">14,280+ MEMBERS</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="font-medium text-text-primary">
                  COMMERCIALIZED HARDWARE
                </span>
                <span className="font-bold text-signal-orange">
                  19 PATENTS
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#kandari-profile"
                className="inline-flex items-center gap-2 rounded-xl bg-signal-orange px-6 py-3.5 font-grotesk text-xs font-bold text-white uppercase shadow-glow-orange transition-all hover:bg-amber-600 sm:text-sm"
              >
                <span>Submit a National Problem</span>
                <Icon name="send" className="text-base" />
              </a>
            </div>
          </div>

          {/* Live feed console. */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated sm:p-6 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-mono text-xs">
              <span className="flex items-center gap-2 font-bold text-bd-green">
                <span className="size-2.5 animate-ping rounded-full bg-bd-green" />
                REAL-TIME INNOVATION STREAM
              </span>
              <span className="text-text-muted">FEED // BD-880-STREAM</span>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 font-sans text-sm">
              {FEED.map((item) => (
                <div key={item.head} className="flex flex-col gap-1.5 pt-3">
                  <div className="flex items-center justify-between gap-3 font-mono text-xs">
                    <span className={`font-bold ${item.headClass}`}>
                      {item.head}
                    </span>
                    <span className="shrink-0 text-text-muted">
                      {item.time}
                    </span>
                  </div>

                  <p className="font-medium text-text-primary">{item.body}</p>

                  <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-muted">
                    {item.meta.map((m, i) => (
                      <span key={m.text} className="flex items-center gap-3">
                        {i > 0 ? <span>•</span> : null}
                        <span className={m.class}>{m.text}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
