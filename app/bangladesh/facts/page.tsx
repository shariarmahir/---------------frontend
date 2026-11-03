import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FactsBar, FactsHero, FactsMap, FactsStack, PrintButton } from "@/components/motherland/facts-parts";
import { anton, montserrat } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { MotherlandHeader } from "@/components/motherland/header";
import { COLUMN, DISPLAY, LEDE, SectionHead, pill } from "@/components/motherland/kit";
import { SideTab } from "@/components/motherland/side-tab";
import { BEST, CHECKED, DIVISIONS_TITLE, FACT_SOURCES, FACT_TOPICS, GLANCE, GOVERNMENT, NOT_BEST, PEACE, RESEARCH, SCHOOLS, SLIDES, factsCredits, type Source } from "@/data/motherland-facts";
import { cn } from "@/lib/utils";
import "../motherland.css";

export const metadata: Metadata = {
  title: "Facts of Bangladesh | MOTHERLAND",
  description: "Why Bangladesh is the best and why it is not doing its best: the real numbers, each with its source, its limit and your part in changing it.",
  openGraph: { title: "Facts of Bangladesh | MOTHERLAND", description: "The real numbers on Bangladesh, the proud ones and the hard ones.", images: ["/motherland/photos/padma-bridge.jpg"] },
};

/** A section lands clear of the header and the facts bar. */
const LAND = "scroll-mt-[calc(var(--ml-header)+7.5rem)] lg:scroll-mt-[calc(var(--ml-header)+5rem)]";
const FIGURE = "font-ml-display text-[clamp(3.75rem,7vw,7.5rem)] leading-none tracking-[0.01em]";

