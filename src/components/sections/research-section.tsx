import { Icon } from "@/components/ui/icon";
import { researchInitiatives } from "@/data/research";
import { cn } from "@/lib/utils";

export function ResearchSection() {
  return (
    <section
      id="rnd-innovations"
      className="w-full border-b border-border bg-slate-50/50 py-space-xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-space-xl px-gutter">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-space-xs">
            <span className="font-code-telemetry text-label-sm font-bold uppercase text-primary">
              FRONTIER DEEP-TECH HORIZONS
            </span>
            <h2 className="font-display text-headline-lg-mobile font-bold tracking-tight text-slate-900 sm:text-headline-lg">
              Advanced R&amp;D Initiatives
            </h2>
            <p className="font-body-md text-body-md text-slate-600">
              Moving past software-only startups to establish industrial
              physical intelligence and semiconductor fabrication capabilities.
            </p>
          </div>
          <a
            href="#founder-vision"
            className="inline-flex items-center gap-space-xs font-display text-label-md font-bold text-primary hover:underline"
          >
            <span>Read Research Pre-Prints (arXiv / Kandari)</span>
            <Icon name="open_in_new" className="text-[18px]" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {researchInitiatives.map((initiative) => (
            <article
              key={initiative.title}
              className="flex flex-col justify-between rounded-2xl border border-border bg-white p-space-lg shadow-md"
            >
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded-sm border px-space-sm py-0.5 font-code-telemetry text-label-sm font-bold",
                      initiative.badgeTone === "primary"
                        ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                        : "border-orange-200 bg-orange-100 text-orange-900",
                    )}
                  >
                    {initiative.badge}
                  </span>
                  <Icon
                    name={initiative.icon}
                    className="text-[24px] text-title"
                  />
                </div>
                <h3 className="font-display text-headline-sm font-bold text-slate-900">
                  {initiative.title}
                </h3>
                <p className="font-body-sm text-body-sm leading-relaxed text-slate-600">
                  {initiative.description}
                </p>
                <dl className="flex flex-col gap-space-xs rounded-lg border border-border bg-slate-50 p-space-sm font-code-telemetry text-label-sm">
                  {initiative.specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-space-sm">
                      <dt className="font-medium text-slate-500">{spec.label}</dt>
                      <dd
                        className={cn(
                          "text-right font-bold",
                          spec.tone === "primary" ? "text-primary" : "text-signal",
                        )}
                      >
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-xs border-t border-border pt-space-sm font-label-sm text-label-sm">
                <span className="text-slate-600">
                  Stage:{" "}
                  <strong className="text-slate-900">{initiative.stage}</strong>
                </span>
                <span className="rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-primary">
                  {initiative.trl}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
