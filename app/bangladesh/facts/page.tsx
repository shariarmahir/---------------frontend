import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Band, IntroFill, Moment } from "@/components/motherland/blocks";
import { Facts, MoreCategories, PageHero } from "@/components/motherland/category";
import { BothSides, FactsMap, FactsNav, PrintButton, ShareFact } from "@/components/motherland/facts-parts";
import { mlFonts } from "@/components/motherland/fonts";
import { MotherlandFooter } from "@/components/motherland/footer";
import { FACTS_FILM } from "@/data/motherland-deep";
import { MotherlandHeader } from "@/components/motherland/header";
import { COLUMN, LAST_ROW_FULL, pill } from "@/components/motherland/kit";
import { Quiz } from "@/components/motherland/quiz";
import { Reveal } from "@/components/motherland/reveal";
import { RiseText } from "@/components/motherland/rise-text";
import { SideTab } from "@/components/motherland/side-tab";
import { BEST, BOTH_SIDES, BOTH_TRUE, CHECKED, DIVISIONS_TITLE, FACT_TOPICS, FACTS_HERO, FACTS_INTRO, FACTS_NAME, FACTS_QUIZ, GLANCE, GOVERNMENT, NOT_BEST, PEACE, RESEARCH, SCHOOLS, type LinkCard,  } from "@/data/motherland-facts";
import { mosaicCells } from "@/lib/motherland-mosaic";
import { cn } from "@/lib/utils";
import "../motherland.css";

export const metadata: Metadata = {
  alternates: { canonical: "/bangladesh/facts" },
  title: `${FACTS_NAME} | MOTHERLAND`,
  description: "Why Bangladesh is the best and why it is not doing its best: the real numbers, with the limit on each and your part in changing it.",
  openGraph: { title: `${FACTS_NAME} | MOTHERLAND`, description: "The real numbers on Bangladesh, the proud ones and the hard ones.", images: [FACTS_HERO.src] },
};

export const viewport = { themeColor: "#0b1849" };

const CARD = "ml-card group flex w-full flex-col overflow-hidden rounded-[1.25rem] bg-white text-ml-navy ring-1 ring-ml-navy/8";
const PHOTO = "ml-wipe relative shrink-0 overflow-hidden bg-ml-mist";
const CARD_TITLE = "w-full font-ml-sans font-extrabold tracking-[-0.03em]";
const SPAN = { 12: "lg:col-span-12", 7: "lg:col-span-7", 5: "lg:col-span-5", 4: "lg:col-span-4" } as const;
const HEIGHT = { 1: "lg:h-[30rem]", 2: "lg:h-[24rem] 2xl:h-[28rem]", 3: "lg:h-[17rem] 2xl:h-[20rem]" } as const;

/** Each list keeps the same card, in rows that come out full: three by three, or the wide pairs and threes of the mosaic. */
function layoutOf(count: number) {
  return count % 3 === 0 ? Array.from({ length: count }, () => ({ span: 4 as const, rowSize: 3 as const })) : mosaicCells(count);
}

/** One fact from either list: the figure on its photograph, the story, the honest second half. */
function FactCard({ id, figure, title, text, panel, picture, hard, span, rowSize, order }: { id: string; figure: string; title: string; text: string; panel: { heading: string; text: string }; picture: LinkCard["picture"]; hard?: boolean; span: keyof typeof SPAN; rowSize: keyof typeof HEIGHT; order: number }) {
  return (
    <Reveal as="li" order={order} className={cn("flex", SPAN[span])}>
      <article id={id} className={CARD}>
        <div className={cn(PHOTO, "aspect-4/3 lg:aspect-auto", HEIGHT[rowSize])}>
          <div className="ml-settle absolute inset-0">
            <Image src={picture.src} alt={picture.alt} fill sizes={span === 4 ? "(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 92vw" : "(min-width: 1024px) 56vw, (min-width: 640px) 46vw, 92vw"} className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05] motion-reduce:transition-none" style={{ objectPosition: picture.focus }} />
          </div>
          <p className={cn("absolute bottom-4 left-4 rounded-xl px-4 pt-2 pb-1.5 font-ml-display text-[clamp(2.25rem,3.2vw,3.25rem)] leading-none tracking-[0.01em] tabular-nums", hard ? "bg-ml-red text-white" : "bg-signal-orange text-ml-navy")}>{figure}</p>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6">
          <RiseText as="h3" text={title} className={cn(CARD_TITLE, "text-[clamp(1.5rem,2vw,2.1rem)] leading-[1.1]")} />
          <p className="leading-relaxed text-pretty text-ml-navy/80">{text}</p>
          <div className={cn("mt-auto rounded-xl p-4", hard ? "bg-ml-navy text-white" : "bg-ml-navy/5")}>
            <h4 className={cn("font-bold", hard && "text-signal-orange")}>{panel.heading}</h4>
            <p className={cn("mt-1 leading-relaxed text-pretty", hard ? "text-white/90" : "text-ml-navy/85")}>{panel.text}</p>
          </div>
          <ShareFact id={id} title={title} />
        </div>
      </article>
    </Reveal>
  );
}

