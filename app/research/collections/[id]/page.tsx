import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import {
  articleHref,
  BTN,
  BTN_SOLID,
  byline,
  contentHref,
  Cover,
  COLUMN,
  FIELD,
  GeniusLogo,
  H1,
  H2,
  LIFT,
  LINK,
  PANEL,
  plural,
  subjectHref,
  StatusTags,
  TITLE_LINK,
  TypeLabel,
} from "@/components/research/kit";
import { excerpt } from "@/lib/research/pages";
import { SignalSeam } from "@/components/ui/section-kit";
import { Results } from "@/components/research/results";
import { sourcePoints, type Urgency } from "@/data/amar-bangladesh";
import { COLLECTIONS } from "@/data/research/showcase";
import { libraryArticles } from "@/data/research/library";
import { FIELDS, type FieldId } from "@/lib/research/core";
import {
  findTrack,
  inTopic,
  problemCode,
  problemCoverage,
  TRACK_IDS,
  type TrackId,
} from "@/lib/research/tracks";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACK_IDS.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const t = findTrack((await params).id);
  return t
    ? { title: `${t.title} — Genius`, description: t.blurb }
    : { title: "Collection — Genius" };
}

const URGENCY: Record<Urgency, { label: string; tone: string }> = {
  "very-high": { label: "Very high", tone: "bg-national-crimson text-white" },
  high: { label: "High", tone: "bg-signal-orange text-bdnavy-900" },
  "medium-high": {
    label: "Medium-high",
    tone: "bg-bdnavy-300 text-bdnavy-900",
  },
  medium: { label: "Medium", tone: "text-white/80 ring-1 ring-white/30 ring-inset" },
};

