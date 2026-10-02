/*
 * গবেষণাকোষ's kit. The world: the home page's pitch-black ground; solid
 * gold for what matters most (the cover, the score), solid bottle green for
 * rank and field, white tiles for reference facts, neutral glass-free dark
 * tiles for lists. The encyclopedia serif (font-wiki) carries titles and big
 * numbers; Bangla never gets letter-spacing.
 */
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { FIELDS, initials, KINDS, LEVELS, type Article } from "@/lib/research/core";
import { cn } from "@/lib/utils";

export const articleHref = (a: Pick<Article, "slug">) => `/research/${encodeURIComponent(a.slug)}`;

/** An inline link to an article (gold on black, green on paper). */
export function ALink({ article, paper, className, children }: { article: Pick<Article, "slug" | "title">; paper?: boolean; className?: string; children?: React.ReactNode }) {
  return (
    <Link href={articleHref(article)} className={cn("font-semibold underline-offset-2 hover:underline", paper ? "text-bd-green" : "text-signal-orange", className)}>
      {children ?? article.title}
    </Link>
  );
}

export function KindChip({ article, paper }: { article: Pick<Article, "kind">; paper?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] leading-none font-bold", paper ? "bg-text-primary text-signal-orange" : "bg-white/8 text-white/85 ring-1 ring-white/12")}>
      <Icon name={KINDS[article.kind].icon} className="text-[14px]" /> {KINDS[article.kind].bn}
    </span>
  );
}

export function FieldChip({ article }: { article: Pick<Article, "field"> }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bd-green px-2.5 py-1 text-[11px] leading-none font-bold text-white">
      <Icon name={FIELDS[article.field].icon} className="text-[14px]" /> {FIELDS[article.field].bn}
    </span>
  );
}

export function LevelChip({ article }: { article: Pick<Article, "level"> }) {
  return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] leading-none font-bold text-white/70 ring-1 ring-white/15">{LEVELS[article.level]}</span>;
}

/** Status badges: working paper, ongoing, in review, sample. */
export function StatusChips({ article }: { article: Pick<Article, "preprint" | "ongoing" | "status" | "sample"> }) {
  return (
    <>
      {article.preprint && <span className="inline-flex items-center gap-1 rounded-full bg-signal-orange px-2.5 py-1 text-[11px] leading-none font-bold text-text-primary"><Icon name="edit_note" className="text-[14px]" /> ওয়ার্কিং পেপার</span>}
      {article.ongoing && <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] leading-none font-bold text-bd-green"><Icon name="science" className="text-[14px]" /> চলমান গবেষণা</span>}
      {article.status === "review" && <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] leading-none font-bold text-text-primary"><Icon name="hourglass_top" className="text-[14px]" /> পর্যালোচনায়</span>}
      {article.sample && <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] leading-none font-bold text-white/55 ring-1 ring-white/15">নমুনা</span>}
    </>
  );
}

const TONES = ["bg-signal-orange text-text-primary", "bg-bd-green text-white", "bg-white text-text-primary"] as const;

/** A solid initials disc; the colour follows the name so a person keeps theirs everywhere. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span aria-hidden className={cn("grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ring-2 ring-black", TONES[h % TONES.length], className)}>
      {initials(name)}
    </span>
  );
}

/** A section's eyebrow and serif title, with an optional link at the right. */
export function SectionHead({ id, eyebrow, title, action }: { id: string; eyebrow: string; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <p className="text-sm font-bold text-signal-orange">{eyebrow}</p>
        <h2 id={id} className="font-wiki mt-1 text-[1.75rem] leading-tight font-bold text-white sm:text-[2.1rem]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/** "সব দেখুন →" style link for a section head. */
export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-bold text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white hover:text-text-primary">
      {children} <Icon name="arrow_forward" className="text-[18px] transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </Link>
  );
}

const BN = "০১২৩৪৫৬৭৮৯";
export const bn = (n: number | string) => String(n).replace(/\d/g, (d) => BN[Number(d)]);

/** Indian grouping (১২,৩৪,৫৬৭) in Bangla digits, up to two decimals. */
export const bnNum = (n: number) => bn(n.toLocaleString("en-IN", { maximumFractionDigits: 2 }));

/** "১২ সেপ্টেম্বর ২০২৬" from YYYY-MM-DD or an ISO time, Dhaka time. */
export function bnDate(iso: string, withYear = true): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00+06:00` : iso);
  return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}), timeZone: "Asia/Dhaka" }).format(d);
}

/** Authors as "ক, খ ও গ", or "ক ও আরও ৩ জন" when there are many. */
export function byline(a: Pick<Article, "authors">, max = 3): string {
  const names = a.authors.map((x) => x.name);
  if (names.length <= max) return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} ও ${names[names.length - 1]}`;
  return `${names.slice(0, max - 1).join(", ")} ও আরও ${bn(names.length - max + 1)} জন`;
}

/** One article in a list: chips, the serif title, a line of the summary, who and when. */
export function ArticleItem({ a, note }: { a: Article; note?: React.ReactNode }) {
  return (
    <Link href={articleHref(a)} className="group block rounded-2xl p-4 transition-colors hover:bg-white/[0.05] sm:p-5">
      <span className="flex flex-wrap gap-1.5"><KindChip article={a} /><FieldChip article={a} /><StatusChips article={a} /></span>
      <span className="font-wiki mt-2.5 block text-lg leading-snug font-bold text-white group-hover:text-signal-orange sm:text-xl">{a.title}</span>
      <span className="mt-1.5 line-clamp-2 block text-[15px] leading-relaxed text-white/60">{a.summary}</span>
      <span className="mt-2 block text-xs text-white/45">{byline(a, 2)} · {a.institution.split(",")[0]} · {bnDate(a.published)}{note}</span>
    </Link>
  );
}
