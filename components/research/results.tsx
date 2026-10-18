"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { FIELDS, KINDS, search, type Article, type FieldId, type ResearchKind } from "@/lib/research/core";
import { toBibtex } from "@/lib/research/export";
import { excerpt } from "@/lib/research/pages";
import { updateResearch, useLibrary, useScores } from "@/lib/research/store";
import { inTopic } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";
import { CiteButton, DownloadButton, SaveButton, saveFile } from "./actions";
import { articleHref, BTN, byline, contentHref, Cover, FIELD, fmtNum, H2, LABEL, LIFT, LINK, PANEL, plural, StatusTags, TITLE, TITLE_LINK, TypeLabel, typeOf } from "./kit";

export type TypeKey = ResearchKind | "preprint";
export type Sort = "relevance" | "newest" | "oldest" | "title" | "engaged";

/** Narrow by field-specific words, as Advanced Search does. */
export interface Match {
  q?: string;
  title?: string;
  author?: string;
  institution?: string;
  keyword?: string;
}

const typeKey = (a: Article): TypeKey => (a.preprint ? "preprint" : a.kind);
const TYPE_LABEL = { ...Object.fromEntries((Object.keys(KINDS) as ResearchKind[]).map((k) => [k, KINDS[k].plural])), preprint: "Working papers" } as Record<TypeKey, string>;
const has = (hay: string, needle?: string) => !needle || hay.toLowerCase().includes(needle.trim().toLowerCase());

/** One checkbox row with its count, JSTOR-style. */
function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg py-1.5 text-sm text-white/80 transition-colors hover:text-white">
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 size-4.5 shrink-0 accent-signal-orange" />
      <span>{label} <span className="text-white/65 tabular-nums">({fmtNum(count)})</span></span>
    </label>
  );
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group border-b border-white/12 py-3 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg py-1 font-grotesk text-sm font-bold text-white transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        {title}
        <Icon name="expand_more" className="text-xl text-signal-orange transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="mt-1">{children}</div>
    </details>
  );
}

const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

/**
 * The catalogue's results, with JSTOR's "Refine Results" rail: content
 * type, date, subject and status, counted on the full set; a gold count,
 * a sort menu, and either a list (search) or a grid of covers
 * (collections). Items can be selected to save or export together.
 */
