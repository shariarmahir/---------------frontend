import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { BTN, BTN_SOLID, COLUMN, CONTENT_TYPES, FIELD, H1, LINK, PANEL, PANEL_INK } from "@/components/research/kit";
import { FIELDS, type FieldId } from "@/lib/research/core";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Advanced Search — Genius" };

const FIELD_ROWS = [
  { name: "q", label: "All fields", hint: "Words anywhere: title, abstract, text, keywords, people and places" },
  { name: "title", label: "Title", hint: "Words in the title" },
  { name: "author", label: "Author", hint: "An author's name" },
  { name: "institution", label: "Institution", hint: "A university, school or lab" },
  { name: "keyword", label: "Keyword", hint: "A keyword the authors chose" },
];

const INPUT = cn(FIELD, "h-12");
const LEGEND = "px-2 font-grotesk text-base font-bold text-signal-orange";
const FIELD_LABEL = "text-sm font-semibold text-white";
const YEARS = Array.from({ length: new Date().getFullYear() - 1971 + 1 }, (_, i) => new Date().getFullYear() - i);

/** JSTOR's Advanced Search: field-by-field terms and limits, sent to /research/search. */
export default function AdvancedSearchPage() {
  return (
    <div className={cn(COLUMN, "py-12 lg:py-16")}>
      <h1 className={cn(H1, "hero-rise")}>Advanced Search</h1>
      <p className="hero-rise mt-4 max-w-2xl text-lg leading-relaxed text-white/80">Fill in any of the fields; a work must match all of them. Leave a field empty to ignore it.</p>
      <form action="/research/search" className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
        <fieldset className={cn(PANEL, "story-reveal p-6 sm:p-8")}>
          <legend className={cn(LEGEND, "sr-only")}>Search terms</legend>
          <p aria-hidden className="mb-6 font-grotesk text-xl font-bold text-signal-orange">Search terms</p>
          <div className="space-y-5">
            {FIELD_ROWS.map((f) => (
              <div key={f.name} className="grid gap-1.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center sm:gap-4">
                <label htmlFor={`adv-${f.name}`} className={FIELD_LABEL}>{f.label}</label>
                <div>
                  <input id={`adv-${f.name}`} name={f.name} type="text" className={INPUT} aria-describedby={`adv-${f.name}-hint`} />
                  <p id={`adv-${f.name}-hint`} className="mt-1.5 text-xs text-white/65">{f.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset className={cn(PANEL_INK, "story-reveal space-y-5 self-start p-6 sm:p-8")}>
          <legend className={cn(LEGEND, "sr-only")}>Narrow by</legend>
          <p aria-hidden className="font-grotesk text-xl font-bold text-signal-orange">Narrow by</p>
          <div>
            <label htmlFor="adv-type" className={FIELD_LABEL}>Content type</label>
            <select id="adv-type" name="type" className={cn(INPUT, "mt-1.5")}>
              {CONTENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="adv-field" className={FIELD_LABEL}>Subject</label>
            <select id="adv-field" name="field" className={cn(INPUT, "mt-1.5")}>
              <option value="">All subjects</option>
              {(Object.keys(FIELDS) as FieldId[]).map((f) => <option key={f} value={f}>{FIELDS[f].en}</option>)}
            </select>
          </div>
          <div>
            <p className={FIELD_LABEL}>Publication year</p>
            <div className="mt-1.5 flex items-center gap-2">
              <label htmlFor="adv-from" className="sr-only">From year</label>
              <select id="adv-from" name="from" className={cn(INPUT, "min-w-0 px-3")}>
                <option value="">From</option>
                {[...YEARS].reverse().map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span aria-hidden className="text-white/65">–</span>
              <label htmlFor="adv-to" className="sr-only">To year</label>
              <select id="adv-to" name="to" className={cn(INPUT, "min-w-0 px-3")}>
                <option value="">To</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
          <button type="submit" className={BTN_SOLID}><Icon name="search" className="text-xl" /> Search</button>
          <button type="reset" className={BTN}>Clear</button>
          <Link href="/research/subjects" className={cn(LINK, "ml-2 text-sm font-semibold")}>Or browse by subject</Link>
        </div>
      </form>
    </div>
  );
}
