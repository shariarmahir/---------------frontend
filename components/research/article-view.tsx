"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { sourcePoints } from "@/data/amar-bangladesh";
import { FIELDS, LEVELS, POINTS, reactionTotal, readMinutes, related, SCOPES, type Article } from "@/lib/research/core";
import { docPages } from "@/lib/research/pages";
import { useLibrary, useScores } from "@/lib/research/store";
import { problemCode, TRACKS } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";
import { CiteButton, DownloadButton, Reactions, SaveButton, ShareButton } from "./actions";
import { Discussion } from "./discussion";
import { ARROW, articleHref, byline, collectionHref, contentHref, Cover, fmtDate, fmtNum, H1, ICON_BTN, LINK, OpenAccess, PANEL_COBALT, PANEL_INK, plural, searchHref, StatusTags, subjectHref, TITLE_LINK, TypeLabel, typeOf } from "./kit";
import { openSeq, Viewer } from "./viewer";

const noop = () => () => {};
/** The site's origin, read in the browser; empty while rendering on the server. */
const useOrigin = () => useSyncExternalStore(noop, () => window.location.origin, () => "");

/** A small gold heading inside a fold. */
const SUB = "font-grotesk text-sm font-bold text-signal-orange";

/** A JSTOR-style fold: a gold chevron row with a hairline under it. */
function Fold({ title, open, children }: { title: React.ReactNode; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-b border-white/12">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-lg py-3 font-grotesk text-lg font-bold text-white transition-colors select-none hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <Icon name="chevron_right" className="text-2xl text-signal-orange transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-90 motion-reduce:transition-none" />
        {title}
      </summary>
      <div className="live-in pb-6 pl-9">{children}</div>
    </details>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-2 text-sm">
      <dt className="font-semibold text-white/65">{label}</dt>
      <dd className="text-white/80">{children}</dd>
    </div>
  );
}

/**
 * The work's own photographs as a grid of thumbnails; one opens large in a
 * dialog with its caption, and the arrows (or the arrow keys) step through.
 */
