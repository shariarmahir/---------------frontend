import Link from "next/link";
import { Card, COLUMN, Section, type Surface } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { BRAVERY, DUTY_COLUMNS, FOUNDER_QUOTE, LET_GO, RESOURCES } from "@/data/desh";
import { cn } from "@/lib/utils";

const SURFACES: Surface[] = ["navy", "ink", "cobalt"];

/** What we already have: the case that the country is not short of means. */
export function SolutionResources() {
  return (
    <Section
      id="resources"
      title="We already have enough"
      lede="The solutions do not need to be imported. People, soil, rivers and a history of standing together: this is the capital we start with."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCES.map((r, i) => (
          <li key={r.title} className="story-reveal flex">
            <Card surface={SURFACES[i % 3]} className="group flex w-full flex-col">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-black/30 text-signal-orange ring-1 ring-white/12 transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                <Icon name={r.icon} className="text-3xl" />
              </span>
              <h3 className="mt-5 font-grotesk text-xl font-bold">{r.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-white/80">{r.body}</p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** The habits to drop, the cost-of-living spiral first and largest. */
export function SolutionLetGo() {
  const [key, ...rest] = LET_GO;
  return (
    <Section
      id="let-go"
      title="What we must let go"
      lede="A large part of the problem lies in our own habits. Correct a few basic mistakes and a great deal changes."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card surface="navy" className="story-reveal flex flex-col sm:p-10">
          <span className="flex items-center gap-2 self-start rounded-full bg-national-crimson px-3 py-1 text-sm font-semibold text-white">
            <Icon name="priority_high" className="text-base" />
            Most urgent
          </span>
          <h3 className="mt-6 font-grotesk text-3xl leading-tight font-bold text-balance text-signal-orange sm:text-4xl">{key.habit}</h3>
          <p className="mt-4 text-lg leading-relaxed text-white">{key.cost}</p>
          <div className="mt-auto pt-8">
            <div className="rounded-2xl bg-black/30 p-5 ring-1 ring-white/12">
              <p className="flex items-center gap-2 text-sm font-semibold text-signal-orange">
                <Icon name="swap_horiz" className="text-xl" />
                What we do instead
              </p>
              <p className="mt-2 text-base leading-relaxed text-white">{key.instead}</p>
            </div>
          </div>
        </Card>

        <ul className="flex flex-col gap-4">
          {rest.map((h, i) => (
            <li key={h.id} className="story-reveal flex">
              <Card surface={i === 1 ? "cobalt" : "ink"} className="w-full p-6 sm:p-7">
                <h3 className="font-grotesk text-xl font-bold line-through decoration-crimson-bright decoration-2">{h.habit}</h3>
                <p className="mt-2 text-base leading-relaxed text-white/80">{h.cost}</p>
                <p className="mt-4 flex items-start gap-2.5 border-t border-white/12 pt-4 text-base leading-relaxed font-semibold text-white">
                  <Icon name="arrow_forward" className="mt-0.5 text-lg text-signal-orange" />
                  {h.instead}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/** Who does what: the state, the citizen, and everyone for each other. */
export function SolutionDuties() {
  return (
    <Section
      id="duties"
      title="Who does what"
      lede="The state must carry its own duties, but if we only wait for it, our areas fall further behind. A solution lasts when three hands work together."
    >
      <ul className="grid gap-4 lg:grid-cols-3">
        {DUTY_COLUMNS.map((d, i) => (
          <li key={d.id} className="story-reveal flex">
            <Card surface={SURFACES[i]} className="group flex w-full flex-col">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-signal-orange text-text-primary transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                <Icon name={d.icon} className="text-3xl" />
              </span>
              <h3 className="mt-5 font-grotesk text-2xl font-bold text-signal-orange">{d.who}</h3>
              <p className="mt-2 text-base leading-relaxed text-white/80">{d.lead}</p>
              <ul className="mt-6 flex flex-col gap-3 border-t border-white/12 pt-5">
                {d.items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5 text-base leading-snug text-white">
                    <Icon name="check" className="text-lg text-signal-orange" />
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

/** Mahir's words, then the courage line and where to act next. */
export function SolutionClose() {
  const [before, after] = BRAVERY.title.split(BRAVERY.accent);
  return (
    <section aria-labelledby="close-title" className={cn(COLUMN, "section-band")}>
      <div className="story-reveal mx-auto max-w-4xl text-center">
        <figure>
          <Icon name="format_quote" className="text-5xl text-bdnavy-300" />
          <blockquote className="mt-2 font-grotesk text-2xl leading-snug font-semibold text-balance text-white sm:text-3xl">“{FOUNDER_QUOTE.text}”</blockquote>
          <figcaption className="mt-5 text-base text-white/80">
            <span className="font-semibold text-signal-orange">{FOUNDER_QUOTE.author}</span>, {FOUNDER_QUOTE.role}
          </figcaption>
        </figure>

        <span aria-hidden className="mx-auto my-14 block h-px w-24 bg-white/20 sm:my-16" />

        <h2 id="close-title" className="font-grotesk text-3xl leading-tight font-bold tracking-tight text-balance text-signal-orange sm:text-4xl lg:text-5xl">
          {before}
          <span className="text-white">{BRAVERY.accent}</span>
          {after}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{BRAVERY.body}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/nagorik" className={btn.gold}>
            <Icon name="how_to_reg" className="text-xl" />
            Citizen rights and duties
          </Link>
          <Link href="/cholo-bangladesh-gori/mission" className={cn(btn.goldOutline, "bg-bdnavy-900")}>
            <Icon name="extension" className="text-xl" />
            Build Bangladesh, the game
          </Link>
          <Link href="/protibad" className={cn(btn.goldOutline, "bg-bdnavy-900")}>
            <Icon name="campaign" className="text-xl" />
            Protest wrongdoing
          </Link>
        </div>
      </div>
    </section>
  );
}
