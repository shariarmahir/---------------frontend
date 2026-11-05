import type { Metadata } from "next";
import { CONTAINER, CardGroup, Crumbs, Intro, LINK, LinkList, Looking, SectionTitle, TitleHero } from "@/components/bd-gov/kit";
import { ABOUT, FACTS, GOV_TODAY, LEVELS, OFFICES } from "@/data/bd-gov";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: "/bangladesh/government/about" },
  title: "Bangladesh and its government | BD Guide",
  description:
    "Facts about Bangladesh, its laws, history and statistics; the branches of its government; and the way to every ministry, office and public service. An independent guide by Kandari-Lab.",
};

/**
 * usa.gov's "The U.S. and its government", for Bangladesh: the title, the
 * photo band with the most-used links, the lede and nine cards (most open
 * their own page); then the facts and the top offices.
 */
export default function GovernmentPage() {
  return (
    <>
      <Crumbs trail={[{ label: "Home", href: "/bangladesh/government" }, { label: ABOUT.title, href: "/bangladesh/government/about" }]} />
      <TitleHero title={ABOUT.title} hero={ABOUT.hero} popular={ABOUT.popular} />
      <Intro>{ABOUT.intro}</Intro>
      <CardGroup cards={ABOUT.cards} label={ABOUT.title} className="mt-8" />
      <Looking {...ABOUT.looking} />

      <section aria-labelledby="today" className="mt-16 bg-gv-navy py-14 text-white lg:py-20">
        <div className={CONTAINER}>
          <SectionTitle id="today" className="text-white">
            {GOV_TODAY.title}
          </SectionTitle>
          <p className="mt-3 max-w-[64ch] text-lg text-white/90">{GOV_TODAY.lede}</p>
          <dl className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {GOV_TODAY.points.map((p) => (
              <div key={p.title} className="border-t-2 border-gv-gold pt-4">
                <dt className="text-[1.2rem] font-bold text-gv-gold">{p.title}</dt>
                <dd className="mt-2 leading-relaxed text-pretty">{p.text}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
            {GOV_TODAY.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline underline-offset-4 hover:text-gv-gold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-gold">
                  {l.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="levels" className={cn(CONTAINER, "mt-16")}>
        <SectionTitle id="levels" className="text-gv-navy">
          {LEVELS.title}
        </SectionTitle>
        <p className="mt-3 max-w-[64ch] text-lg">{LEVELS.lede}</p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {LEVELS.items.map((l) => (
            <li key={l.name} className="rounded-xl bg-gv-card-ground p-5 ring-1 ring-gv-navy/10">
              <p className="font-gv-serif text-[2rem] leading-none font-bold text-gv-navy">{l.count}</p>
              <h3 className="mt-2 text-[1.1rem] font-bold text-gv-navy">{l.name}</h3>
              <p className="mt-1.5 leading-snug text-pretty">{l.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="facts" className={cn(CONTAINER, "mt-20")}>
        <SectionTitle id="facts" className="text-gv-navy">{FACTS.title}</SectionTitle>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <table className="w-full border-collapse text-left text-[1.06rem]">
            <caption className="sr-only">{FACTS.title}</caption>
            <tbody>
              {FACTS.rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" className="w-2/5 border-b border-gv-line py-3 pr-4 align-top font-bold text-gv-navy">
                    {k}
                  </th>
                  <td className="border-b border-gv-line py-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <h3 className="font-gv-serif text-[1.34rem] font-bold">{FACTS.holidays.title}</h3>
            <dl className="mt-4 divide-y divide-gv-line border-y border-gv-line">
              {FACTS.holidays.items.map(([date, name]) => (
                <div key={date} className="py-3">
                  <dt className="font-bold">{date}</dt>
                  <dd>{name}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5">
              Official statistics:{" "}
              <a href={FACTS.source.href} className={LINK}>
                {FACTS.source.label}
              </a>
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="offices" className={cn(CONTAINER, "mt-20 pb-20")}>
        <SectionTitle id="offices" className="text-gv-navy">{OFFICES.title}</SectionTitle>
        <p className="mt-4 max-w-[68ch]">{OFFICES.lede}</p>
        <LinkList links={OFFICES.links} label={OFFICES.title} />
      </section>
    </>
  );
}