export function Results({
  scope,
  match = {},
  initialTypes = [],
  initialFields = [],
  initialFrom,
  initialTo,
  view = "list",
  defaultSort,
  heading,
}: {
  /** Which works to start from: a collection or subject id, or everything. */
  scope: string | "all";
  match?: Match;
  initialTypes?: TypeKey[];
  initialFields?: FieldId[];
  initialFrom?: number;
  initialTo?: number;
  view?: "list" | "grid";
  defaultSort?: Sort;
  heading?: string;
}) {
  const list = useLibrary();
  const { points } = useScores();
  const searching = Boolean(match.q?.trim());

  const base = useMemo(() => {
    let pool = scope === "all" ? list.filter((a) => a.status === "published") : inTopic(list, scope);
    if (searching) pool = search(pool, match.q!);
    return pool.filter(
      (a) =>
        has(a.title, match.title) &&
        has(a.authors.map((x) => `${x.name} ${x.nameEn ?? ""}`).join(" "), match.author) &&
        has(a.institution, match.institution) &&
        has(a.keywords.join(" "), match.keyword),
    );
  }, [list, scope, searching, match.q, match.title, match.author, match.institution, match.keyword]);

  const years = base.map((a) => a.year);
  const minYear = years.length ? Math.min(...years) : 1971;
  const maxYear = years.length ? Math.max(...years) : new Date().getFullYear();

  const [types, setTypes] = useState<TypeKey[]>(initialTypes);
  const [fields, setFields] = useState<FieldId[]>(initialFields);
  const [from, setFrom] = useState<number | undefined>(initialFrom);
  const [to, setTo] = useState<number | undefined>(initialTo);
  const [status, setStatus] = useState<("finished" | "ongoing")[]>([]);
  const [hideSamples, setHideSamples] = useState(false);
  const [sort, setSort] = useState<Sort>(defaultSort ?? (searching ? "relevance" : "newest"));
  const [picked, setPicked] = useState<string[]>([]);

  const shown = useMemo(() => {
    const out = base.filter(
      (a) =>
        (types.length === 0 || types.includes(typeKey(a))) &&
        (fields.length === 0 || fields.includes(a.field)) &&
        (from === undefined || a.year >= from) &&
        (to === undefined || a.year <= to) &&
        (status.length === 0 || status.includes(a.ongoing || a.preprint ? "ongoing" : "finished")) &&
        (!hideSamples || !a.sample),
    );
    if (sort === "relevance") return out;
    return [...out].sort((x, y) =>
      sort === "newest"
        ? y.published.localeCompare(x.published)
        : sort === "oldest"
          ? x.published.localeCompare(y.published)
          : sort === "title"
            ? x.title.localeCompare(y.title, "en")
            : points(y) - points(x),
    );
  }, [base, types, fields, from, to, status, hideSamples, sort, points]);

  const typeCounts = (Object.keys(TYPE_LABEL) as TypeKey[]).map((k) => ({ k, n: base.filter((a) => typeKey(a) === k).length })).filter((x) => x.n > 0);
  const fieldCounts = (Object.keys(FIELDS) as FieldId[]).map((f) => ({ f, n: base.filter((a) => a.field === f).length })).filter((x) => x.n > 0);
  const filtered = types.length + fields.length + status.length + (from !== undefined ? 1 : 0) + (to !== undefined ? 1 : 0) + (hideSamples ? 1 : 0);
  const clear = () => {
    setTypes([]);
    setFields([]);
    setFrom(undefined);
    setTo(undefined);
    setStatus([]);
    setHideSamples(false);
  };

  const pickedArticles = shown.filter((a) => picked.includes(a.slug));
  const saveSelected = () => {
    const ok = updateResearch((s) => ({ ...s, saved: { ...s.saved, ...Object.fromEntries(picked.map((p) => [p, true as const])) } }));
    if (!ok) return toast.error("Log in to save to your Workspace");
    toast.success(`${plural(picked.length, "item")} saved to your Workspace`);
  };
  const exportSelected = () => {
    const origin = window.location.origin;
    saveFile("kandari-research-citations.bib", "application/x-bibtex;charset=utf-8", pickedArticles.map((a) => toBibtex(a, `${origin}/research/${a.slug}`)).join("\n"));
    toast.success("Citations downloaded (BibTeX)");
  };
  const years2 = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const rail = (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className={cn(TITLE, "text-xl")}>Refine Results</h2>
        {filtered > 0 && <button type="button" onClick={clear} className={cn(LINK, "text-sm font-semibold")}>Clear all</button>}
      </div>
      <div className="mt-2">
        <Facet title="Content type">
          {typeCounts.map(({ k, n }) => <Check key={k} label={TYPE_LABEL[k]} count={n} checked={types.includes(k)} onChange={() => setTypes(toggle(types, k))} />)}
          {typeCounts.length === 0 && <p className="text-sm text-white/65">Nothing to refine.</p>}
        </Facet>
        <Facet title="Date">
          <div className="flex items-center gap-2 py-1">
            <label className="sr-only" htmlFor="year-from">From year</label>
            <select id="year-from" value={from ?? ""} onChange={(e) => setFrom(e.target.value ? Number(e.target.value) : undefined)} className={cn(FIELD, "h-10 min-w-0 flex-1 px-2 text-sm")}>
              <option value="">From</option>
              {years2.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <span aria-hidden className="text-white/65">–</span>
            <label className="sr-only" htmlFor="year-to">To year</label>
            <select id="year-to" value={to ?? ""} onChange={(e) => setTo(e.target.value ? Number(e.target.value) : undefined)} className={cn(FIELD, "h-10 min-w-0 flex-1 px-2 text-sm")}>
              <option value="">To</option>
              {years2.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </Facet>
        <Facet title="Subject">
          {fieldCounts.map(({ f, n }) => <Check key={f} label={FIELDS[f].en} count={n} checked={fields.includes(f)} onChange={() => setFields(toggle(fields, f))} />)}
        </Facet>
        <Facet title="Status">
          <Check label="Finished work" count={base.filter((a) => !a.ongoing && !a.preprint).length} checked={status.includes("finished")} onChange={() => setStatus(toggle(status, "finished"))} />
          <Check label="Ongoing or working paper" count={base.filter((a) => a.ongoing || a.preprint).length} checked={status.includes("ongoing")} onChange={() => setStatus(toggle(status, "ongoing"))} />
        </Facet>
        <Facet title="Access type">
          <p className="py-1 text-sm text-white/80">Everything here is open access.</p>
          <Check label="Hide sample entries" count={base.filter((a) => a.sample).length} checked={hideSamples} onChange={() => setHideSamples(!hideSamples)} />
        </Facet>
      </div>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside aria-label="Search filters" className={cn(PANEL, "hidden self-start p-6 lg:block")}>{rail}</aside>
      <details className={cn(PANEL, "rounded-2xl lg:hidden")}>
        <summary className="flex min-h-13 cursor-pointer list-none items-center gap-2 rounded-2xl px-4 font-grotesk text-base font-bold text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none [&::-webkit-details-marker]:hidden">
          <Icon name="tune" className="text-2xl text-signal-orange" /> Refine results {filtered > 0 && <span className="rounded-full bg-signal-orange px-1.5 text-xs leading-5 text-text-primary tabular-nums">{filtered}</span>}
        </summary>
        <div className="border-t border-white/12 p-4">{rail}</div>
      </details>

      <section aria-label="Results" className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className={H2} aria-live="polite">{heading ?? plural(shown.length, "item")}</h2>
          <label className="relative flex items-center">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={cn(FIELD, "h-11 w-auto appearance-none pr-10 text-sm font-semibold")}>
              {searching && <option value="relevance">Sort by: Relevance</option>}
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="title">Sort by: Title (a-z)</option>
              <option value="engaged">Sort by: Most engaged</option>
            </select>
            <Icon name="expand_more" className="pointer-events-none absolute right-3 text-xl text-signal-orange" />
          </label>
        </div>
        {heading && <p className="mt-1 text-sm text-white/65">{plural(shown.length, "item")}</p>}

        <div className="mt-6 flex min-h-14 flex-wrap items-center gap-3 border-y border-white/12 py-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-white">
            <input
              type="checkbox"
              className="size-4.5 accent-signal-orange"
              checked={shown.length > 0 && pickedArticles.length === shown.length}
              onChange={() => setPicked(pickedArticles.length === shown.length ? [] : shown.map((a) => a.slug))}
            />
            Select all
          </label>
          <span className="text-sm text-white/65">{pickedArticles.length ? `${plural(pickedArticles.length, "item")} selected` : "No items selected."}</span>
          {pickedArticles.length > 0 && (
            <span className="ml-auto flex flex-wrap gap-2">
              <button type="button" onClick={saveSelected} className={BTN}><Icon name="bookmark" className="text-xl" /> Save</button>
              <button type="button" onClick={exportSelected} className={BTN}><Icon name="format_quote" className="text-xl" /> Export citations</button>
            </span>
          )}
        </div>

        {shown.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/20 p-10 text-center">
            <p className={cn(TITLE, "text-2xl")}>No items match</p>
            <p className="mt-2 text-base text-white/65">{filtered > 0 ? "Try removing a filter." : "Nothing has been published here yet."}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {filtered > 0 && <button type="button" onClick={clear} className={BTN}>Clear filters</button>}
              <Link href="/research/submit" className={BTN}><Icon name="upload" className="text-xl" /> Upload the first one</Link>
            </div>
          </div>
        ) : view === "grid" ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-5">
            {shown.map((a) => (
              <li key={a.slug} className="story-reveal relative">
                <input type="checkbox" aria-label={`Select ${a.title}`} checked={picked.includes(a.slug)} onChange={() => setPicked(toggle(picked, a.slug))} className="absolute top-3 left-3 z-10 size-4.5 accent-signal-orange" />
                <Link href={articleHref(a)} className="group block rounded-xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                  <Cover a={a} sizes="(min-width: 1280px) 15vw, (min-width: 640px) 28vw, 45vw" className={cn("aspect-3/4 w-full", LIFT)} />
                  <span className="mt-4 line-clamp-3 block font-grotesk text-base leading-snug font-bold text-white transition-colors group-hover:text-signal-orange">{a.title}</span>
                </Link>
                <p className={cn(LABEL, "mt-2")}>{typeOf(a)} · {a.year}</p>
              </li>
            ))}
          </ul>
        ) : (
          <ol className="mt-2 divide-y divide-white/12">
            {shown.map((a) => (
              <li key={a.slug} className="story-reveal grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[auto_minmax(0,1fr)_6.5rem]">
                <input type="checkbox" aria-label={`Select ${a.title}`} checked={picked.includes(a.slug)} onChange={() => setPicked(toggle(picked, a.slug))} className="mt-1 size-4.5 accent-signal-orange" />
                <div className="min-w-0">
                  <TypeLabel a={a} />
                  <Link href={articleHref(a)} className={cn(TITLE_LINK, "mt-1.5 block text-lg leading-snug")}>{a.title}</Link>
                  <p className="mt-1.5 text-sm text-white/80">{byline(a, 4)}</p>
                  <p className="text-sm text-white/65"><Link href={contentHref(a)} className={cn(LINK, "italic")}>{a.institution}</Link>, {a.year}</p>
                  <p className="mt-2.5 max-w-[75ch] text-sm leading-relaxed text-white/80">{excerpt(a.summary, 260)}</p>
                  <StatusTags a={a} className="mt-2" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <DownloadButton a={a} look="row" />
                    <SaveButton a={a} look="row" />
                    <CiteButton a={a} look="row" />
                  </div>
                </div>
                <Link href={articleHref(a)} tabIndex={-1} aria-hidden className="hidden sm:block">
                  <Cover a={a} mini sizes="104px" className="aspect-3/4 w-full" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
