"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type { Photo } from "@/data/bangladesh";
import { cn } from "@/lib/utils";
import { useInView } from "./charter-kit";
import type { CharterLook } from "./charter-looks";

/*
 * The home page's photograph reel (Mahir, 2026-10-25, after getahugo.com's
 * assessment reel), shared by the charter ("From Problem to Impact") and the
 * promo row ("Six Ways to Act"): a one-line gold title with two bare gold
 * arrows, then the cards. From 90rem they stand in one row: the open card
 * wide, the others as narrow tiles; a tile opens on a click (or Enter), the
 * arrows step through. Below 90rem the cards are a swipe reel, every card
 * whole, the arrows paging it (a phone swipes).
 *
 * The open card shows its picture in full, untinted. Everything to read sits
 * on frosted panes of the card's field (navy, ink or cobalt): a caption pane
 * at the bottom-left (the symbol and name, the title, the text, the
 * actions) and, apart from it at the bottom-right, a narrower pane for the
 * evidence when there is some; stacked on a narrow card. The panes are
 * translucent and blurred, dense enough for the type (white at 4.5 : 1).
 * A closed tile keeps a light wash of its field and carries its symbol and
 * name on a small frosted label. No gradient.
 *
 * The CSS is `.reel-*` in globals.css.
 */

/** What stands behind a card's panes. */
export type ReelArt =
  /**
   * A photograph. `focus` slides it sideways; `lift` (a fraction of the
   * card's height) sets it taller than the card and anchors it at the
   * bottom, which crops the empty top and raises the subject above the panes
   * (a point at height y lands at y(1 + lift) - lift). Deep where the
   * subject sits low, gentle where heads are high. A closed tile keeps the
   * plain framing.
   */
  | { kind: "photo"; photo: Photo; focus: string; lift: number }
  /** An app's own screen, filling the card from its top-left corner. */
  | { kind: "screen"; src: string; alt: string }
  /** Anything else, drawn on the card's field; told whether the card is open. */
  | { kind: "custom"; render: (open: boolean) => ReactNode };

export interface ReelItem {
  /** The card's DOM id; arriving at "#id" brings it forward. */
  id: string;
  /** The tile's label and the caption's first line. */
  name: string;
  icon: string;
  look: CharterLook;
  art: ReelArt;
  title: ReactNode;
  /** The title as plain text, for the controls' names. */
  titleText: string;
  summary: string;
  actions: ReactNode;
  /** The evidence pane: its heading and its content (told whether to count up). */
  proof?: { heading: string; render: (active: boolean) => ReactNode };
  /** Bangla name and title (Hind Siliguri) instead of Sora. */
  bangla?: boolean;
}

/** The expanding row from 90rem (below it the open card is too narrow for its slide); below it, the swipe reel. */
const ROW_MQ = "(min-width: 90rem)";

/** Pages the reel so card `i` stands at its gutter. */
function scrollReelTo(list: HTMLElement, i: number) {
  const card = list.children[i] as HTMLElement | undefined;
  if (!card) return;
  const pad = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  list.scrollTo({ left: card.offsetLeft - pad, behavior: reduce ? "auto" : "smooth" });
}

/**
 * `wide`: the cards run the full width of the screen and stand shorter (the promo row); the title and
 * arrows stay on the page's content width, like every other section's. Otherwise the cards keep that
 * width and their full height (the charter's tables need it).
 */
