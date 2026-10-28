import { Icon } from "@/components/ui/icon";
import { SignalSeam, btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";
import { CardIcon } from "@/components/ui/card-icon";

/** How the drive works, in the order a problem travels. */
const STEPS = [
  { icon: "location_on", lordicon: "bangladesh", title: "Citizens register a problem", body: "A district’s pain-point, logged in the open." },
  { icon: "terminal", lordicon: "browser-terminal", title: "Engineers build the fix", body: "University teams submit open-source firmware and data." },
  { icon: "precision_manufacturing", lordicon: "wrench", title: "Kandari-Lab backs it", body: "Hardware grants and cleanroom manufacturing access." },
];

/**
 * The console's entries: samples of what the stream will carry (no feed is
 * connected yet), and the console says so. On the navy console: gold for the lead line and
 * the figure that matters, the navy tint for a second voice, white for the
 * rest.
 */
const FEED = [
  {
    tag: "Proposal",
    head: "Drug trace · Rangpur",
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
    head: "Visual consciousness · Dhaka",
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
    head: "Bio-alarm · Sylhet tea gardens",
    time: "42 mins ago",
    body: "Aponjon Band deployed on 250 tea plantation workers; detected 4 asymptomatic heat-stroke pre-cursors within 2 hours.",
    meta: [
      { label: "By", value: "Lead_Mahir" },
      { label: "Telemetry", value: "100% OK" },
      { label: "Alerts saved", value: "4", strong: true },
    ],
  },
];

/** The innovation drive: a full-bleed ink band, how it works on the left, the stream console on the right. */
export function NodeTerminalSection() {
  return (
    <section id="innovation" className="section-band-tinted relative isolate overflow-hidden bg-text-primary text-white">
      <SignalSeam className="top-0" />

      <div className="mx-auto max-w-384 px-gutter-x">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="story-reveal flex flex-col gap-5 lg:col-span-5 lg:gap-6 xl:col-span-6">
            <h2 className="font-grotesk text-2xl font-bold tracking-tight text-balance text-signal-orange max-sm:text-[1.75rem] max-sm:leading-[1.15] sm:text-3xl lg:text-4xl">
              Innovation Drive
            </h2>
            <p className="max-w-md font-sans text-base leading-relaxed text-white/80">Problems named in the open, solved in the lab.</p>

            <ol className="flex flex-col">
              {STEPS.map((s) => (
                <li key={s.title} className="group/step grid grid-cols-[auto_1fr] items-start gap-3 border-t border-white/10 py-3 last:border-b lg:gap-4 lg:py-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-black/25 text-signal-orange ring-1 ring-white/12 ring-inset lg:size-12 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/step:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover/step:rotate-0">
                    <CardIcon name={s.lordicon} fallback={s.icon} size={32} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-grotesk text-sm font-bold">{s.title}</p>
                    <p className="mt-0.5 text-sm leading-snug text-white/65 lg:mt-1 lg:leading-relaxed">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div>
              {/* The section's one primary action: full width on a phone. */}
              <a href="#kandari-profile" className={cn(btn.gold, "max-sm:w-full")}>
                Submit a National Problem
                <Icon name="send" className="text-base" />
              </a>
            </div>
          </div>

          {/* The stream console: one solid navy field. */}
          <div className="story-reveal overflow-hidden rounded-3xl bg-bdnavy-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_30px_60px_-36px_rgb(0_0_0/0.9)] ring-1 ring-white/12 lg:col-span-7 xl:col-span-6">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
              <span aria-hidden className="size-2 rounded-full bg-signal-orange" />
              <span className="font-sans tabular-nums text-xs font-semibold text-signal-orange">Innovation stream</span>
              {/* Not live yet: the entries are samples, and the console says so (like the apps' "Sample screen"). */}
              <span className="ml-auto font-sans text-xs text-white/65">Sample entries</span>
            </div>

            {/* On a phone the entries are a swipe row inside the console, the
                next one peeking, so it stays one compact block; from sm they stack. */}
            <ul
              tabIndex={0}
              aria-label="Innovation stream, sample entries"
              className="px-2 py-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal-orange sm:px-3 max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-px-4 max-sm:gap-3 max-sm:overflow-x-auto max-sm:px-4 max-sm:py-4 max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden"
            >
              {FEED.map((item) => (
                <li
                  key={item.head}
                  className="rounded-2xl px-3 py-4 transition-colors duration-300 hover:bg-white/4 sm:px-4 max-sm:w-[85%] max-sm:max-w-96 max-sm:shrink-0 max-sm:snap-start max-sm:ring-1 max-sm:ring-white/12"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="shrink-0 rounded-md bg-signal-orange/12 px-2 py-0.5 font-sans tabular-nums text-xs font-semibold text-signal-orange ring-1 ring-signal-orange/30">
                        {item.tag}
                      </span>
                      <span className="truncate font-sans tabular-nums text-xs font-semibold text-bdnavy-300">{item.head}</span>
                    </span>
                    <span className="shrink-0 font-sans tabular-nums text-xs text-white/65">{item.time}</span>
                  </div>

                  <p className="mt-2.5 text-sm leading-snug font-medium text-white/80 sm:max-w-[68ch]">{item.body}</p>

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
