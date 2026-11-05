"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { divisionShapes, MAP_HEIGHT, MAP_WIDTH, type DivisionId } from "@/data/bangladesh-map";
import { CATEGORIES } from "@/data/motherland-categories";
import type { Picture } from "@/data/motherland";
import { BEST, BOTH_SIDES, FACT_INDEX, FACT_NAV, FACT_TOPICS, FACTS_NAME, NOT_BEST } from "@/data/motherland-facts";
import { searchFacts } from "@/lib/motherland-facts-search";
import { cn } from "@/lib/utils";
import { pill } from "./kit";

/** A link inside the page or out of it. */
function Go({ href, ...rest }: React.ComponentProps<"a"> & { href: string }) {
  return href.startsWith("#") ? <a href={href} {...rest} /> : <Link href={href} {...rest} />;
}

/** Three stripes in the flag's colours, green, red, green, leaning as if in the wind. Always on white, so the colours stay true. */
function FactsMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-white shadow-[0_1px_2px_rgb(11_24_73/0.18)] ring-1 ring-ml-navy/10", className)}>
      <svg viewBox="0 0 28 28" strokeWidth={0.9} strokeLinejoin="round" className="size-7">
        <path d="M2 9.5 8.5 7.5v18L2 27.5Z" className="fill-ml-flag stroke-ml-flag" />
        <path d="M10.75 6.8 17.25 4.8v18l-6.5 2Z" className="fill-ml-red stroke-ml-red" />
        <path d="M19.5 4.1 26 2.1v18l-6.5 2Z" className="fill-ml-flag stroke-ml-flag" />
      </svg>
    </span>
  );
}

/**
 * The way round this page: a tab on the right edge, above "Join with us" (a pill
 * at the foot of a phone's screen), opening a side panel with the page's name, a
 * search across all the facts, its sections with the one in view marked, and
 * every topic. A native dialog, so focus and Escape behave without extra code.
 */
