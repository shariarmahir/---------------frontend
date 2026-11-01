import type { Metadata } from "next";
import { CONTAINER, CardGroup, Crumbs, GovAnchor, Intro, LINK, LinkList, Looking, SectionTitle, TitleHero } from "@/components/bd-gov/kit";
import { ABOUT, BRANCHES, FACTS, OFFICES } from "@/data/bd-gov";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bangladesh and its government | BD Guide",
  description:
    "Facts about Bangladesh, its laws, history and statistics; the branches of its government; and the way to every ministry, office and public service. An independent guide by Kandari-Lab.",
};

/**
 * usa.gov's "The U.S. and its government", for Bangladesh: the title, the
 * photo band with the most-used links, the lede and nine cards; then the
 * detail the cards point at: the branches, the facts and the top offices.
 */
export default function GovernmentPage() {
  return (
    <>
      <Crumbs trail={[{ label: "Home", href: "/bangladesh/government" }, { label: ABOUT.title, href: "/bangladesh/government/about" }]} />
      <TitleHero title={ABOUT.title} hero={ABOUT.hero} popular={ABOUT.popular} />
      <Intro>{ABOUT.intro}</Intro>
      <CardGroup cards={ABOUT.cards} label={ABOUT.title} className="mt-8" />
      <Looking {...ABOUT.looking} />

      <section aria-labelledby="branches" className={cn(CONTAINER, "mt-20")}>
        <SectionTitle id="branches">{BRANCHES.title}</SectionTitle>
        <p className="mt-4 max-w-[68ch] font-gv-serif text-[1.04rem] leading-[1.6]">{BRANCHES.lede}</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {BRANCHES.branches.map((b) => (
            <article key={b.name} className="flex flex-col rounded-2xl bg-gv-paper p-7 ring-1 ring-gv-ink/8">
              <h3 className="font-gv-serif text-[1.34rem] leading-[1.3] font-bold">{b.name}</h3>
              <p className="mt-1 font-bold">{b.body}</p>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                {b.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <GovAnchor href={b.link.href} className={cn(LINK, "mt-auto pt-5")}>
                {b.link.label}
              </GovAnchor>
            </article>
          ))}
        </div>
      </section>

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
