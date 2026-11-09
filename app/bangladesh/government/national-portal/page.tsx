import type { Metadata } from "next";
import { CONTAINER, GovAnchor, LINK, Looking } from "@/components/bd-gov/kit";
import { OneClick } from "@/components/bd-gov/one-click";
import { PosterGrid, Sparkle } from "@/components/motherland/poster";
import { Icon } from "@/components/ui/icon";
import { NATIONAL_PORTAL as NP } from "@/data/bd-gov";
import { CHECKED, IN_PERSON, SCHEMES } from "@/data/bd-gov-services";
import { hostOf } from "@/lib/bd-gov-services";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: "/bangladesh/government/national-portal" },
  title: "One click to every government service | BD Guide",
  description:
    "Passport, NID, birth certificate, exam results, government jobs, bank schemes, land, tax and bills: search in English or Bangla and go straight to the official page. An independent guide, with every link checked.",
};

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;
const BAND = "py-16 lg:py-24";

/** A section's title in the poster cards' serif, with its lede. */
function Head({ id, title, lede, dark }: { id: string; title: string; lede?: string; dark?: boolean }) {
  return (
    <div className="max-w-3xl">
      <h2 id={id} className={cn("scroll-mt-6 font-ml-serif text-[clamp(2rem,3.4vw,3rem)] leading-[1.08] font-normal tracking-[-0.01em] text-balance", dark ? "text-ml-paper" : "text-ml-night")}>
        {title}
      </h2>
      {lede ? <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-white/75" : "text-gv-ink/80")}>{lede}</p> : null}
    </div>
  );
}

/**
 * The National Portal page, rebuilt in the poster cards' dress (Mahir, 2026-11-07): the
 * one-click directory under a night-navy search band, then the people who can help as
 * poster cards, how one click works, the helpline numbers, the new loan schemes, and the
 * portal's own categories beside the offices.
 */
export default function NationalPortalPage() {
  return (
    <>
      <OneClick title={NP.title} lede={NP.intro} line={NP.line} photo={NP.photo} stats={NP.glance.stats} />

      <section aria-labelledby="in-person" className={cn("bg-white", BAND)}>
        <div className={cn(CONTAINER, "flex flex-col gap-10 lg:gap-12")}>
          <Head id="in-person" title={NP.help.title} lede={NP.help.lede} />
          <PosterGrid
            label={NP.help.title}
            cards={IN_PERSON.map((h) => ({
              title: h.title,
              text: h.text,
              line: h.bn,
              lineLang: "bn",
              href: h.tel ? `tel:${h.tel}` : (h.href ?? "#in-person"),
              action: h.action,
              field: h.tel ? `Call ${h.tel}` : h.href ? hostOf(h.href) : "",
              words: [h.tel ? "Free call" : "Official site"],
              picture: h.photo,
            }))}
          />
        </div>
      </section>

      <section aria-labelledby="how-it-works" className={cn("bg-ml-night text-white", BAND)}>
        <div className={cn(CONTAINER, "flex flex-col gap-10 lg:gap-14")}>
          <Head id="how-it-works" title={NP.how.title} dark />
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {NP.how.steps.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-3 border-t border-white/15 pt-6">
                <span aria-hidden className="font-ml-serif text-5xl leading-none text-signal-orange">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-xl leading-snug font-bold text-balance">{s.title}</h3>
                <p className="leading-relaxed text-pretty text-white/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="hotlines" className={cn("scroll-mt-4 bg-gv-card-ground", BAND)}>
        <div className={cn(CONTAINER, "flex flex-col gap-10")}>
          <Head id="hotlines" title={NP.hotlines.title} lede={NP.hotlines.lede} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {NP.hotlines.items.map((h, i) => {
              const urgent = i === 0;
              return (
                <li key={h.tel} className={cn("flex", urgent && "sm:col-span-2")}>
                  <a
                    href={`tel:${h.tel}`}
                    className={cn(
                      "group flex w-full items-center gap-5 rounded-2xl p-5 transition-shadow duration-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green",
                      urgent ? "bg-gv-sun text-white shadow-[0_20px_40px_-24px_rgb(244_42_65/0.8)] hover:shadow-[0_28px_50px_-24px_rgb(244_42_65/0.9)]" : "bg-white ring-1 ring-gv-navy/10 hover:shadow-[0_18px_36px_-22px_rgb(11_24_73/0.45)]",
                    )}
                  >
                    <span className={cn("shrink-0 font-ml-serif leading-none tabular-nums", urgent ? "text-[3.25rem]" : h.tel.length > 5 ? "text-[1.35rem] text-ml-night" : "min-w-[3.2ch] text-[2rem] text-ml-night")}>{h.tel}</span>
                    <span className={cn("min-w-0 leading-snug text-pretty", urgent ? "text-lg font-semibold" : "text-[0.98rem] text-gv-ink/85")}>{h.label}</span>
                    <Icon name="call" className={cn("ml-auto shrink-0 text-xl! transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none", urgent ? "text-white" : "text-gv-green")} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="schemes" className={cn("bg-white", BAND)}>
        <div className={cn(CONTAINER, "flex flex-col gap-10")}>
          <Head id="schemes" title={NP.schemes.title} lede={NP.schemes.lede} />
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {SCHEMES.map((s) => (
              <li key={s.title} className="flex flex-col rounded-[1.25rem] bg-gv-card-ground p-6 ring-1 ring-gv-navy/8 lg:p-7">
                <p className="flex items-center gap-2 text-sm font-semibold text-gv-green">
                  <Sparkle />
                  {s.status}
                </p>
                <h3 className="mt-3 font-ml-serif text-[1.6rem] leading-[1.12] font-normal text-balance text-ml-night">{s.title}</h3>
                <ul className="mt-4 flex flex-col gap-2 leading-snug">
                  {s.facts.map((f) => (
                    <li key={f} className="border-l-2 border-gv-green/40 pl-3">
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[0.98rem] leading-snug text-gv-ink/80">{s.who}</p>
                <a href={s.source.href} {...EXTERNAL} className={cn(LINK, "mt-auto pt-5 text-[0.95rem]")}>
                  {s.source.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="max-w-[72ch]">
            {NP.schemes.apply}{" "}
            <a href={NP.schemes.official.href} {...EXTERNAL} className={LINK}>
              {NP.schemes.official.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </div>
      </section>

      <section aria-labelledby="categories" className={cn("bg-gv-card-ground", BAND)}>
        <div className={cn(CONTAINER, "grid gap-14 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16")}>
          <div className="flex flex-col gap-8">
            <Head id="categories" title={NP.services.title} lede={NP.services.lede} />
            <ul className="flex flex-wrap gap-2.5">
              {NP.services.items.map((s) => (
                <li key={s.title}>
                  <a
                    href={s.href}
                    {...EXTERNAL}
                    className="inline-flex min-h-11 items-center rounded-full bg-white px-4 font-medium text-ml-night ring-1 ring-gv-navy/15 transition-colors duration-300 hover:bg-ml-night hover:text-white hover:ring-ml-night focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gv-green"
                  >
                    {s.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <section aria-labelledby="offices" className="flex flex-col gap-8">
            <Head id="offices" title={NP.about.title} />
            <ul className="divide-y divide-gv-line border-y border-gv-line">
              {NP.about.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...EXTERNAL}
                    className="group flex min-h-13 items-center justify-between gap-4 py-3 font-medium text-ml-night transition-colors hover:text-gv-green focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-gv-green"
                  >
                    {l.label}
                    <span className="shrink-0 text-sm text-gv-ink/60 group-hover:text-gv-green">{hostOf(l.href)}</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <div className="bg-white pt-12 pb-4">
        <Looking {...NP.looking} />
        <p className={cn(CONTAINER, "mt-3 text-gv-ink/75")}>
          Gathered from{" "}
          <GovAnchor href="https://bangladesh.gov.bd" className={LINK}>
            bangladesh.gov.bd
          </GovAnchor>{" "}
          and the offices&apos; own sites on {CHECKED}. Services change; the official page is always the authority.
        </p>
      </div>
    </>
  );
}
