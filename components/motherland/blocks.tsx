import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BandTone, Block, Card } from "@/data/motherland-blocks";
import type { Cta, Picture } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { CollageGrid, Credit } from "./collage";
import { CalendarBoard } from "./culture-calendar";
import { ConnectBand } from "./connect";
import { TakaConverter } from "./converter";
import { FilmWall } from "./film-wall";
import { FitLine } from "./fit-line";
import { ANCHOR, BAND_Y, COLUMN, LEDE, SectionHead, pill } from "./kit";
import { LaunchBand } from "./launch";
import { LinesStage } from "./lines-stage";
import { MoneyBrands } from "./money-brands";
import { Parallax } from "./parallax";
import { PinBoard } from "./pin-board";
import { PinnedRail } from "./pinned-rail";
import { Reveal } from "./reveal";
import { RiseText } from "./rise-text";
import { ScrollFill } from "./scroll-fill";

/*
 * The bands a category page is built from, in white, paper, navy or gold.
 * Every card wears the landing page's collage dress (collage.tsx): flat shapes,
 * the photograph cut to a shape of its own over them, the name on a navy label
 * bar, and the words on their own ground below so they can be read.
 */

const GROUND: Record<BandTone, string> = {
  white: "bg-white text-ml-navy",
  paper: "bg-ml-ground text-ml-navy",
  sun: "bg-ml-sun text-ml-navy",
  mint: "bg-ml-mint text-ml-navy",
  navy: "bg-ml-navy text-white",
  gold: "bg-signal-orange text-ml-navy",
};

export function Band({ id, tone, title, lede, cta, children }: { id: string; tone: BandTone; title?: string; lede?: string; cta?: Cta; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={title ? `${id}-title` : undefined} className={cn(ANCHOR, BAND_Y, GROUND[tone])}>
      <div className={cn(COLUMN, "flex flex-col gap-8 lg:gap-12")}>
        {title ? <SectionHead id={`${id}-title`} tone={tone === "navy" ? "dark" : tone === "gold" ? "gold" : "light"} title={title} lede={lede} cta={cta} /> : null}
        {children}
      </div>
    </section>
  );
}

/** The card's own ground against its band's: cream cards on white, white cards on every other band. */
const CARD_GROUND: Record<BandTone, "sun" | "white"> = { white: "sun", paper: "white", sun: "white", mint: "white", navy: "white", gold: "white" };

/** Cards in the landing page's collage dress, in a rhythm of wide pairs and threes, each row full and level. */
export function Mosaic({ cards, tone, numbered }: { cards: Card[]; tone: BandTone; numbered?: boolean }) {
  return <CollageGrid cards={cards} ground={CARD_GROUND[tone]} onGold={tone === "gold"} numbered={numbered} />;
}

/** People: the whole face, cut round, arched or standing, never at a corner. */
export function PeopleGrid({ cards, tone }: { cards: Card[]; tone: BandTone }) {
  return <CollageGrid cards={cards} ground={CARD_GROUND[tone]} onGold={tone === "gold"} portrait />;
}

/** Whatever the count, the row comes out full: even walls when the cards divide evenly, the mosaic when they don't. */
export function CardGrid({ cards, tone, columns, numbered }: { cards: Card[]; tone: BandTone; columns?: 2 | 3 | 4; numbered?: boolean }) {
  const n = cards.length;
  const wall = columns === 4 && n % 4 === 0 ? 4 : n === 3 || (columns === 3 && n % 3 === 0) ? 3 : undefined;
  return <CollageGrid cards={cards} ground={CARD_GROUND[tone]} onGold={tone === "gold"} columns={wall} numbered={numbered} />;
}

/** A chapter that slides sideways as you scroll. Its cards fill the height of the screen. */
function Sideways({ id, title, lede, tone, cards }: { id: string; title: string; lede?: string; tone: BandTone; cards: Card[] }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(ANCHOR, GROUND[tone])}>
      <PinnedRail label={title} head={<SectionHead id={`${id}-title`} tone={tone === "navy" ? "dark" : "light"} title={title} lede={lede} />}>
        {cards.map((c) => (
          <li key={c.title} className="flex w-[min(84vw,24rem)] shrink-0 snap-start lg:w-[clamp(25rem,33vw,38rem)]">
            <article className="ml-card group flex w-full flex-col overflow-hidden rounded-[1.25rem] bg-white text-ml-navy ring-1 ring-ml-navy/8">
              {c.picture ? (
                <div className="relative aspect-4/3 min-h-0 overflow-hidden bg-ml-mist lg:aspect-auto lg:flex-1">
                  <Image src={c.picture.src} alt={c.picture.alt} fill sizes="(min-width: 1024px) 36vw, 84vw" className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05] motion-reduce:transition-none" style={{ objectPosition: c.picture.focus }} />
                  <Credit card={c} />
                </div>
              ) : (
                <h3 className="p-6 pb-0 text-[clamp(1.25rem,1.6vw,1.6rem)] leading-snug font-extrabold tracking-[-0.02em]">{c.title}</h3>
              )}
              <p className="shrink-0 p-6 leading-relaxed text-pretty text-ml-navy/80">{c.text}</p>
            </article>
          </li>
        ))}
      </PinnedRail>
    </section>
  );
}

