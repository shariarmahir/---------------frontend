import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EmptyDesk, LeadStory, SectionHead, StoryList, StoryText, StoryTile } from "@/components/media/news/paper/story";
import { Breadcrumb, PageTitle, photoFirst, Rail, TileGrid } from "@/components/media/news/paper/section-blocks";
import { Num } from "@/components/media/ui/numerals";
import { btn } from "@/components/ui/section-kit";
import { headlines } from "@/lib/media/news";
import { loadPaper } from "@/lib/media/news-paper";
import { findSection, findSub, inSub, newsHref, storiesIn } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";

type Params = Promise<{ section: string; sub: string }>;

/** Stories on one page of a sub-section; the rest wait behind "আরও দেখুন". */
const PER_PAGE = 24;
const RAIL = 8;

async function place(params: Params) {
  const { section: s, sub: u } = await params;
  const section = findSection(s);
  const sub = section ? findSub(section, u) : undefined;
  return section && sub ? { section, sub } : undefined;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const at = await place(params);
  return at ? { title: `${at.sub.bn} · ${at.section.bn} — নাগরিক জীবন`, description: `নাগরিক জীবনের ${at.section.bn} বিভাগে ${at.sub.bn}: দেশের সংবাদপত্রগুলোর খবরের শিরোনাম আর সারাংশ।` } : {};
}

/**
 * One sub-section of নাগরিক জীবন (/media/news/[section]/[sub]): the
 * breadcrumb and its name, a lead story, a grid of tiles with summaries and,
 * at the right on wide screens, the newest from the section's other
 * sub-sections. Twenty-four a page; `?page=` turns to the next.
 */
export default async function SubSectionPage({ params, searchParams }: { params: Params; searchParams: Promise<{ page?: string }> }) {
  const at = await place(params);
  if (!at) notFound();
  const { section, sub } = at;

  const [{ items }, { page: rawPage }] = await Promise.all([loadPaper(), searchParams]);
  const list = storiesIn(items, section, sub);
  const pool = storiesIn(items, section);
  const rail = pool.filter((n) => !inSub(n, sub) && section.subs.some((s) => s !== sub && inSub(n, s))).slice(0, RAIL);

  if (list.length === 0) {
    const latest = (pool.length > 0 ? pool : headlines(items, 8)).slice(0, 8);
    return (
      <div>
        <Breadcrumb section={section} sub={sub} />
        <PageTitle>{sub.bn}</PageTitle>
        <div className="mt-8">
          <EmptyDesk title={`${sub.bn}-এ এখনো কোনো খবর নেই`}>
            সংবাদপত্রগুলো এই বিষয়ে খবর প্রকাশ করলেই এখানে উঠবে — ফিড প্রতি ১৫ মিনিটে হালনাগাদ হয়।{pool.length > 0 ? ` ততক্ষণ ${section.bn} বিভাগের সর্বশেষ খবর দেখুন।` : " ততক্ষণ এখনকার অন্য খবর দেখুন।"}
          </EmptyDesk>
        </div>
        {latest.length > 0 ? (
          <section aria-labelledby="latest-title" className="mt-14">
            <SectionHead
              id="latest-title"
              title={pool.length > 0 ? `${section.bn}: সর্বশেষ` : "এখনকার অন্য খবর"}
              href={pool.length > 0 ? newsHref.section(section.slug) : undefined}
              more={`সব ${section.bn}`}
              className="mb-6"
            />
            <TileGrid items={latest} />
          </section>
        ) : null}
      </div>
    );
  }

  const pages = Math.ceil(list.length / PER_PAGE);
  const asked = Number.parseInt(rawPage ?? "1", 10);
  const page = Number.isFinite(asked) ? Math.min(Math.max(asked, 1), pages) : 1;
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const lead = page === 1 ? photoFirst(shown)[0] : undefined;
  const rest = shown.filter((n) => n !== lead);
  const beside = lead ? rest.slice(0, 3) : [];
  const tiles = rest.slice(beside.length);
  const pageHref = (p: number) => (p > 1 ? `${newsHref.sub(section.slug, sub.slug)}?page=${p}` : newsHref.sub(section.slug, sub.slug));

  return (
    <div>
      <Breadcrumb section={section} sub={sub} />
      <PageTitle>
        {sub.bn}
        {page > 1 ? (
          <span className="ml-3 align-middle font-sans text-base font-semibold text-white/60">
            পাতা <Num value={page} />
          </span>
        ) : null}
      </PageTitle>

      <div className={cn("mt-8 grid grid-cols-1 gap-12", rail.length > 0 && "lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]")}>
        <div className="min-w-0">
          {lead ? (
            <div className="grid grid-cols-1 gap-8 border-b border-white/12 pb-10 xl:grid-cols-3 xl:gap-10">
              <div className="xl:col-span-2">
                <LeadStory item={lead} priority />
              </div>
              {beside.length > 0 ? (
                <StoryList className="border-t border-white/10 pt-6 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-10">
                  {beside.map((n) => (
                    <StoryText key={n.id} item={n} size="md" />
                  ))}
                </StoryList>
              ) : null}
            </div>
          ) : null}

          {tiles.length > 0 ? (
            <div className={cn("grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3", lead && "mt-10")}>
              {tiles.map((n) => (
                <StoryTile key={n.id} item={n} size="md" summary sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" />
              ))}
            </div>
          ) : null}

          {pages > 1 ? (
            <nav aria-label="পাতা" className="mt-12 flex flex-col gap-3 sm:flex-row">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className={cn(btn.goldOutline, "bg-bdnavy-900 sm:w-auto")}>
                  <ArrowLeft className="size-4" aria-hidden />
                  আগের পাতা
                </Link>
              ) : null}
              {page < pages ? (
                <Link href={pageHref(page + 1)} className={cn(btn.goldOutline, "flex-1 bg-bdnavy-900")}>
                  আরও দেখুন
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>

        <Rail title="সর্বাধিক নতুন" href={newsHref.section(section.slug)} items={rail} />
      </div>
    </div>
  );
}
