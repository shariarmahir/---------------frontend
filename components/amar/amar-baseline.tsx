import { Card, Section } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { baselineStats, evidenceRules, type BaselineStat } from "@/data/amar-bangladesh";
import { cn } from "@/lib/utils";

/** How each figure reads, always as icon and word: red only for a concern. */
const TONE: Record<BaselineStat["tone"], { label: string; icon: string; text: string; fill: string }> = {
  good: { label: "Strength", icon: "check_circle", text: "text-bdnavy-300", fill: "bg-bdnavy-300" },
  watch: { label: "Watch", icon: "visibility", text: "text-signal-orange", fill: "bg-signal-orange" },
  bad: { label: "Concern", icon: "warning", text: "text-crimson-bright", fill: "bg-crimson-bright" },
};

/**
 * The figures that are a share of the whole population, so a 0–100 meter
 * tells the truth about them. The other meters in the data are rates scaled
 * up for show (3.5% growth drawn as a third of a bar), so they are not drawn.
 */
const SHARE_OF_PEOPLE = new Set(["electricity", "sanitation", "internet"]);

/**
 * The national baseline: the denominators every later claim on the page is
 * measured against, then the three rules of evidence the dossier keeps.
 */
export function AmarBaseline() {
  return (
    <Section
      id="baseline"
      title="The numbers every claim must be measured against"
      lede="A country with substantial development gains and significant service-quality gaps at the same time. Without these denominators, “all”, “everywhere” and “many” cannot guide policy."
    >
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {baselineStats.map((stat) => (
          <li key={stat.id}>
            <BaselineTile stat={stat} />
          </li>
        ))}
      </ul>

      <Card surface="ink" className="mt-4 sm:mt-6">
        <h3 className="font-grotesk text-lg font-bold text-white">How every claim here is held</h3>
        <ul className="mt-5 grid gap-6 border-t border-white/12 pt-6 md:grid-cols-3">
          {evidenceRules.map((rule) => (
            <li key={rule.rule} className="flex gap-3">
              <Icon name={rule.icon} className="shrink-0 text-2xl! text-signal-orange" />
              <p className="text-base leading-relaxed text-white/80">{rule.rule}</p>
            </li>
          ))}
        </ul>
      </Card>
    </Section>
  );
}

/** One baseline figure: what it is, how it reads, a meter when it is a share of everyone, the note and its source. */
function BaselineTile({ stat }: { stat: BaselineStat }) {
  const tone = TONE[stat.tone];
  const share = SHARE_OF_PEOPLE.has(stat.id) ? Number.parseFloat(stat.value) : null;
  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <Icon name={stat.icon} className="text-2xl! text-signal-orange" />
        <span className="flex items-center gap-1 text-xs font-semibold text-white/80">
          <Icon name={tone.icon} className={cn("text-base!", tone.text)} />
          {tone.label}
        </span>
      </div>
      <h3 className="mt-5 text-sm font-semibold text-white">{stat.label}</h3>
      <p className="mt-1 font-grotesk text-3xl font-bold tracking-tight text-signal-orange lg:text-4xl">
        {stat.value}
        {stat.unit ? <span className="ml-1 text-base font-semibold text-white/80">{stat.unit}</span> : null}
      </p>
      {share !== null ? (
        <span aria-hidden className="mt-3 block h-1.5 w-full overflow-hidden rounded-full bg-white/12">
          <span className={cn("block h-full rounded-full", tone.fill)} style={{ width: `${share}%` }} />
        </span>
      ) : null}
      <p className="mt-3 text-sm leading-snug text-white/80">{stat.note}</p>
      <p className="mt-auto pt-4 text-xs text-white/65">{stat.source}</p>
    </Card>
  );
}
