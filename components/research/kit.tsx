/*
 * Genius's kit, in the landing page's language: a pitch-black
 * ground, solid navy, ink and cobalt panels with a faint white ring, Sora
 * titles in gold, Inter body in white tiers (white, white/80, white/65),
 * gold underlined links and the site's own buttons (components/ui/section-kit).
 * JSTOR's layout stays; only the dress changed. No server-only or
 * client-only code here, so both kinds of component can use it.
 */
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { FIELDS, initials, KINDS, type Article, type FieldId, type ResearchKind } from "@/lib/research/core";
import { cn } from "@/lib/utils";

/* ---------- Links ---------- */

export const articleHref = (a: Pick<Article, "slug">, seq?: number) => `/research/${encodeURIComponent(a.slug)}${seq && seq > 1 ? `?seq=${seq}` : ""}`;
export const contentHref = (a: Pick<Article, "slug">) => `/research/content/${encodeURIComponent(a.slug)}`;
export const collectionHref = (id: string) => `/research/collections/${id}`;
export const subjectHref = (id: FieldId) => `/research/subjects/${id}`;
export const searchHref = (params: Record<string, string>) => `/research/search?${new URLSearchParams(params).toString()}`;

/** What "All Content" can narrow a search to. */
export const CONTENT_TYPES: { value: "" | ResearchKind | "preprint"; label: string }[] = [
  { value: "", label: "All Content" },
  ...(Object.keys(KINDS) as ResearchKind[]).map((k) => ({ value: k, label: KINDS[k].plural })),
  { value: "preprint", label: "Working papers" },
];

/* ---------- Layout and type ---------- */

/** The page column, the landing page's width. */
export const COLUMN = "mx-auto w-full max-w-7xl px-gutter-x";

/** Titles: Sora, bold, gold, as every heading on the landing page. */
export const TITLE = "font-grotesk font-bold tracking-tight text-balance text-signal-orange";

/** A page's own title. */
export const H1 = cn(TITLE, "text-3xl leading-[1.15] sm:text-4xl");

/** A section title inside a page. */
export const H2 = cn(TITLE, "text-2xl leading-tight sm:text-3xl");

/** A band's title on the research home, the landing page's section heading size. */
export const BAND_TITLE = cn(TITLE, "text-2xl leading-[1.2] sm:text-3xl lg:text-4xl");

/** A bare gold arrow for carousels and sliders: no disc, no glass. */
export const ARROW = "grid size-11 shrink-0 place-items-center rounded-full text-signal-orange transition-[translate,opacity] duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none disabled:opacity-30 disabled:hover:translate-y-0 motion-reduce:transition-none";

/** An underlined gold link inside text. */
export const LINK = "rounded-sm text-signal-orange underline decoration-signal-orange/40 decoration-1 underline-offset-4 transition-colors hover:decoration-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

/** A work's title as a link in a list: white and bold, gold on hover. */
export const TITLE_LINK = "rounded-sm font-grotesk font-bold text-white transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

/** The small catalogue label ("Research paper"), in the navy tint that reads on black. */
export const LABEL = "text-xs leading-tight font-semibold text-bdnavy-300";

/** A solid panel: navy by default, with the ring that holds its edge on black. */
export const PANEL = "rounded-3xl bg-bdnavy-900 ring-1 ring-white/12";
/** The second panel colour, for a neighbour that must not match. */
export const PANEL_INK = "rounded-3xl bg-text-primary ring-1 ring-white/12";
/** The third, for the one panel on a page that speaks up. */
export const PANEL_COBALT = "rounded-3xl bg-cobalt ring-1 ring-white/12";

/** A hairline rule on black or navy. */
export const RULE = "border-white/12";

/** Text fields and selects on a dark panel: see-through, a hairline ring, gold when focused. */
export const FIELD = "w-full rounded-xl bg-black/30 px-4 text-base text-white ring-1 ring-white/15 ring-inset transition-shadow placeholder:text-white/65 focus:ring-2 focus:ring-signal-orange focus:outline-none [&>option]:bg-bdnavy-900";

/** The landing page's card lift: rise and a soft shadow in the card's own colour (set `--glow`). */
export const LIFT = "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_48px_-22px_var(--glow,var(--color-bdnavy-400))] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/* ---------- Buttons ---------- */

/** Gold outline: "Cite", "Save", "Share" (the site's secondary button). */
export const BTN = btn.goldOutline;
/** Solid gold: "Download", "Log in", "Upload" (the site's primary button). */
export const BTN_SOLID = btn.gold;
export const BTN_GOLD = btn.gold;
/** A small icon-and-text action, for rows of tools inside lists. */
export const BTN_QUIET = "inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white/80 ring-1 ring-white/15 ring-inset transition-colors hover:text-signal-orange hover:ring-signal-orange/60 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:text-signal-orange aria-pressed:ring-signal-orange/60";
/** A bare icon button (toolbars, close). */
export const ICON_BTN = "grid size-10 shrink-0 place-items-center rounded-xl text-white/80 transition-colors hover:bg-bdnavy-700 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white/80";

/** A drop-down panel under its button: a navy card, as the site header's menus. */
export const MENU = "live-in absolute z-40 mt-2 min-w-64 overflow-hidden rounded-2xl bg-bdnavy-900 py-1.5 text-white shadow-[0_24px_48px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/12";
/** One row of a drop-down. */
export const MENU_ITEM = "flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-bdnavy-700 focus-visible:bg-bdnavy-700 focus-visible:outline-none";

/* ---------- Words ---------- */

/** The catalogue type: "Working paper" for a preprint, else the kind's type. */
export const typeOf = (a: Pick<Article, "kind" | "preprint">) => (a.preprint ? "Working paper" : KINDS[a.kind].type);

