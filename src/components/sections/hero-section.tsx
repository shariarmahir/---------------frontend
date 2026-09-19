import { Icon } from "@/components/ui/icon";
import { BangladeshBackdrop } from "./bangladesh-backdrop";
import { NAZRUL_MOTTO } from "@/data/navigation";
import { heroProofPoints } from "@/data/telemetry";
import { cn } from "@/lib/utils";

export function HeroSection() {
  // Cinematic band, matching the reference proportion: the hero is a wide
  // strip (~3.9:1) rather than a tall section, so the stats row below it
  // stays close to the fold. min-h keeps it usable when the copy needs more
  // room than the ratio allows.
  return (
    <>
      <section
        id="overview-mission"
        className="relative flex w-full items-center overflow-hidden border-b border-border bg-linear-to-b from-white via-emerald-50/30 to-white py-space-lg lg:aspect-[39/10] lg:max-h-[34rem] lg:min-h-[26rem] lg:py-0"
      >
        <BangladeshBackdrop />
        <div className="pointer-events-none absolute -top-32 left-1/4 size-96 rounded-full bg-emerald-100/40 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -right-24 size-80 rounded-full bg-orange-100/50 blur-[120px]" />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-gutter px-gutter lg:grid-cols-12">
          <div className="z-10 flex flex-col gap-space-md lg:col-span-8">
            <div className="flex w-fit max-w-full items-start gap-space-sm rounded-2xl border border-border bg-white px-space-md py-1.5 shadow-xs sm:items-center sm:rounded-full">
              <span className="mt-2 size-2.5 shrink-0 rounded-full bg-crimson shadow-[0_0_8px_rgba(218,41,28,0.4)] sm:mt-0" />
              <p className="font-display text-headline-sm font-bold tracking-wide text-signal-text">
                {NAZRUL_MOTTO}
              </p>
              <span className="hidden font-label-sm text-label-sm uppercase tracking-widest text-slate-500 sm:inline">
                KAZI NAZRUL ISLAM
              </span>
            </div>

            <h1 className="font-display text-display-mobile leading-[1.05] tracking-tight text-slate-900 sm:text-display">
              Solving Bangladesh,
              <br />
              <span className="font-extrabold text-title drop-shadow-sm">
                Pixel by Pixel.
              </span>
            </h1>

            <p className="max-w-2xl font-body-lg text-body-lg leading-relaxed text-slate-600">
              From semiconductor lithography design to sovereign bio-telemetry
              wearables and multi-dialect Bengali emergency artificial
              intelligence. Engineering sovereign national infrastructure to
              transform 180 million lives.
            </p>

            <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
              <a
                href="#swasti"
                className="inline-flex items-center gap-space-sm rounded-lg bg-title px-space-lg py-3.5 font-display text-label-md font-bold text-slate-900 shadow-md transition-all hover:scale-[1.02] hover:bg-signal active:scale-[0.98]"
              >
                <Icon name="download" className="text-[20px]" filled />
                <span>Download SWASTI App</span>
                <span className="rounded-sm bg-slate-900/15 px-space-xs py-0.5 font-code-telemetry text-label-sm font-semibold text-slate-900">
                  v2.4.1
                </span>
              </a>
              <a
                href="#rnd-innovations"
                className="inline-flex items-center gap-space-sm rounded-lg border border-border bg-white px-space-lg py-3.5 font-display text-label-md font-semibold text-slate-900 shadow-xs transition-all hover:bg-slate-50"
              >
                <Icon name="biotech" className="text-[20px] text-primary" />
                <span>Explore R&amp;D Pipeline</span>
                <Icon
                  name="arrow_forward"
                  className="text-[18px] text-primary"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band — a separate full-width strip beneath the hero, as in
          the reference, so the hero stays a clean cinematic band. */}
      <div className="w-full border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border px-gutter sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {heroProofPoints.map((point) => (
            <div
              key={point.label}
              className="flex flex-col items-center gap-0.5 px-space-sm py-space-md text-center"
            >
              <span className="font-label-sm text-label-sm tracking-wider text-slate-500 uppercase">
                {point.label}
              </span>
              <span
                className={cn(
                  "font-display text-headline-sm font-bold",
                  point.tone === "primary"
                    ? "text-primary"
                    : "text-signal-text",
                )}
              >
                {point.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