export function PhotoReel({ sectionId, title, noun, items, wide = false }: { sectionId: string; title: string; noun: string; items: ReelItem[]; wide?: boolean }) {
  const headId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(0);
  const [row, setRow] = useState(false);
  // The reel's own position, for its arrows: the card at its start and whether it can move either way.
  const [reel, setReel] = useState({ at: 0, start: true, end: false });
  const n = items.length;

  useEffect(() => {
    const mq = window.matchMedia(ROW_MQ);
    const sync = () => setRow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || row) return;
    const read = () => {
      const pad = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
      const left = list.getBoundingClientRect().left + pad;
      const cards = [...list.children] as HTMLElement[];
      let at = 0;
      let best = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.getBoundingClientRect().left - left);
        if (d < best) [best, at] = [d, i];
      });
      const max = list.scrollWidth - list.clientWidth;
      setReel((r) => {
        const next = { at, start: list.scrollLeft < 8, end: list.scrollLeft > max - 8 };
        return r.at === next.at && r.start === next.start && r.end === next.end ? r : next;
      });
    };
    read();
    list.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      list.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [row]);

  // Arriving at "#mission" (the header's Mission tab) or any card's id brings that card forward:
  // on load, on hashchange and back/forward, and on an in-page link (Next's links push the hash
  // without a hashchange).
  useEffect(() => {
    const bring = (hash: string) => {
      const i = items.findIndex((s) => `#${s.id}` === hash);
      if (i < 0) return;
      setOpen(i);
      if (!window.matchMedia(ROW_MQ).matches && listRef.current) scrollReelTo(listRef.current, i);
    };
    const fromLocation = () => bring(window.location.hash);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = new URL(a.href, window.location.href);
      if (url.pathname === window.location.pathname) bring(url.hash);
    };
    fromLocation();
    window.addEventListener("hashchange", fromLocation);
    window.addEventListener("popstate", fromLocation);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", fromLocation);
      window.removeEventListener("popstate", fromLocation);
      document.removeEventListener("click", onClick);
    };
  }, [items]);

  const current = row ? open : reel.at;
  const atStart = row ? open === 0 : reel.start;
  const atEnd = row ? open === n - 1 : reel.end;
  const step = (d: -1 | 1) => {
    const i = Math.min(n - 1, Math.max(0, current + d));
    if (row) setOpen(i);
    else if (listRef.current) scrollReelTo(listRef.current, i);
  };

  return (
    <section id={sectionId} aria-labelledby={headId} className="section-band">
      <div className="story-reveal mx-auto flex w-full max-w-384 items-end justify-between gap-6 px-gutter-x">
        {/* The home page's section title: gold, bold, one line from lg (SectionHeading's style). */}
        <h2
          id={headId}
          className="font-grotesk text-[1.75rem] leading-[1.15] font-bold tracking-tight text-balance text-signal-orange sm:text-3xl sm:leading-[1.2] lg:text-4xl lg:whitespace-nowrap"
        >
          {title}
        </h2>
        {/* -mr-2.5: the glyph, not its 44px target, lines up with the cards' right edge. A phone swipes instead. */}
        <div role="group" aria-label={`${title}: cards`} className="-mr-2.5 flex shrink-0 gap-1 max-sm:hidden">
          <Arrow dir="prev" noun={noun} disabled={atStart} onClick={() => step(-1)} />
          <Arrow dir="next" noun={noun} disabled={atEnd} onClick={() => step(1)} />
        </div>
      </div>

      <ul
        ref={listRef}
        style={{ "--n": n } as CSSProperties}
        className={cn(
          "reel-list story-reveal @container relative mx-auto mt-8 flex w-full gap-3 px-gutter-x sm:mt-10",
          !wide && "max-w-384",
          // The reel: swiped sideways, each card snapping to the gutter.
          "snap-x snap-mandatory scroll-px-gutter-x overflow-x-auto overscroll-x-contain pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden",
          // The row: no scrolling, a fixed height.
          "min-[90rem]:snap-none min-[90rem]:overflow-visible min-[90rem]:pb-0",
          wide ? "min-[90rem]:h-120 2xl:h-128" : "min-[90rem]:h-144 2xl:h-150",
        )}
      >
        {items.map((item, i) => (
          <ReelCard key={item.id} item={item} open={open === i} row={row} onOpen={() => setOpen(i)} />
        ))}
      </ul>

      <p className="sr-only" aria-live="polite">
        {`${items[current].name}, ${current + 1} of ${n}`}
      </p>
    </section>
  );
}

/**
 * A bare gold arrow: no disc, no glass (Mahir, 2026-10-17); a 44px target with a visible focus ring.
 * At the end of the row it is aria-disabled rather than disabled, so keyboard focus stays on it.
 */
