import { Icon } from "@/components/ui/icon";
import { priorityBreaks } from "@/data/amar-bangladesh";

/**
 * The five priority breaks.
 *
 * Each card answers the same four questions in the same order: what is
 * measured, why it started, what continuing costs, and what solving returns.
 */
export function AmarPriorityBreaks() {
  return (
    <section
      id="priority-breaks"
      className="w-full bg-surface px-margin-mobile py-space-2xl lg:px-margin"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs">
          <span className="font-code-telemetry text-label-sm font-bold uppercase text-tertiary">
            SECTION 02 · THE FIVE PRIORITY BREAKS
          </span>
          <h2 className="max-w-3xl font-display text-headline-lg-mobile font-bold tracking-tight text-on-surface sm:text-headline-lg">
            Where the system breaks first
          </h2>
          <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
            Bangladesh&rsquo;s most urgent challenge is not one isolated sector.
            It is a reinforcing system. These five carry the strongest published
            evidence — and the largest measured cost.
          </p>
        </div>

        <div className="flex flex-col gap-gutter">
          {priorityBreaks.map((item) => (
            <article
              key={item.id}
              className="grid grid-cols-1 gap-gutter rounded-xl bg-surface-lowest p-space-lg shadow-xs transition-all hover:shadow-md lg:grid-cols-12"
            >
              {/* Headline metric. */}
              <div className="flex flex-col gap-space-sm lg:col-span-4">
                <div className="flex items-center gap-space-sm">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-tertiary/10 text-tertiary">
                    <Icon name={item.icon} className="text-[22px]" />
                  </span>
                  <span className="font-code-telemetry text-label-sm font-bold text-outline">
                    BREAK {String(item.rank).padStart(2, "0")}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-headline-md font-bold tracking-tight text-on-surface">
                    {item.title}
                  </h3>
                  <span className="font-display text-body-md text-outline">
                    {item.banglaTitle}
                  </span>
                </div>

                <div className="flex items-end gap-space-xs pt-space-xs">
                  <span className="font-display text-display-mobile font-extrabold leading-none text-tertiary">
                    {item.headline}
                  </span>
                  <span className="pb-1 font-code-telemetry text-label-md font-bold text-tertiary">
                    {item.headlineUnit}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm leading-snug text-on-surface-variant">
                  {item.headlineCaption}
                </p>

                <dl className="mt-space-xs flex flex-col gap-1 rounded-lg bg-surface-container p-space-sm">
                  {item.figures.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-baseline justify-between gap-space-sm"
                    >
                      <dt className="font-body-sm text-body-sm text-on-surface-variant">
                        {f.label}
                      </dt>
                      <dd className="font-code-telemetry text-label-sm font-bold whitespace-nowrap text-on-surface">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <span className="font-code-telemetry text-[0.6rem] uppercase tracking-wide text-outline">
                  {item.source}
                </span>
              </div>

              {/* The three-part analysis. Each block reads in sequence, so the
                  label colour carries the shift from cause to cost to payoff. */}
              <div className="flex flex-col divide-y divide-outline-variant/30 lg:col-span-8">
                <div className="flex flex-col gap-space-xs pb-space-md">
                  <span className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold uppercase text-outline">
                    <Icon name="history" className="text-[16px]" />
                    Why it started
                  </span>
                  <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                    {item.origin}
                  </p>
                </div>

                <div className="flex flex-col gap-space-xs py-space-md">
                  <span className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold uppercase text-tertiary">
                    <Icon name="trending_down" className="text-[16px]" />
                    If it continues
                  </span>
                  <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                    {item.ifUnsolved}
                  </p>
                </div>

                <div className="flex flex-col gap-space-xs pt-space-md">
                  <span className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold uppercase text-deep-container">
                    <Icon name="trending_up" className="text-[16px]" />
                    If it is solved
                  </span>
                  <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                    {item.ifSolved}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
