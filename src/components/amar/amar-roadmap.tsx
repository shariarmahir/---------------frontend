import { Icon } from "@/components/ui/icon";
import {
  CLOSING_STATEMENT,
  monitorRows,
  PROOF_OF_POSSIBILITY,
  reformStages,
} from "@/data/amar-bangladesh";

/**
 * Staged reform architecture and the monitoring dashboard that governs it.
 *
 * The red-flag column matters as much as the target column: it names the
 * failure mode where a metric improves while the outcome does not.
 */
export function AmarRoadmap() {
  return (
    <section
      id="roadmap"
      className="w-full bg-surface-lowest px-margin-mobile py-space-2xl lg:px-margin"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs">
          <span className="font-code-telemetry text-label-sm font-bold uppercase text-deep-container">
            SECTION 07 · REFORM ARCHITECTURE
          </span>
          <h2 className="max-w-3xl font-display text-headline-lg-mobile font-bold tracking-tight text-on-surface sm:text-headline-lg">
            What solving actually looks like
          </h2>
          <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
            Define the problem, measure it openly, test a solution locally,
            publish the result, correct failure, and scale only what works.
          </p>
        </div>

        {/* Staged timeline. */}
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-4">
          {reformStages.map((stage, i) => (
            <article
              key={stage.id}
              className="group relative flex flex-col gap-space-md rounded-lg bg-surface-low p-space-lg shadow-xs transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="absolute top-0 left-space-lg h-1 w-16 rounded-b-sm bg-title" />

              <div className="flex items-center gap-space-sm pt-space-xs">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-surface-container text-deep-container">
                  <Icon
                    name={stage.icon}
                    className="text-[20px] transition-transform group-hover:scale-110"
                  />
                </span>
                <span className="font-code-telemetry text-label-sm font-bold text-outline">
                  STAGE {i + 1}
                </span>
              </div>

              <div>
                <h3 className="font-display text-headline-sm font-bold text-on-surface">
                  {stage.horizon}
                </h3>
                <span className="font-display text-body-md text-outline">
                  {stage.banglaHorizon}
                </span>
              </div>

              <ul className="flex flex-col gap-space-sm">
                {stage.actions.map((action) => (
                  <li
                    key={action}
                    className="flex items-start gap-space-xs font-body-sm text-body-sm leading-relaxed text-on-surface-variant"
                  >
                    <Icon
                      name="check_circle"
                      className="mt-0.5 shrink-0 text-[15px] text-deep-container"
                    />
                    {action}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Monitoring dashboard. */}
        <div className="flex flex-col gap-space-md">
          <h3 className="font-display text-headline-md font-bold text-on-surface">
            Monitoring dashboard
          </h3>
          <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
            Every domain carries a baseline to establish, a 24-month target, and
            a red flag — the specific way each metric can improve while the
            outcome underneath it gets worse.
          </p>

          <p className="font-label-sm text-label-sm text-outline lg:hidden">
            Swipe the table sideways to see every column →
          </p>
          <div className="overflow-x-auto rounded-lg border border-outline-variant/30 shadow-xs">
            <table className="w-full min-w-[56rem] border-collapse text-left">
              <caption className="sr-only">
                Monitoring dashboard with baseline, 24-month target and red flag
                per domain
              </caption>
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container">
                  <th
                    scope="col"
                    className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                  >
                    Domain
                  </th>
                  <th
                    scope="col"
                    className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                  >
                    Baseline to establish
                  </th>
                  <th
                    scope="col"
                    className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                  >
                    24-month target
                  </th>
                  <th
                    scope="col"
                    className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-tertiary"
                  >
                    Red flag
                  </th>
                </tr>
              </thead>
              <tbody>
                {monitorRows.map((row, i) => (
                  <tr
                    key={row.domain}
                    className={
                      "border-b border-outline-variant/30 transition-colors hover:bg-surface-container/60" +
                      (i % 2 === 1 ? " bg-surface-low/60" : "")
                    }
                  >
                    <th
                      scope="row"
                      className="px-space-md py-space-md align-top whitespace-nowrap"
                    >
                      <span className="flex items-center gap-space-xs font-display text-label-md font-bold text-on-surface">
                        <Icon
                          name={row.icon}
                          className="text-[18px] text-deep-container"
                        />
                        {row.domain}
                      </span>
                    </th>
                    <td className="px-space-md py-space-md align-top font-body-sm text-body-sm text-on-surface-variant">
                      {row.baseline}
                    </td>
                    <td className="px-space-md py-space-md align-top font-body-sm text-body-sm text-on-surface-variant">
                      {row.target}
                    </td>
                    <td className="px-space-md py-space-md align-top font-body-sm text-body-sm text-tertiary">
                      {row.redFlag}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Closing argument. */}
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <div className="flex flex-col gap-space-sm rounded-lg bg-surface-low p-space-lg shadow-xs">
            <span className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold uppercase text-deep-container">
              <Icon name="lightbulb" className="text-[18px]" />
              The credible route
            </span>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
              {CLOSING_STATEMENT}
            </p>
          </div>

          <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container/60 p-space-lg shadow-xs">
            <span className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold uppercase text-deep-container">
              <Icon name="verified" className="text-[18px]" />
              Proof it is possible
            </span>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
              {PROOF_OF_POSSIBILITY}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
