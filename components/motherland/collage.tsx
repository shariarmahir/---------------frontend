import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Card } from "@/data/motherland-blocks";
import { mosaicCells, type MosaicCell } from "@/lib/motherland-mosaic";
import { cn } from "@/lib/utils";
import { LAST_ROW_FULL, pill } from "./kit";
import { Reveal } from "./reveal";

/*
 * The landing page's cards as collages, after the Bauhaus posters and film-credit frames Mahir
 * chose (2026-11-07): flat shapes in MOTHERLAND's colours (navy, gold, flag green; never red,
 * which is kept for urgency) under each photograph, the photograph cut to a shape of its own and
 * breaking over them, and the card's name set on a navy label bar over the art, its dates or field
 * on a small gold tag above, as a film credits its people. The words stay under the art, where
 * they read best. Six compositions:
 *   slab      a photograph off the corner, a gold block, a navy stripe
 *   orbit     a round photograph by a big circle, a dashed path round them
 *   arches    an arched photograph by a rainbow of half circles
 *   target    a standing photograph by a gold target of rings
 *   diagonal  a photograph between a gold and a green plane cut on the slant
 *   hexagons  a standing photograph by a cluster of hexagons
 * Motion (motherland.css, .ml-collage): the shapes grow in one after another, the photograph
 * opens in its shape and blooms from black and white into colour, then the label bars wipe in;
 * under the pointer the shapes drift a little and the photograph leans in.
 */

type Motif = "slab" | "orbit" | "arches" | "target" | "diagonal" | "hexagons";
const MOTIFS: Motif[] = ["slab", "orbit", "target", "arches", "diagonal", "hexagons"];
/** Faces are never cut off at a corner: portraits take the round, arched and standing cuts. */
const PORTRAIT_MOTIFS: Motif[] = ["target", "orbit", "hexagons", "arches", "diagonal"];

type Cell = Omit<MosaicCell, "span"> & { span: MosaicCell["span"] | 3 };
const SPAN: Record<Cell["span"], string> = { 12: "lg:col-span-12", 7: "lg:col-span-7", 5: "lg:col-span-5", 4: "lg:col-span-4", 3: "lg:col-span-3" };

/** Even walls of three or four (columns), or the mosaic's wide pairs and threes. */
function cellsFor(count: number, columns?: 3 | 4): Cell[] {
  if (!columns) return mosaicCells(count);
  return Array.from({ length: count }, () => ({ span: columns === 4 ? 3 : 4, rowSize: 3, feature: false }));
}

const SIZES: Record<Cell["span"], string> = {
  12: "(min-width: 1024px) 40vw, (min-width: 640px) 46vw, 92vw",
  7: "(min-width: 1024px) 40vw, (min-width: 640px) 46vw, 92vw",
  5: "(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 86vw",
  4: "(min-width: 1024px) 26vw, (min-width: 640px) 44vw, 86vw",
  3: "(min-width: 1024px) 20vw, (min-width: 640px) 44vw, 86vw",
};

/** A flat shape that grows in on arrival and drifts a little under the pointer. */
function Shape({ className, from, step, drift, style, children }: { className: string; from: "middle" | "top" | "right" | "foot" | "left"; step: number; drift: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <span aria-hidden data-from={from} className={cn("ml-shape absolute", className)} style={{ "--s": `${step * 140}ms`, "--drift": drift, ...style } as CSSProperties}>
      {children}
    </span>
  );
}

type Cut = "slab" | "circle" | "arch" | "stand";

/** The photograph, cut to its shape, opening in that shape on arrival. */
function Photo({ card, cut, className, sizes, portrait }: { card: Card; cut: Cut; className: string; sizes: string; portrait?: boolean }) {
  if (!card.picture) return null;
  return (
    <div data-cut={cut} className={cn("ml-collage-photo absolute overflow-hidden bg-ml-mist", cut === "circle" && "rounded-full", cut === "arch" && "rounded-t-full", className)}>
      <Image src={card.picture.src} alt={card.picture.alt} fill sizes={sizes} className="object-cover" style={{ objectPosition: card.picture.focus ?? (portrait ? "50% 22%" : undefined) }} />
    </div>
  );
}

/** A small row of dots and a fine rule, the technical marks of the credit frames. */
function Marks({ className }: { className: string }) {
  return (
    <Shape from="left" step={3} drift="0.2rem 0" className={cn("flex items-center gap-1.5", className)}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-2 rounded-full bg-ml-navy/70" />
      ))}
      <span className="ml-1 h-px w-16 bg-ml-navy/40" />
    </Shape>
  );
}

const HEX = "polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0 50%)";
/** The hexagon cluster: where each sits, and which are filled. */
const HEXES: [string, "ring" | "gold" | "green"][] = [
  ["top-[14%] left-[6%]", "ring"],
  ["top-[14%] left-[24%]", "gold"],
  ["top-[36%] left-[15%]", "ring"],
  ["top-[58%] left-[6%]", "green"],
  ["top-[58%] left-[24%]", "ring"],
];