function Gallery({ images }: { images: NonNullable<Article["gallery"]> }) {
  const box = useRef<HTMLDialogElement>(null);
  const [at, setAt] = useState(0);
  const titleId = useId();
  const show = (n: number) => {
    setAt(n);
    box.current?.showModal();
  };
  const step = (d: 1 | -1) => setAt((n) => (n + d + images.length) % images.length);
  const img = images[at];
  return (
    <>
      <ul className="grid grid-cols-3 gap-2">
        {images.map((g, n) => (
          <li key={n}>
            <button type="button" onClick={() => show(n)} aria-label={`Open image ${n + 1}: ${g.caption}`} className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-bdnavy-900 ring-1 ring-white/12 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              <Image src={g.src} alt="" fill sizes="9rem" className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transition-none" />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={box}
        aria-labelledby={titleId}
        onClick={(e) => e.target === e.currentTarget && box.current?.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="live-in m-auto w-[min(64rem,calc(100vw-2rem))] rounded-3xl bg-bdnavy-900 p-0 text-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/12 backdrop:bg-black/85"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/12 px-5 py-3">
          <p id={titleId} className="font-grotesk text-sm font-bold text-signal-orange tabular-nums">Image {at + 1} of {images.length}</p>
          <button type="button" onClick={() => box.current?.close()} aria-label="Close" className={ICON_BTN}>
            <Icon name="close" className="text-2xl" />
          </button>
        </div>
        {img && (
          <figure className="p-4 sm:p-5">
            <span className="relative block aspect-4/3 overflow-hidden rounded-2xl bg-black sm:aspect-video">
              <Image src={img.src} alt={img.caption} fill sizes="64rem" className="object-contain" />
            </span>
            <figcaption className="mt-4 flex items-start justify-between gap-4">
              <span className="text-sm leading-relaxed text-white/80">{img.caption}</span>
              {images.length > 1 && (
                <span className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => step(-1)} aria-label="Previous image" className={ARROW}><Icon name="arrow_back" className="text-2xl" /></button>
                  <button type="button" onClick={() => step(1)} aria-label="Next image" className={ARROW}><Icon name="arrow_forward" className="text-2xl" /></button>
                </span>
              )}
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}

const PER_PAGE = 3;

/** JSTOR's "Related text": three at a time with a pager. */
function RelatedList({ list }: { list: Article[] }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const shown = list.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  if (list.length === 0) return <p className="text-sm text-white/65">No related works yet.</p>;
  return (
    <>
      <ol className="space-y-7">
        {shown.map((r) => (
          <li key={r.slug} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4">
            <Link href={articleHref(r)} tabIndex={-1} aria-hidden className="block">
              <Cover a={r} mini sizes="88px" className="aspect-2/3 w-22" />
            </Link>
            <div className="min-w-0">
              <TypeLabel a={r} />
              <Link href={articleHref(r)} className={cn(TITLE_LINK, "mt-1 block text-base leading-snug")}>{r.title}</Link>
              <p className="mt-2 text-sm text-white/80">{byline(r, 3)}</p>
              <p className="text-sm text-white/65">From: <Link href={contentHref(r)} className={LINK}>{r.institution.split(",")[0]}</Link> ({r.year})</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <DownloadButton a={r} look="row" />
                <SaveButton a={r} look="row" />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-end gap-3 text-sm font-semibold text-white">
          {page > 0 && <button type="button" onClick={() => setPage(page - 1)} className="inline-flex items-center gap-1 rounded-md transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"><Icon name="arrow_back" className="text-xl text-signal-orange" /> Previous</button>}
          <span className="text-white/65 tabular-nums">{page + 1} of {pages}</span>
          {page < pages - 1 && <button type="button" onClick={() => setPage(page + 1)} className="inline-flex items-center gap-1 rounded-md transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">Next <Icon name="arrow_forward" className="text-xl text-signal-orange" /></button>}
        </div>
      )}
    </>
  );
}

/** Reader activity, with what each signal earns the researcher: flat data tiles, a hairline ring each. */
function Activity({ a }: { a: Article }) {
  const { engagement, points } = useScores();
  const e = engagement(a);
  const rows = [
    { label: "Reactions", value: reactionTotal(e), each: POINTS.reaction },
    { label: "Comments", value: e.comments, each: POINTS.comment },
    { label: "Shares", value: e.shares, each: POINTS.share },
    { label: "Citations", value: e.cites, each: POINTS.cite },
  ];
  return (
    <div className="mt-5">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/12 ring-inset">
            <dt className="text-xs font-semibold text-bdnavy-300">{r.label}</dt>
            <dd className="font-grotesk text-xl font-bold text-white tabular-nums">{fmtNum(r.value)} <span className="font-sans text-xs font-normal text-white/65">+{r.each} each</span></dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-white/80">
        Research score: <strong className="font-grotesk text-signal-orange tabular-nums">{plural(points(a), "point")}</strong>
        {a.sample && <span className="text-white/65"> (sample numbers)</span>}
      </p>
      <a href="#discussion" className={cn(LINK, "mt-2 inline-flex items-center gap-1.5 text-sm font-semibold")}><Icon name="forum" className="text-lg" /> Read or write a comment</a>
    </div>
  );
}

/**
 * A work's stable page, after JSTOR's: type, title and source
 * line, the stable URL, Cite / Save / Share / Download; on the left the
 * folds (About, Table of contents, Reactions, Related text, Terms), on the
 * right the content viewer; comments underneath on an ink panel.
 */
export function ArticleView({ a }: { a: Article }) {
  const list = useLibrary();
  const origin = useOrigin();
  const pages = docPages(a);
  const stable = `${origin}/research/${a.slug}`;
  const problems = (a.problems ?? []).map((n) => sourcePoints.find((p) => p.n === n)).filter((p) => p !== undefined);
  const collections = TRACKS.filter((t) => t.has(a));
  const near = related(list, a, 6);

  const copyStable = () => {
    navigator.clipboard?.writeText(stable).then(
      () => toast.success("Stable URL copied"),
      () => toast.error("Could not copy"),
    );
  };

  return (
    <div className="mx-auto w-full max-w-384 px-gutter-x pt-10 pb-20">
      {a.status === "review" && (
        <p className={cn(PANEL_COBALT, "flex items-start gap-3 px-5 py-4 text-sm text-white/80")}>
          <Icon name="hourglass_top" className="mt-0.5 text-xl text-signal-orange" /> In review. Only you can see this work until the reviewers publish it.
        </p>
      )}

      {/* Its own layer, above the sticky viewer below, so the Share and Download menus open over it. */}
      <header className="hero-rise relative z-20 mt-6 first:mt-0">
        <TypeLabel a={a} className="text-sm" />
        <h1 className={cn(H1, "mt-2 max-w-240")}>{a.title}</h1>
        <p className="mt-4 text-base text-white/80">
          <Link href={contentHref(a)} className={cn(LINK, "italic")}>{a.institution}</Link>, {a.year}, {plural(a.sections.length, "section")} ({readMinutes(a)} min read)
        </p>
        <p className="mt-1 text-sm text-white/65">{byline(a, 6)}</p>
        <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 space-y-2.5">
            <p className="flex min-w-0 flex-wrap items-center gap-x-2 text-sm text-white/80">
              <span className="font-semibold text-white">Stable URL:</span>
              <Link href={articleHref(a)} className={cn(LINK, "min-w-0 break-all")}>{origin ? stable : `/research/${a.slug}`}</Link>
              <button type="button" onClick={copyStable} aria-label="Copy stable URL" title="Copy stable URL" className={cn(ICON_BTN, "size-9")}>
                <Icon name="content_copy" className="text-lg" />
              </button>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <OpenAccess />
              <StatusTags a={a} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <CiteButton a={a} />
            <SaveButton a={a} />
            <ShareButton a={a} />
            <DownloadButton a={a} />
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 border-t border-white/12">
          <Fold title={`About this ${typeOf(a).toLowerCase()}`}>
            {a.image && (
              <figure className="mb-5">
                <span className="relative block aspect-video overflow-hidden rounded-2xl bg-bdnavy-900 ring-1 ring-white/12">
                  <Image src={a.image.src} alt={a.image.caption} fill sizes="(min-width: 1024px) 26rem, 90vw" className="object-cover" />
                </span>
                <figcaption className="mt-2 text-xs leading-relaxed text-white/65">{a.image.caption}{a.image.credit ? `. ${a.image.credit}` : ""}</figcaption>
              </figure>
            )}
            <h3 className={SUB}>Abstract</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/80">{a.summary.replace(/\[\d+\]/g, "")}</p>
            {a.dyk && (
              <div className={cn(PANEL_INK, "mt-5 rounded-2xl px-4 py-3")}>
                <p className={cn(SUB, "flex items-center gap-1.5")}><Icon name="lightbulb" className="text-lg" /> Did you know</p>
                <p className="mt-1 text-sm leading-relaxed text-white/80">{a.dyk}</p>
              </div>
            )}
            <dl className="mt-4 divide-y divide-white/12">
              <Row label={a.authors.length > 1 ? "Authors" : "Author"}>{a.authors.map((x) => `${x.nameEn ?? x.name}${x.affiliation ? ` (${x.affiliation})` : ""}`).join("; ")}</Row>
              <Row label="Institution">{a.institution}</Row>
              {a.supervisor && <Row label="Supervisor">{a.supervisor}</Row>}
              <Row label="Published">{fmtDate(a.published)}</Row>
              <Row label="Subject"><Link href={subjectHref(a.field)} className={LINK}>{FIELDS[a.field].en}</Link></Row>
              <Row label="Level">{LEVELS[a.level]}</Row>
              <Row label="Scope">{SCOPES[a.scope ?? "bangladesh"]}</Row>
              {a.district && <Row label="District"><Link href={searchHref({ q: a.district })} className={LINK}>{a.district}</Link></Row>}
              {a.facts?.map((f) => <Row key={f.label} label={f.label}>{f.value}</Row>)}
              {a.keywords.length > 0 && (
                <Row label="Keywords">
                  {a.keywords.map((k, i) => (
                    <span key={k}>
                      {i > 0 && "; "}
                      <Link href={searchHref({ q: k })} className={LINK}>{k}</Link>
                    </span>
                  ))}
                </Row>
              )}
            </dl>
            {problems.length > 0 && (
              <>
                <h3 className={cn(SUB, "mt-6")}>National problems addressed</h3>
                <ul className="mt-2 space-y-1.5">
                  {problems.map((p) => (
                    <li key={p.n} className="text-sm">
                      <Link href={`${collectionHref("bd-live")}#problems`} className={LINK}><span className="font-semibold tabular-nums">{problemCode(p.n)}</span> {p.topic}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {collections.length > 0 && (
              <>
                <h3 className={cn(SUB, "mt-6")}>Part of these collections</h3>
                <ul className="mt-2 space-y-1.5">
                  {collections.map((t) => (
                    <li key={t.id}><Link href={collectionHref(t.id)} className={cn(LINK, "text-sm")}>{t.title}</Link></li>
                  ))}
                </ul>
              </>
            )}
          </Fold>

          {a.gallery && a.gallery.length > 0 && (
            <Fold title={`Project images (${a.gallery.length})`} open>
              <Gallery images={a.gallery} />
            </Fold>
          )}

          <Fold title="Table of contents">
            <ol className="space-y-0.5">
              {pages.map((p) => (
                <li key={p.n}>
                  <button type="button" onClick={() => openSeq(p.n)} className="flex w-full items-baseline gap-3 rounded-lg py-1.5 text-left text-sm text-white/80 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                    <span className="w-6 shrink-0 text-right font-semibold text-bdnavy-300 tabular-nums">{p.n}</span>
                    <span>{p.kind === "title" ? "Title page and abstract" : p.title}</span>
                  </button>
                </li>
              ))}
            </ol>
            <Link href={contentHref(a)} className={cn(LINK, "mt-4 inline-block text-sm font-semibold")}>Contents with excerpts</Link>
          </Fold>

          <Fold title="Reactions and activity" open>
            <Reactions a={a} />
            <Activity a={a} />
          </Fold>

          <Fold title="Related text" open>
            <RelatedList list={near} />
          </Fold>

          <Fold title="Terms and copyright">
            <p className="text-sm leading-relaxed text-white/80"><span className="font-semibold text-white">This item is part of Genius,</span> Bangladesh&apos;s open research library. It is free to read, download and cite with a link to this page.</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">Copyright stays with the authors. {a.sample ? "This is a sample entry: its people, institution and figures are illustrative." : "Reuse beyond citation needs the authors' permission."}</p>
          </Fold>
        </div>

        <div className="min-w-0 lg:sticky lg:top-[calc(var(--research-top)+1rem)]">
          <Viewer a={a} />
        </div>
      </div>

      <div className={cn(PANEL_INK, "story-reveal mt-14 max-w-4xl p-5 sm:p-8")}>
        <Discussion a={a} />
      </div>
    </div>
  );
}
