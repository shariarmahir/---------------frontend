import type { Metadata } from "next";
import Image from "next/image";
import { CardIcon } from "@/components/ui/card-icon";
import { Icon } from "@/components/ui/icon";
import { CONTAINER, CardGroup, GovAnchor, PhotoCredit } from "@/components/bd-gov/kit";
import { ALL_TOPICS as HOME, TOPICS } from "@/data/bd-gov";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All topics and services | BD Guide",
  description:
    "Every way into the Bangladesh government's services, from passports and exam results to land, tax and emergency numbers. An independent guide by Kandari-Lab that links straight to the official pages.",
};

/**
 * The guide's home page, after usa.gov's: the flag beside a welcome box, the
 * "How do I ..." panel bridging into the navy band, the jump link, one
 * featured topic, then every topic and service as an icon card.
 */
export default function GovernmentHomePage() {
  return (
    <>
      <section aria-labelledby="welcome" className="relative isolate bg-gv-green">
        <div className="absolute inset-y-0 left-0 -z-10 w-full lg:w-[53%]">
          <Image src={HOME.hero.src} alt={HOME.hero.alt} fill priority sizes="(min-width: 1024px) 53vw, 100vw" className="object-cover" style={{ objectPosition: HOME.hero.focus }} />
          <PhotoCredit photo={HOME.hero} className="right-auto left-3 lg:left-auto lg:right-3" />
        </div>
        <div className={cn(CONTAINER, "flex min-h-[20.5rem] items-start justify-end pt-64 pb-10 lg:pt-6 lg:pb-24")}>
          <div className="w-full rounded-2xl bg-gv-navy px-[1.9rem] pt-[1.9rem] pb-[2.2rem] text-white shadow-[0_24px_48px_-12px_rgb(0_0_0/0.45)] ring-1 ring-white/10 lg:w-[35rem]">
            <h1 id="welcome" className="font-gv-serif text-[1.95rem] leading-[1.15] font-bold">
              {HOME.title}
            </h1>
            <p className="mt-4 text-[1.13rem] leading-normal">{HOME.lede}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="how" className="bg-gv-card-ground pb-6">
        <div className={CONTAINER}>
          <div className="relative -mt-14 rounded-2xl bg-white px-5 pt-5 pb-5 shadow-[0_20px_44px_-30px_rgb(11_24_73/0.35)] ring-1 ring-gv-navy/10 sm:px-10 sm:pt-6">
            <h2 id="how" className="font-gv-sans text-[1.35rem] leading-tight font-bold text-gv-navy">
              {HOME.howTitle}
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {HOME.how.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="flex min-h-15 items-center justify-center rounded-md bg-gv-navy px-4 py-3 text-center text-[0.98rem] leading-snug font-bold text-gv-gold shadow-[0_6px_14px_-10px_rgb(11_24_73/0.8)] transition-colors duration-200 hover:bg-gv-green hover:text-gv-gold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-gold motion-reduce:transition-none"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <a href="#all-topics" className="group mx-auto mt-5 flex w-fit flex-col items-center gap-2 text-[1.06rem] font-semibold text-gv-navy underline underline-offset-4 hover:text-gv-green focus-visible:outline-3 focus-visible:outline-gv-navy">
            {HOME.jump}
            <span aria-hidden className="grid size-10 place-items-center rounded-full bg-gv-gold text-gv-navy shadow-[0_5px_12px_-5px_rgb(11_24_73/0.5)] ring-2 ring-white transition-transform group-hover:translate-y-0.5">
              <Icon name="expand_more" className="text-3xl!" />
            </span>
          </a>
        </div>
      </section>

      <div className="bg-gv-feature py-4 pb-8 sm:py-6">
        <section aria-labelledby="featured" className={CONTAINER}>
          <div className="grid items-center gap-5 px-5 py-6 sm:px-8 sm:py-7 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-7">
            <span aria-hidden className="grid size-18 place-items-center sm:size-20">
              <CardIcon name={`gov/${HOME.featured.icon}`} fallback={HOME.featured.symbol} size={64} delay={3200} />
            </span>
            <div className="lg:pr-10">
              <h2 id="featured" className="font-gv-serif text-[1.65rem] leading-[1.17] font-bold text-gv-navy sm:text-[1.95rem]">
                {HOME.featured.title}
              </h2>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-gv-ink/90 sm:text-[1.13rem]">{HOME.featured.text}</p>
            </div>
            <GovAnchor
              href={HOME.featured.cta.href}
              className="inline-flex min-h-13 items-center justify-center rounded-md bg-gv-navy px-8 text-[1.08rem] font-bold text-white shadow-[0_12px_24px_-12px_rgb(11_24_73/0.5)] transition-colors duration-300 hover:bg-gv-green focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-navy lg:w-65"
            >
              {HOME.featured.cta.label}
            </GovAnchor>
          </div>
        </section>
      </div>

      <section aria-labelledby="all-topics" data-flush className="mt-16">
        <h2 id="all-topics" className={cn(CONTAINER, "scroll-mt-4 pb-[5px] font-gv-serif text-[1.95rem] leading-[1.15] font-bold text-gv-navy")}>
          {TOPICS.title}
        </h2>
        <CardGroup cards={TOPICS.cards} label={TOPICS.title} columns={3} className="pb-24 lg:pb-28" />
      </section>
    </>
  );
}
