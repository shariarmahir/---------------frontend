import { Icon } from "@/components/ui/icon";
import { reformStages } from "@/data/amar-bangladesh";
import { chapterById } from "@/data/bangladesh";
import { Card, ChapterLink, type Surface, Section } from "./kit";

const stage = (id: string) => reformStages.find((s) => s.id === id)!;

/* The dossier's reform stages in three phases: the first 100 days open the first. */
const PHASES = [
  { horizon: "First 100 days to year 2", actions: [...stage("first-100").actions.slice(0, 2), stage("years-0-2").actions[6]] },
  { horizon: "Years 3 to 5", actions: stage("years-3-5").actions.slice(0, 3) },
  { horizon: "Years 5 to 10", actions: stage("years-5-10").actions.slice(0, 3) },
];

/* Who does what, in English from the solutions chapter's three columns (data/desh.ts, DUTY_COLUMNS). */
const ROLES: { who: string; icon: string; lead: string; items: string[]; surface: Surface }[] = [
  {
    who: "The citizen",
    icon: "person_check",
    lead: "The state cannot do it alone, and when it fails we do not stop.",
    items: ["Obey the law and pay tax", "Never pay a bribe; ask for a receipt", "Report with evidence, not rumour", "Vote, and keep asking questions"],
    surface: "ink",
  },
  {
    who: "The community",
    icon: "diversity_3",
    lead: "Kindness is our oldest strength: in floods, in cyclones, in 1971.",
    items: ["Stand by neighbours in trouble", "Teach young people a skill", "Give blood and volunteer", "Honour honest people in public"],
    surface: "navy",
  },
  {
    who: "The state",
    icon: "account_balance",
    lead: "Rules, services and justice are the state's to guarantee.",
    items: ["Police fair markets and punish hoarding", "Timely, transparent public services", "Fast and impartial justice", "Accurate, open data"],
    surface: "cobalt",
  },
];

/** 7 · What solving looks like: the roadmap in three phases, then who does what. */
export function LandingSolutions() {
  const c = chapterById("solutions");
  return (
    <Section id="solutions" title={c.title} lede={c.lede} action={<ChapterLink chapter="solutions" />}>
      <h3 className="font-grotesk text-xl font-bold text-white sm:text-2xl">A roadmap in three phases</h3>
      <ol className="mt-6 grid gap-8 md:grid-cols-3 md:gap-6">
        {PHASES.map((p, i) => (
          <li key={p.horizon} className="relative">
            <div className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-signal-orange font-grotesk text-lg font-bold text-text-primary">
                <span className="sr-only">Phase </span>
                {i + 1}
              </span>
              {i < PHASES.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-white/20 md:block" />}
            </div>
            <h4 className="mt-5 font-grotesk text-lg font-bold text-signal-orange">{p.horizon}</h4>
            <ul className="mt-3 grid gap-2.5">
              {p.actions.map((a) => (
                <li key={a} className="flex gap-2.5 text-sm leading-relaxed text-white/80">
                  <Icon name="check" className="mt-0.5 shrink-0 text-base! text-bdnavy-300" />
                  {a}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <h3 className="mt-16 font-grotesk text-xl font-bold text-white sm:text-2xl">Who does what</h3>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {ROLES.map((r) => (
          <li key={r.who}>
            <Card surface={r.surface} className="h-full">
              <Icon name={r.icon} className="text-3xl! text-signal-orange" />
              <h4 className="mt-4 font-grotesk text-xl font-bold text-signal-orange">{r.who}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{r.lead}</p>
              <ul className="mt-5 grid gap-2 border-t border-white/12 pt-5">
                {r.items.map((it) => (
                  <li key={it} className="flex gap-2.5 text-sm leading-relaxed text-white">
                    <Icon name="arrow_right_alt" className="mt-0.5 shrink-0 text-base! text-white/65" />
                    {it}
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