/** A table's rows as cards, with one photograph standing beside them at the same height. */
function DataCards({ head, rows, tone, picture, hideLastColumn }: { head: string[]; rows: string[][]; tone: BandTone; picture?: Picture; hideLastColumn?: boolean }) {
  const onNavy = tone === "navy";
  /* One size of figure across the whole set, sized for the longest. */
  const longest = Math.max(...rows.map((r) => r[1]?.length ?? 0));
  const figure = longest > 24 ? "text-[clamp(1.35rem,1.7vw,1.6rem)]" : longest > 14 ? "text-[clamp(1.6rem,2.1vw,2.1rem)]" : "text-[clamp(2rem,2.8vw,2.75rem)]";
  const cardLook = onNavy ? "bg-white/8 text-white ring-1 ring-white/15" : "bg-white text-ml-navy ring-1 ring-ml-navy/8";
  const odd = rows.length % 2 === 1;
  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 lg:gap-6", picture && "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]")}>
      {picture ? (
        <Reveal className="relative hidden lg:block">
          <div className="ml-wipe absolute inset-0 overflow-hidden rounded-[1.25rem] bg-ml-mist">
            <div className="ml-settle absolute inset-0">
              {/* A tall crop of a wide photo: it is drawn wider than its column, so it asks for more than the column's width. */}
              <Image src={picture.src} alt={picture.alt} fill sizes="90vw" className="object-cover" style={{ objectPosition: picture.focus }} />
            </div>
          </div>
        </Reveal>
      ) : null}
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
        {rows.map((r, i) => {
          const rest = hideLastColumn ? r.slice(2, -1) : r.slice(2);
          return (
            /* With an odd count the last card runs wide, so the row ends on the column's edge. */
            <Reveal as="li" key={r.join("|")} order={i % 2} className={cn("flex", odd && i === rows.length - 1 && "sm:col-span-2")}>
              <div className={cn("ml-card flex w-full flex-col gap-1 rounded-2xl p-6", cardLook)}>
                <p className="leading-snug font-semibold text-pretty">{r[0]}</p>
                <p className={cn("pt-2 font-ml-display tracking-[0.01em] tabular-nums", figure, "leading-tight", onNavy && "text-signal-orange")}>{r[1]}</p>
                {rest.map((cell, n) => (
                  <p key={`${n}-${cell}`} className={cn("pt-1 text-sm leading-snug text-pretty", n === 0 && "mt-auto", onNavy ? "text-white/70" : "text-ml-navy/65")}>
                    <span className="sr-only">{head[n + 2]}: </span>
                    {cell}
                  </p>
                ))}
              </div>
            </Reveal>
          );
        })}
      </ul>
    </div>
  );
}

