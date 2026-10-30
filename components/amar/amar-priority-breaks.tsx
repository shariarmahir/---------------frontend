import { Card, Section } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { priorityBreaks } from "@/data/amar-bangladesh";
import { EVIDENCE } from "@/data/bangladesh-problems";
import { cn } from "@/lib/utils";

/* The three readings of every break, in order: cause, cost (red, the urgent one), payoff. */
const READINGS = [
  { key: "origin", label: "Why it started", icon: "history", tone: "text-white/80" },
  { key: "ifUnsolved", label: "If it continues", icon: "trending_down", tone: "text-crimson-bright" },
  { key: "ifSolved", label: "If it is solved", icon: "trending_up", tone: "text-bdnavy-300" },
] as const;

/**
 * The five priority breaks. Each card answers the same questions in the
 * same order: what is measured, why it started, what continuing costs and
 * what solving returns.
 */
export function AmarPriorityBreaks() {
  return (
    <Section
      id="priority-breaks"
      title="Where the system breaks first"
      lede="Bangladesh’s most urgent challenge is not one isolated sector. It is a reinforcing system. These five carry the strongest published evidence, and the largest measured cost."
    >
      <ol className="flex flex-col gap-4 sm:gap-6">
        {priorityBreaks.map((item, i) => (
          <li key={item.id}>
            <Card surface={i % 2 ? "ink" : "navy"} className="grid gap-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
              <div className="flex flex-col lg:col-span-5 xl:col-span-4">
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} className="text-3xl! text-signal-orange" />
                  <span className="text-sm font-semibold text-white/65">Break {item.rank} of {priorityBreaks.length}</span>
                </div>
                <h3 className="mt-4 font-grotesk text-2xl font-bold tracking-tight text-balance text-white">{item.title}</h3>

                <p className="mt-6 flex flex-wrap items-baseline gap-x-2 font-grotesk">
                  <span className="text-5xl leading-none font-bold tracking-tight text-signal-orange">{item.headline}</span>
                  <span className="text-lg font-semibold text-white/80">{item.headlineUnit}</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{item.headlineCaption}</p>

                <dl className="mt-6 divide-y divide-white/12 border-y border-white/12">
                  {item.figures.map((f) => (
                    <div key={f.label} className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-sm text-white/80">{f.label}</dt>
                      <dd className="text-sm font-semibold whitespace-nowrap text-white tabular-nums">{f.value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/65">
                  <span className="flex items-center gap-1 font-semibold text-white/80">
                    <Icon name={EVIDENCE[item.status].icon} className={cn("text-base!", EVIDENCE[item.status].tone)} />
                    {EVIDENCE[item.status].label}
                  </span>
                  <span aria-hidden>·</span>
                  <span>Source: {item.source}</span>
                </p>
              </div>

              <div className="flex flex-col gap-6 lg:col-span-7 lg:border-l lg:border-white/12 lg:pl-12 xl:col-span-8">
                {READINGS.map((r) => (
                  <div key={r.key}>
                    <h4 className={cn("flex items-center gap-2 font-grotesk text-base font-bold", r.tone)}>
                      <Icon name={r.icon} className="text-xl!" />
                      {r.label}
                    </h4>
                    <p className="mt-2 text-base leading-relaxed text-white/80">{item[r.key]}</p>
                  </div>
                ))}
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}
