/**
 * Genius (Kandari-Lab): an open digital library where Bangladeshi students and
 * researchers publish theses, papers, innovations, projects and ideas, browsed
 * the way JSTOR is browsed (subjects, collections, titles, institutions).
 * Pure rules here — types, search, contents, citation, the submission
 * checks — tested in core.test.ts.
 */

export type ResearchKind = "thesis" | "paper" | "innovation" | "project" | "idea";

/**
 * `en` is the short name; `type` is the catalogue label printed above a
 * title, as JSTOR prints "BOOK CHAPTER". `bn` is for the Bangla-language
 * media feed, which shows research too; the library itself is in English.
 */
export const KINDS: Record<ResearchKind, { en: string; bn: string; type: string; plural: string; icon: string }> = {
  thesis: { en: "Thesis", bn: "থিসিস", type: "Thesis", plural: "Theses", icon: "school" },
  paper: { en: "Paper", bn: "গবেষণাপত্র", type: "Research paper", plural: "Research papers", icon: "article" },
  innovation: { en: "Innovation", bn: "উদ্ভাবন", type: "Innovation report", plural: "Innovation reports", icon: "lightbulb" },
  project: { en: "Project", bn: "প্রকল্প", type: "Project report", plural: "Project reports", icon: "construction" },
  /** Mahir, 2026-10-19: an untested proposal, published to find collaborators, a supervisor or funding. */
  idea: { en: "Idea", bn: "আইডিয়া", type: "Idea", plural: "Ideas", icon: "tips_and_updates" },
};

/**
 * The sections an upload starts with, by content type: the structure
 * reviewers and examiners expect for it (data/research/roadmap.ts asks for
 * the same). The author can rename, add or remove any of them.
 */
export const SECTION_TEMPLATES: Record<ResearchKind, string[]> = {
  thesis: ["Introduction", "Literature review", "Methodology", "Results", "Discussion", "Conclusion"],
  paper: ["Introduction", "Methods", "Results", "Discussion"],
  innovation: ["The problem", "The design", "Prototype and testing", "Cost and impact"],
  project: ["Background and objectives", "What we built or did", "Results", "Next steps"],
  idea: ["The problem", "The idea", "How it could be tested", "What it needs"],
};

export type FieldId = "solutions" | "health" | "agriculture" | "climate" | "engineering" | "computing" | "society" | "education" | "economy" | "science";

/** `bn` is for the Bangla-language media feed (see KINDS). */
export const FIELDS: Record<FieldId, { en: string; bn: string; icon: string }> = {
  /** Mahir, 2026-10-19: a subject of its own for real Bangladeshi problems studied to a costed, testable solution. */
  solutions: { en: "Bangladesh Real Issues & Solutions", bn: "বাংলাদেশের বাস্তব সমস্যা ও সমাধান", icon: "emoji_objects" },
  health: { en: "Health & Medicine", bn: "স্বাস্থ্য ও চিকিৎসা", icon: "health_and_safety" },
  agriculture: { en: "Agriculture & Food", bn: "কৃষি ও খাদ্য", icon: "agriculture" },
  climate: { en: "Climate & Environment", bn: "জলবায়ু ও পরিবেশ", icon: "eco" },
  engineering: { en: "Engineering & Hardware", bn: "প্রকৌশল ও হার্ডওয়্যার", icon: "memory" },
  computing: { en: "Computing & AI", bn: "কম্পিউটিং ও এআই", icon: "neurology" },
  society: { en: "Society, Culture & Policy", bn: "সমাজ ও নীতি", icon: "diversity_3" },
  education: { en: "Education", bn: "শিক্ষা", icon: "menu_book" },
  economy: { en: "Economy & Business", bn: "অর্থনীতি ও ব্যবসা", icon: "monitoring" },
  science: { en: "Basic Science", bn: "মৌলিক বিজ্ঞান", icon: "science" },
};

export type Level = "school" | "undergrad" | "masters" | "phd" | "independent";

export const LEVELS: Record<Level, string> = {
  school: "School & college",
  undergrad: "Undergraduate",
  masters: "Master's",
  phd: "PhD",
  independent: "Independent researcher",
};