/** A card's art: its shapes, then its photograph over them. Round and standing shapes are sized by the art's height and width (container units), so none is ever cut off in a narrow frame. */
function Art({ motif, card, index, wide, sizes, portrait, gold }: { motif: Motif; card: Card; index: number; wide: boolean; sizes: string; portrait?: boolean; gold: string }) {
  switch (motif) {
    case "orbit":
      return (
        <>
          <Shape from="middle" step={0} drift="0.5rem -0.4rem" className={cn("-top-[14%] -right-[14%] aspect-square h-[min(80cqh,70cqw)] rounded-full", index % 2 === 1 ? gold : "bg-ml-flag")} />
          <Shape from="middle" step={2} drift="-0.3rem 0.3rem" className="top-[9%] left-[7%] size-5 rounded-full bg-ml-navy" />
          <Shape from="middle" step={1} drift="0 0" className="inset-0">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="size-full overflow-visible">
              <path d="M3 18C30 0 78 4 97 42" fill="none" stroke="var(--color-ml-navy)" strokeWidth="1.6" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
            </svg>
          </Shape>
          <Photo card={card} cut="circle" sizes={sizes} portrait={portrait} className="bottom-[4%] left-[6%] aspect-square h-[min(86cqh,80cqw)]" />
        </>
      );
    case "arches":
      return (
        <>
          <Shape from="foot" step={0} drift="-0.4rem 0" className="bottom-0 left-[1%] aspect-[2/1] w-[46%] rounded-t-full bg-ml-navy" />
          <Shape from="foot" step={1} drift="-0.25rem 0" className={cn("bottom-0 left-[8.5%] aspect-[2/1] w-[31%] rounded-t-full", gold)} />
          <Shape from="foot" step={2} drift="-0.1rem 0" className="bottom-0 left-[16%] aspect-[2/1] w-[16%] rounded-t-full bg-ml-flag" />
          <Photo card={card} cut="arch" sizes={sizes} portrait={portrait} className="right-[5%] bottom-0 aspect-[4/5] h-[min(94cqh,74cqw)]" />
        </>
      );
    case "target":
      return (
        <>
          <Shape from="middle" step={1} drift="-0.2rem 0.1rem" className="top-[-6%] left-[-4%] aspect-square h-[min(112cqh,90cqw)] rounded-full ring-1 ring-ml-navy/25" />
          <Shape from="middle" step={0} drift="-0.4rem 0.2rem" className={cn("top-[6%] left-[4%] grid aspect-square h-[min(88cqh,70cqw)] place-items-center rounded-full", gold)}>
            <span className="grid size-[72%] place-items-center rounded-full ring-2 ring-ml-navy/80">
              <span className="grid size-[62%] place-items-center rounded-full ring-2 ring-ml-navy/80">
                <span className="size-[44%] rounded-full bg-ml-flag" />
              </span>
            </span>
          </Shape>
          <Marks className="top-[8%] right-[6%]" />
          <Photo card={card} cut="stand" sizes={sizes} portrait={portrait} className="right-[6%] bottom-0 aspect-[3/4] h-[min(88cqh,76cqw)]" />
        </>
      );
    case "diagonal":
      return (
        <>
          <Shape from="left" step={0} drift="-0.4rem 0.2rem" className={cn("inset-0 [clip-path:polygon(0_38%,0_100%,64%_100%)]", gold)} />
          <Shape from="right" step={1} drift="0.4rem -0.2rem" className="inset-0 bg-ml-flag/85 [clip-path:polygon(46%_0,100%_0,100%_58%)]" />
          <Shape from="left" step={2} drift="0 0" className="inset-0">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="size-full">
              <line x1="0" y1="88" x2="100" y2="6" stroke="var(--color-ml-navy)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            </svg>
          </Shape>
          <Photo card={card} cut={portrait ? "stand" : "slab"} sizes={sizes} portrait={portrait} className={portrait ? "right-[18%] bottom-0 aspect-[3/4] h-[min(90cqh,76cqw)]" : "bottom-[8%] left-[14%] h-[78%] w-[66%]"} />
        </>
      );
    case "hexagons":
      return (
        <>
          {HEXES.map(([at, fill], i) => (
            <Shape
              key={at}
              from="middle"
              step={i}
              drift={`${-0.1 * i}rem 0.1rem`}
              className={cn("aspect-[1.15] w-[17%]", at, fill === "gold" ? gold : fill === "green" ? "bg-ml-flag" : "bg-ml-navy/25")}
              style={{ clipPath: HEX }}
            />
          ))}
          <Marks className="right-[6%] bottom-[8%]" />
          <Photo card={card} cut="stand" sizes={sizes} portrait={portrait} className="right-[7%] bottom-0 aspect-[3/4] h-[min(92cqh,72cqw)]" />
        </>
      );
    default:
      return (
        <>
          <Shape from="right" step={0} drift="0.5rem 0" className={cn("right-0 bottom-0", gold, wide ? "h-[40%] w-[38%] lg:h-[28%] lg:w-[48%]" : "h-[42%] w-[36%]")} />
          <Shape from="top" step={1} drift="0 0.5rem" className={cn("top-0 h-[62%] w-3.5 bg-ml-navy", wide ? "right-[8%] lg:right-[4%] lg:h-[66%] lg:w-5" : "right-[8%]")} />
          <Photo card={card} cut="slab" sizes={sizes} portrait={portrait} className={cn("bottom-0 left-0", wide ? "h-[90%] w-[82%] lg:h-[90%] lg:w-[56%]" : "h-[90%] w-[80%]")} />
        </>
      );
  }
}

