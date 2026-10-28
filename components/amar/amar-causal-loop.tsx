import { Card, Section } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { causalChain, graphNodes } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

/** The ring's radius, in % of the diagram's side; step 1 sits at twelve o'clock and the steps run clockwise. */
const R = 37;
const angle = (i: number) => (i / causalChain.length) * 2 * Math.PI - Math.PI / 2;
const at = (a: number, r = R) => ({ x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) });

/** One arrowhead on the ring, halfway between step `i` and the next, pointing along the loop. */
function Chevron({ i }: { i: number }) {
  const a = angle(i + 0.5);
  const { x, y } = at(a);
  const closing = i === causalChain.length - 1;
  return (
    <path
      d="M -1.6 -2 L 1.2 0 L -1.6 2"
      transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI + 90}) scale(${closing ? 1.5 : 1})`}
      fill="none"
      className="stroke-crimson-bright"
      strokeWidth={closing ? 1.1 : 0.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/**
 * Why the problems regenerate: six steps that close into a loop, since
 * less capacity (step 6) returns to weak measurement (step 1). From lg it
 * is drawn as a ring with a red pulse running round it; below lg, as a
 * numbered stepper whose last row turns back to the first. Then the
 * indicators that would make each node measurable.
 */
export function AmarCausalLoop() {
  return (
    <Section
      id="loop"
      title="Why these problems keep coming back"
      lede="Each failure creates the conditions for the next. The loop closes when reduced capacity returns to weak measurement, and every turn starts with less capability than the one before."
    >
      <div className="story-reveal">
        {/* The ring, from lg. */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-184 lg:block">
          <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full">
            <circle cx="50" cy="50" r={R} fill="none" className="stroke-white/12" strokeWidth="0.4" />
            <g className="origin-center animate-[spin_14s_linear_infinite] motion-reduce:hidden">
              <circle cx="50" cy="50" r={R} fill="none" className="stroke-crimson-bright/70" strokeWidth="0.6" strokeLinecap="round" pathLength="100" strokeDasharray="7 93" />
            </g>
            {causalChain.map((_, i) => (
              <Chevron key={i} i={i} />
            ))}
          </svg>

          <div className="absolute top-1/2 left-1/2 flex w-52 -translate-1/2 flex-col items-center gap-3 text-center">
            <Icon name="autorenew" className="text-5xl text-crimson-bright" />
            <p className="font-grotesk text-xl leading-snug font-bold text-balance text-white">The loop closes</p>
            <p className="text-sm leading-relaxed text-white/80">Step 6 returns to step 1, with less capacity to break it each time.</p>
          </div>

          <ol>
            {causalChain.map((node, i) => {
              const { x, y } = at(angle(i));
              return (
                <li key={node.step} className="absolute w-56 -translate-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                  <Step node={node} />
                </li>
              );
            })}
          </ol>
        </div>

        {/* The stepper, below lg. */}
        <ol className="flex flex-col lg:hidden">
          {causalChain.map((node) => (
            <li key={node.step} className="relative flex gap-4 pb-4">
              <span aria-hidden className="absolute top-12 bottom-0 left-5.5 w-px bg-white/20" />
              <StepNumber step={node.step} />
              <Step node={node} className="flex-1" bare />
            </li>
          ))}
          <li className="flex items-center gap-4">
            <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-national-crimson text-white">
              <Icon name="autorenew" className="text-2xl" />
            </span>
            <p className="text-base leading-relaxed text-white">
              <strong className="font-semibold text-crimson-bright">Back to step 1.</strong> Each turn leaves the state with less capacity to break the loop.
            </p>
          </li>
        </ol>
      </div>

      <div className="mt-16 sm:mt-20">
        <h3 className="story-reveal font-grotesk text-2xl font-bold text-signal-orange">What to measure at each node</h3>
        <p className="story-reveal mt-3 max-w-3xl text-base leading-relaxed text-white/80">
          The minimum indicators that would make each part of the loop visible, and why each one matters.
        </p>
        <p className="mt-6 text-sm text-white/65 lg:hidden">Scroll the table sideways to see every column.</p>
        <Card surface="ink" className="story-reveal mt-3 p-0 hover:translate-y-0 hover:shadow-none sm:p-0 lg:mt-6">
          <div role="region" aria-label="Indicators for each node of the loop" tabIndex={0} className="overflow-x-auto rounded-3xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
            <table className="w-full min-w-216 border-collapse text-left text-sm">
              <caption className="sr-only">Each node of the causal graph with its mechanism, minimum indicator set and why it matters</caption>
              <thead>
                <tr className="border-b border-white/12 text-white/80">
                  {["Node", "Mechanism", "Minimum indicator set", "Why it matters"].map((h) => (
                    <th key={h} scope="col" className="px-6 py-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {graphNodes.map((node) => (
                  <tr key={node.id} className="border-b border-white/8 align-top last:border-0">
                    <th scope="row" className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2 font-grotesk text-base font-bold text-white">
                        <Icon name={node.icon} className="text-xl text-signal-orange" />
                        {node.node}
                      </span>
                    </th>
                    <td className="px-6 py-4 leading-relaxed text-white/80">{node.mechanism}</td>
                    <td className="px-6 py-4 leading-relaxed text-white">{node.indicators}</td>
                    <td className="px-6 py-4 leading-relaxed text-white/80">{node.matters}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Section>
  );
}

type Node = (typeof causalChain)[number];

function StepNumber({ step }: { step: number }) {
  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-bdnavy-900 font-grotesk text-base font-bold text-signal-orange ring-1 ring-white/20 tabular-nums">
      {step}
    </span>
  );
}

/** A step of the loop: on the ring a small navy card with its number; in the stepper the same words beside the number. */
function Step({ node, bare, className }: { node: Node; bare?: boolean; className?: string }) {
  return (
    <div className={cn(!bare && "rounded-2xl bg-bdnavy-900 p-4 ring-1 ring-white/12", className)}>
      <p className="flex items-center gap-2.5">
        {!bare && <StepNumber step={node.step} />}
        <Icon name={node.icon} className="text-xl text-bdnavy-300" />
        <span className="font-grotesk text-lg leading-snug font-bold text-white">{node.label}</span>
      </p>
      <p className={cn("mt-1.5 text-sm leading-relaxed text-white/80", bare && "pt-0.5")}>{node.detail}</p>
    </div>
  );
}