export type Status = "published" | "review";

export type Scope = "bangladesh" | "global";

export const SCOPES: Record<Scope, string> = { bangladesh: "Bangladesh", global: "Global" };

export interface Author {
  name: string;
  /** The Latin spelling, when `name` is written in Bangla. */
  nameEn?: string;
  affiliation?: string;
}

/** One bar of a figure. In a waterfall, a `total` bar is drawn from zero; the rest stack on the running sum. */
export interface FigureRow {
  label: string;
  value: number;
  total?: boolean;
  /** Drawn in the accent colour: the rows the text talks about. */
  accent?: boolean;
}

export interface Figure {
  kind: "bars" | "waterfall";
  title: string;
  /** Printed after each value, e.g. "%" or " Tk/kg". */
  unit: string;
  rows: FigureRow[];
  caption: string;
}

export interface DataTable {
  title: string;
  head: string[];
  rows: string[][];
  caption?: string;
}

export interface Section {
  id: string;
  heading: string;
  /** Paragraphs separated by a blank line; `[n]` marks a reference; a paragraph of "- " lines is a list. */
  body: string;
  /** Shown after the text, in this order: callout, figures, tables. */
  callout?: { title: string; body: string };
  figures?: Figure[];
  tables?: DataTable[];
}

export interface Reference {
  text: string;
  url?: string;
}

export interface Revision {
  at: string;
  by: string;
  note: string;
}

export interface TalkNote {
  id: string;
  by: string;
  role?: string;
  at: string;
  text: string;
  /** The comment this one answers (one level of replies). */
  parent?: string;
  /** Likes from other readers (sample data); the viewer's own like is added on top. */
  likes?: number;
}

export interface Article {
  slug: string;
  title: string;
  /** An alternative title, e.g. the Bangla original of an English title. */
  titleEn?: string;
  kind: ResearchKind;
  field: FieldId;
  level: Level;
  status: Status;
  authors: Author[];
  institution: string;
  supervisor?: string;
  year: number;
  district?: string;
  /** YYYY-MM-DD. */
  published: string;
  /** The lead paragraph, shown above the contents and on the main page. */
  summary: string;
  keywords: string[];
  sections: Section[];
  references: Reference[];
  image?: { src: string; caption: string; credit?: string };
  /** Photographs of the work itself (a prototype, a field site, a poster), each captioned. */
  gallery?: { src: string; caption: string }[];
  /** Work still under way is shown as ongoing research, not as a finished result. */
  ongoing?: boolean;
  /** Extra infobox rows, e.g. cost or sample size. */
  facts?: { label: string; value: string }[];
  /** A "Did you know…" hook, phrased as the end of that question. */
  dyk?: string;
  /** The uploaded PDF, if any: a data URL for the viewer's own, a path for samples. */
  file?: { name: string; size: number; url?: string };
  /** Demo content, labelled as such on the page. */
  sample?: boolean;
  /** Where the question sits: Bangladesh (the default) or the wider world (global and comparative work). */
  scope?: Scope;
  /** The national dossier's problems this work speaks to (BD-001 … BD-032, by number). */
  problems?: number[];
  /** A working paper: published for reading and comment, not yet peer reviewed. */
  preprint?: boolean;
  /** Put on the main page's cover by the editors. */
  pinned?: boolean;
  /** Other readers' reactions, shares and citations (sample articles only; real ones start at zero). */
  engagement?: { reactions?: Partial<Record<ReactionKind, number>>; shares?: number; cites?: number };
  /** The account that submitted it (the viewer's own submissions). */
  owner?: string;
  revisions: Revision[];
  talk?: TalkNote[];
}

/* ---------- Text ---------- */

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const latinDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

/** A URL slug that keeps Bangla letters: lower case, words joined by "-", at most 80 characters. */
export function slugify(title: string): string {
  const s = latinDigits(title)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, 80).replace(/-+$/, "") || "nibondho";
}