export const authorName = (x: Article["authors"][number]) => x.nameEn ?? x.name;

/** "A, B and C", or "A, B and 3 more" past `max`. */
export function byline(a: Pick<Article, "authors">, max = 3): string {
  const names = a.authors.map(authorName);
  if (names.length <= max) return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `${names.slice(0, max - 1).join(", ")} and ${names.length - max + 1} more`;
}

/** "12 September 2026", Dhaka time. */
export function fmtDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00+06:00` : iso);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }).format(d);
}

export const fmtNum = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** "s" when n is not 1. */
export const plural = (n: number, word: string, many = `${word}s`) => `${fmtNum(n)} ${n === 1 ? word : many}`;

/* ---------- Small parts ---------- */

/**
 * The Genius mark: Mahir's animated logo ("Gen", the gold "i", "us" typing
 * in, then holding), cropped from the 1200px GIF to the word itself and
 * re-encoded as an animated WebP (600 × 219, transparent). Under reduced
 * motion the browser takes the still of the finished word instead. A plain
 * <picture>, because next/image cannot switch sources on a media query.
 * Size it by height; the width follows the 600:219 ratio.
 */
export function GeniusLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <picture className={cn("block w-fit shrink-0", className)}>
      <source media="(prefers-reduced-motion: reduce)" srcSet="/research/genius-still.png" />
      <img src="/research/genius.webp" alt="Genius" width={600} height={219} decoding="async" fetchPriority={priority ? "high" : "auto"} className="h-full w-auto select-none" draggable={false} />
    </picture>
  );
}

/** The type label printed above a title, with its document icon. */
export function TypeLabel({ a, className }: { a: Pick<Article, "kind" | "preprint">; className?: string }) {
  return (
    <p className={cn(LABEL, "flex items-center gap-1.5", className)}>
      <Icon name={a.preprint ? "edit_note" : KINDS[a.kind].icon} className="text-base" />
      {typeOf(a)}
    </p>
  );
}

const TAG = "inline-flex items-center rounded-md px-2 text-xs leading-6 font-semibold";

/** The "Open access" tag. Everything published here is free to read. */
export function OpenAccess({ className }: { className?: string }) {
  return <span className={cn(TAG, "text-bdnavy-300 ring-1 ring-bdnavy-300/60 ring-inset", className)}>Open access</span>;
}

/** Sample, ongoing, in-review tags: the honest status of a work. */
export function StatusTags({ a, className }: { a: Pick<Article, "sample" | "ongoing" | "status" | "preprint">; className?: string }) {
  const quiet = "text-white/80 ring-1 ring-white/25 ring-inset";
  const tags = [
    a.status === "review" && { label: "In review", tone: quiet },
    a.ongoing && { label: "Ongoing research", tone: quiet },
    a.preprint && { label: "Not peer reviewed", tone: quiet },
    a.sample && { label: "Sample entry", tone: "bg-signal-orange text-text-primary" },
  ].filter(Boolean) as { label: string; tone: string }[];
  if (tags.length === 0) return null;
  return (
    <span className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((t) => (
        <span key={t.label} className={cn(TAG, t.tone)}>
          {t.label}
        </span>
      ))}
    </span>
  );
}

/**
 * The work's own image, or a typeset cover in navy and gold when it has none.
 * `mini` covers (thumbnails under ~120px) drop the words, which would be too
 * small to read, and keep the gold rule and the subject's icon.
 */
export function Cover({ a, sizes, className, priority, mini }: { a: Pick<Article, "title" | "kind" | "preprint" | "field" | "institution" | "year" | "image">; sizes: string; className?: string; priority?: boolean; mini?: boolean }) {
  if (a.image) {
    return (
      <span className={cn("relative block overflow-hidden rounded-xl bg-bdnavy-900", className)}>
        <Image src={a.image.src} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      </span>
    );
  }
  if (mini) {
    return (
      <span aria-hidden className={cn("relative flex flex-col justify-between overflow-hidden rounded-xl bg-bdnavy-900 p-[14%] ring-1 ring-white/12 ring-inset", className)}>
        <span className="h-0.5 w-1/2 bg-signal-orange" />
        <Icon name={FIELDS[a.field].icon} className="text-2xl text-signal-orange" />
      </span>
    );
  }
  return (
    <span aria-hidden className={cn("relative flex flex-col overflow-hidden rounded-xl bg-bdnavy-900 p-[9%] text-white ring-1 ring-white/12 ring-inset", className)}>
      <span className="h-0.5 w-1/3 bg-signal-orange" />
      <span className="mt-[8%] text-xs font-semibold text-signal-orange">{typeOf(a)}</span>
      <span className="mt-[6%] line-clamp-5 font-grotesk text-sm leading-snug font-bold sm:text-base">{a.title}</span>
      <span className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-white/65">
        <Icon name={FIELDS[a.field].icon} className="text-base text-signal-orange" />
        <span className="line-clamp-2">{a.institution.split(",")[0]} · {a.year}</span>
      </span>
    </span>
  );
}

const TONES = ["bg-cobalt text-white", "bg-signal-orange text-text-primary", "bg-text-primary text-white ring-1 ring-white/25"] as const;

/** A solid initials disc; the colour follows the name, so a person keeps theirs everywhere. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span aria-hidden className={cn("grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold", TONES[h % TONES.length], className)}>
      {initials(name)}
    </span>
  );
}

/** A section heading with a hairline under it, as JSTOR's "Table of Contents". */
export function RuleHeading({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn(H2, "border-b border-white/12 pb-4", className)}>
      {children}
    </h2>
  );
}
