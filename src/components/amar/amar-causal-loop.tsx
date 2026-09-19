import { Icon } from "@/components/ui/icon";
import { causalChain, graphNodes } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

/**
 * The reinforcing loop, plus the measurable indicator set for each node.
 *
 * The chain is drawn as a closed cycle because step 6 feeds step 1 — that
 * return arrow is the whole argument for fixing measurement first.
 */
export function AmarCausalLoop() {
  return (
    <section
      id="causal-loop"
      className="w-full bg-surface-lowest px-margin-mobile py-space-2xl lg:px-margin"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs">
          <span className="font-code-telemetry text-label-sm font-bold uppercase text-deep-container">
            SECTION 03 · THE CAUSAL GRAPH
          </span>
          <h2 className="max-w-3xl font-display text-headline-lg-mobile font-bold tracking-tight text-on-surface sm:text-headline-lg">
            Why these problems keep regenerating
          </h2>
          <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
            Each failure produces the conditions for the next. The loop closes:
            reduced institutional capacity returns to weak measurement, and the
            cycle restarts with less capability than before.
          </p>
        </div>

        {/* The loop. */}
        <div className="relative rounded-lg bg-surface-low p-space-lg">
          <ol className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-6">
            {causalChain.map((node, i) => (
              <li
                key={node.step}
                className="relative flex flex-col gap-space-xs"
              >
                <div className="flex items-center gap-space-xs">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-container font-code-telemetry text-label-sm font-bold text-white shadow-xs">
                    {node.step}
                  </span>
                  {/* Connector, desktop only. */}
                  {i < causalChain.length - 1 ? (
                    <span className="hidden h-px flex-1 bg-linear-to-r from-primary/50 to-primary/10 lg:block" />
                  ) : null}
                </div>
                <Icon name={node.icon} className="text-[20px] text-signal-text" />
                <span className="font-display text-label-md font-bold text-on-surface">
                  {node.label}
                </span>
                <span className="font-body-sm text-body-sm leading-snug text-on-surface-variant">
                  {node.detail}
                </span>
              </li>
            ))}
          </ol>

          {/* The return arrow that closes the cycle. */}
          <div className="mt-space-lg flex items-center gap-space-sm rounded-lg border bg-tertiary/5 px-space-md py-space-sm">
            <Icon
              name="refresh"
              className="shrink-0 text-[20px] text-tertiary"
            />
            <p className="font-body-sm text-body-sm font-medium text-on-surface-variant">
              <span className="font-bold text-tertiary">
                The loop closes here.
              </span>{" "}
              Step 6 returns to step 1 — each cycle leaves the state with less
              capacity to break it than the cycle before.
            </p>
          </div>
        </div>

        {/* Node indicator table. */}
        <p className="font-label-sm text-label-sm text-outline lg:hidden">
          Swipe the table sideways to see every column →
        </p>
        <div className="overflow-x-auto rounded-lg border border-outline-variant/30 shadow-xs">
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <caption className="sr-only">
              Causal graph nodes with mechanism, indicator set and significance
            </caption>
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container">
                <th
                  scope="col"
                  className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                >
                  Node
                </th>
                <th
                  scope="col"
                  className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                >
                  Mechanism
                </th>
                <th
                  scope="col"
                  className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                >
                  Minimum indicator set
                </th>
                <th
                  scope="col"
                  className="px-space-md py-space-sm font-code-telemetry text-label-sm font-bold uppercase text-on-surface-variant"
                >
                  Why it matters
                </th>
              </tr>
            </thead>
            <tbody>
              {graphNodes.map((node, i) => (
                <tr
                  key={node.id}
                  className={cn(
                    "border-b border-outline-variant/30 transition-colors hover:bg-surface-container/60",
                    i % 2 === 1 && "bg-surface-low/60",
                  )}
                >
                  <th
                    scope="row"
                    className="px-space-md py-space-md align-top whitespace-nowrap"
                  >
                    <span className="flex items-center gap-space-xs font-display text-label-md font-bold text-on-surface">
                      <Icon
                        name={node.icon}
                        className="text-[18px] text-deep-container"
                      />
                      {node.node}
                    </span>
                  </th>
                  <td className="px-space-md py-space-md align-top font-body-sm text-body-sm text-on-surface-variant">
                    {node.mechanism}
                  </td>
                  <td className="px-space-md py-space-md align-top font-code-telemetry text-label-sm text-on-surface-variant">
                    {node.indicators}
                  </td>
                  <td className="px-space-md py-space-md align-top font-body-sm text-body-sm text-on-surface-variant">
                    {node.matters}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
