import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BandTone, Block, Card } from "@/data/motherland-blocks";
import type { Cta, Picture } from "@/data/motherland";
import { mosaicCells, type MosaicCell } from "@/lib/motherland-mosaic";
import { cn } from "@/lib/utils";
import { CalendarBoard } from "./culture-calendar";
import { ConnectBand } from "./connect";
import { TakaConverter } from "./converter";
import { FilmWall } from "./film-wall";
import { FitLine } from "./fit-line";
import { ANCHOR, BAND_Y, COLUMN, LAST_ROW_FULL, LEDE, SectionHead, pill } from "./kit";
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
 * Everything is a card with its photograph: the photograph wipes open, the card
 * rises, and the words sit on their own ground below it so they can be read.
 */

const GROUND: Record<BandTone, string> = {
  white: "bg-white text-ml-navy",
  paper: "bg-ml-ground text-ml-navy",
  sun: "bg-ml-sun text-ml-navy",
  mint: "bg-ml-mint text-ml-navy",
  navy: "bg-ml-navy text-white",
  gold: "bg-signal-orange text-ml-navy",
};

type Skin = "white" | "navy";

/** What a card wears on each band: white with a shadow, and the wide card in the band's contrast. */
function skinFor(tone: BandTone, feature: boolean): Skin {
  return feature && tone !== "navy" ? "navy" : "white";
}

const SKIN: Record<Skin, { card: string; soft: string; panel: string; label: string }> = {
  white: { card: "bg-white text-ml-navy ring-1 ring-ml-navy/8", soft: "text-ml-navy/80", panel: "bg-ml-navy/5", label: "text-ml-navy/65" },
  navy: { card: "bg-ml-navy text-white ring-1 ring-white/10", soft: "text-white/85", panel: "bg-white/10", label: "text-white/70" },
};

const CARD_SHELL = "ml-card group flex w-full flex-col overflow-hidden rounded-[1.25rem]";

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

/** The photograph at the top of a card. It wipes open as the card arrives and leans in under the pointer. */
function CardPhoto({ picture, sizes, className, chip, badge }: { picture: Picture; sizes: string; className: string; chip?: string; badge?: number }) {
  return (
    <div className={cn("ml-wipe relative overflow-hidden bg-ml-mist", className)}>
      <div className="ml-settle absolute inset-0">
        <Image src={picture.src} alt={picture.alt} fill sizes={sizes} className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05] motion-reduce:transition-none" style={{ objectPosition: picture.focus }} />
      </div>
      {badge ? <span className="absolute top-4 left-4 grid size-12 place-items-center rounded-full bg-signal-orange font-ml-display text-2xl leading-none text-ml-navy">{badge}</span> : null}
      {chip ? <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-full bg-signal-orange px-4 py-1.5 text-sm font-semibold text-ml-navy">{chip}</span> : null}
    </div>
  );
}

const SPAN: Record<MosaicCell["span"], string> = { 12: "lg:col-span-12", 7: "lg:col-span-7", 5: "lg:col-span-5", 4: "lg:col-span-4" };
const PHOTO_HEIGHT: Record<MosaicCell["rowSize"], string> = { 1: "lg:h-[34rem]", 2: "lg:h-[26rem] 2xl:h-[32rem]", 3: "lg:h-[19rem] 2xl:h-[23rem]" };
const PHOTO_SIZES: Record<MosaicCell["span"], string> = { 12: "92vw", 7: "(min-width: 1024px) 56vw, (min-width: 640px) 46vw, 92vw", 5: "(min-width: 1024px) 40vw, (min-width: 640px) 46vw, 92vw", 4: "(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 92vw" };