/** The slug, or the slug with -2, -3 … if it is taken. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

/** Paragraphs of a section body. */
export const paragraphs = (body: string) => body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/** Split a paragraph into text and `[n]` citation marks (Latin or Bangla digits). */
export function citeParts(p: string): ({ text: string } | { cite: number })[] {
  const out: ({ text: string } | { cite: number })[] = [];
  let last = 0;
  for (const m of p.matchAll(/\[([0-9০-৯]{1,3})\]/g)) {
    if (m.index! > last) out.push({ text: p.slice(last, m.index) });
    out.push({ cite: Number(latinDigits(m[1])) });
    last = m.index! + m[0].length;
  }
  if (last < p.length) out.push({ text: p.slice(last) });
  return out;
}

/** The numbered contents: 1, 2, 3 … with each section's anchor. */
export const contents = (sections: Section[]) => sections.map((s, i) => ({ n: i + 1, id: s.id, heading: s.heading }));

export type Block = { text: string } | { list: string[] };

/** A section body as paragraphs and lists: a paragraph whose every line starts with "- " or "• " is a list. */
export function blocks(body: string): Block[] {
  return paragraphs(body).map((p) => {
    const lines = p.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.every((l) => /^[-•]\s/.test(l)) ? { list: lines.map((l) => l.replace(/^[-•]\s+/, "")) } : { text: p };
  });
}

/** Where each waterfall bar starts and ends: totals from zero, steps from the running sum. */
export function waterfall(rows: FigureRow[]): { row: FigureRow; start: number; end: number }[] {
  let run = 0;
  return rows.map((row) => {
    if (row.total) {
      run = row.value;
      return { row, start: 0, end: row.value };
    }
    const start = run;
    run += row.value;
    return { row, start, end: run };
  });
}

