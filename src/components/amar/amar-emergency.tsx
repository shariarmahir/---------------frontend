import { Icon } from "@/components/ui/icon";
import { emergencyCategories } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

/**
 * Emergency categories — what the evidence says to act on first.
 */
export function AmarEmergency() {
  return (
    <section
      id="emergency"
      className="w-full bg-surface-lowest px-margin-mobile py-space-2xl lg:px-margin"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs">
          <span className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold uppercase text-tertiary">
            <span className="relative flex size-2.5 items-center justify-center">
              <span className="absolute size-2.5 animate-ping rounded-full bg-tertiary/60" />
              <span className="relative size-1.5 rounded-full bg-tertiary" />
            </span>
            SECTION 05 · EMERGENCY CATEGORIES
          </span>
          <h2 className="max-w-3xl font-display text-headline-lg-mobile font-bold tracking-tight text-on-surface sm:text-headline-lg">
            Solve the measurement layer first
          </h2>
          <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
            The practical implication of the whole dossier: build the
            measurement and accountability layer, then use it to target health,
            education, jobs, pollution, logistics, energy, safety and
            innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {emergencyCategories.map((cat) => (
            <article
              key={cat.id}
              className={cn(
                "group relative flex flex-col gap-space-sm overflow-hidden rounded-lg p-space-md shadow-xs transition-all hover:-translate-y-1 hover:shadow-md",
                cat.tone === "critical"
                  ? "bg-tertiary/10/50"
                  : "bg-secondary-fixed/50",
              )}
            >
              <div className="flex items-start justify-between gap-space-sm">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-lg border bg-surface-lowest shadow-xs",
                    cat.tone === "critical" ? "text-tertiary" : "text-signal-text",
                  )}
                >
                  <Icon
                    name={cat.icon}
                    className="text-[22px] transition-transform group-hover:scale-110"
                  />
                </span>
                <span
                  className={cn(
                    "rounded-full px-space-sm py-0.5 font-code-telemetry text-label-xs font-bold uppercase",
                    cat.tone === "critical"
                      ? "bg-tertiary text-white"
                      : "bg-signal text-white",
                  )}
                >
                  {cat.tone}
                </span>
              </div>

              <div>
                <h3 className="font-display text-label-md font-bold text-on-surface">
                  {cat.title}
                </h3>
                <span className="font-display text-body-sm text-outline">
                  {cat.banglaTitle}
                </span>
              </div>

              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                {cat.summary}
              </p>

              <span className="mt-auto flex items-center gap-space-xs pt-space-xs font-code-telemetry text-label-sm font-bold text-outline">
                <Icon name="tag" className="text-[14px]" />
                {cat.pointCount} source point{cat.pointCount === 1 ? "" : "s"}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
