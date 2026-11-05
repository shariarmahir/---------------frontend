import type { Metadata } from "next";
import Link from "next/link";
import { COLUMN, H1, H2, PANEL, subjectHref } from "@/components/research/kit";
import { Icon } from "@/components/ui/icon";
import { libraryArticles } from "@/data/research/library";
import { FIELDS } from "@/lib/research/core";
import { inTopic, SUBJECT_GROUPS } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Browse by Subject — Genius" };

/** JSTOR's Browse by Subject: a gold heading per discipline group, its subjects in three columns. */
export default function SubjectsPage() {
  return (
    <div className={cn(COLUMN, "py-12 lg:py-16")}>
      <h1 className={cn(H1, "hero-rise")}>Browse by Subject</h1>
      <div className="mt-12 space-y-14">
        {SUBJECT_GROUPS.map((g) => (
          <section key={g.title} aria-labelledby={`group-${g.fields[0]}`} className="story-reveal">
            <h2 id={`group-${g.fields[0]}`} className={cn(H2, "text-2xl sm:text-2xl")}>{g.title}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.fields.map((f) => (
                <li key={f}>
                  <Link href={subjectHref(f)} className={cn(PANEL, "group flex min-h-16 items-center gap-3 rounded-2xl px-4 py-3 transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_22px_40px_-22px_var(--color-bdnavy-400)] focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0")}>
                    <Icon name={FIELDS[f].icon} className="text-2xl text-signal-orange" />
                    <span className="min-w-0 flex-1 font-semibold text-white transition-colors group-hover:text-signal-orange">{FIELDS[f].en}</span>
                    <span className="text-sm text-white/65 tabular-nums">{inTopic(libraryArticles, f).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
