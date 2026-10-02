import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { BadgeCheck, ChevronDown, LayoutGrid, Sparkles, Store, UsersRound, X } from "lucide-react";
import { ClassroomAd } from "@/components/media/feed/classroom-ad";
import { FeedComposer } from "@/components/media/feed/feed-composer";
import { FeedEnd } from "@/components/media/feed/feed-end";
import { CommunityModule, Highlights, JobsModule, MarketModule, ResearchModule } from "@/components/media/feed/feed-modules";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { FollowingFeed } from "@/components/media/feed/following-feed";
import { MyPosts } from "@/components/media/feed/my-posts";
import { PeopleYouMayKnow } from "@/components/media/feed/people-you-may-know";
import { PostCard } from "@/components/media/feed/post-card";
import { SponsoredAd, type AdListing } from "@/components/media/feed/sponsored-ad";
import { TOPIC_ICON } from "@/components/media/feed/topic-style";
import { EmptyState } from "@/components/media/ui/empty-state";
import { mediaButton } from "@/components/media/ui/button-styles";
import { categories, getCategory, isCategoryId } from "@/data/media/categories";
import { challenges } from "@/data/media/challenges";
import { getListing, listings } from "@/data/media/market";
import { posts } from "@/data/media/posts";
import { isTopic, topicOf, topics } from "@/data/media/topics";
import { getPerson, personOrThrow } from "@/data/media/users";
import { skillStatus } from "@/lib/media/skill";
import { cn } from "@/lib/utils";

/*
 * THESIS: the front door of the whole platform. Anything people share —
 * life, talent, work to verify — in one stream, opening between posts onto
 * the বাজার, গবেষণাকোষ, jobs and the community, with clearly labelled ad
 * spaces. Every module links to the exact item and to its room.
 */

const tabs = [
  { key: "all", label: "আপনার জন্য", Icon: Sparkles },
  { key: "following", label: "অনুসরণ", Icon: UsersRound },
  { key: "verify", label: "যাচাই দরকার", Icon: BadgeCheck },
  { key: "sale", label: "বিক্রির জন্য", Icon: Store },
] as const;

type TabKey = (typeof tabs)[number]["key"];
type Filters = { tab: TabKey; t?: string; c?: string };

function href({ tab, t, c }: Filters) {
  const q = new URLSearchParams();
  if (tab !== "all") q.set("tab", tab);
  if (t) q.set("t", t);
  if (c) q.set("c", c);
  const s = q.toString();
  return s ? `/media?${s}` : "/media";
}

