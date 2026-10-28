import { Card, Section, type Surface } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { CLOSING_STATEMENT, monitorRows, PROOF_OF_POSSIBILITY, reformStages } from "@/data/amar-bangladesh";

const SURFACES: Surface[] = ["navy", "ink", "cobalt", "navy"];

/**
 * The staged reform roadmap, the monitoring table that governs it and the
 * argument for why it is credible. The red-flag column matters as much as
 * the target: it names how each metric can improve while the outcome under
 * it gets worse.
 */
export function AmarRoadmap() {
  return (
    <>
      <Section
        id="roadmap"
        title="A roadmap that is realistic and brave"
        lede="Define the problem, measure it openly, test a solution locally, publish the result, correct what fails, and scale only what works."
      >
        <div className="relative">
          {/* The rail through the stage markers, from lg. */}
          <span aria-hidden className="absolute top-5.5 right-[12.5%] left-[12.5%] hidden h-px bg-white/20 lg:block" />
          <ol className="relative grid gap-4 lg:grid-cols-4">
            {reformStages.map((stage, i) => (
              <li key={stage.id} className="story-reveal flex flex-col gap-4 lg:gap-6">
                <span className="flex items-center gap-3 lg:justify-center">
                  <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-signal-orange font-grotesk text-base font-bold text-text-primary tabular-nums ring-4 ring-black">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-white/80 lg:sr-only">Stage {i + 1}</span>
                </span>
                <Card surface={SURFACES[i]} className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <Icon name={stage.icon} className="text-3xl text-bdnavy-300" />
                    <h3 className="font-grotesk text-2xl font-bold text-signal-orange">{stage.horizon}</h3>
                  </div>
                  <ul className="mt-5 flex flex-col gap-3">
                    {stage.actions.map((action) => (
                      <li key={action} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/80">
                        <Icon name="check" className="mt-0.5 text-base text-signal-orange" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section
        id="monitoring"
        title="How we will know it is working"
        lede="Every domain carries a baseline to establish, a 24-month target, and a red flag: the specific way a metric can improve while the outcome under it gets worse."
      >
        <p className="mb-3 text-sm text-white/65 lg:hidden">Scroll the table sideways to see every column.</p>
        <Card surface="ink" className="story-reveal p-0 hover:translate-y-0 hover:shadow-none sm:p-0">
          <div role="region" aria-label="Monitoring table" tabIndex={0} className="overflow-x-auto rounded-3xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
            <table className="w-full min-w-216 border-collapse text-left text-sm">
              <caption className="sr-only">Monitoring table: the baseline to establish, the 24-month target and the red flag for each domain</caption>
              <thead>
                <tr className="border-b border-white/12 text-white/80">
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Domain
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Baseline to establish
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    24-month target
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold text-crimson-bright">
                    Red flag
                  </th>
                </tr>
              </thead>
              <tbody>
                {monitorRows.map((row) => (
                  <tr key={row.domain} className="border-b border-white/8 align-top last:border-0">
                    <th scope="row" className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2 font-grotesk text-base font-bold text-white">
                        <Icon name={row.icon} className="text-xl text-signal-orange" />
                        {row.domain}
                      </span>
                    </th>
                    <td className="px-6 py-4 leading-relaxed text-white/80">{row.baseline}</td>
                    <td className="px-6 py-4 leading-relaxed text-white">{row.target}</td>
                    <td className="px-6 py-4 leading-relaxed text-white">
                      <span className="flex items-start gap-2">
                        <Icon name="flag" filled className="mt-0.5 text-base text-crimson-bright" />
                        {row.redFlag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      <Section id="credible" title="Why it can be done">
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { icon: "route", title: "The credible route", body: CLOSING_STATEMENT, surface: "navy" as const },
            { icon: "verified", title: "Proof it is possible", body: PROOF_OF_POSSIBILITY, surface: "cobalt" as const },
          ].map((c) => (
            <Card key={c.title} surface={c.surface} className="story-reveal">
              <h3 className="flex items-center gap-3 font-grotesk text-2xl font-bold text-signal-orange">
                <Icon name={c.icon} className="text-3xl" />
                {c.title}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-white">{c.body}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
