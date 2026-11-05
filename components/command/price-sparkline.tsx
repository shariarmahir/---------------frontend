import type { PriceObservation } from "@/lib/command/prices";
import { taka } from "./kit";

/**
 * A 7-day price sparkline for Price watch: one 2px line in the quiet navy
 * tint, today's point marked (gold, red when over the fixed price), and the
 * limit drawn behind it: a dashed line at the fixed price, or a faint band for
 * the reference range. One series, so no legend; the aria-label reads out the
 * values, and each point names its day and price on hover.
 */

const W = 112;
const H = 32;
const PAD = 4;

const DAY = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short" });
/** A Bangladesh calendar day (selectors' bdDay) as "22 Oct". */
const dayLabel = (day: number): string => DAY.format(day * 86_400_000);

export function PriceSparkline({ o, day }: { o: PriceObservation; day: number }) {
  const s = o.series;
  const f = o.item.fixed;
  const r = o.item.reference;
  // The limit belongs in the frame, so the line reads against it.
  const limits = f ? [f.priceTk] : r ? [r.lowTk, r.highTk] : [];
  let lo = Math.min(...s, ...limits);
  let hi = Math.max(...s, ...limits);
  if (hi - lo < 1) {
    lo -= 1;
    hi += 1;
  }
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (s.length - 1);
  const y = (v: number) => PAD + ((hi - v) * (H - 2 * PAD)) / (hi - lo);
  const points = s.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = s.length - 1;
  const over = o.status === "over-ceiling";
  const label =
    `Last 7 days, oldest first: ${s.map((v) => taka(v)).join(", ")}.` +
    (f ? ` Fixed price ${taka(f.priceTk)}.` : r ? ` Reference range ${taka(r.lowTk)} to ${taka(r.highTk)}.` : "");

  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block shrink-0 overflow-visible">
      {r ? <rect x={0} y={y(r.highTk)} width={W} height={Math.max(1, y(r.lowTk) - y(r.highTk))} rx={2} className="fill-white/8" /> : null}
      {f ? <line x1={0} x2={W} y1={y(f.priceTk)} y2={y(f.priceTk)} strokeWidth={1} strokeDasharray="3 3" className="stroke-white/45" /> : null}
      <polyline points={points} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="stroke-bdnavy-300" />
      <circle cx={x(last)} cy={y(s[last])} r={3.5} strokeWidth={2} className={over ? "fill-crimson-bright stroke-bdnavy-900" : "fill-signal-orange stroke-bdnavy-900"} />
      {s.map((v, i) => (
        // Hit targets wider than the marks; the native tooltip names the day.
        <circle key={i} cx={x(i)} cy={y(v)} r={7} className="fill-transparent">
          <title>{`${dayLabel(day - last + i)}: ${taka(v)}`}</title>
        </circle>
      ))}
    </svg>
  );
}
