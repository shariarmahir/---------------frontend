/**
 * The building blocks of a MOTHERLAND category page. Each page lists its own
 * blocks in the order it wants them read: first what stops the eye, then what
 * explains, then what makes you want to come, and last what you can do next.
 */
import type { Picture } from "./motherland.ts";
import { EVENT_PICTURES } from "./motherland-live.ts";
import { MORE } from "./motherland-more.ts";
import { PLACE_CREDITS } from "./motherland-places-credits.ts";

export interface Src {
  name: string;
  url: string;
}

export type BandTone = "white" | "paper" | "sun" | "mint" | "navy" | "gold";

export interface Card {
  title: string;
  /** A short line under the title: a date, a place, a field. */
  meta?: string;
  text: string;
  picture?: Picture;
  source?: Src;
  /** Plain facts shown on the card: status, where to see it, when. */
  facts?: { label: string; value: string }[];
  /** A way onward from the card. */
  cta?: { label: string; href: string };
  /** The tab it sits under, when its block has tabs. */
  group?: string;
}

export interface Line {
  bangla: string;
  english: string;
  who: string;
  picture?: Picture;
}

export interface MapPin {
  id: string;
  name: string;
  place: string;
  lat: number;
  lon: number;
  text: string;
  tag?: string;
  link?: Src;
  picture?: Picture;
}

export type Block =
  | { kind: "chapters"; id: string; title: string; lede?: string; tone: BandTone; chapters: Card[]; layout?: "sideways" }
  | { kind: "cards"; id: string; title: string; lede?: string; tone: BandTone; cards: Card[]; columns?: 2 | 3 | 4; note?: string; layout?: "sideways"; /** Shows the cards one group at a time, by each card's `group`. */ tabs?: string[] }
  | { kind: "people"; id: string; title: string; lede?: string; tone: BandTone; cards: Card[] }
  | { kind: "steps"; id: string; title: string; lede?: string; tone: BandTone; steps: Card[] }
  | { kind: "table"; id: string; title: string; lede?: string; tone: BandTone; head: string[]; rows: string[][]; note?: string; sources?: Src[]; picture?: Picture; /** The last column is a source, kept for reference.md and not shown. */ hideLastColumn?: boolean }
  | { kind: "lines"; id: string; title: string; lede?: string; tone: BandTone; lines: Line[]; note?: string }
  | { kind: "map"; id: string; title: string; lede?: string; tone: BandTone; pins: MapPin[]; note?: string }
  | { kind: "films"; id: string; title: string; lede?: string; tone: BandTone; films: FilmCard[] }
  /** A pause: one photograph across the whole screen with one thought on it. */
  | { kind: "moment"; id: string; title: string; text?: string; picture: Picture }
  | { kind: "statement"; id: string; tone: BandTone; title?: string; text: string[]; cta?: { label: string; href: string } }
  /** A part the page already had: its opening stack, sourced figures, timeline, or a rail of stories. */
  | { kind: "part"; part: "stack" | "figures" | "timeline" | "rails" | "simulator" | "debates" | "videos" }
  /** A part with its own behaviour, drawn by a client component. */
  | { kind: "tool"; tool: "converter" | "calendar" | "connect" | "launch" | "money-brands" };

export interface FilmCard {
  title: string;
  text: string;
  file: string;
  /** "mp4" for files from Pixabay; the rest are webm. */
  ext?: "mp4" | "webm";
  /** How honest the picture is about where it was filmed. */
  where: string;
  credit: { author: string; license: string; sourceUrl: string; source?: "Pixabay" };
}

/** A credited photo from public/motherland/more, if we have it. */
export function pic(key: string, alt: string, focus?: string): Picture | undefined {
  const m = MORE[key];
  if (!m) return undefined;
  return { src: `/motherland/more/${m.file ?? `${key}.jpg`}`, alt, focus, credit: { author: m.author, source: m.source ?? "Wikimedia Commons", sourceUrl: m.sourceUrl, license: m.license, licenseUrl: m.licenseUrl || undefined } };
}

/** A credited Commons photo from public/motherland/places. */
export function place(key: string, alt: string, focus?: string): Picture {
  const c = PLACE_CREDITS[key];
  if (!c) throw new Error(`MOTHERLAND: no credit for places/${key}`);
  return { src: `/motherland/places/${key}.jpg`, alt, focus, credit: { author: c.author, source: "Wikimedia Commons", sourceUrl: c.sourceUrl, license: c.license, licenseUrl: c.licenseUrl } };
}

export const wiki = (title: string): Src => ({ name: "Wikipedia", url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}` });
export const bangla = (title: string): Src => ({ name: "Banglapedia", url: `https://en.banglapedia.org/index.php/${encodeURIComponent(title.replace(/ /g, "_"))}` });

/** Every source a page's blocks name, once. */
export function blockSources(blocks: Block[]): Src[] {
  const seen = new Map<string, string>();
  const add = (s?: Src) => {
    if (s) seen.set(s.url, s.name);
  };
  for (const b of blocks) {
    if (b.kind === "chapters") b.chapters.forEach((c) => add(c.source));
    if (b.kind === "cards" || b.kind === "people") b.cards.forEach((c) => add(c.source));
    if (b.kind === "steps") b.steps.forEach((c) => add(c.source));
    if (b.kind === "table") b.sources?.forEach(add);
    if (b.kind === "map") b.pins.forEach((p) => add(p.link));
  }
  return [...seen].map(([url, name]) => ({ url, name }));
}

/** Every picture and film a page's blocks show, for its credits. */
export function blockCredits(blocks: Block[]) {
  const out: { label: string; credit: Picture["credit"] }[] = [];
  const add = (c: Card) => {
    if (c.picture) out.push({ label: c.title, credit: c.picture.credit });
  };
  for (const b of blocks) {
    if (b.kind === "chapters") b.chapters.forEach(add);
    if (b.kind === "cards" || b.kind === "people") b.cards.forEach(add);
    if (b.kind === "steps") b.steps.forEach(add);
    if (b.kind === "tool" && b.tool === "calendar") {
      for (const [id, e] of Object.entries(EVENT_PICTURES)) {
        const p = e.key ? pic(e.key, e.alt) : e.place ? place(e.place, e.alt) : undefined;
        if (p) out.push({ label: id, credit: p.credit });
      }
    }
    if (b.kind === "map") b.pins.forEach((m) => { if (m.picture) out.push({ label: m.name, credit: m.picture.credit }); });
    if (b.kind === "moment") out.push({ label: b.title, credit: b.picture.credit });
    if (b.kind === "table" && b.picture) out.push({ label: b.title, credit: b.picture.credit });
    if (b.kind === "lines") b.lines.forEach((l) => { if (l.picture) out.push({ label: l.who, credit: l.picture.credit }); });
    if (b.kind === "films") b.films.forEach((f) => out.push({ label: f.title, credit: { author: f.credit.author, source: f.credit.source ?? "Wikimedia Commons", sourceUrl: f.credit.sourceUrl, license: f.credit.license } }));
  }
  return out;
}
