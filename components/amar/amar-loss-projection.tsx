import { Icon } from "@/components/ui/icon";
import {
  avoidedBurdenScenarios,
  CALC_RULES,
  lossProjection,
} from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

/* Chart geometry. */
const W = 900;
const H = 340;
const PAD_L = 62;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 42;

const MAX =
  Math.ceil(Math.max(...lossProjection.map((d) => d.unchecked)) / 20) * 20;
const YEARS = lossProjection.map((d) => d.year);
const X0 = YEARS[0];
const X1 = YEARS[YEARS.length - 1];

const px = (year: number) =>
  PAD_L + ((year - X0) / (X1 - X0)) * (W - PAD_L - PAD_R);
const py = (v: number) => H - PAD_B - (v / MAX) * (H - PAD_T - PAD_B);

const line = (key: "unchecked" | "withReform") =>
  lossProjection.map((d) => `${px(d.year)},${py(d[key])}`).join(" ");

const area = (key: "unchecked" | "withReform") =>
  `${PAD_L},${H - PAD_B} ${line(key)} ${px(X1)},${H - PAD_B}`;

const TONE = {
  low: "bg-surface-container text-deep-container",
  central: "bg-secondary-fixed text-signal-text",
  high: "bg-tertiary/10 text-tertiary",
} as const;

/**
 * Compounding-loss projection to 2050.
 *
 * Two paths are drawn: the environmental burden left unaddressed at
 * 17.6% of a GDP growing 3.5% a year, and the same burden with the
 * report's central-case 10% reduction. The shaded wedge between them is
 * the cumulative cost of delay.
 */
export function AmarLossProjection() {
  const last = lossProjection[lossProjection.length - 1];
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(MAX * f));

  return (
    <section
      id="loss-projection"
      className="w-full bg-surface px-margin-mobile py-space-2xl lg:px-margin"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs">
          <span className="font-code-telemetry text-label-sm font-bold uppercase text-tertiary">
            SECTION 04 · LOSS PROJECTION
          </span>
          <h2 className="max-w-3xl font-display text-headline-lg-mobile font-bold tracking-tight text-on-surface sm:text-headline-lg">
            What continuing costs, calculated openly
          </h2>
          <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">
            The environmental burden alone is 17.6% of GDP. Projected against
            3.5% growth, here is the divergence between acting and not acting.
            This is a transparent calculation, not a forecast.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          {/* Chart. */}
          <figure className="flex flex-col gap-space-md rounded-lg bg-surface-lowest p-space-lg shadow-xs lg:col-span-8">
            <figcaption className="flex flex-wrap items-center justify-between gap-space-sm">
              <span className="font-display text-headline-sm font-bold text-on-surface">
                Environmental burden, 2026–2050
              </span>
              <span className="flex items-center gap-space-md">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-tertiary" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Unaddressed
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-deep-container" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    With 10% reform
                  </span>
                </span>
              </span>
            </figcaption>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={`Environmental burden rising from ${lossProjection[0].unchecked} to ${last.unchecked} billion US dollars by 2050 if unaddressed, versus ${last.withReform} billion with a 10 percent reduction`}
              className="w-full"
            >
              {/* Grid + Y axis. */}
              {gridLines.map((v) => (
                <g key={v}>
                  <line
                    x1={PAD_L}
                    y1={py(v)}
                    x2={W - PAD_R}
                    y2={py(v)}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={PAD_L - 10}
                    y={py(v) + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="12"
                    fontFamily="ui-monospace, monospace"
                  >
                    ${v}B
                  </text>
                </g>
              ))}

              {/* The cost-of-delay wedge. */}
              <polygon
                points={`${line("unchecked")} ${lossProjection
                  .slice()
                  .reverse()
                  .map((d) => `${px(d.year)},${py(d.withReform)}`)
                  .join(" ")}`}
                fill="#da291c"
                fillOpacity="0.10"
              />

              <polygon
                points={area("withReform")}
                fill="#006747"
                fillOpacity="0.08"
              />

              {/* Unaddressed path. */}
              <polyline
                points={line("unchecked")}
                fill="none"
                stroke="#da291c"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="1"
                  to="0"
                  dur="1.8s"
                  fill="freeze"
                />
              </polyline>

              {/* Reform path. */}
              <polyline
                points={line("withReform")}
                fill="none"
                stroke="#006747"
                strokeWidth="3"
                strokeDasharray="7 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points. */}
              {lossProjection.map((d) => (
                <g key={d.year}>
                  <circle
                    cx={px(d.year)}
                    cy={py(d.unchecked)}
                    r="4.5"
                    fill="#da291c"
                  >
                    <animate
                      attributeName="r"
                      values="4.5;6.5;4.5"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={px(d.year)}
                    cy={py(d.withReform)}
                    r="3.5"
                    fill="#006747"
                  />
                  <text
                    x={px(d.year)}
                    y={H - PAD_B + 20}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="12"
                    fontFamily="ui-monospace, monospace"
                  >
                    {d.year}
                  </text>
                </g>
              ))}

              {/* Axes. */}
              <line
                x1={PAD_L}
                y1={H - PAD_B}
                x2={W - PAD_R}
                y2={H - PAD_B}
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
            </svg>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              By {last.year} the annual burden reaches{" "}
              <strong className="text-tertiary">${last.unchecked}B</strong>{" "}
              unaddressed versus{" "}
              <strong className="text-deep-container">
                ${last.withReform}B
              </strong>{" "}
              with reform — an annual gap of{" "}
              <strong className="text-signal-text">${last.gap}B</strong>.
            </p>
          </figure>

          {/* Scenarios + calculation rules. */}
          <div className="flex flex-col gap-gutter lg:col-span-4">
            <div className="flex flex-col gap-space-md rounded-lg bg-surface-lowest p-space-lg shadow-xs">
              <h3 className="font-display text-headline-sm font-bold text-on-surface">
                Avoided-burden scenarios
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Gross avoided burden before implementation cost and
                double-counting adjustment.
              </p>
              <ul className="flex flex-col gap-space-sm">
                {avoidedBurdenScenarios.map((s) => (
                  <li
                    key={s.reduction}
                    className={cn(
                      "flex items-center justify-between gap-space-sm rounded-lg border px-space-md py-space-sm",
                      TONE[s.tone],
                    )}
                  >
                    <span className="flex flex-col">
                      <span className="font-code-telemetry text-label-sm font-bold uppercase">
                        {s.label}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {s.reduction}% reduction
                      </span>
                    </span>
                    <span className="flex flex-col items-end">
                      <span className="font-display text-headline-sm font-extrabold">
                        {s.avoidedPctGdp}%
                      </span>
                      <span className="font-code-telemetry text-label-sm text-on-surface-variant">
                        ≈ ${s.avoidedUsdB}B
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-space-sm rounded-lg border border-outline-variant/30 bg-on-surface p-space-lg shadow-xs">
              <span className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold uppercase text-on-deep-container">
                <Icon name="functions" className="text-[16px]" />
                Calculation rules
              </span>
              {Object.values(CALC_RULES).map((rule) => (
                <code
                  key={rule}
                  className="block rounded-lg bg-on-surface/80 px-space-sm py-space-xs font-code-telemetry text-label-xs leading-relaxed text-surface"
                >
                  {rule}
                </code>
              ))}
              <p className="font-body-sm text-body-sm text-outline">
                Avoided cost is a scenario benefit, not a budget saving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