/** Real-Time Bangladesh Problems' own shelf: the dossier's themes, each a row of pixels, one per problem. */
function ThemeCards() {
  const cover = problemCoverage(
    libraryArticles,
    sourcePoints.map((p) => p.n),
  );
  const themes = [...new Set(sourcePoints.map((p) => p.theme))];
  return (
    <>
      <p className="-mt-4 mb-8 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/65">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3.5 rounded-sm bg-signal-orange" /> One problem
          with linked research
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3.5 rounded-sm border border-white/50" /> One
          problem awaiting research
        </span>
      </p>
      <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {themes.map((theme) => {
          const pts = sourcePoints.filter((p) => p.theme === theme);
          const done = pts.filter(
            (p) => cover.find((c) => c.n === p.n)!.articles.length > 0,
          ).length;
          return (
            <li key={theme} className="story-reveal">
              <a
                href={`#problem-${theme.toLowerCase()}`}
                className="group block rounded-3xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
              >
                <span
                  aria-hidden
                  className={cn(
                    PANEL,
                    LIFT,
                    "flex aspect-4/3 flex-wrap content-center justify-center gap-2 p-6",
                  )}
                >
                  {pts.map((p) => {
                    const covered =
                      cover.find((c) => c.n === p.n)!.articles.length > 0;
                    return (
                      <span
                        key={p.n}
                        className={cn(
                          "size-9 rounded-md transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none",
                          covered
                            ? "bg-signal-orange"
                            : "border border-white/40",
                        )}
                      />
                    );
                  })}
                </span>
                <span className="mt-5 block font-grotesk text-lg font-bold text-white transition-colors group-hover:text-signal-orange">
                  {theme}
                </span>
              </a>
              <p className="mt-2 text-sm font-semibold text-bdnavy-300 tabular-nums">
                {plural(pts.length, "problem")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                {done} of {pts.length} with linked research
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** The 32 problems, with their urgency, evidence and the research on each, or an invitation to supply it. */
function ProblemTable() {
  const cover = problemCoverage(
    libraryArticles,
    sourcePoints.map((p) => p.n),
  );
  return (
    <div
      className={cn(PANEL, "overflow-x-auto focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none")}
      role="region"
      aria-label="The 32 national problems"
      tabIndex={0}
    >
      <table className="w-full min-w-200 border-collapse text-left text-sm text-white/80">
        <thead className="font-grotesk text-signal-orange">
          <tr className="border-b border-white/20">
            <th scope="col" className="px-4 py-3 font-semibold">
              Code
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Problem
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Theme
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Urgency
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Evidence
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Research
            </th>
          </tr>
        </thead>
        <tbody>
          {sourcePoints.map((p, i) => {
            const works = cover.find((c) => c.n === p.n)!.articles;
            const firstOfTheme =
              sourcePoints.findIndex((x) => x.theme === p.theme) === i;
            return (
              <tr
                key={p.n}
                id={
                  firstOfTheme ? `problem-${p.theme.toLowerCase()}` : undefined
                }
                className="border-b border-white/12 align-top transition-colors last:border-0 hover:bg-bdnavy-700"
              >
                <td className="px-4 py-3 font-semibold whitespace-nowrap text-white tabular-nums">
                  {problemCode(p.n)}
                </td>
                <th scope="row" className="px-4 py-3 font-semibold text-white">
                  {p.topic}
                  <span className="mt-0.5 block font-normal text-white/65">
                    {p.interpretation}
                  </span>
                </th>
                <td className="px-4 py-3">{p.theme}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-md px-2 text-xs leading-6 font-semibold whitespace-nowrap",
                      URGENCY[p.urgency].tone,
                    )}
                  >
                    {URGENCY[p.urgency].label}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">{p.status}</td>
                <td className="px-4 py-3">
                  {works.length ? (
                    <ul className="space-y-1">
                      {works.map((w) => (
                        <li key={w.slug}>
                          <Link href={articleHref(w)} className={cn(TITLE_LINK, "font-sans font-semibold")}>
                            {w.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Link
                      href="/research/submit"
                      className="inline-flex items-center gap-1 rounded-md font-semibold whitespace-nowrap text-signal-orange underline decoration-signal-orange/40 underline-offset-4 hover:decoration-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                    >
                      <Icon name="upload" className="text-lg" /> Awaiting
                      research
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Bangladesh Real Issues & Solutions: each work as a wide feature card,
 * since the collection is one subject and a grid of subject cards would
 * hold a single tile. Cover, type, title, the dossier problems it answers,
 * an excerpt of its abstract, and the way in.
 */
function SolutionCards({ id }: { id: TrackId }) {
  const works = inTopic(libraryArticles, id);
  if (works.length === 0)
    return (
      <p className="text-base text-white/65">
        Nothing has been published in this collection yet.
      </p>
    );
  return (
    <ul className="grid gap-6">
      {works.map((a) => (
        <li key={a.slug} className="story-reveal">
          <article className={cn(PANEL, LIFT, "group grid overflow-hidden md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]")}>
            <Link href={articleHref(a)} tabIndex={-1} aria-hidden className="block">
              <Cover a={a} sizes="(min-width: 768px) 352px, 100vw" className="aspect-4/3 h-full w-full rounded-none md:aspect-auto md:min-h-72" />
            </Link>
            <div className="flex min-w-0 flex-col p-6 sm:p-8">
              <TypeLabel a={a} className="text-sm" />
              <h3 className="mt-2">
                <Link href={articleHref(a)} className={cn(TITLE_LINK, "text-xl leading-snug sm:text-2xl")}>{a.title}</Link>
              </h3>
              <p className="mt-2 text-sm text-white/65">{byline(a, 3)} · {a.institution} · {a.year}</p>
              {a.problems && a.problems.length > 0 && (
                <ul aria-label="National problems addressed" className="mt-4 flex flex-wrap gap-2">
                  {a.problems.map((n) => (
                    <li key={n} className="rounded-md px-2 text-xs leading-6 font-semibold text-bdnavy-300 ring-1 ring-bdnavy-300/60 ring-inset">
                      {problemCode(n)} · {sourcePoints.find((p) => p.n === n)?.topic}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-white/80">{excerpt(a.summary, 320)}</p>
              <StatusTags a={a} className="mt-4" />
              <div className="mt-6 flex flex-wrap gap-3 pt-0 md:mt-auto md:pt-6">
                <Link href={articleHref(a)} className={BTN_SOLID}>Read the work</Link>
                <Link href={contentHref(a)} className={BTN}>Contents</Link>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

/** The collection's subjects as cards, each fronted by one of its works. */
function SubjectCards({ id }: { id: TrackId }) {
  const works = inTopic(libraryArticles, id);
  const fields = (Object.keys(FIELDS) as FieldId[])
    .map((f) => ({ f, list: works.filter((a) => a.field === f) }))
    .filter((x) => x.list.length > 0);
  if (fields.length === 0)
    return (
      <p className="text-base text-white/65">
        Nothing has been published in this collection yet.
      </p>
    );
  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {fields.map(({ f, list }) => (
        <li key={f} className="story-reveal group">
          <Link href={subjectHref(f)} className="block rounded-xl focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
            <Cover
              a={list[0]}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
              className={cn("aspect-4/3 w-full", LIFT)}
            />
            <span className="mt-5 block font-grotesk text-lg font-bold text-white transition-colors group-hover:text-signal-orange">
              {FIELDS[f].en}
            </span>
          </Link>
          <p className="mt-2 text-sm font-semibold text-bdnavy-300 tabular-nums">{plural(list.length, "item")}</p>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/80">
            Latest: {list[0].title}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * One collection, after JSTOR's collection site pages: "Part of", the
 * gold name, "About this Collection" with Show more, search within, the
 * cover; then "Explore this collection" and every item, refinable.
 */
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = findTrack((await params).id);
  if (!t) notFound();
  const c = COLLECTIONS[t.id];
  const count = inTopic(libraryArticles, t.id).length;
  const [first, ...rest] = c.about;

  return (
    <>
      <section>
        <div
          className={cn(
            COLUMN,
            "grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16 lg:py-16",
          )}
        >
          <div className="hero-rise min-w-0">
            <p className="text-sm text-white/65">
              Part of{" "}
              <Link href="/research/collections" className={LINK}>
                Genius
              </Link>
            </p>
            <h1
              className={cn(
                H1,
                "mt-3 text-4xl leading-[1.08] sm:text-5xl",
              )}
            >
              {t.title}
            </h1>
            <p className="mt-8 font-grotesk font-bold text-white">About this Collection:</p>
            <p className="mt-2 max-w-[62ch] text-lg leading-relaxed text-white/80">
              {first}
            </p>
            {rest.length > 0 && (
              <details className="group mt-3 max-w-[62ch]">
                <summary className={cn(BTN, "list-none [&::-webkit-details-marker]:hidden")}>
                  <Icon
                    name="expand_more"
                    className="text-xl transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                  />
                  <span className="group-open:hidden">Show more</span>
                  <span className="hidden group-open:inline">Show less</span>
                </summary>
                {rest.map((p) => (
                  <p
                    key={p.slice(0, 24)}
                    className="live-in mt-4 text-lg leading-relaxed text-white/80"
                  >
                    {p}
                  </p>
                ))}
              </details>
            )}
            <form
              action="/research/search"
              role="search"
              className="mt-10 max-w-md"
            >
              <input type="hidden" name="collection" value={t.id} />
              <label
                htmlFor="within-q"
                className="block font-grotesk text-sm font-bold text-signal-orange"
              >
                Search within collection
              </label>
              <span className="relative mt-2 block">
                <input
                  id="within-q"
                  name="q"
                  type="search"
                  placeholder={`Search ${plural(count, "item")}`}
                  className={cn(FIELD, "h-12 pr-12")}
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-xl text-signal-orange transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none"
                >
                  <Icon name="search" className="text-2xl" />
                </button>
              </span>
            </form>
          </div>
          <figure className="hero-rise self-start" style={{ "--d": "160ms" } as React.CSSProperties}>
            <span className="relative block aspect-3/4 w-full max-w-80 overflow-hidden rounded-3xl bg-bdnavy-900 shadow-[0_30px_60px_-30px_var(--color-bdnavy-400)] ring-1 ring-white/12">
              <Image
                src={c.cover.src}
                alt={c.cover.alt}
                fill
                priority
                sizes="320px"
                className="object-cover"
              />
            </span>
            {c.cover.credit && (
              <figcaption className="mt-3 max-w-80 text-xs text-white/65">
                {c.cover.credit.author},{" "}
                <a
                  href={c.cover.credit.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  {c.cover.credit.license}
                </a>
              </figcaption>
            )}
            <Link href="/research" aria-label="Genius home" className="mt-8 inline-block rounded-lg focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              <GeniusLogo className="h-14" />
            </Link>
          </figure>
        </div>
      </section>

      <section aria-labelledby="explore-title" className="section-band-tinted relative bg-text-primary">
        <SignalSeam className="top-0" />
        <div className={COLUMN}>
        <h2 id="explore-title" className={cn(H2, "story-reveal")}>
          Explore this collection
        </h2>
        <div className="mt-10">
          {t.id === "bd-live" ? <ThemeCards /> : t.id === "bd-solutions" ? <SolutionCards id={t.id} /> : <SubjectCards id={t.id} />}
        </div>
        </div>
      </section>

      {t.id === "bd-live" && (
        <section
          id="problems"
          aria-labelledby="problems-title"
          className={cn(COLUMN, "section-band")}
        >
          <h2 id="problems-title" className={cn(H2, "story-reveal")}>
            The 32 problems, and the research on each
          </h2>
          <p className="mt-4 max-w-[70ch] text-base leading-relaxed text-white/65">
            From Kandari-Lab&apos;s national dossier. Urgency and evidence
            status are the dossier&apos;s own ratings; a problem marked
            &quot;Awaiting research&quot; has no linked study yet.
          </p>
          <div className="story-reveal mt-8">
            <ProblemTable />
          </div>
        </section>
      )}

      <section
        aria-label="Items in this collection"
        className="section-band-tinted relative bg-bdnavy-900"
      >
        <SignalSeam className="top-0" />
        <div className={COLUMN}>
          <Results scope={t.id} view="grid" defaultSort="title" />
        </div>
      </section>
    </>
  );
}
