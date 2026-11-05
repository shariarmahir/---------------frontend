import type { Metadata } from "next";
import { CONTAINER, GovAnchor, LINK, LinkList, Looking, SectionTitle } from "@/components/bd-gov/kit";
import { OneClick } from "@/components/bd-gov/one-click";
import { Icon } from "@/components/ui/icon";
import { NATIONAL_PORTAL as NP } from "@/data/bd-gov";
import { CHECKED, IN_PERSON, SCHEMES } from "@/data/bd-gov-services";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "One click to every government service | BD Guide",
  description:
    "Passport, NID, birth certificate, exam results, government jobs, bank schemes, land, tax and bills: search in English or Bangla and go straight to the official page. An independent guide, with every link checked.",
};

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;
const BAND = "py-14 lg:py-20";

/** The National Portal page: the one-click directory first, then the help, the schemes and the numbers around it. */
export default function NationalPortalPage() {
  return (
    <>
      <OneClick title={NP.title} lede={NP.intro} />

      <section aria-labelledby="how-it-works" className={cn("bg-white", BAND)}>
        <div className={CONTAINER}>
          <SectionTitle id="how-it-works" className="text-gv-navy">
            {NP.how.title}
          </SectionTitle>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {NP.how.steps.map((s, i) => (
              <li key={s.title} className="border-t-2 border-gv-green pt-5">
                <span className="font-gv-serif text-[1.6rem] font-bold text-gv-green">{i + 1}</span>
                <h3 className="mt-1 text-[1.2rem] leading-snug font-bold text-gv-navy">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-pretty">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="in-person" className={cn("bg-gv-navy text-white", BAND)}>
        <div className={CONTAINER}>
          <SectionTitle id="in-person" className="text-white">
            {NP.help.title}
          </SectionTitle>
          <p className="mt-3 max-w-[62ch] text-lg text-white/90">{NP.help.lede}</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {IN_PERSON.map((h) => (
              <li key={h.title} className="flex flex-col rounded-xl bg-white/8 p-6 ring-1 ring-white/15">
                <h3 className="text-[1.25rem] font-bold">{h.title}</h3>
                <p lang="bn" className="mt-1 font-bengali text-white/85">
                  {h.bn}
                </p>
                <p className="mt-3 leading-relaxed text-pretty text-white/90">{h.text}</p>
                <a
                  href={h.tel ? `tel:${h.tel}` : h.href}
                  {...(h.href ? EXTERNAL : {})}
                  className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start rounded-lg bg-gv-gold px-4 font-bold text-gv-navy transition-colors duration-200 hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white [&:not(:first-child)]:mt-5"
                >
                  {h.action}
                  <Icon name={h.tel ? "call" : "open_in_new"} className="text-lg!" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="schemes" className={cn("bg-gv-card-ground", BAND)}>
        <div className={CONTAINER}>
          <SectionTitle id="schemes" className="text-gv-navy">
            {NP.schemes.title}
          </SectionTitle>
          <p className="mt-3 max-w-[68ch] text-lg">{NP.schemes.lede}</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SCHEMES.map((s) => (
              <li key={s.title} className="flex flex-col rounded-xl bg-white p-6 ring-1 ring-gv-navy/10">
                <p className="text-sm font-semibold text-gv-green">{s.status}</p>
                <h3 className="mt-1 text-[1.2rem] leading-snug font-bold text-balance text-gv-navy">{s.title}</h3>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-snug marker:text-gv-green">
                  {s.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="mt-3 leading-snug text-gv-ink/85">{s.who}</p>
                <a href={s.source.href} {...EXTERNAL} className={cn(LINK, "mt-auto pt-4 text-[0.95rem]")}>
                  {s.source.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[72ch]">
            {NP.schemes.apply}{" "}
            <a href={NP.schemes.official.href} {...EXTERNAL} className={LINK}>
              {NP.schemes.official.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </div>
      </section>

      <section aria-labelledby="glance" className="bg-gv-gold py-10">
        <div className={CONTAINER}>
          <h2 id="glance" className="sr-only">
            {NP.glance.title}
          </h2>
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
            {NP.glance.stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <dt className="leading-tight text-gv-navy">{s.label}</dt>
                <dd className="order-first font-gv-serif text-[2.1rem] leading-none font-bold text-gv-navy">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="hotlines" className={cn(CONTAINER, "scroll-mt-4 pt-16")}>
        <SectionTitle id="hotlines" className="text-gv-navy">
          {NP.hotlines.title}
        </SectionTitle>
        <p className="mt-3 max-w-[68ch]">{NP.hotlines.lede}</p>
        <ul className="mt-6 grid gap-x-8 border-t border-gv-line sm:grid-cols-2 lg:grid-cols-3">
          {NP.hotlines.items.map((h) => (
            <li key={h.tel} className="flex items-baseline gap-4 border-b border-gv-line py-3">
              <a href={`tel:${h.tel}`} className="min-w-[5.5rem] font-gv-serif text-[1.34rem] font-bold text-gv-navy underline-offset-4 hover:underline">
                {h.tel}
              </a>
              <span>{h.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="categories" className={cn(CONTAINER, "mt-16")}>
        <SectionTitle id="categories" className="text-gv-navy">
          {NP.services.title}
        </SectionTitle>
        <p className="mt-3 max-w-[68ch]">{NP.services.lede}</p>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {NP.services.items.map((s) => (
            <li key={s.title}>
              <a href={s.href} {...EXTERNAL} className="inline-flex min-h-11 items-center rounded-full bg-white px-4 font-semibold text-gv-navy ring-1 ring-gv-navy/20 transition-colors duration-200 hover:bg-gv-navy hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green">
                {s.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="offices" className={cn(CONTAINER, "mt-16")}>
        <SectionTitle id="offices" className="text-gv-navy">
          {NP.about.title}
        </SectionTitle>
        <LinkList links={NP.about.links} label={NP.about.title} />
      </section>

      <div className="mt-12">
        <Looking {...NP.looking} />
      </div>
      <p className={cn(CONTAINER, "mt-3 pb-16 text-gv-ink/75")}>
        Gathered from{" "}
        <GovAnchor href="https://bangladesh.gov.bd" className={LINK}>
          bangladesh.gov.bd
        </GovAnchor>{" "}
        and the offices&apos; own sites on {CHECKED}. Services change; the official page is always the authority.
      </p>
    </>
  );
}
