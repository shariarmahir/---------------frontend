import { Card, Section } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { avoidedBurdenScenarios, CALC_RULES, lossProjection } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

/*
 * The chart works in a 0–100 box on both axes and stretches to its frame
 * (strokes stay their own width), so every label is real HTML at a
 * readable size instead of SVG text that shrinks with the phone.
 */
const MAX = Math.ceil(Math.max(...lossProjection.map((d) => d.unchecked)) / 50) * 50;
const FIRST = lossProjection[0];
const LAST = lossProjection[lossProjection.length - 1];
const x = (year: number) => ((year - FIRST.year) / (LAST.year - FIRST.year)) * 100;
const y = (v: number) => 100 - (v / MAX) * 100;
const points = (key: "unchecked" | "withReform") => lossProjection.map((d) => `${x(d.year)},${y(d[key])}`).join(" ");
const TICKS = [0, 0.25, 0.5, 0.75, 1].map((f) => MAX * f);
/** Years crowded together on a phone: shown from sm. */
const DENSE = new Set([2028, 2032]);
const usd = (v: number) => `$${v.toFixed(1)}B`;

/**
 * What continuing costs, 2026–2050: the environmental burden left alone at
 * 17.6% of a GDP growing 3.5% a year, against the same burden cut by the
 * report's central-case 10%. The red wedge between them is the yearly cost
 * of delay. Beside it, the avoided-burden scenarios and the rules behind
 * every number.
 */
