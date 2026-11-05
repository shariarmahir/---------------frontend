import type { Metadata } from "next";
import Link from "next/link";
import { articleHref, byline, COLUMN, H1, TITLE, TITLE_LINK, typeOf } from "@/components/research/kit";
import { libraryArticles } from "@/data/research/library";
import { shelfLetter } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Browse by Title — Genius" };

const LETTERS = ["0–9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "#"];
const anchor = (l: string) => (l === "0–9" ? "digits" : l === "#" ? "other" : l.toLowerCase());

/** JSTOR's Browse by Title: an A–Z bar, then every published work under its letter. */
export default function TitlesPage() {
  const works = libraryArticles.filter((a) => a.status === "published").sort((x, y) => x.title.localeCompare(y.title, "en"));
  const shelves = LETTERS.map((l) => ({ l, list: works.filter((a) => shelfLetter(a.title) === l) }));
  return (
    <div className={cn(COLUMN, "py-12 lg:py-16")}>
      <h1 className={cn(H1, "hero-rise")}>Browse by Title</h1>
      <nav aria-label="Jump to a letter" className="hero-rise mt-8 rounded-2xl bg-bdnavy-900 p-2 ring-1 ring-white/12">
        <ul className="flex flex-wrap gap-1">
          {shelves.map(({ l, list }) => (
            <li key={l}>
              {list.length ? (
                <a href={`#${anchor(l)}`} className="grid h-10 min-w-10 place-items-center rounded-lg px-1.5 font-grotesk text-base font-bold text-signal-orange transition-colors hover:bg-signal-orange hover:text-text-primary focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">{l}</a>
              ) : (
                <span aria-hidden className="grid h-10 min-w-10 place-items-center px-1.5 text-base text-white/30">{l}</span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-10 space-y-12">
        {shelves
          .filter((s) => s.list.length)
          .map(({ l, list }) => (
            <section key={l} id={anchor(l)} aria-labelledby={`h-${anchor(l)}`} className="story-reveal">
              <h2 id={`h-${anchor(l)}`} className={cn(TITLE, "border-b border-white/12 pb-3 text-3xl")}>{l}</h2>
              <ul className="mt-2 divide-y divide-white/12">
                {list.map((a) => (
                  <li key={a.slug} className="py-4">
                    <Link href={articleHref(a)} className={cn(TITLE_LINK, "text-lg")}>{a.title}</Link>
                    <p className="mt-1 text-sm text-white/65">{typeOf(a)} · {byline(a, 3)} · {a.year}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </div>
  );
}
