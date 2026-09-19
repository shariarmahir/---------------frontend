"use client";

import { Icon } from "@/components/ui/icon";
import { useFeedClock } from "@/components/news/feed-clock";
import { NewsArt } from "@/components/news/news-art";
import {
  newsCategories,
  SOURCE_KIND_META,
  type NewsItem,
} from "@/data/news-feed";
import { cn } from "@/lib/utils";

/**
 * "2h ago" / "3d ago" — compact relative time for a dense feed.
 *
 * `now` is passed in rather than read from the clock inside, so the caller
 * decides which instant the whole feed is measured against. Reading
 * `Date.now()` here would give the server and the client two different
 * answers and mismatch on hydration.
 */
export function relativeTime(iso: string, now: number): string {
  const mins = Math.max(1, Math.round((now - +new Date(iso)) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function categoryOf(id: NewsItem["category"]) {
  return newsCategories.find((c) => c.id === id) ?? newsCategories[0];
}

/** An item links out only if it has a real destination. */
function hasLink(item: NewsItem): boolean {
  return Boolean(item.url) && item.url !== "#";
}

/** Publisher host, e.g. "technologyreview.com", shown on the read link. */
function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * The headline.
 *
 * Renders as a link only when there is somewhere to go. An `href="#"`
 * headline looks clickable, takes the keyboard focus and then does
 * nothing — worse than plain text, and it misleads a screen reader about
 * what is available.
 */
function Headline({ item, className }: { item: NewsItem; className: string }) {
  if (!hasLink(item)) {
    return <span className={className}>{item.headline}</span>;
  }
  return (
    <a
      href={item.url}
      target="_blank"
      // noopener/noreferrer: the destination is a third-party outlet, and
      // a new tab opened without these can reach back via window.opener.
      rel="noopener noreferrer"
      className={cn(
        className,
        "hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      {item.headline}
    </a>
  );
}

/**
 * "Read the full report" — the explicit way out to the source.
 *
 * The page only ever carries a short summary, so this link is the point of
 * the card. It names the outlet and host so a reader knows where they are
 * being sent before they click.
 */
function ReadMoreLink({ item }: { item: NewsItem }) {
  if (!hasLink(item)) {
    return (
      <span className="inline-flex items-center gap-1 font-sans text-[0.8125rem] text-slate-400">
        <Icon name="link_off" className="text-[14px]" />
        Source link pending
      </span>
    );
  }
  const host = hostOf(item.url);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-1 rounded-sm font-sans text-[0.8125rem] font-semibold text-primary transition-colors hover:text-emerald-800 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Icon name="open_in_new" className="text-[14px]" />
      {/* The explicit space matters: flex `gap` separates these visually,
          but the accessible name is the concatenated text, which would
          otherwise be read as "reporton technologyreview.com". */}
      <span>Read the full report </span>
      {host ? (
        <span className="font-normal text-slate-500">on {host}</span>
      ) : null}
    </a>
  );
}

/** Small category pill, reused across every card size. */
export function CategoryChip({
  category,
  className,
}: {
  category: NewsItem["category"];
  className?: string;
}) {
  const meta = categoryOf(category);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-sm border px-1.5 py-0.5",
        "font-sans text-[0.6875rem] font-semibold whitespace-nowrap",
        meta.chip,
        className,
      )}
    >
      <Icon name={meta.icon} className="text-[12px]" />
      {meta.label}
    </span>
  );
}

/** Source credit line: outlet, medium and corroboration count. */
function SourceLine({ item }: { item: NewsItem }) {
  const kind = SOURCE_KIND_META[item.sourceKind];
  const now = useFeedClock();
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans text-[0.75rem] text-slate-500">
      <Icon name={kind.icon} className="text-[13px]" />
      <span className="font-medium text-slate-600">{item.source}</span>
      <span aria-hidden>·</span>
      <time dateTime={item.publishedAt}>
        {relativeTime(item.publishedAt, now)}
      </time>
      {item.district ? (
        <>
          <span aria-hidden>·</span>
          <span>{item.district}</span>
        </>
      ) : null}
      {item.corroboration && item.corroboration > 1 ? (
        <>
          <span aria-hidden>·</span>
          <span className="font-medium text-primary">
            {item.corroboration} outlets
          </span>
        </>
      ) : null}
      {item.sourceKind === "citizen" ? (
        <span className="rounded-sm bg-violet-50 px-1 py-px font-semibold text-violet-800">
          Unverified
        </span>
      ) : null}
    </span>
  );
}