/** A boosted listing as the ad needs it. */
function adListing(id: string): AdListing | undefined {
  const l = listings.find((x) => x.id === id);
  if (!l) return undefined;
  return { id: l.id, title: l.title, price: l.price, unit: l.unit, image: l.media.src, imageAlt: l.media.label, seller: getPerson(l.seller)?.nameBn ?? "", rating: l.rating, sold: l.sold, location: l.location };
}

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ tab?: string; c?: string; t?: string }> }) {
  const sp = await searchParams;
  const tab: TabKey = tabs.find((t) => t.key === sp.tab)?.key ?? "all";
  const cat = sp.c && isCategoryId(sp.c) ? sp.c : undefined;
  const topic = sp.t && isTopic(sp.t) ? sp.t : undefined;
  const unfiltered = tab === "all" && !cat && !topic;

  const shown = posts
    .filter((p) => !p.audience || p.audience === "public")
    .filter((p) =>
      tab === "verify" ? Boolean(p.skill) && skillStatus(p.skill!.self, p.skill!.communityAvg, p.skill!.raters) !== "verified" : tab === "sale" ? Boolean(p.listingId) : true,
    )
    .filter((p) => !topic || topicOf(p).id === topic)
    .filter((p) => !cat || p.category === cat)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Ad spaces: sellers' boosted listings, then the platform's own promotions.
  const boosted = listings.filter((l) => l.featured).map((l) => adListing(l.id)).filter((x): x is AdListing => Boolean(x));
  const prize = [...challenges].sort((a, b) => b.prize - a.prize)[1] ?? challenges[0];
  const challengeAd = <SponsoredAd variant="challenge" challenge={{ id: prize.id, title: prize.title, host: prize.host, prize: prize.prize, deadline: prize.deadline, entries: prize.entries }} />;
  const listingAd = (n: number) => (boosted[n % Math.max(1, boosted.length)] ? <SponsoredAd variant="listing" listing={boosted[n % boosted.length]} /> : null);

  // What appears after the post at each index (0-based).
  const slots: Record<number, ReactNode> = unfiltered
    ? { 1: <MarketModule />, 3: listingAd(0), 5: <ResearchModule />, 7: <JobsModule />, 9: <SponsoredAd variant="research" />, 10: <CommunityModule />, 13: challengeAd, 16: listingAd(1) }
    : { 3: listingAd(0), 8: <SponsoredAd variant="research" /> };

  // A filtered view opens on the room it is about.
  const lead =
    tab === "sale" ? <MarketModule /> : topic === "research" ? <ResearchModule /> : topic === "help" || topic === "rights" ? <CommunityModule /> : null;

  const card = (p: (typeof shown)[number]) => <PostCard post={p} author={personOrThrow(p.author)} listing={p.listingId ? getListing(p.listingId) : undefined} />;

  const chip = (on: boolean) =>
    cn(
      "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap transition-colors",
      on ? "border-signal-orange bg-signal-orange text-text-primary shadow-[0_8px_20px_-12px_var(--color-signal-orange)]" : "border-white/12 bg-text-primary text-white/80 hover:border-signal-orange/40 hover:text-signal-orange",
    );

  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-4">
        <h1 className="sr-only">ফিড</h1>

        <FeedComposer />

        {unfiltered && <Highlights />}

        <nav aria-label="ফিড ফিল্টার" className="space-y-3">
          <div className="grid grid-cols-4 gap-1 rounded-2xl border border-white/12 bg-text-primary p-1">
            {tabs.map(({ key, label, Icon }) => (
              <Link
                key={key}
                href={href({ tab: key, t: topic, c: cat })}
                aria-current={tab === key ? "page" : undefined}
                scroll={false}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-xs font-semibold transition-[background-color,color,box-shadow] sm:flex-row sm:gap-1.5 sm:text-sm",
                  tab === key ? "bg-signal-orange text-text-primary shadow-tile" : "text-white/75 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="size-4.5 shrink-0" aria-hidden />
                <span className="text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="-ml-3 min-w-0 flex-1 overflow-x-auto pl-3 [mask-image:linear-gradient(to_right,black_90%,transparent)] scrollbar-none sm:ml-0 sm:pl-0">
              <ul className="flex w-max gap-2 pr-6">
                <li>
                  <Link href={href({ tab, c: cat })} scroll={false} aria-current={!topic ? "page" : undefined} className={chip(!topic)}>
                    সব ধরন
                  </Link>
                </li>
                {topics.map((t) => {
                  const I = TOPIC_ICON[t.id];
                  return (
                    <li key={t.id}>
                      <Link href={href({ tab, t: t.id, c: cat })} scroll={false} aria-current={topic === t.id ? "page" : undefined} className={chip(topic === t.id)} title={t.hint}>
                        <I className="size-4" aria-hidden />
                        {t.bn}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Every category, one tap away. */}
            <details className="group/cat relative shrink-0">
              <summary className={cn(chip(Boolean(cat)), "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}>
                <LayoutGrid className="size-4" aria-hidden />
                <span className="hidden sm:inline">{cat ? getCategory(cat).bn : "সব বিভাগ"}</span>
                <span className="sr-only sm:hidden">বিভাগ বেছে নিন</span>
                <ChevronDown className="size-4 transition-transform group-open/cat:rotate-180" aria-hidden />
              </summary>
              <div className="absolute top-full right-0 z-30 mt-2 w-[min(34rem,calc(100vw-1.5rem))] rounded-2xl border border-white/15 bg-text-primary p-3 shadow-ink">
                <p className="mb-2 px-1 text-xs font-bold text-white/60">বিভাগ অনুযায়ী দেখুন</p>
                <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={href({ tab, t: topic, c: c.id })}
                        scroll={false}
                        aria-current={cat === c.id ? "page" : undefined}
                        className={cn("flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold transition-colors", cat === c.id ? "bg-signal-orange text-text-primary" : "text-white/85 hover:bg-white/10")}
                      >
                        {c.bn}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>

          {cat && (
            <p className="flex items-center gap-2 text-sm text-white/80">
              বিভাগ:
              <Link href={href({ tab, t: topic })} scroll={false} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white/10 px-3 font-semibold text-signal-orange hover:bg-white/15">
                {getCategory(cat).bn} <X className="size-3.5" aria-hidden />
                <span className="sr-only">বিভাগের ফিল্টার সরান</span>
              </Link>
            </p>
          )}
        </nav>

        {unfiltered && <MyPosts />}

        {lead}

        {tab === "following" ? (
          <>
            <FollowingFeed items={shown.map((p) => ({ id: p.id, author: p.author, node: card(p) }))} />
            <ClassroomAd />
            <FeedEnd />
          </>
        ) : shown.length === 0 ? (
          <EmptyState
            icon="posts"
            title="এই ফিল্টারে কোনো পোস্ট নেই"
            body="অন্য ধরন বা বিভাগ বেছে নিন, অথবা প্রথম পোস্টটি আপনিই দিন।"
            action={<Link href="/media/post/new" className={mediaButton({ variant: "primary" })}>পোস্ট করুন</Link>}
          />
        ) : (
          <>
            {shown.map((p, i) => (
              <Fragment key={p.id}>
                {card(p)}
                {slots[i]}
                {/* Classroom's own promotion: after the third post, then after every ninth one. */}
                {i + 1 >= 3 && (i + 1 - 3) % 9 === 0 && <ClassroomAd />}
                {/* Every seventh post (or after a short list), reshuffled each time. */}
                {((i + 1) % 7 === 0 || (shown.length < 7 && i === shown.length - 1)) && <PeopleYouMayKnow seed={i < 7 ? 0 : i + 1} />}
              </Fragment>
            ))}
            <FeedEnd />
          </>
        )}
      </div>

      <aside aria-label="আপনার জন্য" className="sticky top-22 hidden max-h-[calc(100dvh-6.5rem)] w-80 shrink-0 overflow-y-auto scrollbar-none xl:block">
        <FeedRail />
      </aside>
    </div>
  );
}
