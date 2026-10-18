/**
 * The document viewer's pages: a title page, one page per section, and a
 * references page when there are references, as JSTOR's viewer shows a
 * work page by page. Page n is what `?seq=n` opens. Pure; tested in
 * pages.test.ts.
 */
import type { Article } from "./core.ts";

export type DocPage =
  | { n: number; kind: "title"; title: string }
  | { n: number; kind: "section"; title: string; section: number }
  | { n: number; kind: "references"; title: string };

export function docPages(a: Pick<Article, "title" | "sections" | "references">): DocPage[] {
  const pages: DocPage[] = [{ n: 1, kind: "title", title: a.title }];
  a.sections.forEach((s, i) => pages.push({ n: i + 2, kind: "section", title: s.heading, section: i }));
  if (a.references.length) pages.push({ n: pages.length + 1, kind: "references", title: "References" });
  return pages;
}

/** The page `?seq=` asks for, kept inside 1…count; anything unreadable opens page 1. */
export function clampSeq(raw: string | null | undefined, count: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, Math.max(1, count));
}

/** The first `max` characters of a text, cut at a word and closed with an ellipsis. */
export function excerpt(text: string, max: number): string {
  const flat = text.replace(/\[\d{1,3}\]/g, "").replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** Which pages mention every word of a query, for "Search document". */
export function pagesMatching(a: Pick<Article, "title" | "summary" | "sections" | "references">, query: string): number[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const text = (p: DocPage) => {
    if (p.kind === "title") return `${a.title} ${a.summary}`;
    if (p.kind === "references") return a.references.map((r) => r.text).join(" ");
    const s = a.sections[p.section];
    return [s.heading, s.body, s.callout?.title, s.callout?.body, ...(s.figures ?? []).flatMap((f) => [f.title, f.caption]), ...(s.tables ?? []).flatMap((t) => [t.title, ...t.head, ...t.rows.flat()])].join(" ");
  };
  return docPages(a)
    .filter((p) => {
      const t = text(p).toLowerCase();
      return terms.every((w) => t.includes(w));
    })
    .map((p) => p.n);
}
