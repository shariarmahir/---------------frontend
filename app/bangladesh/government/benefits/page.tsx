import type { Metadata } from "next";
import { CardGroup, Crumbs, Intro, Looking, TitleHero } from "@/components/bd-gov/kit";
import { BENEFITS } from "@/data/bd-gov";

export const metadata: Metadata = {
  alternates: { canonical: "/bangladesh/government/benefits" },
  title: "Government benefits | BD Guide",
  description:
    "Bangladesh government programmes that help with food, housing, health care and living costs: allowances, stipends, the universal pension and more. An independent guide by Kandari-Lab.",
};

/**
 * usa.gov/benefits, for Bangladesh: the title, the photo band with the
 * most-used links, the lede, then one card for each kind of help, each
 * opening its own page.
 */
export default function BenefitsPage() {
  return (
    <>
      <Crumbs trail={[{ label: "Home", href: "/bangladesh/government" }, { label: BENEFITS.title, href: "/bangladesh/government/benefits" }]} />
      <TitleHero title={BENEFITS.title} hero={BENEFITS.hero} popular={BENEFITS.popular} />
      <Intro>{BENEFITS.intro}</Intro>
      <CardGroup cards={BENEFITS.cards} label={BENEFITS.title} className="mt-8" />
      <Looking {...BENEFITS.looking} />
    </>
  );
}