/** The card's name on a navy label bar over the art, its dates or field on a gold tag above, as a film credits its people. */
export function Credit({ card }: { card: Card }) {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex max-w-[calc(100%-2rem)] flex-col items-start gap-1.5 sm:bottom-5 sm:left-5">
      {card.meta ? <p className="ml-credit bg-signal-orange px-2.5 py-1 text-xs font-bold text-ml-navy [--c:0]">{card.meta}</p> : null}
      <h3 className="ml-credit text-[clamp(1.1rem,1.45vw,1.45rem)] leading-[1.45] font-extrabold tracking-[-0.02em] text-balance text-white [--c:1]">
        <span className="bg-ml-navy box-decoration-clone px-3 py-1">{card.title}</span>
      </h3>
    </div>
  );
}

/** The words, under the art; on a wide slab card they stand beside it, over the gold block. */
function Words({ card, side, artGrows }: { card: Card; side: boolean; artGrows: boolean }) {
  return (
    <div className={cn("relative flex flex-1 flex-col gap-3 p-6 sm:p-7", artGrows && "lg:flex-none", side && "lg:absolute lg:top-0 lg:right-[9%] lg:bottom-[30%] lg:left-[60%] lg:p-0 lg:pt-10 2xl:pt-12")}>
      <p className="leading-relaxed text-pretty text-ml-navy/80">{card.text}</p>
      {card.facts?.length ? (
        <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-ml-navy/5 p-4">
          {card.facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-sm text-ml-navy/60">{f.label}</dt>
              <dd className="font-semibold text-pretty text-ml-navy">{f.value}</dd>
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

/**
 * Collage cards in the page's mosaic (wide pairs and threes) or, with `columns`, in even walls,
 * every row full and level. `ground` is the card's own colour, chosen against the band's: cream on
 * white bands, white on the rest. `portrait` keeps faces whole. On the gold band (`onGold`) the
 * gold shapes turn green, so no shape melts into the band at a card's edge. `numbered` marks each
 * card's place in a sequence, for steps and rankings.
 */
export function CollageGrid({ cards, ground, portrait, onGold, columns, numbered }: { cards: Card[]; ground: "sun" | "white"; portrait?: boolean; onGold?: boolean; columns?: 3 | 4; numbered?: boolean }) {
  const cells = cellsFor(cards.length, columns);
  return (
    <ul className={cn("grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-7", LAST_ROW_FULL)}>
      {cards.map((card, i) => {
        const cell = cells[i];
        const wide = cell.span === 7 || cell.span === 12;
        const motif = portrait ? PORTRAIT_MOTIFS[i % PORTRAIT_MOTIFS.length] : wide ? "slab" : MOTIFS[i % MOTIFS.length];
        const slab = motif === "slab";
        /* Only the slab sets its words beside the art; every other wide card gives the art the full width, so its photograph can grow. */
        const side = wide && slab;
        const grows = !side && (cell.rowSize === 2 || cell.rowSize === 1);
        return (
          <Reveal as="li" key={card.title} order={columns ? i % columns : cell.rowSize === 3 ? i % 3 : i % 2} className={cn("ml-collage flex", SPAN[cell.span])}>
            <article
              className={cn(
                "ml-card group relative flex w-full flex-col overflow-hidden rounded-[1.25rem]",
                ground === "sun" ? "bg-ml-sun" : "bg-white",
                cell.rowSize === 1 && "lg:h-[40rem]",
                cell.rowSize === 2 && "lg:h-[38rem] 2xl:h-[42rem]",
                side && "lg:block",
              )}
            >
              <div className={cn("relative h-[21rem] shrink-0 overflow-hidden [container-type:size] sm:h-[23rem]", side ? "lg:absolute lg:inset-0 lg:h-auto" : grows ? "lg:h-auto lg:flex-1" : cell.span === 3 ? "lg:h-[21rem] 2xl:h-[24rem]" : "lg:h-[24rem] 2xl:h-[27rem]")}>
                <Art motif={motif} card={card} index={i} wide={side} sizes={SIZES[cell.span]} portrait={portrait} gold={onGold ? "bg-ml-flag" : "bg-signal-orange"} />
                {numbered ? <span className="absolute top-4 left-4 z-10 grid size-11 place-items-center rounded-full bg-ml-navy text-lg font-extrabold text-white tabular-nums ring-2 ring-white">{i + 1}</span> : null}
                <Credit card={card} />
              </div>
              <Words card={card} side={side} artGrows={grows} />
            </article>
          </Reveal>
        );
      })}
    </ul>
  );
}