/**
 * Where the underlying information comes from.
 *
 * Named explicitly so a reader can go and check the primary document rather
 * than taking the summary on trust.
 */
function ReferenceLine({ item }: { item: NewsItem }) {
  if (!item.reference) return null;
  return (
    <span className="flex flex-wrap items-baseline gap-x-1 rounded-md bg-slate-50 px-space-xs py-1 font-sans text-[0.75rem] text-slate-600">
      <Icon name="description" className="text-[12px] text-slate-400" />
      <span className="font-semibold text-slate-900">Reference:</span>
      <span>{item.reference.publisher}</span>
      <span aria-hidden className="text-slate-400">
        —
      </span>
      <span className="italic">{item.reference.document}</span>
    </span>
  );
}

/** Key figures lifted out of the report. */
function FactStrip({ item }: { item: NewsItem }) {
  if (!item.facts?.length) return null;
  return (
    <dl className="flex flex-wrap gap-x-space-md gap-y-1">
      {item.facts.map((f) => (
        <div key={f.label} className="flex flex-col">
          <dt className="font-sans text-[0.6875rem] tracking-wide text-slate-500 uppercase">
            {f.label}
          </dt>
          <dd className="font-display text-[0.875rem] font-bold text-slate-900">
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * One feed entry.
 *
 * `size` controls the treatment: `lead` for the top story, `standard` for
 * the main grid, `compact` for the sidebar rails. Every variant shows only a
 * short summary and always credits the source, because this screen indexes
 * reporting rather than reproducing it.
 */
export function NewsCard({
  item,
  size = "standard",
}: {
  item: NewsItem;
  size?: "lead" | "standard" | "compact";
}) {
  const meta = categoryOf(item.category);

  if (size === "compact") {
    return (
      <article className="group flex gap-space-sm py-space-sm">
        <span
          aria-hidden
          className={cn(
            "mt-1.5 h-full w-[3px] shrink-0 rounded-full",
            meta.accent,
          )}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <Headline
            item={item}
            className="font-display text-[0.9375rem] leading-snug font-bold text-slate-900 transition-colors group-hover:text-primary"
          />
          <SourceLine item={item} />
        </div>
      </article>
    );
  }

  if (size === "lead") {
    return (
      <article className="group flex flex-col gap-space-md">
        <NewsArt
          id={item.id}
          category={item.category}
          className="aspect-[16/9] w-full"
          priority
        />
        <div className="flex flex-col gap-space-sm">
          <CategoryChip category={item.category} className="w-fit" />
          <Headline
            item={item}
            className="font-display text-[1.75rem] leading-[1.15] font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-primary sm:text-[2.125rem]"
          />
          <p className="max-w-2xl font-sans text-[0.9375rem] leading-relaxed text-slate-600">
            {item.summary}
          </p>

          {item.whyItMatters ? (
            <p className="max-w-2xl border-l-2 border-primary/40 pl-space-sm font-sans text-[0.875rem] leading-relaxed text-slate-600 italic">
              <span className="font-semibold not-italic text-primary">
                Why it matters:{" "}
              </span>
              {item.whyItMatters}
            </p>
          ) : null}

          <FactStrip item={item} />
          <SourceLine item={item} />
          <ReferenceLine item={item} />
          <ReadMoreLink item={item} />
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col gap-space-sm">
      <NewsArt
        id={item.id}
        category={item.category}
        className="aspect-[16/9] w-full"
      />
      <CategoryChip category={item.category} className="w-fit" />
      <Headline
        item={item}
        className="font-display text-[1.0625rem] leading-snug font-bold text-slate-900 transition-colors group-hover:text-primary"
      />
      <p className="font-sans text-[0.875rem] leading-relaxed text-slate-600">
        {item.summary}
      </p>
      {item.whyItMatters ? (
        <p className="border-l-2 border-primary/40 pl-space-sm font-sans text-[0.8125rem] leading-relaxed text-slate-600 italic">
          <span className="font-semibold text-primary not-italic">
            Why it matters:{" "}
          </span>
          {item.whyItMatters}
        </p>
      ) : null}
      <FactStrip item={item} />
      <SourceLine item={item} />
      <ReferenceLine item={item} />
      <ReadMoreLink item={item} />
    </article>
  );
}