/** A pause in the page: one photograph across the whole screen, moving slowly, with one thought on it. */
export function Moment({ id, title, text, picture, cta }: { id: string; title: string; text?: string; picture: Picture; cta?: { label: string; href: string } }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(ANCHOR, "relative isolate flex min-h-[70svh] items-end overflow-hidden bg-ml-navy text-white")}>
      <Parallax lift={14}>
        <Image src={picture.src} alt={picture.alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: picture.focus }} />
      </Parallax>
      <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ml-navy via-ml-navy/35 to-ml-navy/10" />
      <div className={cn(COLUMN, "flex flex-col items-start gap-4 py-12 lg:py-16")}>
        <RiseText id={`${id}-title`} text={title} className="w-full font-ml-sans font-extrabold text-[clamp(2.5rem,7vw,7rem)] leading-[1.08] tracking-[-0.03em]" />
        {text ? <FitLine text={text} className={cn(LEDE, "ml-lede text-white/90")} /> : null}
        {cta ? (
          <Link href={cta.href} className={pill.onDark}>
            {cta.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

/** The words after the hero, across the whole screen, inked in line by line as they scroll past. */
export function IntroFill({ text, tone = "white", id, label }: { text: string; tone?: BandTone; id?: string; label?: string }) {
  return (
    <section id={id} aria-label={label ?? "Introduction"} className={cn(ANCHOR, "py-14 sm:py-20 lg:py-24", GROUND[tone])}>
      <div className={cn(COLUMN, "lg:px-[max(3rem,8vw)]")}>
        <ScrollFill text={text} tone={tone === "navy" ? "dark" : tone === "gold" ? "gold" : "light"} className="font-ml-title text-[clamp(1.5rem,2.6vw,2.75rem)] leading-[1.28] font-bold tracking-[-0.01em]" />
      </div>
    </section>
  );
}

/** One block, or null for a part the page itself draws. */
export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "chapters":
      if (block.layout === "sideways") return <Sideways id={block.id} title={block.title} lede={block.lede} tone={block.tone} cards={block.chapters} />;
      return (
        <Band id={block.id} tone={block.tone} title={block.title} lede={block.lede}>
          <Mosaic cards={block.chapters} tone={block.tone} />
        </Band>
      );
    case "cards":
      if (block.layout === "sideways") return <Sideways id={block.id} title={block.title} lede={block.lede} tone={block.tone} cards={block.cards} />;
      return (
        <Band id={block.id} tone={block.tone} title={block.title} lede={block.lede}>
          <CardGrid cards={block.cards} tone={block.tone} columns={block.columns} />
        </Band>
      );
    case "people":
      return (
        <Band id={block.id} tone={block.tone} title={block.title} lede={block.lede}>
          <PeopleGrid cards={block.cards} tone={block.tone} />
        </Band>
      );
    case "steps":
      return (
        <Band id={block.id} tone={block.tone} title={block.title} lede={block.lede}>
          <Mosaic cards={block.steps} tone={block.tone} numbered />
        </Band>
      );
    case "table":
      return (
        <Band id={block.id} tone={block.tone} title={block.title} lede={block.lede}>
          <DataCards head={block.head} rows={block.rows} tone={block.tone} picture={block.picture} hideLastColumn={block.hideLastColumn} />
        </Band>
      );
    case "lines":
      return (
        <section id={block.id} aria-labelledby={`${block.id}-title`} className={cn(ANCHOR, GROUND[block.tone])}>
          <SectionHead id={`${block.id}-title`} tone={block.tone === "navy" ? "dark" : "light"} title={block.title} lede={block.lede} className={cn(COLUMN, "pt-14 pb-10 sm:pt-20 lg:pt-24 lg:pb-12")} />
          <LinesStage lines={block.lines} />
        </section>
      );
    case "map":
      return (
        <Band id={block.id} tone={block.tone} title={block.title} lede={block.lede}>
          <PinBoard pins={block.pins} />
        </Band>
      );
    case "films":
      return (
        <Band id={block.id} tone={block.tone} title={block.title} lede={block.lede}>
          <FilmWall films={block.films} />
        </Band>
      );
    case "moment":
      return <Moment id={block.id} title={block.title} text={block.text} picture={block.picture} />;
    case "statement":
      if (!block.title) return <IntroFill id={block.id} text={block.text.join(" ")} tone={block.tone} label="Our policy" />;
      return (
        <section id={block.id} aria-labelledby={`${block.id}-title`} className={cn(ANCHOR, BAND_Y, GROUND[block.tone])}>
          <div className={cn(COLUMN, "flex flex-col gap-5")}>
            <RiseText id={`${block.id}-title`} text={block.title} className="w-full font-ml-sans font-extrabold text-[clamp(3rem,8vw,7.5rem)] leading-[1.08] tracking-[-0.03em]" />
            {block.text.map((t) => (
              <p key={t} className="text-[clamp(1.25rem,2vw,1.75rem)] leading-snug font-semibold text-pretty">
                {t}
              </p>
            ))}
            {block.cta ? (
              <a href={block.cta.href} className={cn(pill.onLight, "w-fit")}>
                {block.cta.label}
              </a>
            ) : null}
          </div>
        </section>
      );
    case "tool":
      if (block.tool === "converter") return <TakaConverter />;
      if (block.tool === "calendar") return <CalendarBoard />;
      if (block.tool === "connect") return <ConnectBand />;
      if (block.tool === "launch") return <LaunchBand />;
      if (block.tool === "money-brands") return <MoneyBrands />;
      return null;
    case "part":
      return null;
  }
}
