import type { Metadata } from "next";
import { EmptyDesk, SectionHead, StoryRow } from "@/components/media/news/paper/story";
import { bySection, EditionSwitcher, PaperPageHead, SectionChips, type EditionTab } from "@/components/media/news/paper/story-page";
import { DateText, Num } from "@/components/media/ui/numerals";
import { EDITION_ORDER, EDITIONS, editionAt, inEdition, newsDay, type Edition } from "@/lib/media/news";
import { loadPaper } from "@/lib/media/news-paper";
import { newsHref } from "@/lib/media/news-sections";

export const metadata: Metadata = { title: "আজকের খবর — নাগরিক জীবন" };

const isEdition = (v?: string): v is Edition => v === "morning" || v === "noon" || v === "evening" || v === "night";

/**
 * আজকের খবর: the day in four editions (সকাল, দুপুর, সন্ধ্যা, রাত), as the
 * old নাগরিক জীবন page had them. `?e=` picks the edition, `?d=y`
 * yesterday's; editions still to come can't be opened. The edition's
 * stories are filed by the paper's sections, each story once.
 */
export default async function TodayPage({ searchParams }: { searchParams: Promise<{ e?: string; d?: string }> }) {
  const { e, d } = await searchParams;
  const now = new Date();
  const paper = await loadPaper(now);
  const yesterday = d === "y";
  const day = yesterday ? newsDay(new Date(now.getTime() - 24 * 3_600_000)) : newsDay(now);
  const current = editionAt(now);
  const reached = (ed: Edition) => yesterday || EDITION_ORDER.indexOf(ed) <= EDITION_ORDER.indexOf(current);
  const edition: Edition = isEdition(e) && reached(e) ? e : yesterday ? "night" : current;

  const href = (q: { e?: Edition; d?: boolean }) => {
    const p = new URLSearchParams();
    if (q.d) p.set("d", "y");
    if (q.e) p.set("e", q.e);
    const s = p.toString();
    return s ? `${newsHref.today}?${s}` : newsHref.today;
  };

  // With sample stories (no feed reachable) the editions mean nothing: show them all.
  const stories = paper.sample ? paper.items : inEdition(paper.items, day, edition);
  const groups = bySection(stories);
  const tabs: EditionTab[] = EDITION_ORDER.map((ed) => ({
    edition: ed,
    href: reached(ed) ? href({ e: ed, d: yesterday }) : undefined,
    count: paper.sample ? 0 : inEdition(paper.items, day, ed).length,
    on: ed === edition,
    now: !yesterday && ed === current,
  }));
  const days = [
    { label: "আজ", href: href({}), on: !yesterday },
    { label: "গতকাল", href: href({ d: true, e: "night" }), on: yesterday },
  ];
  const counts = Object.fromEntries(groups.map(([s, list]) => [s.slug, list.length]));

  return (
    <div className="mx-auto max-w-[84rem] space-y-10">
      <PaperPageHead
        title="আজকের খবর"
        aside={
          <p className="text-sm font-semibold text-white/70">
            <DateText iso={day} weekday />
            {" · "}
            {yesterday ? "গতকালের " : ""}
            {EDITIONS[edition].bn} · <Num value={stories.length} />টি খবর
          </p>
        }
      >
        দিনের খবর চার বেলায়: সকাল, দুপুর, সন্ধ্যা আর রাত। বেলা বেছে নিন, খবরগুলো সাজানো আছে বিভাগ ধরে।
      </PaperPageHead>

      {paper.sample ? null : <EditionSwitcher tabs={tabs} days={days} />}

      {groups.length === 0 ? (
        <EmptyDesk title="এই বেলায় এখনো খবর আসেনি">সংবাদপত্রগুলো নতুন খবর দিলেই এখানে উঠবে। আগের বেলার খবর দেখতে ওপরের বেলাগুলো থেকে বেছে নিন।</EmptyDesk>
      ) : (
        <>
          <nav aria-label="এই বেলার বিভাগ">
            <SectionChips sections={groups.map(([s]) => s)} counts={counts} href={(s) => `#desk-${s.slug}`} />
          </nav>
          {groups.map(([section, list]) => (
            <section key={section.slug} id={`desk-${section.slug}`} aria-labelledby={`desk-${section.slug}-title`} className="scroll-mt-36">
              <SectionHead id={`desk-${section.slug}-title`} title={section.bn} href={newsHref.section(section.slug)} more={`সব ${section.bn}`} />
              <ul className="mt-4 grid grid-cols-1 gap-x-10 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((n) => (
                  <li key={n.id} className="border-t border-white/10 py-4">
                    <StoryRow item={n} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
