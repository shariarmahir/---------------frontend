import type { Metadata } from "next";
import Link from "next/link";
import { articleHref, COLUMN, H1, LIFT, PANEL, plural, TITLE_LINK, typeOf } from "@/components/research/kit";
import { libraryArticles } from "@/data/research/library";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Institutions — Genius" };

const nameOf = (institution: string) => institution.split(",")[0].trim();

/** JSTOR's Publishers list, as the universities, schools and labs behind the work. */
export default function InstitutionsPage() {
  const works = libraryArticles.filter((a) => a.status === "published");
  const names = [...new Set(works.map((a) => nameOf(a.institution)))].sort((x, y) => x.localeCompare(y, "en"));
  return (
    <div className={cn(COLUMN, "py-12 lg:py-16")}>
      <h1 className={cn(H1, "hero-rise")}>Institutions</h1>
      <p className="hero-rise mt-4 max-w-[62ch] text-lg leading-relaxed text-white/80">The universities, schools and labs behind the work in Genius. Sample entries describe their institution rather than naming it.</p>
      <ul className="mt-12 grid gap-5 md:grid-cols-2">
        {names.map((name) => {
          const list = works.filter((a) => nameOf(a.institution) === name);
          return (
            <li key={name} className={cn(PANEL, LIFT, "story-reveal p-6")}>
              <h2 className="font-grotesk text-lg font-bold text-signal-orange">{name} <span className="font-sans text-sm font-normal text-white/65">({plural(list.length, "item")})</span></h2>
              <ul className="mt-3 space-y-2">
                {list.map((a) => (
                  <li key={a.slug} className="text-sm">
                    <Link href={articleHref(a)} className={cn(TITLE_LINK, "font-sans font-semibold")}>{a.title}</Link> <span className="text-white/65">· {typeOf(a)}, {a.year}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
