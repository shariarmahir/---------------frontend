"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CardIcon } from "@/components/ui/card-icon";
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
  /** Material Symbols name: the tile's symbol, and the fallback while its animation loads. */
  icon: string;
  /** An animated Lordicon in `public/lordicon/` (file name without `.json`), the landing page's one icon look. */
  lordicon?: string;
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
/** How long each card stays open before the next opens on its own. */
const AUTO_MS = 6500;
/** How long the reel stays still after a finger leaves it. */
const TOUCH_HOLD_MS = 5000;

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
export function PhotoReel({ sectionId, title, items, wide = false }: { sectionId: string; title: string; items: ReelItem[]; wide?: boolean }) {
  const headId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(0);
  const [row, setRow] = useState(false);
  // The reel's own position: the card standing at its start.
  const [at, setAt] = useState(0);
  const n = items.length;
  const sectionRef = useRef<HTMLElement>(null);
  // Held while a pointer, keyboard focus or a finger is on the cards.
  const held = useRef(false);
  const release = useRef(0);

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
      setAt(at);
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

  const current = row ? open : at;
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // The next card opens on its own, like a slow breath (the reviews' widening): only while the
  // reel is on screen, the tab is visible and nothing holds it. Reduced motion: it waits for a hand.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.35 });
    io.observe(section);
    const id = window.setInterval(() => {
      if (!seen || held.current || document.hidden) return;
      const i = (currentRef.current + 1) % n;
      if (row) setOpen(i);
      else if (listRef.current) scrollReelTo(listRef.current, i);
    }, AUTO_MS);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [row, n]);
  useEffect(() => () => window.clearTimeout(release.current), []);

  const hold = () => {
    window.clearTimeout(release.current);
    held.current = true;
  };
  const letGo = (after = 0) => {
    window.clearTimeout(release.current);
    release.current = window.setTimeout(() => (held.current = false), after);
  };

  return (
    <section ref={sectionRef} id={sectionId} aria-labelledby={headId} className="section-band">
      {/* The title is for screen readers only (Mahir, 2026-10-29: the cards speak for themselves). */}
      <h2 id={headId} className="sr-only">
        {title}
      </h2>

      <ul
        ref={listRef}
        onPointerEnter={(e) => e.pointerType === "mouse" && hold()}
        onPointerLeave={(e) => e.pointerType === "mouse" && letGo()}
        onTouchStart={hold}
        onTouchEnd={() => letGo(TOUCH_HOLD_MS)}
        onFocus={(e) => e.target.matches(":focus-visible") && hold()}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && letGo()}
        style={{ "--n": n } as CSSProperties}
        className={cn(
          "reel-list story-reveal @container relative mx-auto flex w-full gap-3 px-gutter-x",
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

/** Words laid straight on the picture, held legible by a soft shadow (globals.css, .reel-bare): no pane behind them (Mahir, 2026-10-29). */
const BARE = "reel-bare";

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
      style={look.vars as CSSProperties}
      className={cn(
        "group/card relative isolate flex shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-(--field) text-white scroll-mt-header lg:scroll-mt-header-lg",
        "min-h-100 w-[min(86vw,30rem)] sm:min-h-128 sm:w-120 lg:w-176",
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
      {/* One flat dim under the words wherever they stand on the picture (every card in the reel, the
          open card in the row), so white and gold read without a pane or a gradient. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 bg-black opacity-35 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          !open && "min-[90rem]:opacity-0",
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
          "absolute inset-0 z-10 hidden scroll-mt-header-lg flex-col items-center justify-end rounded-3xl p-2 pb-5 text-center transition-opacity min-[90rem]:flex",
          "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none focus-visible:ring-inset",
          open ? "pointer-events-none opacity-0 duration-150" : "opacity-100 delay-300 duration-500",
        )}
      >
        <span
          className={cn(
            BARE,
            "flex flex-col items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:-translate-y-1 motion-reduce:transition-none",
          )}
        >
          {item.lordicon ? (
            <CardIcon name={item.lordicon} fallback={item.icon} size={44} />
          ) : (
            <Icon name={item.icon} className="text-[1.375rem]! text-signal-orange" />
          )}
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
      <div {...r(0)} className={cn(BARE, "reel-caption flex flex-col gap-3 rounded-2xl", r(0).className)}>
        <h3 lang={lang} className={cn("text-[clamp(1.375rem,1.05rem+1.1cqi,1.625rem)] leading-[1.12] font-bold tracking-tight text-balance", face, item.bangla && "leading-tight")}>
          {item.title}
        </h3>
        <p className="max-w-[60ch] text-sm leading-relaxed text-pretty text-white/90">{item.summary}</p>
        <div className="flex flex-wrap items-center gap-3 pt-1">{item.actions}</div>
      </div>

      {/* The evidence, a narrower pane of its own. */}
      {item.proof && (
        <div {...r(1)} role="group" aria-label={item.proof.heading} className={cn(BARE, "reel-stat rounded-2xl max-sm:hidden", r(1).className)}>
          {item.proof.render(active)}
        </div>
      )}
    </div>
  );
}
