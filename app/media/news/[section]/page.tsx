import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyDesk, SectionHead } from "@/components/media/news/paper/story";
import {
  BLOCK_SIZE, PageTitle, photoFirst, StoryOverlay, SubBand, SubBlock, takeFresh, TileGrid, TileRow, type BlockKind,
} from "@/components/media/news/paper/section-blocks";
import { headlines, type NewsItem } from "@/lib/media/news";
import { loadPaper } from "@/lib/media/news-paper";
import { findSection, storiesIn, subsWithStories, type NewsSub } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";

type Params = Promise<{ section: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const section = findSection((await params).section);
  return section ? { title: `${section.bn} — নাগরিক জীবন`, description: `নাগরিক জীবনের ${section.bn} বিভাগ: দেশের সংবাদপত্রগুলোর আজকের খবরের শিরোনাম আর সারাংশ।` } : {};
}

/** The block layouts take turns, so the page has a rhythm (after The Daily Star's /news). */
const TURNS: BlockKind[] = ["focus", "row", "columns"];
/** Sub-sections with at least this many fresh stories get a block of their own; the rest share the closing band. */
const BLOCK_MIN = 4;
const MAX_BLOCKS = 5;

/**
 * A section of নাগরিক জীবন (/media/news/[section]): its name, a lead pair
 * and a strip of five, then a block per sub-section that has stories, and
 * the quieter sub-sections side by side at the foot. No story twice.
 */
export default async function SectionPage({ params }: { params: Params }) {
  const section = findSection((await params).section);
  if (!section) notFound();

  const { items } = await loadPaper();
  const pool = storiesIn(items, section);

  if (pool.length === 0) {
    const others = headlines(items, 8);
    return (
      <div>
        <PageTitle>{section.bn}</PageTitle>
        <div className="mt-8">
          <EmptyDesk title={`${section.bn} বিভাগে এখন কোনো খবর নেই`}>
            সংবাদপত্রগুলো এই বিভাগের খবর দিলেই এখানে উঠবে — ফিড প্রতি ১৫ মিনিটে হালনাগাদ হয়। ততক্ষণ নিচে এখনকার অন্য খবর দেখুন।
          </EmptyDesk>
        </div>
        {others.length > 0 ? (
          <section aria-labelledby="others-title" className="mt-14">
            <SectionHead id="others-title" title="এখনকার অন্য খবর" className="mb-6" />
            <TileGrid items={others} />
          </section>
        ) : null}
      </div>
    );
  }

  const used = new Set<string>();
  const lead = takeFresh(photoFirst(pool), used, 2);
  const strip = takeFresh(photoFirst(pool), used, 5);

  const blocks: { sub: NewsSub; items: NewsItem[]; kind: BlockKind }[] = [];
  const band: [NewsSub, NewsItem[]][] = [];
  for (const [sub, list] of subsWithStories(items, section)) {
    const fresh = list.filter((n) => !used.has(n.id));
    if (fresh.length === 0) continue;
    if (fresh.length >= BLOCK_MIN && blocks.length < MAX_BLOCKS) {
      let kind = TURNS[blocks.length % TURNS.length];
      if (fresh.length < BLOCK_SIZE[kind]) kind = fresh.length >= BLOCK_SIZE.focus ? "focus" : "row";
      blocks.push({ sub, kind, items: takeFresh(photoFirst(fresh), used, BLOCK_SIZE[kind]) });
    } else {
      band.push([sub, takeFresh(photoFirst(fresh), used, 4)]);
    }
  }
  const leftover = pool.filter((n) => !used.has(n.id)).slice(0, 8);

  return (
    <div>
      <PageTitle>{section.bn}</PageTitle>

      {/* The lead pair and the strip of five under it. */}
      <section aria-label={`${section.bn}: প্রধান খবর`} className="mt-8">
        <div className={cn("grid grid-cols-1 gap-8 md:gap-6", lead.length > 1 && "md:grid-cols-2")}>
          {lead.map((n, i) => (
            <StoryOverlay key={n.id} item={n} priority={i === 0} />
          ))}
        </div>
        {strip.length > 0 ? (
          <div className="mt-8 border-t border-white/12 pt-6">
            <TileRow items={strip} cols={5} tablet="carousel" />
          </div>
        ) : null}
      </section>

      {blocks.map((b) => (
        <SubBlock key={b.sub.slug} section={section} sub={b.sub} items={b.items} kind={b.kind} />
      ))}

      <SubBand section={section} entries={band} />

      {leftover.length > 0 ? (
        <section aria-labelledby="leftover-title" className="mt-14 lg:mt-16">
          <SectionHead id="leftover-title" title={`${section.bn} বিভাগের আরও খবর`} className="mb-6" />
          <TileGrid items={leftover} />
        </section>
      ) : null}
    </div>
  );
}
