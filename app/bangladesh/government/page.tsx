import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CONTAINER, CardGroup, GovAnchor, PhotoCredit, SectionTitle } from "@/components/bd-gov/kit";
import { ServiceCard } from "@/components/bd-gov/service-card";
import { CardIcon } from "@/components/ui/card-icon";
import { Icon } from "@/components/ui/icon";
import { ALL_TOPICS as HOME, TOPICS } from "@/data/bd-gov";
import { TOP_SERVICES } from "@/data/bd-gov-services";
import { cn } from "@/lib/utils";

const PORTAL_PAGE = "/bangladesh/government/national-portal";

export const metadata: Metadata = {
  alternates: { canonical: "/bangladesh/government" },
  title: "Bangladesh government guide | BD Guide",
  description:
    "Every way into the Bangladesh government's services, from passports and exam results to land, tax and emergency numbers, for people who live here, Bangladeshis abroad and visitors. An independent guide by Kandari-Lab that links to the official source.",
};

/** The guide's home: search first, the three kinds of reader, the most-used services, the emergency numbers, then every topic. */
export default function GovernmentHomePage() {
  return (
    <>
      <section aria-labelledby="welcome" className="relative isolate overflow-hidden bg-gv-navy text-white">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 lg:block">
          <Image src={HOME.hero.src} alt={HOME.hero.alt} fill priority sizes="50vw" className="object-cover" style={{ objectPosition: HOME.hero.focus }} />
          <div aria-hidden className="absolute inset-0 bg-linear-to-r from-gv-navy via-gv-navy/25 via-35% to-transparent" />
          <PhotoCredit photo={HOME.hero} />
        </div>
        <div className={cn(CONTAINER, "py-12 lg:py-20")}>
          <div className="lg:max-w-[52%]">
            <h1 id="welcome" className="font-gv-serif text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.12] font-bold text-balance">
              {HOME.title}
            </h1>
            <p className="mt-5 max-w-[56ch] text-[1.13rem] leading-relaxed text-white/90 lg:text-xl">{HOME.lede}</p>
            <form role="search" action={PORTAL_PAGE} method="get" className="mt-8 flex gap-2">
              <label htmlFor="home-search" className="sr-only">
                Search government services, in English or Bangla
              </label>
              <input
                id="home-search"
                type="search"
                name="q"
                placeholder="Passport, পাসপোর্ট, land tax…"
                autoComplete="off"
                className="h-16 min-w-0 flex-1 rounded-xl bg-white px-5 text-lg text-gv-navy placeholder:text-gv-ink/60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-gold"
              />
              <button type="submit" className="h-16 shrink-0 cursor-pointer rounded-xl bg-gv-gold px-6 text-lg font-bold text-gv-navy transition-colors duration-200 hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section aria-labelledby="who" className="bg-white py-12 lg:py-16">
        <div className={CONTAINER}>
          <h2 id="who" className="sr-only">
            {HOME.doorsTitle}
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {HOME.doors.map((d) => (
              <li key={d.title} className="flex">
                <Link href={d.href} className="group flex w-full gap-4 rounded-xl bg-gv-card-ground p-6 ring-1 ring-gv-navy/10 transition-colors duration-200 hover:bg-gv-navy hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green">
                  <Icon name={d.symbol} className="shrink-0 text-[2rem]! text-gv-green group-hover:text-gv-gold" />
                  <span className="min-w-0">
                    <span className="block text-[1.2rem] leading-snug font-bold">{d.title}</span>
                    <span lang="bn" className="mt-0.5 block font-bengali opacity-80">
                      {d.bn}
                    </span>
                    <span className="mt-2 block leading-snug text-pretty">{d.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="most-used" className="bg-gv-card-ground py-14 lg:py-20">
        <div className={CONTAINER}>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div>
              <SectionTitle id="most-used" className="text-gv-navy">
                {HOME.howTitle}
              </SectionTitle>
              <p className="mt-2 text-lg">{HOME.howLede}</p>
            </div>
            <Link href={PORTAL_PAGE} className="inline-flex min-h-12 items-center rounded-lg bg-gv-navy px-5 font-bold text-white transition-colors duration-200 hover:bg-gv-green focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green">
              {HOME.jump}
            </Link>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TOP_SERVICES.map((s) => (
              <li key={s.id} className="flex">
                <ServiceCard service={s} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="featured" className="bg-gv-feature py-8">
        <div className={cn(CONTAINER, "grid items-center gap-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-7")}>
          <span aria-hidden className="grid size-18 place-items-center sm:size-20">
            <CardIcon name={`gov/${HOME.featured.icon}`} fallback={HOME.featured.symbol} size={64} delay={3200} />
          </span>
          <div>
            <h2 id="featured" className="font-gv-serif text-[1.65rem] leading-[1.17] font-bold text-gv-navy sm:text-[1.95rem]">
              {HOME.featured.title}
            </h2>
            <p className="mt-2 text-[1.05rem] leading-relaxed text-gv-navy sm:text-[1.13rem]">{HOME.featured.text}</p>
          </div>
          <GovAnchor href={HOME.featured.cta.href} className="inline-flex min-h-13 items-center justify-center rounded-lg bg-gv-navy px-8 text-[1.08rem] font-bold text-white transition-colors duration-200 hover:bg-white hover:text-gv-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white">
            {HOME.featured.cta.label}
          </GovAnchor>
        </div>
      </section>

      <section aria-labelledby="all-topics" data-flush className="pt-14 lg:pt-20">
        <h2 id="all-topics" className={cn(CONTAINER, "scroll-mt-4 pb-2 font-gv-serif text-[1.95rem] leading-[1.15] font-bold text-gv-navy")}>
          {TOPICS.title}
        </h2>
        <CardGroup cards={TOPICS.cards} label={TOPICS.title} columns={4} className="bg-white pb-20" />
      </section>
    </>
  );
}