function Arrow({ dir, noun, disabled, onClick }: { dir: "prev" | "next"; noun: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      aria-disabled={disabled}
      aria-label={`${dir === "prev" ? "Previous" : "Next"} ${noun}`}
      className={cn(
        "group/arrow grid size-11 place-items-center rounded-xl text-signal-orange transition-opacity duration-300",
        "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
        "aria-disabled:cursor-default aria-disabled:opacity-30",
      )}
    >
      <Icon
        name={dir === "prev" ? "arrow_back" : "arrow_forward"}
        className={cn(
          "text-[1.75rem]! transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          !disabled && (dir === "prev" ? "group-hover/arrow:-translate-x-1" : "group-hover/arrow:translate-x-1"),
        )}
      />
    </button>
  );
}

/** A frosted pane of the card's field laid on the picture (globals.css, .reel-glass): the picture shows through, blurred. */
const GLASS = "reel-glass ring-1 ring-white/15 ring-inset";

const SIZES = "(min-width: 90rem) 70vw, (min-width: 64rem) 52rem, (min-width: 40rem) 36rem, 100vw";

/**
 * One card. How it looks in the row is set by CSS from `open` alone (the
 * `min-[90rem]:` classes), so the server's first paint on a wide screen is
 * already the finished row; `row` (known only after hydration) decides what
 * is reachable: in the reel every slide is, in the row only the open one.
 */
function ReelCard({ item, open, row, onOpen }: { item: ReelItem; open: boolean; row: boolean; onOpen: () => void }) {
  const { look, art } = item;
  const slideId = useId();
  const slideRef = useRef<HTMLDivElement>(null);
  const [ref, { active }] = useInView<HTMLLIElement>();
  const face = item.bangla ? "font-bengali" : "font-grotesk";
  // Bangla names and titles are marked as Bangla, so a screen reader speaks them in a Bangla voice.
  const lang = item.bangla ? "bn" : undefined;
  const lift = art.kind === "photo" ? art.lift : 0;
  const label = `${item.name}: ${item.titleText}`;

  const imageClass = cn(
    "object-cover transition-[scale] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
    open ? "reel-settle" : "min-[90rem]:group-hover/card:scale-105",
  );

  return (
    <li
      ref={ref}
      id={item.id}
      // Cobalt is the lightest field, so its panes are a step more opaque to hold the white type.
      style={{ ...look.vars, "--glass": look.vars["--field"] === "var(--color-cobalt)" ? "80%" : "72%" } as CSSProperties}
      className={cn(
        "group/card relative isolate flex shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-(--field) text-white scroll-mt-header lg:scroll-mt-header-lg",
        "min-h-128 w-[min(86vw,30rem)] sm:w-120 lg:w-176",
        "min-[90rem]:min-h-0 min-[90rem]:w-auto min-[90rem]:basis-(--spine) min-[90rem]:transition-[flex-grow] min-[90rem]:duration-700 min-[90rem]:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open ? "min-[90rem]:grow" : "min-[90rem]:grow-0",
      )}
    >
      {/* The picture: in full on an open card, under a light wash of the field on a closed tile. */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 -z-20 h-(--lifted) transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          !open && "min-[90rem]:h-full",
        )}
        style={{ "--lifted": `${(1 + lift) * 100}%` } as CSSProperties}
      >
        {art.kind === "photo" && (
          <Image src={art.photo.src} alt={art.photo.alt} fill sizes={SIZES} className={imageClass} style={{ objectPosition: art.focus }} />
        )}
        {art.kind === "screen" && <Image src={art.src} alt={art.alt} fill sizes={SIZES} className={cn(imageClass, "object-top-left")} />}
        {art.kind === "custom" && art.render(open)}
      </div>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 bg-(--field) opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          !open && "min-[90rem]:opacity-35 min-[90rem]:group-hover/card:opacity-0",
        )}
      />
      {/* The edge, drawn over the picture so it holds on the black. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-10 rounded-3xl ring-1 ring-white/12 ring-inset" />

      {/* A closed tile (row only; hidden in the reel): its symbol and name on a small frosted label at
          the foot; the whole tile opens it. Opened from the keyboard, focus moves into the slide. */}
      <button
        type="button"
        inert={open}
        onClick={(e) => {
          onOpen();
          if (e.detail === 0) requestAnimationFrame(() => slideRef.current?.focus());
        }}
        aria-expanded={false}
        aria-controls={slideId}
        aria-label={`Open ${label}`}
        className={cn(
          // scroll-mt: tabbing to a tile scrolls it clear of the fixed header, focus ring included.
          "absolute inset-0 z-10 hidden scroll-mt-header-lg flex-col justify-end rounded-3xl p-2 text-left transition-opacity min-[90rem]:flex",
          "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none focus-visible:ring-inset",
          open ? "pointer-events-none opacity-0 duration-150" : "opacity-100 delay-300 duration-500",
        )}
      >
        <span
          className={cn(
            GLASS,
            "flex flex-col items-start gap-2.5 rounded-2xl p-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:-translate-y-1 motion-reduce:transition-none",
          )}
        >
          <Icon name={item.icon} className="text-[1.375rem]! text-signal-orange" />
          <span lang={lang} className={cn("text-sm leading-tight font-bold", face)}>{item.name}</span>
        </span>
      </button>

      {/* The slide, set at the open card's final width so it never reflows while the card grows. */}
      <div
        ref={slideRef}
        id={slideId}
        tabIndex={-1}
        role="group"
        aria-label={label}
        inert={row && !open}
        className={cn(
          "@container/slide relative flex flex-1 flex-col p-3 outline-none sm:p-4",
          "min-[90rem]:absolute min-[90rem]:inset-y-0 min-[90rem]:left-0 min-[90rem]:w-[calc(100cqw-(var(--n)-1)*(var(--spine)+0.75rem))] min-[90rem]:p-4 min-[90rem]:transition-opacity motion-reduce:transition-none",
          open ? "min-[90rem]:opacity-100 min-[90rem]:delay-200 min-[90rem]:duration-500" : "min-[90rem]:opacity-0 min-[90rem]:duration-150",
        )}
      >
        <Slide item={item} face={face} rise={open} active={active && (!row || open)} />
      </div>
    </li>
  );
}

