import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/media/news/paper/print-button";
import { EmptyDesk, Kicker, Thumb } from "@/components/media/news/paper/story";
import { bySection, PaperColumnStory, PaperPageHead } from "@/components/media/news/paper/story-page";
import { DateText, Num } from "@/components/media/ui/numerals";
import { sourceName } from "@/data/media/news-sources";
import { newsDay } from "@/lib/media/news";
import { loadPaper } from "@/lib/media/news-paper";
import { newsHref } from "@/lib/media/news-sections";

export const metadata: Metadata = { title: "ই-পেপার — নাগরিক জীবন" };

/** A section's share of the printed page; the rest stays on the site. */
const PER_SECTION = 8;
/** Below this many stories today (just after dawn), the sheet takes in the last day and a half. */
const MIN_TODAY = 12;

/*
 * Print: only the sheet goes to paper, black on white. Everything around it
 * (the platform's bars, the masthead, the section menu) is hidden, and the
 * sheet's own colours give way to ink.
 */
const PRINT_CSS = `
@media print {
  @page { margin: 12mm; }
  html, body, .np, .media-shell, main { background: #fff !important; }
  body * { visibility: hidden !important; }
  #np-epaper, #np-epaper * { visibility: visible !important; }
  #np-epaper { position: absolute; inset: 0 0 auto 0; margin: 0; max-width: none; }
  #np-epaper, #np-epaper * { color: #000 !important; border-color: rgb(0 0 0 / 0.35) !important; box-shadow: none !important; }
  #np-epaper .np-cols { column-rule-color: rgb(0 0 0 / 0.25) !important; }
}`;

/**
 * ই-পেপার: today's paper as one printed page. A rule-framed broadsheet on
 * the black ground, the nameplate and date at the top, the lead story
 * across, then the stories in narrow newspaper columns, section by
 * section. Headlines open the story's page; "ছাপুন" prints the sheet.
 */
export default async function EpaperPage() {
  const now = new Date();
  const paper = await loadPaper(now);
  const today = newsDay(now);
  const todays = paper.items.filter((n) => newsDay(new Date(n.at)) === today);
  const pool = paper.sample || todays.length < MIN_TODAY ? paper.items : todays;
  // The lead: the newest story with a photo, else the newest.
  const lead = pool.find((n) => n.image) ?? pool[0];
  const groups = bySection(pool.filter((n) => n !== lead)).map(([s, list]) => [s, list.slice(0, PER_SECTION)] as const);
  const count = (lead ? 1 : 0) + groups.reduce((sum, [, list]) => sum + list.length, 0);

  return (
    <div className="mx-auto max-w-[72rem] space-y-8">
      <style href="np-epaper-print" precedence="default">
        {PRINT_CSS}
      </style>

      <div className="print:hidden">
        <PaperPageHead title="ই-পেপার" aside={<PrintButton />}>
          আজকের কাগজ, ছাপা পাতার মতো করে: প্রধান খবর ওপরে, বাকিগুলো বিভাগ ধরে কলামে। শিরোনামে চাপ দিলে খবরের পাতা খোলে।
        </PaperPageHead>
      </div>

      {!lead ? (
        <EmptyDesk title="আজকের কাগজ এখনো তৈরি হয়নি">সংবাদপত্রগুলো খবর দিলেই এখানে পাতা সাজানো হবে। একটু পরে আবার দেখুন।</EmptyDesk>
      ) : (
        <article id="np-epaper" aria-label="আজকের ই-পেপার" className="border border-white/25 p-4 sm:p-8 lg:p-10 print:border-0 print:p-0">
          {/* Nameplate: the paper's name between rules, the date line under it. */}
          <header className="text-center">
            <p className="font-grotesk text-5xl leading-none font-extrabold tracking-tight text-signal-orange sm:text-7xl lg:text-8xl">নাগরিক জীবন</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-y-2 border-white/25 py-2.5 text-xs font-semibold text-white/70 sm:justify-between sm:text-sm">
              <DateText iso={today} weekday />
              <span>দেশ-বিদেশের খবরের সারাংশ · ই-পেপার</span>
              <span>
                <Num value={count} />টি খবর
              </span>
            </div>
          </header>

          {/* The lead, across the page. */}
          <section aria-label="প্রধান খবর" className="grid grid-cols-1 gap-6 border-b border-white/25 py-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
            <div className="min-w-0">
              <Link href={newsHref.story(lead.id)} className="group block rounded-sm focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:outline-none">
                <h2 lang={lead.lang} className="font-grotesk text-3xl leading-[1.2] font-extrabold tracking-[-0.015em] text-balance text-white transition-colors group-hover:text-signal-orange sm:text-[2.75rem] sm:leading-[1.15]">
                  {lead.title}
                </h2>
              </Link>
              {lead.summary ? (
                <p lang={lead.lang} className="mt-4 text-[17px] leading-relaxed text-white/80">
                  {lead.summary}
                </p>
              ) : null}
              <Kicker item={lead} source className="mt-3" />
            </div>
            {lead.image ? (
              <figure className="min-w-0">
                <Thumb item={lead} ratio="aspect-[4/3]" sizes="(min-width: 1024px) 420px, 100vw" priority />
                <figcaption className="mt-2 text-xs font-semibold text-white/55">ছবি: {sourceName(lead.source)}</figcaption>
              </figure>
            ) : null}
          </section>

          {/* The rest, in newspaper columns, section by section. */}
          <div className="np-cols mt-7 columns-1 gap-8 [column-rule:1px_solid_rgb(255_255_255/0.12)] sm:columns-2 lg:columns-4">
            {groups.map(([section, list]) => (
              <section key={section.slug} aria-labelledby={`ep-${section.slug}`} className="mb-4 [&>h2+article]:border-t-0 [&>h2+article]:pt-0">
                <h2 id={`ep-${section.slug}`} className="break-after-avoid border-t-2 border-signal-orange pt-2 pb-3 font-grotesk text-xl font-extrabold text-signal-orange">
                  {section.bn}
                </h2>
                {list.map((n) => (
                  <PaperColumnStory key={n.id} item={n} />
                ))}
              </section>
            ))}
          </div>

          <p className="mt-6 border-t border-white/25 pt-4 text-xs leading-relaxed text-white/55">
            শিরোনাম আর সারাংশ সংবাদপত্রগুলোর নিজস্ব আরএসএস ফিড থেকে নেওয়া; পুরো খবর, ছবি আর স্বত্ব তাদেরই।
          </p>
        </article>
      )}
    </div>
  );
}
