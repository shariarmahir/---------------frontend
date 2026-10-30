"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { FIELDS, LEVELS, type Article } from "@/lib/research/core";
import { fileBase, toMarkdown } from "@/lib/research/export";
import { docPages, excerpt, type DocPage } from "@/lib/research/pages";
import { useResearch } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { absoluteUrl, CiteButton, SaveButton, saveFile } from "./actions";
import { articleHref, authorName, BTN, BTN_QUIET, COLUMN, Cover, H1, LINK, OpenAccess, PANEL, RuleHeading, searchHref, StatusTags, subjectHref, TITLE_LINK } from "./kit";

/** The text a page row previews: the abstract, a section's first lines, or the first references. */
function preview(a: Article, p: DocPage): string {
  if (p.kind === "title") return a.summary;
  if (p.kind === "references") return a.references.slice(0, 3).map((r) => r.text).join(" ");
  return a.sections[p.section].body.replace(/^- /gm, "");
}

/** Only the chosen pages of a work, as Markdown. */
function partMarkdown(a: Article, pages: DocPage[], url: string): string {
  const sections = pages.filter((p) => p.kind === "section").map((p) => a.sections[(p as Extract<DocPage, { kind: "section" }>).section]);
  const withRefs = pages.some((p) => p.kind === "references");
  return toMarkdown({ ...a, sections, references: withRefs ? a.references : [] }, url);
}

/** A label in the item-info panel. */
const DT = "font-grotesk font-bold text-signal-orange";

/**
 * A work's contents page, after JSTOR's book page: cover, title block and
 * stable URL; "Cite" and "Item info"; then the table of contents, each part
 * with its own link (`?seq=`), an excerpt, and download, save and cite.
 */
export function ContentView({ a }: { a: Article }) {
  const pages = docPages(a);
  const [picked, setPicked] = useState<number[]>([]);
  const [info, setInfo] = useState(false);
  const saved = useResearch((s) => Boolean(s.saved[a.slug]));

  const download = (chosen: DocPage[]) => {
    const url = absoluteUrl(a);
    const suffix = chosen.length === 1 ? `-p${chosen[0].n}` : chosen.length < pages.length ? "-selected" : "";
    saveFile(`${fileBase(a)}${suffix}.md`, "text/markdown;charset=utf-8", partMarkdown(a, chosen, url));
    toast.success("Download started", { description: chosen.length === 1 ? chosen[0].title : `${chosen.length} parts` });
  };
  const all = picked.length === pages.length;

  return (
    <div className={cn(COLUMN, "py-12 lg:py-14")}>
      <div className="hero-rise grid gap-6 sm:grid-cols-[11.5rem_minmax(0,1fr)] sm:gap-10">
        <Link href={articleHref(a)} className="block w-40 rounded-xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:w-auto">
          <Cover a={a} priority sizes="184px" className="aspect-3/4 w-full shadow-[0_28px_48px_-22px_var(--color-bdnavy-400)]" />
        </Link>
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap gap-1.5"><OpenAccess /><StatusTags a={a} /></div>
          <h1 className={cn(H1, "mt-3")}>{a.title}</h1>
          <ul className="mt-4 space-y-0.5 text-base font-semibold text-white">
            {a.authors.map((x) => <li key={x.name}>{authorName(x)}</li>)}
          </ul>
          <p className="mt-2 text-sm text-white/80">Year: {a.year}</p>
          <p className="text-sm text-white/80">Published by: <Link href="/research/institutions" className={LINK}>{a.institution}</Link></p>
          <p className="text-sm break-all text-white/80"><Link href={articleHref(a)} className={LINK}>/research/{a.slug}</Link></p>
          {a.keywords[0] && <p className="mt-1 text-sm"><Link href={searchHref({ q: a.keywords[0] })} className={LINK}>Search for related research</Link></p>}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <CiteButton a={a} />
        <button type="button" onClick={() => setInfo((o) => !o)} aria-expanded={info} className={cn(BTN, info && "bg-signal-orange/12")}>
          <Icon name="info" className="text-xl" /> Item info
        </button>
        <SaveButton a={a} />
      </div>
      {info && (
        <dl className={cn(PANEL, "live-in mt-4 max-w-3xl p-6 text-sm text-white/80")}>
          <dt className={DT}>Abstract</dt>
          <dd className="mt-1 leading-relaxed">{a.summary.replace(/\[\d+\]/g, "")}</dd>
          <dt className={cn(DT, "mt-4")}>Subject</dt>
          <dd><Link href={subjectHref(a.field)} className={LINK}>{FIELDS[a.field].en}</Link> · {LEVELS[a.level]}</dd>
          {a.keywords.length > 0 && (
            <>
              <dt className={cn(DT, "mt-4")}>Keywords</dt>
              <dd>{a.keywords.join("; ")}</dd>
            </>
          )}
          {a.facts?.map((f) => (
            <div key={f.label} className="mt-4">
              <dt className={DT}>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <section aria-labelledby="toc-title" className="story-reveal mt-14 max-w-4xl">
        <RuleHeading id="toc-title">Table of Contents</RuleHeading>
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-white">
            <input type="checkbox" checked={all} onChange={() => setPicked(all ? [] : pages.map((p) => p.n))} className="size-4.5 accent-signal-orange" />
            Select all
          </label>
          <button
            type="button"
            disabled={picked.length === 0}
            onClick={() => download(pages.filter((p) => picked.includes(p.n)))}
            className={BTN_QUIET}
          >
            <Icon name="download" className="text-xl" /> Download selected{picked.length ? ` (${picked.length})` : ""}
          </button>
        </div>
        <ol>
          {pages.map((p) => (
            <li key={p.n} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-t border-white/12 py-7">
              <input
                type="checkbox"
                aria-label={`Select ${p.kind === "title" ? "title page and abstract" : p.title}`}
                checked={picked.includes(p.n)}
                onChange={() => setPicked(picked.includes(p.n) ? picked.filter((x) => x !== p.n) : [...picked, p.n])}
                className="mt-1 size-4.5 accent-signal-orange"
              />
              <div className="min-w-0">
                <p className="text-lg">
                  <Link href={articleHref(a, p.n)} className={TITLE_LINK}>{p.kind === "title" ? "Title page and abstract" : p.title}</Link>{" "}
                  <span className="text-sm text-white/65">(p. {p.n})</span>
                </p>
                <p className="mt-0.5 text-sm break-all text-white/65">/research/{a.slug}{p.n > 1 ? `?seq=${p.n}` : ""}</p>
                <OpenAccess className="mt-1.5" />
                <p className="mt-3 max-w-[75ch] text-sm leading-relaxed text-white/80">{excerpt(preview(a, p), 380)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => download([p])} aria-label={`Download ${p.title}`} title="Download this part" className={BTN_QUIET}>
                    <Icon name="download" className="text-xl" />
                  </button>
                  <SaveButton a={a} look="icon" />
                  <CiteButton a={a} look="icon" />
                  {saved && <span className="self-center text-sm text-white/65">Saved to your Workspace</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
