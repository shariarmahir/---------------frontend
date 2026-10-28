import { Icon } from "@/components/ui/icon";
import { nationalStats, type NationalStat, type RiskTone } from "@/data/national-index";
import { cn } from "@/lib/utils";
import { Card, Section } from "./kit";

/*
 * Each reading's state, never colour alone: an icon and a word on the pill,
 * the same colour on the meter. Gold is good, a navy tint is "watch", red
 * is kept for the critical.
 */
const TONE: Record<RiskTone, { label: string; icon: string; text: string; fill: string; track: string }> = {
  stable: { label: "Stable", icon: "check_circle", text: "text-signal-orange", fill: "bg-signal-orange", track: "bg-signal-orange/20" },
  watch: { label: "Watch", icon: "visibility", text: "text-bdnavy-300", fill: "bg-bdnavy-300", track: "bg-bdnavy-300/20" },
  critical: { label: "Critical", icon: "warning", text: "text-crimson-bright", fill: "bg-national-crimson", track: "bg-national-crimson/25" },
};

const ORDER: RiskTone[] = ["critical", "watch", "stable"];

/** 3 · National Index: where the country stands, one meter card per reading. Home's spotlight and the header link here: /bangladesh#national-index. */
export function LandingNationalIndex() {
  return (
    <Section
      id="national-index"
      title="National Index"
      lede="Eight readings of where Bangladesh stands: the economy, the air, work, debt, waste, industry, justice and trust. Snapshots from published sources, not a live feed."
    >
      <ul className="mb-6 flex flex-wrap gap-2" aria-label="Readings by state">
        {ORDER.map((tone) => (
          <li key={tone}>
            <TonePill tone={tone} count={nationalStats.filter((s) => s.tone === tone).length} />
          </li>
        ))}
      </ul>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {nationalStats.map((s) => (
          <li key={s.id}>
            <MeterCard stat={s} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function TonePill({ tone, count }: { tone: RiskTone; count?: number }) {
  const t = TONE[tone];
  return (
    <span className={cn("inline-flex min-h-7 items-center gap-1.5 rounded-full bg-black px-3 text-xs font-semibold ring-1 ring-white/12", t.text)}>
      <Icon name={t.icon} className="text-base!" />
      {count === undefined ? t.label : `${count} ${t.label.toLowerCase()}`}
    </span>
  );
}

/** One reading: its state, the figure, the meter, the change since the last period, what it means and where it comes from. */
function MeterCard({ stat: s }: { stat: NationalStat }) {
  const t = TONE[s.tone];
  const better = s.delta ? (s.deltaDirection === "up") === Boolean(s.upIsGood) : undefined;
  return (
    <Card surface="ink" className="flex h-full flex-col p-6 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Icon name={s.icon} className="text-2xl! text-bdnavy-300" />
        <TonePill tone={s.tone} />
      </div>
      <h3 className="mt-5 font-grotesk text-lg leading-snug font-bold text-white">{s.label}</h3>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
        <span className="font-grotesk text-4xl font-bold tracking-tight text-white">{s.value}</span>
        {s.unit && <span className="text-sm font-semibold text-white/65">{s.unit}</span>}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div
          role="meter"
          aria-label={`${s.label} index`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={s.progress}
          aria-valuetext={`${s.progress} of 100, ${t.label.toLowerCase()}`}
          className={cn("h-2 flex-1 overflow-hidden rounded-full", t.track)}
        >
          <div className={cn("h-full rounded-full", t.fill)} style={{ width: `${s.progress}%` }} />
        </div>
        <span aria-hidden className="text-xs font-semibold text-white/65 tabular-nums">
          {s.progress}/100
        </span>
      </div>
      {s.delta && (
        <p className={cn("mt-4 flex items-center gap-1.5 text-sm font-semibold", better ? "text-signal-orange" : "text-crimson-bright")}>
          <Icon name={s.deltaDirection === "up" ? "trending_up" : "trending_down"} className="text-lg!" />
          {s.delta}
          <span className="font-normal text-white/80">{better ? "· improving" : "· worsening"}</span>
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-white/80">{s.caption}</p>
      <p className="mt-auto pt-5 text-xs leading-relaxed text-white/65">Source: {s.source}</p>
    </Card>
  );
}
