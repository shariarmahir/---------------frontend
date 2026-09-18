import { Icon } from "@/components/ui/icon";
import { RadarLattice } from "./radar-lattice";
import { NAZRUL_MOTTO } from "@/data/navigation";
import { heroProofPoints } from "@/data/telemetry";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section
      id="overview-mission"
      className="relative flex w-full items-center overflow-hidden border-b border-border bg-slate-50/50 py-space-xl lg:aspect-[16/6] lg:py-0"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="pointer-events-none absolute -top-32 left-1/4 size-96 rounded-full bg-emerald-100/50 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-24 size-80 rounded-full bg-orange-100/60 blur-[120px]" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-gutter px-gutter lg:grid-cols-12">
        <div className="z-10 flex flex-col gap-space-md lg:col-span-7">
          <div className="flex w-fit max-w-full items-start gap-space-sm rounded-2xl border border-border bg-white px-space-md py-1.5 shadow-xs sm:items-center sm:rounded-full">
            <span className="mt-2 size-2.5 shrink-0 rounded-full bg-crimson shadow-[0_0_8px_rgba(218,41,28,0.4)] sm:mt-0" />
            <p className="font-display text-headline-sm font-bold tracking-wide text-signal">
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
              className="inline-flex items-center gap-space-sm rounded-lg bg-title px-space-lg py-3.5 font-display text-label-md font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-signal active:scale-[0.98]"
            >
              <Icon name="download" className="text-[20px]" filled />
              <span>Download SWASTI App</span>
              <span className="rounded-sm bg-white/20 px-space-xs py-0.5 font-code-telemetry text-label-sm font-semibold text-white">
                v2.4.1
              </span>
            </a>
            <a
              href="#rnd-innovations"
              className="inline-flex items-center gap-space-sm rounded-lg border border-border bg-white px-space-lg py-3.5 font-display text-label-md font-semibold text-slate-800 shadow-xs transition-all hover:bg-slate-50"
            >
              <Icon name="biotech" className="text-[20px] text-primary" />
              <span>Explore R&amp;D Pipeline</span>
              <Icon name="arrow_forward" className="text-[18px] text-primary" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-space-sm pt-space-md sm:grid-cols-3">
            {heroProofPoints.map((point) => (
              <div
                key={point.label}
                className="rounded-lg border border-border bg-white p-space-sm shadow-xs"
              >
                <span className="block font-label-sm text-label-sm uppercase text-slate-500">
                  {point.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block font-display text-headline-sm font-bold",
                    point.tone === "primary" ? "text-primary" : "text-signal",
                  )}
                >
                  {point.value}
                </span>
                <span className="block font-body-sm text-body-sm text-slate-600">
                  {point.caption}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:col-span-5">
          <RadarLattice />
        </div>
      </div>
    </section>
  );
}
