import { Icon } from "@/components/ui/icon";
import { pixelThesis } from "@/data/pixels";

export function PixelThesisSection() {
  return (
    <section
      id="pixel-thesis"
      className="w-full border-b border-border bg-white py-space-xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-space-lg px-gutter">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold tracking-wider text-primary">
              <Icon name="grid_4x4" className="text-[16px]" />
              <span>Foundational Architectural Philosophy</span>
            </div>
            <h2 className="font-display text-headline-lg-mobile tracking-tight text-slate-900 sm:text-headline-lg">
              The Pixel-by-Pixel Thesis
            </h2>
            <p className="font-body-md text-body-md leading-relaxed text-slate-600">
              Macro-scale national paralysis cannot be rectified with
              superficial apps. We disaggregate every systemic bottleneck into a
              computational unit—a discrete &ldquo;Pixel&rdquo;—and apply deep
              physics, custom silicon, and local intelligence.
            </p>
          </div>
          <div className="flex items-center gap-space-xs rounded-lg border border-border bg-muted px-space-md py-space-xs font-code-telemetry text-code-telemetry text-slate-900 shadow-xs">
            <span className="size-2 rounded-full bg-title" />
            <span className="font-semibold">4 Critical Sub-Pixels Engaged</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {pixelThesis.map((pixel) => (
            <article
              key={pixel.code}
              className="flex flex-col justify-between rounded-2xl border border-border bg-slate-50/70 p-space-md shadow-xs transition-all hover:border-emerald-300 hover:bg-emerald-50/30"
            >
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-code-telemetry text-label-sm font-bold text-primary">
                    {pixel.code}
                  </span>
                  <Icon name={pixel.icon} className="text-[24px] text-title" />
                </div>
                <h3 className="font-display text-headline-sm font-bold text-slate-900">
                  {pixel.title}
                </h3>
                <p className="font-body-sm text-body-sm text-slate-600">
                  {pixel.problem}
                </p>
              </div>
              <div className="mt-space-md flex flex-col gap-space-xs rounded-lg border border-border bg-white p-space-sm pt-space-sm">
                <span className="font-label-sm text-label-sm font-bold text-signal-text">
                  KANDARI RESOLUTION
                </span>
                <span className="font-body-sm text-body-sm font-medium text-slate-900">
                  {pixel.resolution}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
