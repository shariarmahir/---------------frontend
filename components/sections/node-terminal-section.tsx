import { Icon } from "@/components/ui/icon";
import { SignalSeam, btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/** How the drive works, in the order a problem travels. */
const STEPS = [
  { icon: "location_on", title: "Citizens register a problem", body: "A district’s pain-point, logged in the open." },
  { icon: "terminal", title: "Engineers build the fix", body: "University teams submit open-source firmware and data." },
  { icon: "precision_manufacturing", title: "Kandari-Lab backs it", body: "Hardware grants and cleanroom manufacturing access." },
];

/**
 * The console's entries. On the navy console: gold for the lead line and
 * the figure that matters, the navy tint for a second voice, white for the
 * rest.
 */
const FEED = [
  {
    tag: "Proposal",
    head: "DRUG_TRACE_RANGPUR",
    time: "2 mins ago",
    body: "New smart-packaging barcode RFID firmware uploaded to counter spurious medicine distribution in Rangpur division.",
    meta: [
      { label: "By", value: "LabFellow_Tanvir" },
      { label: "Branch", value: "v1.0.3" },
      { label: "Commits", value: "+148", strong: true },
    ],
  },
  {
    tag: "Dataset",
    head: "VISUAL_CONSCIOUSNESS",
    time: "18 mins ago",
    body: "Urban Dhaka sidewalk telemetry dataset uploaded: 120,000 labeled obstacle points for visually impaired sensory belt.",
    meta: [
      { label: "By", value: "Safia_Mubassara" },
      { label: "Size", value: "8.4 GB" },
      { label: "Status", value: "Verified", strong: true },
    ],
  },
  {
    tag: "Pilot",
    head: "BIO_ALARM · SYLHET TEA GARDENS",
    time: "42 mins ago",
    body: "Aponjon Band deployed on 250 tea plantation workers; detected 4 asymptomatic heat-stroke pre-cursors within 2 hours.",
    meta: [
      { label: "By", value: "Lead_Mahir" },
      { label: "Telemetry", value: "100% OK" },
      { label: "Alerts saved", value: "4", strong: true },
    ],
  },
];

/** The innovation drive: a full-bleed ink band, how it works on the left, the live console on the right. */
export function NodeTerminalSection() {
  return (
    <section id="innovation" className="section-band-tinted relative isolate overflow-hidden bg-text-primary text-white">
      <SignalSeam className="top-0" />

      <div className="mx-auto max-w-7xl px-gutter-x">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="story-reveal flex flex-col gap-6 lg:col-span-5">
            <h2 className="font-grotesk text-2xl font-bold tracking-tight text-balance text-signal-orange sm:text-3xl lg:text-4xl">
              The Bangladesh Innovation Drive
            </h2>
            <p className="max-w-md font-sans text-base leading-relaxed text-white/80">
              GitHub meets open democracy: the country’s problems, solved in the open, from the district that
              names them to the cleanroom that builds the answer.
            </p>

            <ol className="flex flex-col">
              {STEPS.map((s) => (
                <li key={s.title} className="group/step grid grid-cols-[auto_1fr] items-start gap-4 border-t border-white/10 py-4 last:border-b">
                  <span className="grid size-10 place-items-center rounded-xl bg-signal-orange text-text-primary transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/step:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover/step:rotate-0">
                    <Icon name={s.icon} className="text-xl" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-grotesk text-sm font-bold">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/65">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div>
              <a href="#kandari-profile" className={btn.gold}>
                Submit a National Problem
                <Icon name="send" className="text-base" />
              </a>
            </div>
          </div>

          {/* The live console: one solid navy field. */}
          <div className="story-reveal overflow-hidden rounded-3xl bg-bdnavy-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_30px_60px_-36px_rgb(0_0_0/0.9)] ring-1 ring-white/12 lg:col-span-7">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-signal-orange/70 motion-reduce:hidden" />
                <span className="relative size-2 rounded-full bg-signal-orange" />
              </span>
              <span className="font-sans tabular-nums text-xs font-semibold text-signal-orange">Live innovation stream</span>
            </div>

            <ul className="px-2 py-2 sm:px-3">
              {FEED.map((item) => (
                <li key={item.head} className="rounded-2xl px-3 py-4 transition-colors duration-300 hover:bg-white/4 sm:px-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="shrink-0 rounded-md bg-signal-orange/12 px-2 py-0.5 font-sans tabular-nums text-xs font-semibold text-signal-orange ring-1 ring-signal-orange/30">
                        {item.tag}
                      </span>
                      <span className="truncate font-sans tabular-nums text-xs font-semibold text-bdnavy-300">{item.head}</span>
                    </span>
                    <span className="shrink-0 font-sans tabular-nums text-xs text-white/65">{item.time}</span>
                  </div>

                  <p className="mt-2.5 text-sm leading-snug font-medium text-white/80">{item.body}</p>

                  <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-sans tabular-nums text-xs">
                    {item.meta.map((m) => (
                      <div key={m.label} className="flex gap-1.5">
                        <dt className="text-white/65">{m.label}</dt>
                        <dd className={cn(m.strong ? "font-semibold text-signal-orange" : "text-white/80")}>{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>

            {/* The prompt waiting for the next entry (decorative). */}
            <div aria-hidden className="flex items-center gap-2 border-t border-white/10 px-5 py-4 font-sans tabular-nums text-xs text-signal-orange sm:px-7">
              &gt;
              <span className="caret-blink inline-block h-4 w-2 rounded-md bg-signal-orange" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
