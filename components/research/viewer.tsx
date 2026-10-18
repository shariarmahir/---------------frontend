"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { FIELDS, KINDS, LEVELS, type Article } from "@/lib/research/core";
import { toHtml } from "@/lib/research/export";
import { clampSeq, docPages, pagesMatching, type DocPage } from "@/lib/research/pages";
import { cn } from "@/lib/utils";
import { absoluteUrl, downloadAs, useDismiss } from "./actions";
import { byline, ICON_BTN, MENU, MENU_ITEM, typeOf } from "./kit";
import { Blocks, Callout, Cited, FigureView, TableView } from "./prose";

/** Other parts of the page (contents lists, "Read online") open a page by sending this event. */
export const SEQ_EVENT = "research:seq";
export const openSeq = (n: number) => window.dispatchEvent(new CustomEvent<number>(SEQ_EVENT, { detail: n }));

/* "Search document" marks every hit with the CSS Custom Highlight API. The rule lives here because
   the CSS optimiser does not parse ::highlight() yet; the colours are the gold and navy tokens. */
const HIGHLIGHT_CSS = "::highlight(doc-search){background-color:var(--color-signal-orange);color:var(--color-bdnavy-900)}";

const ZOOMS = [0.8, 0.9, 1, 1.15, 1.3, 1.5] as const;
const TOOL = ICON_BTN;

/** Figure and table numbers run through the whole work, as in print. */
function numbering(a: Article) {
  let f = 0;
  let t = 0;
  return a.sections.map((s) => ({ figures: (s.figures ?? []).map(() => ++f), tables: (s.tables ?? []).map(() => ++t) }));
}

