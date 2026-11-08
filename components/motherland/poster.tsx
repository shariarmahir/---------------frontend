import Image from "next/image";
import Link from "next/link";
import { Fragment, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/*
 * The poster card (Mahir, 2026-11-07, after a studio poster he sent), shared by MOTHERLAND's
 * Built by Bangladesh and BD Guide's topic cards: the photograph fills the top of a night-navy
 * card and melts into it, a short serif line sits on the photo, and the foot holds a serif
 * title, one sentence, an outline pill and a quiet row with a name on the left and a few words
 * between gold sparkles on the right. The pill stretches over the whole card, so the card is
 * one link; the card never moves, its shadow deepens under the pointer.
 */

export interface PosterCard {
  title: string;
  text: string;
  /** The serif line on the photograph: where and when, or who runs it. */
  line: string;
  /** Set when the line is not in English, such as "bn". */
  lineLang?: string;
  href: string;
  /** The pill's words, such as "Read the story". */
  action: string;
  /** The foot's left side. */
  field: string;
  /** The foot's right side, between sparkles. */
  words?: readonly string[];
  picture: { src: string; alt: string; focus?: string };
}

/** Rows of two wide cards and three standing ones, in turn, with every row full: 5 is 2 + 3, 9 is 2 + 3 + 2 + 2, 20 is four of 2 + 3. */
export function posterRows(n: number): number[] {
  const rows: number[] = [];
  let left = n;
  while (left > 0) {
    if (left === 1 && rows.length) {
      const last = rows.pop()!;
      rows.push(...(last === 2 ? [3] : [2, 2]));
      break;
    }
    const size = Math.min(rows.length % 2 ? 3 : 2, left);
    rows.push(size);
    left -= size;
  }
  return rows;
}

const WIDE = { cell: "lg:col-span-3 lg:aspect-6/5", sizes: "(min-width: 640px) 50vw, 100vw" };
const STANDING = { cell: "lg:col-span-2 lg:aspect-3/5 xl:aspect-5/7 2xl:aspect-3/4", sizes: "(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw" };

/** A wall of posters: one column on phones, two on tablets (an odd last card runs across), then the rows of two and three. */
export function PosterGrid({ cards, label, className }: { cards: PosterCard[]; label?: string; className?: string }) {
  const places = posterRows(cards.length).flatMap((size) => Array.from({ length: size }, () => (size === 2 ? WIDE : STANDING)));
  const oddLast = cards.length % 2 === 1;
  return (
    <ul aria-label={label} className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:gap-6", className)}>
      {cards.map((c, i) => {
        const across = oddLast && i === cards.length - 1;
        return (
          <Reveal as="li" key={c.title} order={i % 3} className={cn(places[i].cell, across && "sm:col-span-2")}>
            <Poster card={c} sizes={across ? places[i].sizes.replace("(min-width: 640px) 50vw, ", "") : places[i].sizes} />
          </Reveal>
        );
      })}
    </ul>
  );
}

export function Poster({ card: c, sizes }: { card: PosterCard; sizes: string }) {
  return (
    <article className="group @container relative isolate flex size-full flex-col overflow-hidden rounded-[1.25rem] bg-ml-night text-white shadow-[0_30px_60px_-30px_rgb(11_24_73/0.6),0_10px_20px_-12px_rgb(11_24_73/0.25)] transition-shadow duration-500 hover:shadow-[0_44px_80px_-30px_rgb(11_24_73/0.75),0_14px_28px_-12px_rgb(11_24_73/0.3)]">
      <div className="ml-wipe relative h-64 shrink-0 overflow-hidden sm:h-72 lg:h-auto lg:min-h-44 lg:flex-1">
        <div className="ml-settle absolute inset-0">
          <Image src={c.picture.src} alt={c.picture.alt} fill sizes={sizes} className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04] motion-reduce:transition-none" style={{ objectPosition: c.picture.focus }} />
        </div>
        <span aria-hidden className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-ml-night/55 to-transparent" />
        <span aria-hidden className="absolute inset-x-0 -bottom-px h-3/5 bg-linear-to-b from-transparent via-ml-night/75 via-55% to-ml-night to-90%" />
        <p lang={c.lineLang} className="absolute top-6 right-6 left-6 font-ml-serif text-[15px] leading-snug text-white lg:top-7 lg:right-7 lg:left-7">{c.line}</p>
      </div>

      <div className="relative -mt-14 flex flex-1 flex-col px-6 pb-6 lg:flex-none lg:px-7 lg:pb-7">
        <h3 className="font-ml-serif text-[clamp(1.6rem,6.5cqi,2.6rem)] leading-[1.1] font-normal tracking-[-0.01em] text-balance text-ml-paper">{c.title}</h3>
        <p className="mt-2.5 max-w-[42ch] text-[15px] leading-normal text-white/70">{c.text}</p>
        <Go
          href={c.href}
          className="mt-5 inline-flex h-9 items-center self-start rounded-full px-4 text-[13px] font-medium text-white/90 ring-1 ring-white/35 transition-colors duration-300 group-hover:bg-white group-hover:text-ml-night group-hover:ring-white after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange"
        >
          {c.action}
          <span className="sr-only">: {c.title}</span>
        </Go>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-10 text-[13px] text-white/70 lg:pt-12">
          <span className="min-w-0 break-words">{c.field}</span>
          {c.words?.length ? (
            <span className="flex items-center gap-2.5">
              {c.words.map((w, i) => (
                <Fragment key={w}>
                  {i || c.words!.length === 1 ? <Sparkle /> : null}
                  <span>{w}</span>
                </Fragment>
              ))}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** The site's own pages route inside the app; an official site, a phone number or a section of the page is a plain link. */
function Go({ href, ...rest }: ComponentProps<"a"> & { href: string }) {
  return href.startsWith("/") ? <Link href={href} {...rest} /> : <a href={href} {...rest} />;
}

/** The four-pointed star between the words at a card's foot. */
export function Sparkle() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className="size-2.5 shrink-0 fill-signal-orange">
      <path d="M6 0C6.5 3.7 8.3 5.5 12 6 8.3 6.5 6.5 8.3 6 12 5.5 8.3 3.7 6.5 0 6 3.7 5.5 5.5 3.7 6 0Z" />
    </svg>
  );
}
