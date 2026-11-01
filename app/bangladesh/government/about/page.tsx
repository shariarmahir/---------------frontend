import type { Metadata } from "next";
import { CONTAINER, CardGroup, Crumbs, Intro, LINK, LinkList, Looking, SectionTitle, TitleHero } from "@/components/bd-gov/kit";
import { ABOUT, FACTS, OFFICES } from "@/data/bd-gov";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
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

      <section aria-labelledby="facts" className={cn(CONTAINER, "mt-20")}>
        <SectionTitle id="facts">{FACTS.title}</SectionTitle>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <table className="w-full border-collapse text-left text-[1.06rem]">
            <caption className="sr-only">{FACTS.title}</caption>
            <tbody>
              {FACTS.rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" className="w-2/5 border border-gv-ink bg-gv-line px-4 py-2 align-top font-bold">
                    {k}
                  </th>
                  <td className="border border-gv-ink px-4 py-2">{v}</td>
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

      <section aria-labelledby="offices" className={cn(CONTAINER, "mt-20")}>
        <SectionTitle id="offices">{OFFICES.title}</SectionTitle>
        <p className="mt-4 max-w-[68ch]">{OFFICES.lede}</p>
        <LinkList links={OFFICES.links} label={OFFICES.title} />
      </section>
    </>
  );
}