function Slide({ item, face, rise, active }: { item: ReelItem; face: string; rise: boolean; active: boolean }) {
  const lang = item.bangla ? "bn" : undefined;
  // In the row, the open card's panes rise in one after another; elsewhere they simply stand.
  const r = (i: number) => (rise ? { className: "reel-rise", style: { "--i": i } as CSSProperties } : { className: "" });
  return (
    <div className="reel-slide">
      {/* The caption: the symbol and name, then the title, the text and the actions. */}
      <div {...r(0)} className={cn(GLASS, "reel-caption flex flex-col gap-3 rounded-2xl", r(0).className)}>
        <p lang={lang} className={cn("flex items-center gap-2 text-sm font-semibold text-white/80", face)}>
          <Icon name={item.icon} className="text-xl! text-signal-orange" />
          {item.name}
        </p>
        <h3 lang={lang} className={cn("text-[clamp(1.375rem,1.05rem+1.1cqi,1.625rem)] leading-[1.12] font-bold tracking-tight text-balance", face, item.bangla && "leading-tight")}>
          {item.title}
        </h3>
        <p className="max-w-[60ch] text-sm leading-relaxed text-pretty text-white/90">{item.summary}</p>
        <div className="flex flex-wrap items-center gap-3 pt-1">{item.actions}</div>
      </div>

      {/* The evidence, a narrower pane of its own. */}
      {item.proof && (
        <div {...r(1)} className={cn(GLASS, "reel-stat rounded-2xl", r(1).className)}>
          <p className="text-xs font-semibold text-white/75">{item.proof.heading}</p>
          <div className="mt-3">{item.proof.render(active)}</div>
        </div>
      )}
    </div>
  );
}
