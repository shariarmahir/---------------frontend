import { Icon } from "@/components/ui/icon";
import { baselineStats, evidenceRules } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

const TONE_TEXT = {
  good: "text-deep-container",
  watch: "text-signal",
  bad: "text-tertiary",
} as const;

const TONE_BAR = {
  good: "bg-deep-container",
  watch: "bg-signal",
  bad: "bg-tertiary",
} as const;

/**
 * National baseline — the denominators every later claim is measured against.
 */
export function AmarBaseline() {
  return (
    <section
      id="baseline"
      className="w-full bg-surface-lowest px-margin-mobile py-space-2xl lg:px-margin"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs">
          <span className="font-code-telemetry text-label-sm font-bold uppercase text-deep-container">
            SECTION 01 · NATIONAL BASELINE
          </span>
          <h2 className="max-w-3xl font-display text-headline-lg-mobile font-bold tracking-tight text-on-surface sm:text-headline-lg">
            The numbers every claim must be measured against
          </h2>
          <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
            A country with substantial development gains and significant
            service-quality gaps at the same time. Without these denominators,
            &ldquo;all&rdquo;, &ldquo;everywhere&rdquo; and &ldquo;many&rdquo;
            cannot guide policy.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-space-md sm:grid-cols-3 lg:grid-cols-5">
          {baselineStats.map((stat) => (
            <article
              key={stat.id}
              className="group flex flex-col gap-space-xs rounded-xl bg-surface-low p-space-md shadow-xs transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <Icon
                name={stat.icon}
                className={cn(
                  "text-[22px] transition-transform group-hover:scale-110",
                  TONE_TEXT[stat.tone],
                )}
              />
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "font-display text-headline-sm font-extrabold",
                    TONE_TEXT[stat.tone],
                  )}
                >
                  {stat.value}
                </span>
                {stat.unit ? (
                  <span className="font-code-telemetry text-label-sm text-outline">
                    {stat.unit}
                  </span>
                ) : null}
              </div>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                {stat.label}
              </span>
              <span className="font-display text-body-sm text-outline">
                {stat.banglaLabel}
              </span>

              {stat.meter !== null ? (
                <span className="mt-0.5 flex h-1 w-full overflow-hidden rounded-full bg-surface-highest">
                  <span
                    className={cn("h-full rounded-full", TONE_BAR[stat.tone])}
                    style={{ width: `${stat.meter}%` }}
                  />
                </span>
              ) : null}

              <p className="font-body-sm text-body-sm leading-snug text-on-surface-variant">
                {stat.note}
              </p>
              <span className="mt-auto font-code-telemetry text-[0.6rem] uppercase tracking-wide text-outline">
                {stat.source}
              </span>
            </article>
          ))}
        </div>

        {/* Evidence discipline. */}
        <div className="grid grid-cols-1 gap-space-md rounded-xl bg-surface-low p-space-lg md:grid-cols-3">
          {evidenceRules.map((rule) => (
            <div key={rule.rule} className="flex gap-space-sm">
              <Icon
                name={rule.icon}
                className="shrink-0 text-[20px] text-deep-container"
              />
              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                {rule.rule}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