function Cited({ source, dark }: { source: Source; dark?: boolean }) {
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className={cn("mt-3 inline-block rounded-sm text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2", dark ? "text-white/70 hover:text-white focus-visible:outline-white" : "text-ml-ink/70 hover:text-ml-ink focus-visible:outline-ml-green")}>
      Source: {source.name}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** The section's short title and rule, centred as on Facts about Germany. */
function Centred({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center">
      <h2 id={id} className={DISPLAY}>
        {title}
      </h2>
      <span aria-hidden className="h-1 w-16 rounded-full bg-ml-green" />
      <p className={cn(LEDE, "text-ml-ink/85")}>{text}</p>
    </div>
  );
}

/** Facts about Germany's split panel: photograph and paper side by side, three ways on beneath. */
function Split({ block, flip }: { block: typeof SCHOOLS | typeof PEACE; flip?: boolean }) {
  return (
    <section id={block.id} aria-labelledby={`${block.id}-title`} className={cn(LAND, COLUMN, "py-16 lg:py-20")}>
      <div className="grid overflow-hidden rounded-2xl lg:grid-cols-2">
        <div className={cn("relative aspect-16/10 lg:aspect-auto lg:min-h-112", flip && "lg:order-last")}>
          <Image src={block.picture.src} alt={block.picture.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" style={{ objectPosition: block.picture.focus }} />
        </div>
        <div className="flex flex-col items-start justify-center gap-5 bg-ml-ground p-8 sm:p-12 xl:p-16">
          <h2 id={`${block.id}-title`} className="font-ml-display text-[clamp(2.25rem,4vw,4rem)] leading-tight tracking-[0.01em] uppercase">
            {block.title}
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-ml-ink/85">{block.text}</p>
          <Link href={block.href} className={pill.onLight}>
            Read more
          </Link>
        </div>
      </div>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3 sm:divide-x sm:divide-ml-ink/15">
        {block.links.map((l) => (
          <li key={l.label} className="sm:px-6 sm:first:pl-0">
            {l.href.startsWith("#") ? (
              <a href={l.href} className="rounded-sm text-lg leading-snug font-bold hover:text-ml-green hover:underline focus-visible:outline-2 focus-visible:outline-ml-green">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="rounded-sm text-lg leading-snug font-bold hover:text-ml-green hover:underline focus-visible:outline-2 focus-visible:outline-ml-green">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Facts of Bangladesh, on the plan of Facts about Germany: the hero and its
 * stepper, the figures, government as a stack of cards, the divisions on a
 * map, the split panels, research, every topic, and a printable edition.
 * Its heart is what Germany's page doesn't have: the two honest lists.
 */
export default function FactsOfBangladeshPage() {
  return (
    <div className={cn(anton.variable, montserrat.variable, "ml w-full bg-white font-ml-sans text-ml-ink")}>
      <noscript>
        <style>{".ml-rise .ml-word > span { translate: none !important; }"}</style>
      </noscript>
      <MotherlandHeader topic="facts" solid />
      <main id="main" className="pt-(--ml-header)">
        <FactsBar />
        <FactsHero slides={SLIDES} />

        <section id={GLANCE.id} aria-label="Bangladesh at a glance" className={cn(LAND, "bg-signal-orange text-ml-ink")}>
          <dl className={cn(COLUMN, "grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-ml-ink/15 lg:py-12")}>
            {GLANCE.facts.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1 px-3 text-center">
                <dt className="text-sm font-semibold text-ml-ink/75">{f.label}</dt>
                <dd className="text-2xl font-bold text-balance">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className={cn(COLUMN, "pb-6 text-center")}>
            <Cited source={GLANCE.source} />
          </p>
        </section>

        <section id={BEST.id} aria-labelledby={`${BEST.id}-title`} className={cn(LAND, "bg-ml-deep py-20 text-white sm:py-28")}>
          <div className={cn(COLUMN, "flex flex-col gap-12 lg:gap-16")}>
            <SectionHead id={`${BEST.id}-title`} tone="dark" title={BEST.title} lede={BEST.lede} />
            <ol className="flex flex-col border-t border-white/20">
              {BEST.items.map((f) => (
                <li key={f.id} id={f.id} className={cn(LAND, "grid gap-6 border-b border-white/20 py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,4fr)] lg:gap-12 lg:py-14")}>
                  <p className={cn(FIGURE, "text-signal-orange")}>{f.figure}</p>
                  <div>
                    <h3 className="text-2xl leading-snug font-bold text-balance">{f.title}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-pretty text-white/85">{f.text}</p>
                  </div>
                  <div className="rounded-2xl bg-black/20 p-6">
                    <h4 className="font-bold text-signal-orange">Reality check</h4>
                    <p className="mt-2 leading-relaxed text-pretty">{f.check}</p>
                    <Cited source={f.source} dark />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id={NOT_BEST.id} aria-labelledby={`${NOT_BEST.id}-title`} className={cn(LAND, "bg-ml-ground py-20 sm:py-28")}>
          <div className={cn(COLUMN, "flex flex-col gap-12 lg:gap-16")}>
            <SectionHead id={`${NOT_BEST.id}-title`} title={NOT_BEST.title} lede={NOT_BEST.lede} />
            <ol className="flex flex-col border-t border-ml-ink/20">
              {NOT_BEST.items.map((f) => (
                <li key={f.id} id={f.id} className={cn(LAND, "grid gap-6 border-b border-ml-ink/20 py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,4fr)] lg:gap-12 lg:py-14")}>
                  <p className={cn(FIGURE, "text-ml-red")}>{f.figure}</p>
                  <div>
                    <h3 className="text-2xl leading-snug font-bold text-balance">{f.title}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-pretty text-ml-ink/85">{f.text}</p>
                    <Cited source={f.source} />
                  </div>
                  <div className="self-start rounded-2xl bg-ml-ink p-6 text-white">
                    <h4 className="font-bold text-signal-orange">Your part</h4>
                    <p className="mt-2 leading-relaxed text-pretty">{f.yourPart}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="both-true" className="relative isolate overflow-hidden bg-ml-ink py-24 text-center text-white sm:py-36">
          <Image src="/motherland/photos/flag-mural.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-black/70" />
          <div className={cn(COLUMN, "flex flex-col items-center gap-8")}>
            <h2 id="both-true" className="max-w-6xl font-ml-display text-[clamp(2.75rem,7vw,7rem)] leading-[1.02] tracking-[0.01em] text-balance uppercase">
              Both lists are true. Which one grows is up to us.
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/nagorik" className={pill.onDark}>
                Know your rights and duties
              </Link>
              <Link href="/signup" className={pill.white}>
                Join Kandari Profile
              </Link>
            </div>
          </div>
        </section>

        <section id={GOVERNMENT.id} aria-labelledby={`${GOVERNMENT.id}-title`} className={cn(LAND, "flex flex-col gap-12 py-20 sm:py-28")}>
          <Centred id={`${GOVERNMENT.id}-title`} title={GOVERNMENT.title} text={GOVERNMENT.text} />
          <FactsStack cards={GOVERNMENT.cards} label={GOVERNMENT.title} />
        </section>

        <section aria-labelledby="divisions-title" className={cn(COLUMN, "flex flex-col gap-12 py-16")}>
          <h2 id="divisions-title" className={cn(DISPLAY, "text-center")}>
            {DIVISIONS_TITLE}
          </h2>
          <FactsMap />
        </section>

        <Split block={SCHOOLS} />
        <Split block={PEACE} flip />

        <section id={RESEARCH.id} aria-labelledby={`${RESEARCH.id}-title`} className={cn(LAND, "flex flex-col gap-12 py-20 sm:py-28")}>
          <Centred id={`${RESEARCH.id}-title`} title={RESEARCH.title} text={RESEARCH.text} />
          <FactsStack cards={RESEARCH.cards} label={RESEARCH.title} />
        </section>

        <section aria-labelledby="all-topics" className="bg-ml-ground py-20 sm:py-28">
          <div className={cn(COLUMN, "flex flex-col gap-12")}>
            <h2 id="all-topics" className={cn(DISPLAY, "text-center")}>
              All topics at a glance
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FACT_TOPICS.map((t) => {
                const body = (
                  <>
                    <span className="relative block aspect-16/10 overflow-hidden bg-ml-mist">
                      <Image src={t.picture.src} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" style={{ objectPosition: t.picture.focus }} />
                    </span>
                    <span className="flex flex-col gap-3 p-5">
                      <span className="text-xl leading-snug font-bold text-balance">{t.title}</span>
                      <span aria-hidden className="h-0.5 w-10 bg-ml-green transition-[width] duration-300 group-hover:w-20" />
                      <span className="leading-relaxed text-pretty text-ml-ink/85">{t.text}</span>
                    </span>
                  </>
                );
                const card = "group block h-full overflow-hidden rounded-2xl bg-white ring-1 ring-ml-ink/10 transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgb(15_42_32/0.5)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ml-green";
                return (
                  <li key={t.title}>
                    {t.href.startsWith("#") ? (
                      <a href={t.href} className={card}>
                        {body}
                      </a>
                    ) : (
                      <Link href={t.href} className={card}>
                        {body}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section aria-labelledby="printable" className={cn(COLUMN, "flex flex-col gap-8 py-14")}>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 id="printable" className="text-2xl font-bold">
                Complete printable edition
              </h2>
              <p className="mt-1 text-ml-ink/85">Every fact on one page, to print or save as a PDF. Figures checked on {CHECKED}.</p>
            </div>
            <PrintButton />
          </div>
          <details className="group border-t border-ml-ink/15 pt-5">
            <summary className="cursor-pointer font-semibold hover:text-ml-green focus-visible:outline-2 focus-visible:outline-ml-green">Every source on this page</summary>
            <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {FACT_SOURCES.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ml-green">
                    {s.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </section>
      </main>
      <SideTab href="/bangladesh#join" />
      <MotherlandFooter credits={factsCredits()} onLanding={false} />
    </div>
  );
}
