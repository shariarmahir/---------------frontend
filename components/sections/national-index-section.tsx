import { Icon } from "@/components/ui/icon";
import { DailyJudgmentForm } from "@/components/sections/daily-judgment-form";
import {
  DEULIA_RISK_LABEL,
  DEULIA_RISK_SCORE,
  economicRisks,
  nationalStats,
  type RiskTone,
} from "@/data/national-index";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<RiskTone, string> = {
  stable: "text-primary",
  watch: "text-signal-text",
  critical: "text-crimson",
};

const TONE_BAR: Record<RiskTone, string> = {
  stable: "bg-primary",
  watch: "bg-signal",
  critical: "bg-crimson",
};

const TONE_CHIP: Record<RiskTone, string> = {
  stable: "border-white/12 bg-bdgreen-500/15 text-primary",
  watch: "border-white/12 bg-signal-orange/15 text-signal-text",
  critical: "border-white/12 bg-national-crimson/20 text-crimson",
};

export function NationalIndexSection() {
  return (
    <section
      id="national-index"
      className="amar-dark w-full bg-black py-space-xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-space-xl px-gutter">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-space-xs text-center">
          <span className="font-code-telemetry text-label-sm font-bold tracking-wider text-primary">
            National Sovereign Index
          </span>
          <h2 className="font-display text-headline-lg-mobile font-bold tracking-tight text-signal-orange sm:text-headline-lg">
            আমরা কাণ্ডারী — Judge Our Own Bangladesh
          </h2>
          <p className="font-body-md text-body-md text-white/80">
            Where Bangladesh stands today, measured honestly. Figures compiled
            from IMF, World Bank, Bangladesh Bank, BBS, IQAir and national
            industry reporting.
          </p>
        </div>

        {/* Primary indicator grid. */}
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {nationalStats.map((stat) => (
            <article
              key={stat.id}
              className="flex flex-col gap-space-sm rounded-2xl bg-text-primary p-space-md shadow-xs ring-1 ring-white/12 transition-all hover:-translate-y-1 hover:border-white/12 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-space-sm">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg border",
                    TONE_CHIP[stat.tone],
                  )}
                >
                  <Icon name={stat.icon} className="text-[20px]" />
                </span>
                {stat.delta ? (
                  <span
                    className={cn(
                      "flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 font-code-telemetry text-label-xs font-bold",
                      (stat.deltaDirection === "up") === Boolean(stat.upIsGood)
                        ? "bg-bdgreen-500/15 text-primary"
                        : "bg-national-crimson/20 text-crimson",
                    )}
                  >
                    <Icon
                      name={
                        stat.deltaDirection === "up" ? "trending_up" : "trending_down"
                      }
                      className="text-[12px]"
                    />
                    {stat.delta}
                  </span>
                ) : null}
              </div>

              <div>
                <h3 className="font-label-md text-label-md font-semibold text-white">
                  {stat.label}
                </h3>
                <span className="block font-display text-body-sm text-white/65">
                  {stat.banglaLabel}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "font-display text-headline-md font-extrabold",
                    TONE_TEXT[stat.tone],
                  )}
                >
                  {stat.value}
                </span>
                {stat.unit ? (
                  <span className="font-code-telemetry text-label-sm font-semibold text-white/65">
                    {stat.unit}
                  </span>
                ) : null}
              </div>

              {/* Bar graph. */}
              <div
                role="meter"
                aria-valuenow={stat.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${stat.label} index`}
                className="h-1.5 w-full overflow-hidden rounded-full bg-white/15"
              >
                <div
                  className={cn("h-full rounded-full", TONE_BAR[stat.tone])}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>

              <p className="font-body-sm text-body-sm leading-relaxed text-white/80">
                {stat.caption}
              </p>
              <span className="mt-auto font-code-telemetry text-label-xs tracking-wide text-white/65">
                {stat.source}
              </span>
            </article>
          ))}
        </div>

        {/* Bankruptcy / collapse risk console. */}
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-space-md rounded-2xl border-2 border-white/12 bg-national-crimson/15 p-space-lg shadow-md lg:col-span-5">
            <div className="flex items-center gap-space-sm">
              {/* Beeping risk beacon. */}
              <span className="relative flex size-4 shrink-0 items-center justify-center">
                <span className="absolute size-4 animate-ping rounded-full bg-crimson/60" />
                <span className="relative size-2.5 rounded-full bg-crimson shadow-[0_0_10px_rgba(218,41,28,0.9)]" />
              </span>
              <span className="font-code-telemetry text-label-sm font-bold uppercase tracking-wide text-crimson">
                দেউলিয়া / ECONOMIC COLLAPSE RISK
              </span>
            </div>

            <div className="flex items-end gap-space-sm">
              <span className="font-display text-display-mobile font-extrabold leading-none text-crimson">
                {DEULIA_RISK_SCORE}
              </span>
              <span className="pb-1 font-code-telemetry text-label-md font-bold text-crimson">
                / 100 · {DEULIA_RISK_LABEL}
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-text-primary ring-1 ring-white/12">
              <div
                className="h-full animate-pulse rounded-full bg-linear-to-r from-signal to-crimson"
                style={{ width: `${DEULIA_RISK_SCORE}%` }}
              />
            </div>

            <ul className="flex flex-col gap-space-sm">
              {economicRisks.map((risk) => (
                <li key={risk.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-space-sm">
                    <span className="font-label-md text-label-md font-semibold text-white">
                      {risk.label}{" "}
                      <span className="font-display text-body-sm text-white/65">
                        {risk.banglaLabel}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "font-code-telemetry text-label-sm font-bold",
                        TONE_TEXT[risk.tone],
                      )}
                    >
                      {risk.score}
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-text-primary ring-1 ring-white/12">
                    <div
                      className={cn("h-full rounded-full", TONE_BAR[risk.tone])}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                  <span className="font-body-sm text-body-sm text-white/80">
                    {risk.detail}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="#daily-judgment"
              className="mt-auto inline-flex items-center justify-center gap-space-xs rounded-lg bg-crimson px-space-md py-2.5 font-display text-label-md font-bold text-white shadow-sm transition-colors hover:bg-red-700"
            >
              <Icon name="campaign" className="text-[18px]" />
              Report Today&apos;s Reality
            </a>
          </div>

          <div className="lg:col-span-7">
            <DailyJudgmentForm />
          </div>
        </div>
      </div>
    </section>
  );
}
