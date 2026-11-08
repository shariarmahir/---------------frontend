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
      <section aria-labelledby="welcome" className="relative isolate overflow-hidden bg-ml-night text-white">
        <div className="absolute inset-0 -z-10 lg:left-[40%]">
          <Image src={HOME.hero.src} alt={HOME.hero.alt} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover opacity-55 lg:opacity-100" style={{ objectPosition: HOME.hero.focus }} />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ml-night via-ml-night/70 to-ml-night/40 lg:bg-linear-to-r lg:from-ml-night lg:via-ml-night/40 lg:via-35% lg:to-transparent" />
          <PhotoCredit photo={HOME.hero} />
        </div>
        <div className={cn(CONTAINER, "pt-14 pb-16 lg:pt-24 lg:pb-28")}>
          <div className="lg:max-w-[56%]">
            <p className="font-ml-serif text-base text-white/90">{HOME.line}</p>
            <h1 id="welcome" className="mt-5 font-ml-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] font-normal tracking-[-0.015em] text-balance text-ml-paper">
              {HOME.title}
            </h1>
            <p className="mt-5 max-w-[54ch] text-[1.13rem] leading-relaxed text-white/75 lg:text-xl">{HOME.lede}</p>
            <form role="search" action={PORTAL_PAGE} method="get" className="mt-9 flex max-w-2xl items-center gap-2 rounded-full bg-white p-2 shadow-[0_24px_50px_-24px_rgb(0_0_0/0.8)] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-signal-orange">
              <label htmlFor="home-search" className="sr-only">
                Search government services, in English or Bangla
              </label>
              <Icon name="search" className="ml-3 shrink-0 text-2xl! text-ml-night" />
              <input
                id="home-search"
                type="search"
                name="q"
                placeholder="Passport, পাসপোর্ট, land tax…"
                autoComplete="off"
                className="h-12 min-w-0 flex-1 bg-transparent px-1 text-lg text-ml-night outline-none placeholder:text-gv-ink/55"
              />
              <button type="submit" className="h-12 shrink-0 cursor-pointer rounded-full bg-signal-orange px-6 font-semibold text-ml-night transition-colors duration-300 hover:bg-ml-night hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-night">
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
          <ul className="grid gap-4 md:grid-cols-3 lg:gap-5">
            {HOME.doors.map((d) => (
              <li key={d.title} className="flex">
                <Link
                  href={d.href}
                  className="group flex w-full flex-col rounded-[1.25rem] bg-gv-card-ground p-6 ring-1 ring-gv-navy/8 transition-[background-color,color,box-shadow] duration-300 hover:bg-ml-night hover:text-white hover:shadow-[0_30px_60px_-30px_rgb(11_24_73/0.6)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green lg:p-7"
                >
                  <Icon name={d.symbol} className="text-[2rem]! text-gv-green transition-colors duration-300 group-hover:text-signal-orange" />
                  <span className="mt-4 font-ml-serif text-[1.6rem] leading-[1.12]">{d.title}</span>
                  <span lang="bn" className="mt-1 font-bengali text-[0.98rem] opacity-75">
                    {d.bn}
                  </span>
                  <span className="mt-3 leading-snug text-pretty opacity-85">{d.text}</span>
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
            <Link href={PORTAL_PAGE} className="inline-flex min-h-12 items-center rounded-full bg-ml-night px-6 font-semibold text-white transition-colors duration-300 hover:bg-gv-green focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green">
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
            <h2 id="featured" className="font-ml-serif text-[1.65rem] leading-[1.17] font-normal text-ml-night sm:text-[2.2rem]">
              {HOME.featured.title}
            </h2>
            <p className="mt-2 text-[1.05rem] leading-relaxed text-gv-navy sm:text-[1.13rem]">{HOME.featured.text}</p>
          </div>
          <GovAnchor href={HOME.featured.cta.href} className="inline-flex min-h-13 items-center justify-center rounded-full bg-ml-night px-8 text-[1.08rem] font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-ml-night focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white">
            {HOME.featured.cta.label}
          </GovAnchor>
        </div>
      </section>

      <section aria-labelledby="all-topics" data-flush className="pt-14 lg:pt-20">
        <h2 id="all-topics" className={cn(CONTAINER, "scroll-mt-4 pb-2 font-ml-serif text-[clamp(2rem,3.4vw,3rem)] leading-[1.08] font-normal text-ml-night")}>
          {TOPICS.title}
        </h2>
        <CardGroup cards={TOPICS.cards} label={TOPICS.title} className="bg-white pb-20" />
      </section>
    </>
  );
}