/** The page's detailed card: its title, the whole story, the plain facts, and where to go next. */
function CardBody({ card, skin, large }: { card: Card; skin: Skin; large?: boolean }) {
  const look = SKIN[skin];
  return (
    <div className={cn("flex flex-1 flex-col gap-3 p-6 lg:p-7", large && "lg:p-9")}>
      <RiseText as="h3" text={card.title} className={cn("w-full font-ml-display tracking-[0.01em] uppercase", large ? "text-[clamp(1.75rem,2.7vw,3rem)]" : "text-[clamp(1.5rem,2.1vw,2.25rem)]", "leading-[1.1]")} />
      <p className={cn("max-w-[62ch] leading-relaxed text-pretty", large && "text-lg", look.soft)}>{card.text}</p>
      {card.facts?.length ? (
        <dl className={cn("mt-auto grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl p-4", look.panel)}>
          {card.facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className={cn("text-sm", look.label)}>{f.label}</dt>
              <dd className="font-semibold text-pretty">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {card.cta ? (
        <div className={cn("pt-1", !card.facts?.length && "mt-auto")}>
          <Link href={card.cta.href} className={pill.onLight}>
            {card.cta.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function MosaicCard({ card, cell, tone, order, badge }: { card: Card; cell: MosaicCell; tone: BandTone; order: number; badge?: number }) {
  const skin = skinFor(tone, cell.feature);
  return (
    <Reveal as="li" order={order} className={cn("flex", SPAN[cell.span])}>
      <article className={cn(CARD_SHELL, SKIN[skin].card)}>
        {card.picture ? <CardPhoto picture={card.picture} sizes={PHOTO_SIZES[cell.span]} className={cn("aspect-4/3 shrink-0 lg:aspect-auto", PHOTO_HEIGHT[cell.rowSize])} chip={card.meta} badge={badge} /> : null}
        <CardBody card={card} skin={skin} large={cell.rowSize < 3} />
      </article>
    </Reveal>
  );
}

/** Cards in a rhythm of wide pairs and threes, each row the same height, so nothing sits out of line. */
export function Mosaic({ cards, tone, numbered }: { cards: Card[]; tone: BandTone; numbered?: boolean }) {
  const cells = mosaicCells(cards.length);
  return (
    <ul className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-7", LAST_ROW_FULL)}>
      {cards.map((c, i) => (
        <MosaicCard key={c.title} card={c} cell={cells[i]} tone={tone} order={cells[i].rowSize === 3 ? i % 3 : i % 2} badge={numbered ? i + 1 : undefined} />
      ))}
    </ul>
  );
}

/** A tighter wall for many small things: every card alike, in full rows. */
export function Wall({ cards, columns, shape = "aspect-4/3" }: { cards: Card[]; columns: 3 | 4; shape?: string }) {
  return (
    <ul className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2", LAST_ROW_FULL, columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {cards.map((c, i) => (
        <Reveal as="li" key={c.title} order={i % columns} className="flex">
          <article className={cn(CARD_SHELL, SKIN.white.card)}>
            {c.picture ? <CardPhoto picture={c.picture} sizes={columns === 4 ? "(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 92vw" : "(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"} className={cn(shape, "shrink-0")} chip={c.meta} /> : null}
            <CardBody card={c} skin="white" />
          </article>
        </Reveal>
      ))}
    </ul>
  );
}

/** How many portraits share each row, so that every row is full: 7 is 4 and 3, 9 is three threes. */
function portraitRows(n: number): number[] {
  if (n <= 5) return [n];
  if (n % 4 === 0) return Array.from({ length: n / 4 }, () => 4);
  if (n % 3 === 0) return Array.from({ length: n / 3 }, () => 3);
  return [4, ...portraitRows(n - 4)];
}

/** Each portrait's share of its row, less its share of the 1.25rem gaps. Five are too narrow for a long name until xl, so they sit as three and two, and the two grow to fill. */
const PORTRAIT_WIDTH: Record<number, string> = { 1: "lg:w-full", 2: "lg:w-[calc((100%-1.25rem)/2)]", 3: "lg:w-[calc((100%-2.5rem)/3)]", 4: "lg:w-[calc((100%-3.75rem)/4)]", 5: "lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-5rem)/5)]" };

/** People: the whole face, in full rows of portraits. */
export function PeopleGrid({ cards }: { cards: Card[] }) {
  const rows = portraitRows(cards.length);
  const sizes = rows.flatMap((r) => Array.from({ length: r }, () => r));
  return (
    <ul className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:flex lg:flex-wrap", LAST_ROW_FULL)}>
      {cards.map((c, i) => (
        <Reveal as="li" key={c.title} order={i % sizes[i]} className={cn("flex lg:grow", PORTRAIT_WIDTH[sizes[i]])}>
          <article className={cn(CARD_SHELL, SKIN.white.card)}>
            {c.picture ? <CardPhoto picture={c.picture} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" className="aspect-4/5 shrink-0 lg:aspect-auto lg:h-[24rem]" chip={c.meta} /> : null}
            <CardBody card={c} skin="white" />
          </article>
        </Reveal>
      ))}
    </ul>
  );
}

/** Whatever the count, the row comes out full: walls when the cards divide evenly, the mosaic when they don't. */
export function CardGrid({ cards, tone, columns, numbered, shape }: { cards: Card[]; tone: BandTone; columns?: 2 | 3 | 4; numbered?: boolean; shape?: string }) {
  const n = cards.length;
  if (columns === 4 && n % 4 === 0) return <Wall cards={cards} columns={4} shape={shape} />;
  if (n === 3 || (columns === 3 && n % 3 === 0)) return <Wall cards={cards} columns={3} shape={shape} />;
  return <Mosaic cards={cards} tone={tone} numbered={numbered} />;
}

/** A chapter that slides sideways as you scroll. Its cards fill the height of the screen. */
function Sideways({ id, title, lede, tone, cards }: { id: string; title: string; lede?: string; tone: BandTone; cards: Card[] }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(ANCHOR, GROUND[tone])}>
      <PinnedRail label={title} head={<SectionHead id={`${id}-title`} tone={tone === "navy" ? "dark" : "light"} title={title} lede={lede} />}>
        {cards.map((c) => (
          <li key={c.title} className="flex w-[min(84vw,24rem)] shrink-0 snap-start lg:w-[clamp(25rem,33vw,38rem)]">
            <article className={cn(CARD_SHELL, SKIN.white.card)}>
              {c.picture ? (
                <div className="relative aspect-4/3 min-h-0 overflow-hidden bg-ml-mist lg:aspect-auto lg:flex-1">
                  <Image src={c.picture.src} alt={c.picture.alt} fill sizes="(min-width: 1024px) 36vw, 84vw" className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05] motion-reduce:transition-none" style={{ objectPosition: c.picture.focus }} />
                  {c.meta ? <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-full bg-signal-orange px-4 py-1.5 text-sm font-semibold text-ml-navy">{c.meta}</span> : null}
                </div>
              ) : null}
              <div className="flex shrink-0 flex-col gap-3 p-6">
                <RiseText as="h3" text={c.title} className="w-full font-ml-display text-[clamp(1.5rem,2vw,2.1rem)] leading-[1.1] tracking-[0.01em] uppercase" />
                <p className="leading-relaxed text-pretty text-ml-navy/80">{c.text}</p>
              </div>
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
        <RiseText id={`${id}-title`} text={title} className="w-full font-ml-display text-[clamp(2.5rem,7vw,7rem)] leading-[1.02] tracking-[0.01em] uppercase" />
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
          <PeopleGrid cards={block.cards} />
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
            <RiseText id={`${block.id}-title`} text={block.title} className="w-full font-ml-display text-[clamp(3rem,8vw,7.5rem)] leading-none tracking-[0.01em] uppercase" />
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
