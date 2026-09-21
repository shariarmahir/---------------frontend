import { Icon } from "@/components/ui/icon";
import { impactMetrics } from "@/data/metrics";
import { cn } from "@/lib/utils";

const TONE_TEXT = {
  primary: "text-primary",
  signal: "text-signal-text",
  crimson: "text-crimson",
  slate: "text-slate-900",
} as const;

const TONE_ICON = {
  primary: "text-primary",
  signal: "text-title",
  crimson: "text-crimson",
  slate: "text-primary",
} as const;

const TONE_BAR = {
  primary: "bg-primary",
  signal: "bg-title",
  crimson: "bg-crimson",
  slate: "bg-primary",
} as const;

export function MetricsSection() {
  return (
    <section
      id="impact"
      className="w-full border-b border-border bg-white py-space-xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-space-xl px-gutter">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-space-xs text-center">
          <span className="font-code-telemetry text-label-sm font-bold tracking-wider text-signal-text">
            Quantifiable National Telemetry
          </span>
          <h2 className="font-display text-headline-lg-mobile font-bold tracking-tight text-slate-900 sm:text-headline-lg">
            Systemic Transformation Metrics
          </h2>
          <p className="font-body-md text-body-md text-slate-600">
            Empirical impact benchmarks monitored round-the-clock across our
            decentralized data mesh.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric) => (
            <article
              key={metric.label}
              className="flex flex-col justify-between rounded-2xl border border-border bg-slate-50 p-space-lg shadow-xs transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-label-sm text-label-sm font-bold tracking-wider">
                  {metric.label}
                </span>
                <Icon
                  name={metric.icon}
                  className={cn("text-[20px]", TONE_ICON[metric.tone])}
                />
              </div>

              <div className="my-space-md">
                <span
                  className={cn(
                    "font-display text-display-mobile font-extrabold tracking-tight xl:text-display",
                    TONE_TEXT[metric.tone],
                  )}
                >
                  {metric.value}
                </span>
                <span className="mt-1 block font-display text-label-md font-bold text-slate-900">
                  {metric.title}
                </span>
                <p className="mt-1 font-body-sm text-body-sm text-slate-600">
                  {metric.description}
                </p>
              </div>

              <div
                role="progressbar"
                aria-valuenow={metric.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${metric.title} progress`}
                className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
              >
                <div
                  className={cn("h-full rounded-full", TONE_BAR[metric.tone])}
                  style={{ width: `${metric.progress}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