export function AmarLossProjection() {
  return (
    <Section
      id="loss-projection"
      title="What continuing costs, calculated openly"
      lede="The environmental burden alone is 17.6% of GDP. Projected against 3.5% growth a year, this is the gap between acting and not acting. It is a transparent calculation, not a forecast."
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <Card surface="ink" className="story-reveal flex flex-col gap-6 lg:col-span-8">
          <dl className="grid grid-cols-3 gap-3 border-b border-white/12 pb-6">
            {[
              { label: `Left unaddressed, ${LAST.year}`, value: usd(LAST.unchecked), tone: "text-crimson-bright" },
              { label: "With 10% reform", value: usd(LAST.withReform), tone: "text-bdnavy-300" },
              { label: "The gap in that year", value: usd(LAST.gap), tone: "text-white" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <dt className="order-last text-xs leading-snug text-white/80 sm:text-sm">{s.label}</dt>
                <dd className={cn("font-grotesk text-2xl font-bold tracking-tight tabular-nums sm:text-3xl lg:text-4xl", s.tone)}>{s.value}</dd>
              </div>
            ))}
          </dl>
          <figure className="flex flex-col gap-6">
            <figcaption className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <span className="font-grotesk text-xl font-bold text-white">Environmental burden, 2026–2050</span>
              <span className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="h-0.75 w-5 rounded-full bg-crimson-bright" />
                  Left unaddressed
                </span>
                <span className="flex items-center gap-2">
                  <svg aria-hidden viewBox="0 0 20 4" className="h-1 w-5">
                    <line x1="0" x2="20" y1="2" y2="2" className="stroke-bdnavy-300" strokeWidth="3" strokeDasharray="6 4" />
                  </svg>
                  With 10% reform
                </span>
              </span>
            </figcaption>

            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
              {/* Y axis. */}
              <div aria-hidden className="relative h-64 w-12 text-right text-xs text-white/65 tabular-nums sm:h-80">
                {TICKS.map((v) => (
                  <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${y(v)}%` }}>
                    ${v}B
                  </span>
                ))}
              </div>

              <div
                role="img"
                aria-label={`Environmental burden rising from ${usd(FIRST.unchecked)} in ${FIRST.year} to ${usd(LAST.unchecked)} in ${LAST.year} if left unaddressed, against ${usd(LAST.withReform)} with a 10 percent reduction.`}
                className="relative h-64 sm:h-80"
              >
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full overflow-visible">
                  {TICKS.map((v) => (
                    <line key={v} x1="0" x2="100" y1={y(v)} y2={y(v)} className="stroke-white/10" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  ))}
                  <polygon points={`0,100 ${points("withReform")} 100,100`} className="fill-bdnavy-400/15" />
                  {/* The cost of delay: the wedge between the two paths. */}
                  <polygon
                    points={`${points("unchecked")} ${[...lossProjection].reverse().map((d) => `${x(d.year)},${y(d.withReform)}`).join(" ")}`}
                    className="fill-crimson-bright/45"
                  />
                  <polyline
                    points={points("withReform")}
                    fill="none"
                    className="stroke-bdnavy-300"
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline points={points("unchecked")} fill="none" className="stroke-crimson-bright" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
                {lossProjection.map((d) => (
                  <span
                    key={d.year}
                    aria-hidden
                    className="absolute size-2.5 -translate-1/2 rounded-full bg-crimson-bright ring-2 ring-text-primary"
                    style={{ left: `${x(d.year)}%`, top: `${y(d.unchecked)}%` }}
                  />
                ))}
              </div>

              {/* X axis. */}
              <div aria-hidden className="relative col-start-2 mt-2 h-5 text-xs text-white/65 tabular-nums">
                {lossProjection.map((d, i) => (
                  <span
                    key={d.year}
                    className={cn(
                      "absolute",
                      i === 0 ? "left-0" : i === lossProjection.length - 1 ? "right-0" : "-translate-x-1/2",
                      DENSE.has(d.year) && "hidden sm:block",
                    )}
                    style={i === 0 || i === lossProjection.length - 1 ? undefined : { left: `${x(d.year)}%` }}
                  >
                    {d.year}
                  </span>
                ))}
              </div>
            </div>
          </figure>

          <details className="group/numbers border-t border-white/12 pt-4">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md text-sm font-semibold text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <Icon name="expand_more" className="text-xl transition-transform group-open/numbers:rotate-180 motion-reduce:transition-none" />
              See every number
            </summary>
            <div role="region" aria-label="Projection by year" tabIndex={0} className="mt-3 overflow-x-auto rounded-xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              <table className="w-full min-w-120 border-collapse text-left text-sm tabular-nums">
                <caption className="sr-only">Environmental burden by year, in billions of US dollars</caption>
                <thead>
                  <tr className="border-b border-white/12 text-white/80">
                    {["Year", "GDP", "Left unaddressed", "With 10% reform", "Gap"].map((h) => (
                      <th key={h} scope="col" className="py-2.5 pr-4 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lossProjection.map((d) => (
                    <tr key={d.year} className="border-b border-white/8 last:border-0">
                      <th scope="row" className="py-2.5 pr-4 font-semibold text-white">
                        {d.year}
                      </th>
                      <td className="py-2.5 pr-4 text-white/80">{usd(d.gdp)}</td>
                      <td className="py-2.5 pr-4 text-crimson-bright">{usd(d.unchecked)}</td>
                      <td className="py-2.5 pr-4 text-white/80">{usd(d.withReform)}</td>
                      <td className="py-2.5 text-white">{usd(d.gap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <Card surface="navy" className="story-reveal">
            <h3 className="font-grotesk text-xl font-bold text-white">Avoided-burden scenarios</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">Gross burden avoided, before implementation cost and adjustment for double counting.</p>
            <ul className="mt-5 flex flex-col gap-3">
              {avoidedBurdenScenarios.map((s) => {
                const central = s.tone === "central";
                return (
                  <li key={s.reduction} className={cn("rounded-2xl bg-black/30 p-4 ring-1", central ? "ring-signal-orange" : "ring-white/12")}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-white">
                        {s.label} <span className="font-normal text-white/80">· {s.reduction}% cut</span>
                      </span>
                      <span className={cn("font-grotesk text-2xl font-bold tabular-nums", central ? "text-signal-orange" : "text-white")}>{s.avoidedPctGdp}%</span>
                    </div>
                    <div aria-hidden className="mt-3 h-1.5 rounded-full bg-white/10">
                      <div className={cn("h-full rounded-full", central ? "bg-signal-orange" : "bg-bdnavy-300")} style={{ width: `${(s.reduction / 20) * 100}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-white/80">of GDP, about ${s.avoidedUsdB}B a year</p>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card surface="cobalt" className="story-reveal">
            <h3 className="flex items-center gap-2 font-grotesk text-xl font-bold text-white">
              <Icon name="functions" className="text-2xl text-signal-orange" />
              The rules behind the numbers
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {Object.values(CALC_RULES).map((rule) => (
                <li key={rule} className="rounded-xl bg-bdnavy-900 px-3.5 py-3 font-mono text-xs leading-relaxed text-white">
                  {rule}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-white/80">An avoided cost is a scenario benefit, not a budget saving.</p>
          </Card>
        </div>
      </div>
    </Section>
  );
}