/** One white page, set like the site (Sora headings, Inter text): a running head, the content, the page number at the foot. */
function Page({ a, page, count, nums }: { a: Article; page: DocPage; count: number; nums: ReturnType<typeof numbering> }) {
  return (
    <article
      id={`page-${page.n}`}
      data-page={page.n}
      aria-label={`Page ${page.n} of ${count}`}
      className="mx-auto w-full rounded-lg bg-white px-[8%] pt-[6%] pb-[5%] font-sans leading-[1.7] text-text-primary shadow-[0_18px_40px_-18px_rgb(0_0_0/0.8)]"
    >
      {page.n > 1 && (
        <p className="mb-[2em] flex justify-between gap-6 border-b border-bdnavy-900/20 pb-[0.5em] text-[0.75em] text-bdnavy-700">
          <span className="truncate">{a.title}</span>
          <span className="shrink-0">{page.title}</span>
        </p>
      )}

      {page.kind === "title" && (
        <div>
          <div className="border-y border-bdnavy-900/40 py-[1.2em] text-center">
            <p className="text-[0.8em] font-semibold text-bdnavy-700">{typeOf(a)}</p>
            <h1 className="mt-[0.5em] font-grotesk text-[1.6em] leading-snug font-bold tracking-tight text-bdnavy-900">{a.title}</h1>
          </div>
          <p className="mt-[1.2em] text-center text-[1.02em]">{byline(a, 8)}</p>
          <p className="text-center text-[0.85em] text-bdnavy-700">{a.institution} · {a.year}</p>
          {a.supervisor && <p className="text-center text-[0.8em] text-bdnavy-700">Supervised by {a.supervisor}</p>}
          <h2 className="mt-[2em] font-grotesk text-[0.95em] font-bold text-bdnavy-900">Abstract</h2>
          <p className="mt-[0.5em] text-pretty sm:text-justify"><Cited text={a.summary} /></p>
          {a.keywords.length > 0 && (
            <p className="mt-[1em] text-[0.88em]"><span className="font-semibold text-bdnavy-900">Keywords: </span>{a.keywords.join("; ")}</p>
          )}
          <p className="mt-[1.4em] text-[0.78em] text-bdnavy-700">{KINDS[a.kind].type} · {FIELDS[a.field].en} · {LEVELS[a.level]}{a.district ? ` · ${a.district}` : ""}</p>
          {a.sample && (
            <p className="mt-[1.4em] rounded-md border border-signal-orange bg-signal-orange/15 px-[1em] py-[0.7em] text-[0.8em]">
              Sample entry. The people, institution and figures are illustrative; do not cite this as a real study.
            </p>
          )}
          {(a.preprint || a.ongoing) && !a.sample && (
            <p className="mt-[1.4em] rounded-md border border-bdnavy-900/25 bg-bdnavy-50 px-[1em] py-[0.7em] text-[0.8em]">
              {a.preprint ? "Working paper: published for reading and comment, not yet peer reviewed." : "Ongoing research: findings are provisional."}
            </p>
          )}
        </div>
      )}

      {page.kind === "section" &&
        (() => {
          const s = a.sections[page.section];
          const n = nums[page.section];
          return (
            <div>
              <p className="text-[0.78em] font-semibold text-bdnavy-700">Section {page.section + 1}</p>
              <h2 className="mt-[0.3em] font-grotesk text-[1.35em] leading-snug font-bold tracking-tight text-bdnavy-900">{s.heading}</h2>
              <Blocks body={s.body} />
              {s.callout && <Callout c={s.callout} />}
              {s.figures?.map((f, i) => <FigureView key={f.title} f={f} n={n.figures[i]} />)}
              {s.tables?.map((t, i) => <TableView key={t.title} t={t} n={n.tables[i]} />)}
            </div>
          );
        })()}

      {page.kind === "references" && (
        <div>
          <h2 className="font-grotesk text-[1.35em] font-bold tracking-tight text-bdnavy-900">References</h2>
          <ol className="mt-[1em] space-y-[0.6em] text-[0.85em]">
            {a.references.map((r, i) => (
              <li key={i} id={`ref-${i + 1}`} className="grid scroll-mt-4 grid-cols-[2.2em_minmax(0,1fr)] gap-[0.3em]">
                <span className="text-right tabular-nums">[{i + 1}]</span>
                <span className="wrap-break-word">
                  {r.text}
                  {r.url && (
                    <>
                      {" "}
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[0.9em] break-all text-cobalt underline underline-offset-2">{r.url}</a>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="mt-[2.4em] text-center text-[0.75em] text-bdnavy-700 tabular-nums">{page.n}</p>
    </article>
  );
}

/** Mark every hit of the query inside the pages, where the browser supports CSS highlights. */
function highlight(root: HTMLElement | null, query: string) {
  const reg = typeof CSS !== "undefined" && "highlights" in CSS ? CSS.highlights : null;
  if (!reg) return;
  reg.delete("doc-search");
  const q = query.trim().toLowerCase();
  if (!root || q.length < 2) return;
  const ranges: Range[] = [];
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walk.nextNode(); node; node = walk.nextNode()) {
    const text = node.textContent?.toLowerCase() ?? "";
    for (let at = text.indexOf(q); at !== -1; at = text.indexOf(q, at + q.length)) {
      const r = new Range();
      r.setStart(node, at);
      r.setEnd(node, at + q.length);
      ranges.push(r);
    }
  }
  if (ranges.length) reg.set("doc-search", new Highlight(...ranges));
}

/**
 * JSTOR's content viewer: a navy toolbar (contents, zoom, page, search,
 * fullscreen) over the work set as white pages on an ink canvas, in a
 * rounded frame like the landing page's panels. `?seq=n` opens page n.
 */
export function Viewer({ a, className }: { a: Article; className?: string }) {
  const pages = useMemo(() => docPages(a), [a]);
  const nums = useMemo(() => numbering(a), [a]);
  const count = pages.length;
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(1);
  const [zoom, setZoom] = useState(2);
  const [thumbs, setThumbs] = useState(false);
  const [full, setFull] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<number[] | null>(null);
  const [hit, setHit] = useState(0);
  const [pageInput, setPageInput] = useState("1");
  const [more, setMore] = useState(false);
  const moreBox = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const closeMore = useCallback(() => setMore(false), []);
  useDismiss(more, closeMore, moreBox);

  const go = useCallback(
    (n: number, smooth = true) => {
      const target = Math.min(Math.max(1, n), count);
      const el = scroller.current?.querySelector<HTMLElement>(`#page-${target}`);
      if (!el || !scroller.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      scroller.current.scrollTo({ top: el.offsetTop - 16, behavior: smooth && !reduce ? "smooth" : "auto" });
      setCurrent(target);
      setPageInput(String(target));
      const url = new URL(window.location.href);
      if (target > 1) url.searchParams.set("seq", String(target));
      else url.searchParams.delete("seq");
      window.history.replaceState(window.history.state, "", url);
    },
    [count],
  );

  // Open the page the address asks for, and listen for other parts of the page asking for one.
  useEffect(() => {
    const seq = clampSeq(new URLSearchParams(window.location.search).get("seq"), count);
    if (seq > 1) requestAnimationFrame(() => go(seq, false));
    const on = (e: Event) => {
      go((e as CustomEvent<number>).detail);
      root.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    };
    window.addEventListener(SEQ_EVENT, on);
    return () => window.removeEventListener(SEQ_EVENT, on);
  }, [count, go]);

  // The current page is the last one whose top has passed a line a third of the way down the canvas.
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    let frame = 0;
    const on = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const line = box.scrollTop + box.clientHeight / 3;
        let n = 1;
        box.querySelectorAll<HTMLElement>("[data-page]").forEach((el) => {
          if (el.offsetTop <= line) n = Number(el.dataset.page);
        });
        setCurrent(n);
        setPageInput(String(n));
      });
    };
    box.addEventListener("scroll", on, { passive: true });
    return () => {
      box.removeEventListener("scroll", on);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  useEffect(() => () => {
    if (typeof CSS !== "undefined" && "highlights" in CSS) CSS.highlights.delete("doc-search");
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const found = pagesMatching(a, query);
    setHits(found);
    setHit(0);
    highlight(scroller.current, query);
    if (found.length) go(found[0]);
  };
  const nextHit = (dir: 1 | -1) => {
    if (!hits?.length) return;
    const i = (hit + dir + hits.length) % hits.length;
    setHit(i);
    go(hits[i]);
  };

  const printCopy = () => {
    setMore(false);
    const url = URL.createObjectURL(new Blob([toHtml(a, absoluteUrl(a))], { type: "text/html;charset=utf-8" }));
    const w = window.open(url, "_blank");
    if (w) w.addEventListener("load", () => w.print(), { once: true });
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <section
      ref={root}
      aria-label="Content viewer"
      className={cn("flex flex-col overflow-hidden bg-text-primary text-white ring-1 ring-white/12", full ? "h-screen" : "h-[78vh] min-h-120 scroll-mt-[calc(var(--research-top)+1rem)] rounded-3xl lg:h-[calc(100vh-var(--research-top)-2rem)]", className)}
    >
      <style>{HIGHLIGHT_CSS}</style>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-white/12 bg-bdnavy-900 px-2 py-1.5">
        <button type="button" onClick={() => setThumbs((t) => !t)} aria-pressed={thumbs} aria-label="Show pages" title="Show pages" className={TOOL}>
          <Icon name="side_navigation" className="text-2xl" />
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))} disabled={zoom === ZOOMS.length - 1} aria-label="Zoom in" title="Zoom in" className={TOOL}>
          <Icon name="zoom_in" className="text-2xl" />
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.max(0, z - 1))} disabled={zoom === 0} aria-label="Zoom out" title="Zoom out" className={TOOL}>
          <Icon name="zoom_out" className="text-2xl" />
        </button>
        <button type="button" onClick={() => setZoom(2)} aria-label="Fit to width" title="Fit to width" className={TOOL}>
          <Icon name="fit_width" className="text-2xl" />
        </button>
        <div ref={moreBox} className="relative">
          <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more} aria-label="More options" title="More options" className={TOOL}>
            <Icon name="more_vert" className="text-2xl" />
          </button>
          {more && (
            <div className={cn(MENU, "top-full left-0 z-30 w-64")}>
              <button type="button" onClick={printCopy} className={cn(MENU_ITEM, "items-center font-semibold")}><Icon name="print" className="text-xl text-signal-orange" /> Print reading copy</button>
              <button type="button" onClick={() => { downloadAs(a, "html"); setMore(false); }} className={cn(MENU_ITEM, "items-center font-semibold")}><Icon name="download" className="text-xl text-signal-orange" /> Download reading copy</button>
              <button type="button" onClick={() => { go(1); setMore(false); }} className={cn(MENU_ITEM, "items-center font-semibold")}><Icon name="first_page" className="text-xl text-signal-orange" /> Back to the first page</button>
            </div>
          )}
        </div>

        <div className="mx-auto flex items-center gap-1">
          <button type="button" onClick={() => go(current - 1)} disabled={current <= 1} aria-label="Previous page" className={TOOL}>
            <Icon name="keyboard_arrow_up" className="text-2xl" />
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go(Number.parseInt(pageInput, 10) || 1);
            }}
            className="flex items-center gap-1.5 text-sm font-semibold tabular-nums"
          >
            <label htmlFor={`${searchId}-page`} className="sr-only">Page</label>
            <input id={`${searchId}-page`} value={pageInput} onChange={(e) => setPageInput(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" className="h-9 w-11 rounded-lg bg-black/30 text-center text-white ring-1 ring-white/15 ring-inset focus:ring-2 focus:ring-signal-orange focus:outline-none" />
            <span aria-hidden className="text-white/65">/ {count}</span>
          </form>
          <button type="button" onClick={() => go(current + 1)} disabled={current >= count} aria-label="Next page" className={TOOL}>
            <Icon name="keyboard_arrow_down" className="text-2xl" />
          </button>
        </div>

        <form role="search" onSubmit={search} className="order-last flex w-full items-center sm:order-none sm:w-auto">
          <label htmlFor={searchId} className="sr-only">Search document</label>
          <div className="relative flex-1 sm:w-56 sm:flex-none">
            <input
              id={searchId}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (hits) {
                  setHits(null);
                  highlight(null, "");
                }
              }}
              placeholder="Search document"
              className="h-10 w-full rounded-xl bg-black/30 pr-10 pl-3 text-sm text-white ring-1 ring-white/15 ring-inset placeholder:text-white/65 focus:ring-2 focus:ring-signal-orange focus:outline-none"
            />
            <button type="submit" aria-label="Search" className="absolute top-0 right-0 grid size-10 place-items-center rounded-xl text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              <Icon name="search" className="text-2xl" />
            </button>
          </div>
          {hits && (
            <span className="ml-2 flex items-center gap-0.5 text-sm whitespace-nowrap text-white/80" aria-live="polite">
              {hits.length ? `${hit + 1} of ${hits.length} pages` : "No matches"}
              {hits.length > 1 && (
                <>
                  <button type="button" onClick={() => nextHit(-1)} aria-label="Previous match" className={cn(TOOL, "size-8")}><Icon name="chevron_left" className="text-xl" /></button>
                  <button type="button" onClick={() => nextHit(1)} aria-label="Next match" className={cn(TOOL, "size-8")}><Icon name="chevron_right" className="text-xl" /></button>
                </>
              )}
            </span>
          )}
        </form>
        <button
          type="button"
          onClick={() => (full ? document.exitFullscreen() : root.current?.requestFullscreen?.())}
          aria-label={full ? "Exit full screen" : "Full screen"}
          title={full ? "Exit full screen" : "Full screen"}
          className={TOOL}
        >
          <Icon name={full ? "close_fullscreen" : "open_in_full"} className="text-2xl" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {thumbs && (
          <nav aria-label="Pages" className="live-in w-56 shrink-0 overflow-y-auto border-r border-white/12 bg-bdnavy-900 p-2 [scrollbar-width:thin]">
            <ol>
              {pages.map((p) => (
                <li key={p.n}>
                  <button
                    type="button"
                    onClick={() => go(p.n)}
                    aria-current={current === p.n ? "page" : undefined}
                    className={cn("flex w-full gap-2.5 rounded-lg px-3 py-2 text-left text-sm leading-snug transition-colors focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none", current === p.n ? "bg-signal-orange text-text-primary" : "text-white/80 hover:bg-bdnavy-700")}
                  >
                    <span className="w-5 shrink-0 text-right font-semibold tabular-nums">{p.n}</span>
                    <span className="line-clamp-2">{p.kind === "title" ? "Title page" : p.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div ref={scroller} tabIndex={0} aria-label="Pages of the document" className="relative min-w-0 flex-1 overflow-y-auto px-3 py-4 [scrollbar-color:var(--color-signal-orange)_transparent] [scrollbar-width:thin] focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-inset sm:px-6">
          <div className="mx-auto space-y-5 text-[calc(var(--z)*16px)] sm:text-[calc(var(--z)*18px)]" style={{ maxWidth: `${ZOOMS[zoom] * 46}rem`, ["--z" as string]: ZOOMS[zoom] }}>
            {pages.map((p) => (
              <Page key={p.n} a={a} page={p} count={count} nums={nums} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
