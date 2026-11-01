import type { Metadata } from "next";
import { CONTAINER, Crumbs, GovAnchor, Intro, LINK, LinkList, Looking, SectionTitle, Tile, TitleHero } from "@/components/bd-gov/kit";
import { NATIONAL_PORTAL as NP } from "@/data/bd-gov";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bangladesh National Portal | BD Guide",
  description:
    "What the Bangladesh National Portal (bangladesh.gov.bd) holds: the government's offices in numbers, every citizen service category, emergency and helpline numbers, and the way to business and investment services.",
};

/**
 * The national portal, in usa.gov's dress: the same title, photo band,
 * lede and cards, carrying what bangladesh.gov.bd holds. Its counts, its
 * service categories, its hotlines and its offices, each linked to the
 * portal's own page.
 */
export default function NationalPortalPage() {
  return (
    <>
      <Crumbs
        trail={[
          { label: "Home", href: "/bangladesh/government" },
          { label: "Bangladesh and its government", href: "/bangladesh/government/about" },
          { label: NP.title, href: "/bangladesh/government/national-portal" },
        ]}
      />
      <TitleHero title={NP.title} hero={NP.hero} popular={NP.popular} />
      <Intro>{NP.intro}</Intro>

      <section aria-labelledby="glance" className="mt-8 bg-gv-gold py-10">
        <div className={CONTAINER}>
          <h2 id="glance" className="sr-only">
            {NP.glance.title}
          </h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {NP.glance.stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1.5 p-5">
                <dt className="text-base leading-tight">{s.label}</dt>
                <dd className="order-first font-gv-serif text-[2.1rem] leading-none font-bold text-gv-navy">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="services" className="mt-16 bg-white py-10 lg:py-12">
        <div className={CONTAINER}>
          <SectionTitle id="services" className="text-gv-gold">{NP.services.title}</SectionTitle>
          <p className="mt-3 max-w-[68ch]">{NP.services.lede}</p>
        </div>
        <div className="mt-6">
          <ul aria-label={NP.services.title} className={cn(CONTAINER, "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5")}>
            {NP.services.items.map((s) => (
              <li key={s.title} className="flex">
                <Tile title={s.title} sub={s.bn} href={s.href} icon={s.icon} symbol={s.symbol} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="hotlines" className={cn(CONTAINER, "mt-16")}>
        <SectionTitle id="hotlines">{NP.hotlines.title}</SectionTitle>
        <p className="mt-3 max-w-[68ch]">{NP.hotlines.lede}</p>
        <ul className="mt-6 grid border-t border-gv-line sm:grid-cols-2 lg:grid-cols-3">
          {NP.hotlines.items.map((h) => (
            <li key={h.tel} className="flex items-baseline gap-4 border-b border-gv-line py-3 sm:pr-6">
              <a href={`tel:${h.tel}`} className="min-w-[5.5rem] font-gv-serif text-[1.34rem] font-bold text-gv-sun underline-offset-4 hover:underline">
                {h.tel}
              </a>
              <span>{h.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="offices" className={cn(CONTAINER, "mt-16")}>
        <SectionTitle id="offices">{NP.about.title}</SectionTitle>
        <LinkList links={NP.about.links} label={NP.about.title} />
      </section>

      <section aria-labelledby="business" className={cn(CONTAINER, "mt-16")}>
        <SectionTitle id="business">{NP.business.title}</SectionTitle>
        <LinkList links={NP.business.links} label={NP.business.title} />
      </section>

      <div className="mt-12">
        <Looking {...NP.looking} />
      </div>
      <p className={cn(CONTAINER, "mt-3 text-base text-gv-ink/70")}>
        Gathered from{" "}
        <GovAnchor href="https://bangladesh.gov.bd" className={LINK}>
          bangladesh.gov.bd
        </GovAnchor>{" "}
        on 1 November 2026. Numbers and services change; the portal is always the authority.
      </p>
    </>
  );
}