export function FactsNav() {
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const sections = FACT_NAV.map((n) => document.getElementById(n.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setCurrent((c) => (e.isIntersecting ? e.target.id : c === e.target.id ? null : c));
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = dialog.current;
    const root = document.documentElement;
    panel?.showModal();
    field.current?.focus();
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
      panel?.close();
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const results = searchFacts(query, FACT_INDEX);
  const searching = query.trim().length > 0;
  const goToFirst = (e: FormEvent) => {
    e.preventDefault();
    if (!results[0]) return;
    window.location.assign(results[0].href);
    close();
  };

  return (
    <>
      <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex min-h-12 items-center gap-2.5 rounded-full bg-ml-navy py-1.5 pr-5 pl-1.5 font-semibold text-white shadow-lg ring-1 ring-white/20 transition-colors hover:bg-ml-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange lg:top-auto lg:right-0 lg:bottom-[calc(50%+5.5rem)] lg:flex-col lg:rounded-none lg:rounded-l-xl lg:px-1.5 lg:py-3 lg:text-sm print:hidden">
        <FactsMark className="size-9 lg:size-8" />
        <span className="lg:rotate-180 lg:[writing-mode:vertical-rl]">Topics</span>
      </button>

      <dialog ref={dialog} aria-label={FACTS_NAME} onClose={close} onKeyDown={(e) => e.key === "Escape" && close()} onClick={(e) => e.target === e.currentTarget && close()} className="m-0 ml-auto h-dvh max-h-none w-[min(30rem,100vw)] max-w-none overflow-hidden bg-white p-0 text-ml-navy shadow-2xl backdrop:bg-ml-navy/55 animate-in slide-in-from-right-8 fade-in-0 duration-300 motion-reduce:animate-none">
        {open ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-ml-navy/10 py-3 pr-3 pl-5">
              <FactsMark />
              <p className="min-w-0 flex-1 truncate font-ml-display text-xl tracking-[0.03em] uppercase">{FACTS_NAME}</p>
              <button type="button" onClick={close} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-ml-ground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange">
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <form role="search" onSubmit={goToFirst} className="flex items-center gap-3 border-b border-ml-navy/10 px-5 py-2">
              <Icon name="search" className="text-2xl text-ml-navy/60" />
              <input ref={field} type="search" name="fact-search" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" aria-label="Search the facts" placeholder="Search, such as air, Padma or rice…" className="min-h-11 w-full bg-transparent font-medium outline-none placeholder:text-ml-navy/55 [&::-webkit-search-cancel-button]:appearance-none" />
            </form>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {searching ? (
                <>
                  <p role="status" className="px-2 pt-1 pb-2 text-sm text-ml-navy/70">
                    {results.length ? `${results.length} ${results.length === 1 ? "result" : "results"}` : `Nothing matches "${query.trim()}". Try a word like rice, air or loans.`}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {results.map((r) => (
                      <li key={r.href}>
                        <PanelLink href={r.href} picture={r.picture} onClick={close} title={r.title} detail={r.group} figure={r.figure} />
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="px-2 pt-1 pb-1.5 font-bold">On this page</h2>
                  <ul className="flex flex-col">
                    {FACT_NAV.map((n) => (
                      <li key={n.id}>
                        <a href={`#${n.id}`} onClick={close} aria-current={n.id === current ? "true" : undefined} className={cn("flex min-h-11 items-center rounded-lg border-l-[3px] pr-3 pl-[5px] font-semibold transition-colors hover:bg-ml-ground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal-orange", n.id === current ? "border-signal-orange bg-ml-ground" : "border-transparent")}>
                          {n.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <h2 className="px-2 pt-5 pb-1.5 font-bold">All topics</h2>
                  <ul className="flex flex-col gap-0.5">
                    {FACT_TOPICS.slice(2).map((t) => (
                      <li key={t.title}>
                        <PanelLink href={t.href} picture={t.picture} onClick={close} title={t.title} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

/** A row in the side panel: a small photograph, a title, and the figure if it has one. */
function PanelLink({ href, picture, onClick, title, detail, figure }: { href: string; picture: Picture; onClick: () => void; title: string; detail?: string; figure?: string }) {
  return (
    <Go href={href} onClick={onClick} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-ml-ground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal-orange">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ml-mist">
        <Image src={picture.src} alt="" fill sizes="48px" className="object-cover" style={{ objectPosition: picture.focus }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{title}</span>
        {detail ? <span className="block truncate text-sm text-ml-navy/70">{detail}</span> : null}
      </span>
      {figure ? <span className="shrink-0 font-ml-display text-xl tracking-[0.01em] tabular-nums">{figure}</span> : null}
    </Go>
  );
}

/** Copies a link to one fact, or opens the phone's own share sheet. */
export function ShareFact({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      /* Closing the share sheet rejects; that isn't an error worth showing. */
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* No clipboard here: put the link in the address bar instead, where it can be copied by hand. */
      window.location.hash = id;
    }
  };
  return (
    <button type="button" onClick={share} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ml-navy/80 transition-colors hover:bg-ml-navy/8 hover:text-ml-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange print:hidden">
      <Icon name={copied ? "check" : "link"} className="text-lg" />
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
}

const STRENGTHS = new Map<string, (typeof BEST.items)[number]>(BEST.items.map((f) => [f.id, f]));
const FAILINGS = new Map<string, (typeof NOT_BEST.items)[number]>(NOT_BEST.items.map((f) => [f.id, f]));

/** One subject from both lists, side by side: the point of the page in one look. */
export function BothSides() {
  const [index, setIndex] = useState(0);
  const pair = BOTH_SIDES.pairs[index];
  const sides = [
    { fact: STRENGTHS.get(pair.best)!, heading: BEST.title, figure: "bg-signal-orange text-ml-navy" },
    { fact: FAILINGS.get(pair.hard)!, heading: NOT_BEST.title, figure: "bg-ml-red text-white" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-wrap gap-2.5">
        {BOTH_SIDES.pairs.map((p, i) => (
          <li key={p.subject}>
            <button type="button" aria-pressed={i === index} onClick={() => setIndex(i)} className={cn("min-h-11 rounded-full px-5 font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange", i === index ? "bg-ml-navy text-white" : "bg-ml-ground text-ml-navy hover:bg-signal-orange")}>
              {p.subject}
            </button>
          </li>
        ))}
      </ul>
      <div key={pair.subject} className="grid gap-5 animate-in fade-in-0 duration-500 motion-reduce:animate-none lg:grid-cols-2 lg:gap-6">
        {sides.map(({ fact, heading, figure }) => (
          <a key={fact.id} href={`#${fact.id}`} className="group relative isolate flex min-h-80 flex-col items-start justify-end gap-3 overflow-hidden rounded-[1.25rem] bg-ml-navy p-6 text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal-orange sm:p-8 lg:min-h-96">
            <Image src={fact.picture.src} alt="" fill sizes="(min-width: 1024px) 48vw, 92vw" className="-z-20 object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04] motion-reduce:transition-none" style={{ objectPosition: fact.picture.focus }} />
            <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ml-navy via-ml-navy/55 to-ml-navy/5" />
            <span className="text-sm font-semibold text-white/90">{heading}</span>
            <span className={cn("rounded-xl px-4 pt-2 pb-1.5 font-ml-display text-[clamp(2.75rem,4.5vw,4.5rem)] leading-none tracking-[0.01em] tabular-nums", figure)}>{fact.figure}</span>
            <span className="text-xl font-bold">{fact.title}</span>
          </a>
        ))}
      </div>
      <p aria-live="polite" className="text-[clamp(1.25rem,2vw,1.75rem)] leading-snug font-medium text-pretty text-ml-navy">
        {pair.line}
      </p>
    </div>
  );
}

const DIVISIONS = CATEGORIES.find((c) => c.slug === "travel")!.subcategories.find((s) => s.id === "eight-divisions")!.stories;
const TONES: Record<DivisionId, string> = {
  dhaka: "fill-ml-navy",
  chattogram: "fill-ml-navy-700",
  rajshahi: "fill-ml-navy-700",
  khulna: "fill-ml-navy/80",
  barishal: "fill-ml-navy-700/85",
  sylhet: "fill-ml-navy/80",
  rangpur: "fill-ml-navy",
  mymensingh: "fill-ml-navy/70",
};

/** Two names would run onto water from their centres, so they sit on their land. */
const LABEL_AT: Partial<Record<DivisionId, { x: number; y: number }>> = { chattogram: { x: 540, y: 640 }, barishal: { x: 289, y: 588 } };

/** The eight divisions: point at or choose one to read about it, in a card with its photograph. */
export function FactsMap() {
  const [current, setCurrent] = useState<DivisionId>("dhaka");
  const story = (id: DivisionId) => DIVISIONS.find((d) => d.title.toLowerCase() === id)!;
  const here = story(current);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Map of the eight divisions of Bangladesh" className="mx-auto max-h-160 w-full max-w-xl">
        {divisionShapes.map((d) => (
          <g key={d.id} onMouseEnter={() => setCurrent(d.id)} onClick={() => setCurrent(d.id)} className="cursor-pointer">
            <path d={d.d} className={cn("stroke-white transition-colors duration-300", d.id === current ? "fill-signal-orange" : TONES[d.id])} strokeWidth={2.5} strokeLinejoin="round" />
          </g>
        ))}
        {divisionShapes.map((d) => (
          <text key={d.id} x={LABEL_AT[d.id]?.x ?? d.cx} y={LABEL_AT[d.id]?.y ?? d.cy} textAnchor="middle" className={cn("pointer-events-none font-bold capitalize", d.id === "chattogram" || d.id === "barishal" ? "text-[0.9rem]" : "text-[1.05rem]", d.id === current ? "fill-ml-navy" : "fill-white")}>
            {d.id}
          </text>
        ))}
      </svg>

      <div className="flex min-w-0 flex-col gap-5">
        <ul className="flex flex-wrap gap-2.5">
          {divisionShapes.map((d) => (
            <li key={d.id}>
              <button type="button" aria-pressed={d.id === current} onClick={() => setCurrent(d.id)} className={cn("min-h-11 rounded-full px-5 font-semibold capitalize transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange", d.id === current ? "bg-signal-orange text-ml-navy" : "bg-white text-ml-navy ring-1 ring-ml-navy/10 hover:bg-ml-mist")}>
                {d.id}
              </button>
            </li>
          ))}
        </ul>
        <article className="ml-card overflow-hidden rounded-[1.25rem] bg-ml-navy text-white">
          <div className="relative aspect-16/9 overflow-hidden bg-ml-mist lg:aspect-auto lg:h-88">
            <Image key={here.title} src={here.picture.src} alt={here.picture.alt} fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-cover animate-in fade-in-0 duration-500 motion-reduce:animate-none" style={{ objectPosition: here.picture.focus }} />
          </div>
          <div aria-live="polite" className="flex flex-col gap-2 p-6 lg:min-h-44 lg:p-8">
            <h3 className="font-ml-display text-[clamp(1.75rem,2.6vw,2.75rem)] leading-[1.1] tracking-[0.01em] uppercase">{here.title}</h3>
            <p className="max-w-[62ch] text-lg leading-relaxed text-pretty text-white/85">{here.text}</p>
          </div>
        </article>
      </div>
    </div>
  );
}

/** Prints the whole page: photographs further down haven't loaded yet, so it asks for them first. */
export function PrintButton() {
  const [busy, setBusy] = useState(false);
  const print = async () => {
    setBusy(true);
    const lazy = [...document.querySelectorAll<HTMLImageElement>("main img")];
    lazy.forEach((img) => (img.loading = "eager"));
    /* A photograph that fails still shouldn't stop the printing, and nor should a slow line. */
    await Promise.race([Promise.allSettled(lazy.map((img) => img.decode())), new Promise((done) => window.setTimeout(done, 8000))]);
    setBusy(false);
    window.print();
  };
  return (
    <button type="button" onClick={print} disabled={busy} className={cn(pill.onDark, "disabled:opacity-70 print:hidden")}>
      <Icon name="print" className="text-xl" />
      {busy ? "Getting the photographs…" : "Print or save as PDF"}
    </button>
  );
}