/** A card that goes somewhere, whole: a photograph, a title and one line. */
function LinkCards({ cards, columns }: { cards: LinkCard[]; columns: 3 | 4 }) {
  return (
    <ul className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:gap-6", LAST_ROW_FULL, columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {cards.map((c, i) => {
        const Tag = c.href.startsWith("#") ? "a" : Link;
        return (
          <Reveal as="li" key={c.title} order={i % columns} className="flex">
            <Tag href={c.href} className={cn(CARD, "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal-orange")}>
              <div className={cn(PHOTO, "aspect-4/3")}>
                <div className="ml-settle absolute inset-0">
                  <Image src={c.picture.src} alt="" fill sizes={columns === 4 ? "(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 92vw" : "(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"} className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05] motion-reduce:transition-none" style={{ objectPosition: c.picture.focus }} />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-5 lg:p-6">
                <RiseText as="h3" text={c.title} className={cn(CARD_TITLE, "text-[clamp(1.35rem,1.75vw,1.85rem)] leading-[1.1]")} />
                <p className="leading-relaxed text-pretty text-ml-navy/80">{c.text}</p>
              </div>
            </Tag>
          </Reveal>
        );
      })}
    </ul>
  );
}

/** A photograph and a navy panel side by side, with the panel's three ways on. */
function Split({ block, flip }: { block: typeof SCHOOLS | typeof PEACE; flip?: boolean }) {
  return (
    <section id={block.id} aria-labelledby={`${block.id}-title`}>
      <Reveal className="ml-card grid overflow-hidden rounded-[1.25rem] bg-ml-navy text-white lg:grid-cols-2">
      <div className={cn(PHOTO, "aspect-16/10 lg:aspect-auto lg:min-h-112", flip && "lg:order-last")}>
        <div className="ml-settle absolute inset-0">
          <Image src={block.picture.src} alt={block.picture.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" style={{ objectPosition: block.picture.focus }} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col items-start justify-center gap-5 p-6 sm:p-10 xl:p-14">
        <RiseText id={`${block.id}-title`} text={block.title} className="w-full font-ml-sans font-extrabold text-[clamp(2rem,3.4vw,3.5rem)] leading-[1.05] tracking-[-0.03em]" />
        <p className="max-w-xl text-lg leading-relaxed text-pretty text-white/85">{block.text}</p>
        <ul className="flex w-full max-w-xl flex-col divide-y divide-white/15 border-y border-white/15">
          {block.links.map((l) => {
            const Tag = l.href.startsWith("#") ? "a" : Link;
            return (
              <li key={l.label}>
                <Tag href={l.href} className="flex min-h-12 items-center py-2.5 font-semibold transition-colors hover:text-signal-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange">
                  {l.label}
                </Tag>
              </li>
            );
          })}
        </ul>
        <Link href={block.href} className={pill.onDark}>
          Read more
        </Link>
      </div>
      </Reveal>
    </section>
  );
}

/**
 * Facts about Bangladesh: Facts about Germany's topics, in the dress of every
 * other MOTHERLAND page. Its heart is what Germany's page doesn't have: the two
 * honest lists, and the same subject read from both of them.
 */
export default function FactsAboutBangladeshPage() {
  const bestCells = layoutOf(BEST.items.length);
  const hardCells = layoutOf(NOT_BEST.items.length);
  return (
    <div className={cn(mlFonts, "ml ml-light ml-facts w-full bg-ml-ground font-ml-sans text-ml-ink")}>
      <noscript>
        <style>{".ml-rise .ml-word > span { translate: none !important; } .ml-reveal { opacity: 1 !important; translate: none !important; } .ml-reveal .ml-wipe { clip-path: none !important; } .ml-reveal .ml-settle { transform: none !important; }"}</style>
      </noscript>
      <MotherlandHeader topic="facts" />
      <main id="main">
        <PageHero
          id="facts-title"
          name={FACTS_NAME}
          film={FACTS_FILM}
          titleTone="navy"
        />

        <section id={GLANCE.id} aria-label="Bangladesh at a glance">
          <Facts facts={GLANCE.facts} />
        </section>

        <IntroFill text={FACTS_INTRO} />

        <Band id={BEST.id} tone="navy" title={BEST.title} lede={BEST.lede}>
          <ul className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6", LAST_ROW_FULL)}>
            {BEST.items.map((f, i) => (
              <FactCard key={f.id} id={f.id} figure={f.figure} title={f.title} text={f.text} panel={{ heading: "Reality check", text: f.check }} picture={f.picture} span={bestCells[i].span} rowSize={bestCells[i].rowSize} order={i % 3} />
            ))}
          </ul>
        </Band>

        <Band id={NOT_BEST.id} tone="sun" title={NOT_BEST.title} lede={NOT_BEST.lede}>
          <ul className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6", LAST_ROW_FULL)}>
            {NOT_BEST.items.map((f, i) => (
              <FactCard key={f.id} hard id={f.id} figure={f.figure} title={f.title} text={f.text} panel={{ heading: "Your part", text: f.yourPart }} picture={f.picture} span={hardCells[i].span} rowSize={hardCells[i].rowSize} order={hardCells[i].rowSize === 3 ? i % 3 : i % 2} />
            ))}
          </ul>
        </Band>

        <div className="print:hidden">
          <Band id={BOTH_SIDES.id} tone="white" title={BOTH_SIDES.title} lede={BOTH_SIDES.lede}>
            <BothSides />
          </Band>
          <Moment id="both-true" title="Both lists are true. Which one grows is up to us." picture={BOTH_TRUE} cta={{ label: "Know your rights and duties", href: "/nagorik" }} />
        </div>

        <Band id={GOVERNMENT.id} tone="mint" title={GOVERNMENT.title} lede="A parliamentary republic under the Constitution of 1972: who holds power, and how to reach them.">
          <LinkCards cards={GOVERNMENT.cards} columns={3} />
        </Band>

        <Band id="divisions" tone="white" title={DIVISIONS_TITLE} lede="Point at a division on the map, or choose one, to read about it.">
          <FactsMap />
        </Band>

        <section aria-label="Schools and peace" className="bg-ml-ground py-12 sm:py-14 lg:py-16">
          <div className={cn(COLUMN, "flex flex-col gap-6")}>
            <Split block={SCHOOLS} />
            <Split block={PEACE} flip />
          </div>
        </section>

        <Band id={RESEARCH.id} tone="white" title={RESEARCH.title} lede="This delta has always solved its own problems, from the flood to the boson.">
          <LinkCards cards={RESEARCH.cards} columns={4} />
        </Band>

        <Band id="all-topics" tone="paper" title="All topics at a glance" lede="Every subject on one wall. Choose one to go straight to it.">
          <LinkCards cards={FACT_TOPICS} columns={4} />
        </Band>

        <Band id="printable" tone="navy" title="The complete printable edition" lede={`Every fact on one page, to print or save as a PDF. Figures checked on ${CHECKED}.`}>
          <PrintButton />
        </Band>

        <div className="print:hidden">
          <Quiz questions={FACTS_QUIZ} name={FACTS_NAME} />
          {/* Ten categories fill the wall's two rows; Pro & Con is one tap away from the two lists above. */}
          <MoreCategories current="procon" />
        </div>
      </main>
      <FactsNav />
      <SideTab href="/bangladesh#join" />
      <MotherlandFooter />
    </div>
  );
}