/** Minutes to read the summary, sections and tables, at about 180 words a minute. */
export function readMinutes(a: Pick<Article, "summary" | "sections">): number {
  const text = [a.summary, ...a.sections.flatMap((s) => [s.body, ...(s.tables ?? []).flatMap((t) => t.rows.flat())])].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

/** One or two letters for an avatar: the first letter of the first and last word. */
export function initials(name: string): string {
  const seg = new Intl.Segmenter("bn", { granularity: "grapheme" });
  const first = (w: string) => seg.segment(w)[Symbol.iterator]().next().value?.segment ?? "";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words.length === 1 ? first(words[0]) : first(words[0]) + first(words[words.length - 1]);
}

/* ---------- Finding ---------- */

const norm = (s: string) => latinDigits(s).normalize("NFC").toLowerCase();

/**
 * Search the library: every word must match somewhere; the title counts
 * most, then keywords, then people and places, then the text.
 */
export function search(list: Article[], query: string): Article[] {
  const terms = norm(query).split(/\s+/).filter((t) => t.length > 0);
  if (terms.length === 0) return [];
  const scored = list
    .map((a) => {
      const fields: [string, number][] = [
        [norm(`${a.title} ${a.titleEn ?? ""}`), 6],
        [norm(a.keywords.join(" ")), 4],
        [norm(`${a.authors.map((x) => x.name).join(" ")} ${a.institution} ${a.supervisor ?? ""} ${a.district ?? ""}`), 3],
        [norm(`${FIELDS[a.field].en} ${KINDS[a.kind].en} ${KINDS[a.kind].type}`), 2],
        [norm(`${a.summary} ${a.sections.map((s) => `${s.heading} ${s.body}`).join(" ")}`), 1],
      ];
      let score = 0;
      for (const t of terms) {
        const hit = fields.reduce((sum, [text, w]) => sum + (text.includes(t) ? w : 0), 0);
        if (hit === 0) return { a, score: 0 };
        score += hit;
      }
      return { a, score };
    })
    .filter((x) => x.score > 0);
  return scored.sort((x, y) => y.score - x.score || y.a.published.localeCompare(x.a.published)).map((x) => x.a);
}

/** FNV-1a over a string, for a pick that stays the same all day. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Today's featured research: published, with a picture, the same one all day. */
export function featured(list: Article[], day: string): Article | undefined {
  const pool = list.filter((a) => a.status === "published" && a.image);
  return pool.length ? pool[hash(day) % pool.length] : undefined;
}

/** `n` items rotated by the day, so the main page changes daily but not on every visit. */
export function rotate<T>(items: T[], day: string, n: number): T[] {
  if (items.length === 0) return [];
  const start = hash(`${day}:r`) % items.length;
  return Array.from({ length: Math.min(n, items.length) }, (_, i) => items[(start + i) % items.length]);
}

export const newest = (list: Article[], n: number) => [...list].filter((a) => a.status === "published").sort((a, b) => b.published.localeCompare(a.published)).slice(0, n);

/** Every edit across the library, newest first. */
export function recentChanges(list: Article[], n: number): { article: Article; rev: Revision }[] {
  return list
    .flatMap((article) => article.revisions.map((rev) => ({ article, rev })))
    .sort((a, b) => b.rev.at.localeCompare(a.rev.at))
    .slice(0, n);
}

export function counts(list: Article[]) {
  const pub = list.filter((a) => a.status === "published");
  return {
    articles: pub.length,
    institutions: new Set(pub.map((a) => a.institution)).size,
    authors: new Set(pub.flatMap((a) => a.authors.map((x) => x.name))).size,
    byKind: Object.fromEntries((Object.keys(KINDS) as ResearchKind[]).map((k) => [k, pub.filter((a) => a.kind === k).length])) as Record<ResearchKind, number>,
    byField: Object.fromEntries((Object.keys(FIELDS) as FieldId[]).map((f) => [f, pub.filter((a) => a.field === f).length])) as Record<FieldId, number>,
  };
}

/* ---------- Citing ---------- */

/** "Name 1, Name 2 and Name 3". */
export function nameList(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** How to cite it: authors (year). Title. Type, institution. Genius (Kandari-Lab). URL */
export function citation(a: Article, url: string): string {
  return `${nameList(a.authors.map((x) => x.nameEn ?? x.name))} (${a.year}). ${a.title}. ${a.preprint ? "Working paper" : KINDS[a.kind].type}, ${a.institution}. Genius (Kandari-Lab). ${url}`;
}

/* ---------- Publishing ---------- */

export const LIMITS = {
  title: [8, 160],
  summary: [80, 1200],
  heading: [2, 80],
  body: [40, 6000],
  sections: [2, 10],
  authors: 8,
  keywords: 8,
  references: 30,
  fileBytes: 1_500_000,
  /** The largest photo accepted before it is scaled down in the browser. */
  imageBytes: 12_000_000,
  gallery: 6,
  caption: 200,
} as const;

export interface Draft {
  title: string;
  titleEn: string;
  kind: ResearchKind | "";
  field: FieldId | "";
  level: Level | "";
  authors: string;
  institution: string;
  supervisor: string;
  year: string;
  district: string;
  summary: string;
  keywords: string;
  sections: { heading: string; body: string }[];
  references: string;
  agree: boolean;
  /** Optional: Bangladesh unless the author says the work is global. */
  scope?: Scope;
  /** Optional: one dossier problem the work speaks to, by number ("" for none). */
  problem?: string;
  /** The thumbnail (required): a photo scaled down in the browser, as a data URL. */
  cover?: string;
  /** What the thumbnail shows, and whose it is. */
  coverCaption?: string;
  /** Project images (optional), scaled down the same way, each with a caption. */
  gallery?: { src: string; caption: string }[];
}

export type DraftProblems = Partial<Record<"title" | "kind" | "field" | "level" | "authors" | "institution" | "year" | "summary" | "keywords" | "sections" | "references" | "cover" | "gallery" | "agree", string>>;

/* ---------- Uploaded media ---------- */

// Only what the upload form itself produces (a JPEG, PNG or WebP drawn on a
// canvas, a PDF read as base64) or a file the site serves. Anything else
// found in storage (a javascript: or remote URL, an SVG) is dropped.
const SAFE_IMAGE = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const SAFE_PDF = /^data:application\/pdf;base64,[A-Za-z0-9+/]+={0,2}$/;
const SITE_PATH = /^\/(?![/\\])[\w\-./%]+$/;

export const isSafeImage = (s: unknown): s is string => typeof s === "string" && (SAFE_IMAGE.test(s) || SITE_PATH.test(s));
export const isSafePdf = (s: unknown): s is string => typeof s === "string" && (SAFE_PDF.test(s) || SITE_PATH.test(s));
const isWebLink = (s: unknown): s is string => typeof s === "string" && /^https?:\/\/[^\s"<>]+$/i.test(s);

const splitList = (s: string, sep: RegExp) => s.split(sep).map((x) => x.trim()).filter(Boolean);
export const authorNames = (s: string) => splitList(s, /[,\n،]/).slice(0, LIMITS.authors + 1);
export const keywordList = (s: string) => splitList(s, /[,،\n]/);
/** One reference per line; a URL anywhere in the line becomes its link. */
export function parseReferences(s: string): Reference[] {
  return splitList(s, /\n/).map((line) => {
    const m = line.match(/https?:\/\/\S+/);
    const text = line.replace(/https?:\/\/\S+/, "").replace(/[\s,–—-]+$/, "").trim();
    return m ? { text: text || m[0], url: m[0].replace(/[).,]+$/, "") } : { text: line };
  });
}

/** Everything a submission still needs, in plain English; empty when it is ready. */
export function draftProblems(d: Draft, thisYear: number): DraftProblems {
  const p: DraftProblems = {};
  const len = (s: string) => s.trim().length;
  if (len(d.title) < LIMITS.title[0]) p.title = "Give a title of at least 8 characters";
  else if (len(d.title) > LIMITS.title[1]) p.title = "Shorten the title (160 characters at most)";
  if (!d.kind) p.kind = "Choose a content type";
  if (!d.field) p.field = "Choose a subject";
  if (!d.level) p.level = "Choose a level";
  const names = authorNames(d.authors);
  if (names.length === 0) p.authors = "Name at least one author";
  else if (names.length > LIMITS.authors) p.authors = "8 authors at most";
  if (len(d.institution) < 3) p.institution = "Name the institution";
  const year = Number(latinDigits(d.year.trim()));
  if (!Number.isInteger(year) || year < 1971 || year > thisYear) p.year = `Give a year from 1971 to ${thisYear}`;
  if (len(d.summary) < LIMITS.summary[0]) p.summary = "Write an abstract of at least 80 characters: the question and what you found";
  else if (len(d.summary) > LIMITS.summary[1]) p.summary = "Keep the abstract within 1,200 characters";
  if (keywordList(d.keywords).length > LIMITS.keywords) p.keywords = "8 keywords at most";
  const filled = d.sections.filter((s) => len(s.heading) > 0 || len(s.body) > 0);
  if (filled.length < LIMITS.sections[0]) p.sections = "Write at least two sections (for example: Method, Results)";
  else if (filled.length > LIMITS.sections[1]) p.sections = "10 sections at most";
  else if (filled.some((s) => len(s.heading) < LIMITS.heading[0] || len(s.heading) > LIMITS.heading[1])) p.sections = "Give every section a heading";
  else if (filled.some((s) => len(s.body) < LIMITS.body[0])) p.sections = "Write at least two lines in every section";
  else if (filled.some((s) => len(s.body) > LIMITS.body[1])) p.sections = "One section is too long; split it";
  const refs = parseReferences(d.references);
  if (refs.length > LIMITS.references) p.references = "30 references at most";
  if (!isSafeImage(d.cover)) p.cover = "Add a thumbnail image: a photo of the work, the site or the device";
  else if ((d.coverCaption ?? "").length > LIMITS.caption) p.cover = "Keep the thumbnail caption within 200 characters";
  const gallery = d.gallery ?? [];
  if (gallery.length > LIMITS.gallery) p.gallery = "6 project images at most";
  else if (gallery.some((g) => !isSafeImage(g.src))) p.gallery = "One project image could not be read; remove it and add it again";
  else if (gallery.some((g) => len(g.caption) < 3)) p.gallery = "Write a short caption for every project image";
  else if (gallery.some((g) => len(g.caption) > LIMITS.caption)) p.gallery = "Keep each caption within 200 characters";
  if (!d.agree) p.agree = "Confirm the work is yours (or your co-authors agree)";
  return p;
}

/** A ready draft becomes an article waiting for review. */
export function buildArticle(d: Draft, opts: { now: Date; taken: Set<string>; owner: string; ownerName: string; file?: Article["file"] }): Article {
  const at = opts.now.toISOString();
  const sections = d.sections
    .filter((s) => s.heading.trim() || s.body.trim())
    .map((s, i) => ({ id: `${slugify(s.heading)}-${i + 1}`, heading: s.heading.trim(), body: s.body.trim() }));
  return {
    slug: uniqueSlug(slugify(d.title), opts.taken),
    title: d.title.trim(),
    ...(d.titleEn.trim() ? { titleEn: d.titleEn.trim() } : {}),
    kind: d.kind as ResearchKind,
    field: d.field as FieldId,
    level: d.level as Level,
    status: "review",
    authors: authorNames(d.authors).map((name) => ({ name })),
    institution: d.institution.trim(),
    ...(d.supervisor.trim() ? { supervisor: d.supervisor.trim() } : {}),
    year: Number(latinDigits(d.year.trim())),
    ...(d.district.trim() ? { district: d.district.trim() } : {}),
    published: at.slice(0, 10),
    summary: d.summary.trim(),
    keywords: keywordList(d.keywords).slice(0, LIMITS.keywords),
    sections,
    references: parseReferences(d.references),
    ...(isSafeImage(d.cover) ? { image: { src: d.cover, caption: d.coverCaption?.trim() || d.title.trim() } } : {}),
    ...(d.gallery?.length ? { gallery: d.gallery.slice(0, LIMITS.gallery).map((g) => ({ src: g.src, caption: g.caption.trim() })) } : {}),
    ...(opts.file ? { file: opts.file } : {}),
    ...(d.scope === "global" ? { scope: "global" as const } : {}),
    ...(Number(d.problem) >= 1 && Number(d.problem) <= 32 ? { problems: [Number(d.problem)] } : {}),
    owner: opts.owner,
    revisions: [{ at, by: opts.ownerName, note: "First submission, awaiting review" }],
  };
}

const isStr = (x: unknown): x is string => typeof x === "string";

/**
 * The viewer's own submissions as read back from browser storage, which
 * anything else on the device can edit: keep only well-formed works, only
 * the fields an upload can have, and only media the upload form makes.
 * A submission is always "in review" until a server publishes it.
 */
export function sanitizeOwn(raw: unknown): Article[] {
  if (!Array.isArray(raw)) return [];
  const out: Article[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const x = item as Partial<Article>;
    if (!isStr(x.slug) || !x.slug || !isStr(x.title) || !isStr(x.summary) || !isStr(x.institution) || !isStr(x.published)) continue;
    if (!isStr(x.kind) || !Object.hasOwn(KINDS, x.kind) || !isStr(x.field) || !Object.hasOwn(FIELDS, x.field) || !isStr(x.level) || !Object.hasOwn(LEVELS, x.level)) continue;
    if (!Number.isInteger(x.year) || !Array.isArray(x.authors) || !Array.isArray(x.sections) || !Array.isArray(x.keywords)) continue;
    const authors = x.authors.filter((a) => a && isStr(a.name)).map((a) => ({ name: a.name }));
    const sections = x.sections.filter((s) => s && isStr(s.id) && isStr(s.heading) && isStr(s.body)).map((s) => ({ id: s.id, heading: s.heading, body: s.body }));
    if (authors.length === 0 || sections.length === 0) continue;
    const gallery = Array.isArray(x.gallery) ? x.gallery.filter((g) => g && isSafeImage(g.src) && isStr(g.caption)).slice(0, LIMITS.gallery).map((g) => ({ src: g.src, caption: g.caption })) : [];
    out.push({
      slug: x.slug,
      title: x.title,
      ...(isStr(x.titleEn) && x.titleEn ? { titleEn: x.titleEn } : {}),
      kind: x.kind,
      field: x.field,
      level: x.level,
      status: "review",
      authors,
      institution: x.institution,
      ...(isStr(x.supervisor) && x.supervisor ? { supervisor: x.supervisor } : {}),
      year: x.year as number,
      ...(isStr(x.district) && x.district ? { district: x.district } : {}),
      published: x.published,
      summary: x.summary,
      keywords: x.keywords.filter(isStr),
      sections,
      references: (Array.isArray(x.references) ? x.references : []).filter((r) => r && isStr(r.text)).map((r) => ({ text: r.text, ...(isWebLink(r.url) ? { url: r.url } : {}) })),
      ...(x.image && isSafeImage(x.image.src) ? { image: { src: x.image.src, caption: isStr(x.image.caption) ? x.image.caption : x.title } } : {}),
      ...(gallery.length ? { gallery } : {}),
      ...(x.file && isStr(x.file.name) && (x.file.url === undefined || isSafePdf(x.file.url)) ? { file: { name: x.file.name, size: Number(x.file.size) || 0, ...(x.file.url ? { url: x.file.url } : {}) } } : {}),
      ...(x.scope === "global" ? { scope: "global" as const } : {}),
      ...(Array.isArray(x.problems) ? { problems: x.problems.filter((n) => Number.isInteger(n) && n >= 1 && n <= 32) } : {}),
      ...(isStr(x.owner) ? { owner: x.owner } : {}),
      revisions: (Array.isArray(x.revisions) ? x.revisions : []).filter((r) => r && isStr(r.at) && isStr(r.by) && isStr(r.note)).map((r) => ({ at: r.at, by: r.by, note: r.note })),
    });
  }
  return out;
}

/* ---------- Reactions, points and rankings ---------- */

export type ReactionKind = "insight" | "method" | "useful" | "inspire";

/** What a reader can say about a piece of research, one reaction each. */
export const REACTIONS: Record<ReactionKind, { label: string; icon: string }> = {
  insight: { label: "New insight", icon: "lightbulb" },
  method: { label: "Sound method", icon: "verified" },
  useful: { label: "Useful", icon: "handyman" },
  inspire: { label: "Inspiring", icon: "local_fire_department" },
};
export const REACTION_KINDS = Object.keys(REACTIONS) as ReactionKind[];

/** Points per signal. A share or citation means the work travelled, so it counts more than a reaction. */
export const POINTS = { reaction: 2, comment: 3, share: 5, cite: 4, article: 25 } as const;

export interface Engagement {
  reactions: Record<ReactionKind, number>;
  comments: number;
  shares: number;
  cites: number;
}

/** What the viewer did on one article. */
export interface Activity {
  reaction?: ReactionKind;
  comments?: number;
  /** Channels shared to (feed, Facebook …), each counted once. */
  shares?: number;
  cited?: boolean;
}

/** Other readers' signals plus the viewer's own. */
export function engagementOf(a: Pick<Article, "engagement" | "talk">, act: Activity = {}): Engagement {
  const seed = a.engagement ?? {};
  const reactions = Object.fromEntries(REACTION_KINDS.map((k) => [k, (seed.reactions?.[k] ?? 0) + (act.reaction === k ? 1 : 0)])) as Record<ReactionKind, number>;
  return {
    reactions,
    comments: (a.talk?.length ?? 0) + (act.comments ?? 0),
    shares: (seed.shares ?? 0) + (act.shares ?? 0),
    cites: (seed.cites ?? 0) + (act.cited ? 1 : 0),
  };
}

export const reactionTotal = (e: Engagement) => REACTION_KINDS.reduce((sum, k) => sum + e.reactions[k], 0);

export const pointsOf = (e: Engagement) => reactionTotal(e) * POINTS.reaction + e.comments * POINTS.comment + e.shares * POINTS.share + e.cites * POINTS.cite;

type Score = (a: Article) => number;
const published = (list: Article[]) => list.filter((a) => a.status === "published");

/** The most-engaged published research; ties go to the newer one. */
export function trending(list: Article[], score: Score, n: number): Article[] {
  return published(list)
    .map((a) => ({ a, p: score(a) }))
    .sort((x, y) => y.p - x.p || y.a.published.localeCompare(x.a.published))
    .slice(0, n)
    .map((x) => x.a);
}

/** Every field with its article count and points, the busiest first; empty fields keep their place at the end. */
export function topFields(list: Article[], score: Score): { field: FieldId; articles: number; points: number }[] {
  const order = Object.keys(FIELDS) as FieldId[];
  const pub = published(list);
  return order
    .map((field) => {
      const in_ = pub.filter((a) => a.field === field);
      return { field, articles: in_.length, points: in_.reduce((s, a) => s + score(a), 0) };
    })
    .sort((x, y) => y.points - x.points || y.articles - x.articles || order.indexOf(x.field) - order.indexOf(y.field));
}

/** Researchers by points: their articles' points plus a fixed amount per published article. */
export function topResearchers(list: Article[], score: Score): { name: string; institution: string; articles: number; points: number }[] {
  const by = new Map<string, { name: string; institution: string; articles: number; points: number }>();
  for (const a of published(list)) {
    const p = score(a);
    for (const au of a.authors) {
      const r = by.get(au.name) ?? { name: au.name, institution: au.affiliation ?? a.institution, articles: 0, points: 0 };
      r.articles += 1;
      r.points += p + POINTS.article;
      by.set(au.name, r);
    }
  }
  return [...by.values()].sort((x, y) => y.points - x.points || y.articles - x.articles || x.name.localeCompare(y.name, "en"));
}

/** Further reading: same field first, then same kind, then the rest, newest first within each. */
export function related(list: Article[], a: Article, n: number): Article[] {
  const rank = (x: Article) => (x.field === a.field ? 0 : x.kind === a.kind ? 1 : 2);
  return published(list)
    .filter((x) => x.slug !== a.slug)
    .sort((x, y) => rank(x) - rank(y) || y.published.localeCompare(x.published))
    .slice(0, n);
}

/* ---------- Discussion ---------- */

/** Comments with their replies under them. Top-level order: newest first, or most liked; replies run oldest first. */
export function thread(notes: TalkNote[], likes: (n: TalkNote) => number, order: "new" | "top"): { note: TalkNote; replies: TalkNote[] }[] {
  const ids = new Set(notes.map((n) => n.id));
  const top = notes.filter((n) => !n.parent || !ids.has(n.parent));
  const sorted = [...top].sort((x, y) => (order === "top" ? likes(y) - likes(x) : 0) || y.at.localeCompare(x.at));
  return sorted.map((note) => ({ note, replies: notes.filter((r) => r.parent === note.id).sort((x, y) => x.at.localeCompare(y.at)) }));
}

/* ---------- Sharing ---------- */

export type SocialChannel = "facebook" | "x" | "linkedin" | "whatsapp" | "telegram";

export const SOCIAL: Record<SocialChannel, string> = {
  facebook: "Facebook",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
};

/** The line that goes with a shared link. */
export const shareText = (a: Pick<Article, "title" | "authors">) => `${a.title} — ${nameList(a.authors.map((x) => x.nameEn ?? x.name))} | Genius`;

/** Each network's own share page for a link; nothing is sent until the reader confirms there. */
export function shareLinks(url: string, text: string): Record<SocialChannel, string> {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
  };
}

/** The Kandari feed's share page, prefilled with this article (the feed reads only the query). */
export function feedIntent(a: Pick<Article, "slug" | "title" | "summary" | "kind" | "keywords">): string {
  const summary = a.summary.length > 280 ? `${a.summary.slice(0, 279).trimEnd()}…` : a.summary;
  const q = new URLSearchParams({ u: `/research/${a.slug}`, t: a.title, s: summary, src: "Genius", k: KINDS[a.kind].type, tags: a.keywords.slice(0, 4).join(",") });
  return `/media/share?${q.toString()}`;
}
