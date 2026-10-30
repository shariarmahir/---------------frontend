import Link from "next/link";
import { Card, Section, type Surface } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { sourcePoints } from "@/data/amar-bangladesh";
import { CRISIS_ATTACKS } from "@/data/desh";

const SURFACES: Surface[] = ["navy", "ink", "cobalt"];
const topic = (n: number) => sourcePoints.find((p) => p.n === n)?.topic;

/**
 * The national crisis as the attacks an ordinary household feels, each
 * paired with the shield a citizen can raise today and the dossier problem
 * it belongs to. The attack is marked in the flag's red, the shield in gold.
 */
export function CrisisAttacks() {
  return (
    <Section
      id="attacks"
      title="Eight attacks on the household, and a shield against each"
      lede="A crisis is not a distant word; it comes into our homes every day. The government cannot handle all of it right now, so the first duty to protect our area, our city and our country falls on us."
    >
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CRISIS_ATTACKS.map((a, i) => (
          <li key={a.id} className="story-reveal flex">
            <Card surface={SURFACES[i % 3]} className="flex w-full flex-col p-6 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-national-crimson text-white">
                  <Icon name={a.icon} className="text-2xl" />
                </span>
                <h3 className="font-grotesk text-lg leading-snug font-bold text-balance">{a.threat}</h3>
              </div>
              <p className="mt-4 text-base leading-relaxed text-white/80">{a.feels}</p>
              <div className="mt-5 flex-1 border-t border-white/12 pt-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Icon name="shield" filled className="text-lg text-signal-orange" />
                  Your shield
                </p>
                <p className="mt-2 text-base leading-relaxed text-white">{a.shield}</p>
              </div>
              <Link
                href={`/bangladesh/problems#p-${a.problem}`}
                className="group mt-5 -mb-2 inline-flex min-h-11 items-center gap-1.5 self-start rounded-md text-sm font-semibold text-white transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
              >
                <span>
                  Problem {a.problem}
                  <span className="font-normal">: {topic(a.problem)}</span>
                </span>
                <Icon name="arrow_forward" className="text-base transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
