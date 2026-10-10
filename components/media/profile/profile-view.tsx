import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, Clock, GraduationCap, Users } from "lucide-react";
import { PeopleYouMayKnow } from "../feed/people-you-may-know";
import { PostCard } from "../feed/post-card";
import { HireBar } from "../hire/hire";
import { ListingCard } from "../market/listing-card";
import { PinnedNotes } from "../notes/notes";
import { EmptyState } from "../ui/empty-state";
import { Compact, Num, Taka } from "../ui/numerals";
import { IdBadge } from "../ui/trust";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategory } from "@/data/media/categories";
import { threads } from "@/data/media/chat";
import { coursesBy } from "@/data/media/academy";
import { listings } from "@/data/media/market";
import { posts } from "@/data/media/posts";
import { isRated } from "@/data/media/topics";
import type { Person } from "@/data/media/types";
import { walletSeed } from "@/data/media/wallet";
import { CvFormatCards } from "./cv-panel";
import { ProfileSection } from "./glass";
import { DoneCount, ProfileJourney, ProfileSkills } from "./profile-academy";
import { OwnProfileFeed, type FeedItem } from "./profile-feed";
import { ProfileHero } from "./profile-hero";
import { FollowerCount, MyPortfolioTiles, MyShopCards, PortfolioTile, WalletCard } from "./profile-parts";
import { ResumeUpload } from "./resume-upload";

function Tile({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-m-ink/10 bg-m-ink/4 p-4">
      <span className="text-m-blue">{icon}</span>
      <span className="mt-3 block text-2xl font-bold text-m-ink">{value}</span>
      <span className="block text-xs text-m-ink/60">{label}</span>
    </div>
  );
}

/**
 * One profile for every member, built after the reference portfolio: the
 * opening with the picture, a short About with three numbers, the skills
 * (academy courses join them by themselves), the academy road, the feed and
 * portfolio, what clients said, and a closing that is the CV on your own
 * page and the hire form on anyone else's.
 */
export function ProfileView({ person, self }: { person: Person; self: boolean }) {
  const theirPosts = posts.filter((p) => p.author === person.handle);
  const theirListings = listings.filter((l) => l.seller === person.handle);
  const thread = threads.find((t) => t.with === person.handle);
  const cat = person.categories[0] ? getCategory(person.categories[0]) : undefined;
  const taught = coursesBy(person.handle).length;

  // Anyone else sees the posts shared with everyone; the viewer sees all of theirs.
  const feedItems: FeedItem[] = theirPosts
    .filter((p) => self || !p.audience || p.audience === "public")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => ({
      id: p.id,
      audience: p.audience ?? "public",
      node: <PostCard post={p} author={person} listing={listings.find((l) => l.id === p.listingId)} />,
    }));

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-20 lg:pb-0">
      <ProfileHero person={person} self={self} />

      <ProfileSection id="about" eyebrow="পরিচিতি" title="দক্ষতা দিয়ে গড়া পরিচয়">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
            <Tile icon={<Users className="size-5" aria-hidden />} value={<FollowerCount handle={person.handle} base={person.followers} />} label="অনুসারী" />
            <Tile icon={<BriefcaseBusiness className="size-5" aria-hidden />} value={<Compact n={person.jobsDone} />} label="সম্পন্ন কাজ" />
            <Tile icon={<GraduationCap className="size-5" aria-hidden />} value={self ? <DoneCount /> : <Num value={taught} />} label={self ? "একাডেমির কোর্স সম্পন্ন" : "একাডেমিতে পড়ান"} />
          </div>
          <div className="space-y-3 text-sm text-m-ink/80">
            <p className="leading-relaxed text-m-ink">{person.bio}</p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-m-ink/65">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" aria-hidden /> উত্তর: {person.responseTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-4" aria-hidden /> সক্রিয় <Num value={person.joined.slice(0, 4)} />
                -এর পর থেকে
              </span>
              {person.rate && (
                <span>
                  <Taka amount={person.rate.amount} /> {person.rate.unit}
                </span>
              )}
              {person.idVerified && <IdBadge />}
            </p>
            {person.categories.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="খাত">
                {person.categories.map((c) => (
                  <li key={c} className="rounded-full border border-m-ink/12 px-3 py-1 text-xs font-semibold text-m-ink/85">
                    {getCategory(c).bn}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </ProfileSection>

      <ProfileSection id="skills" eyebrow="দক্ষতা" title="যা আমি পারি">
        <ProfileSkills person={person} self={self} />
      </ProfileSection>

      <ProfileSection
        id="journey"
        eyebrow="একাডেমি"
        title="শেখার পথ"
        action={
          <Link href="/media/academy" className="text-sm font-semibold text-m-blue hover:underline">
            একাডেমি
          </Link>
        }
      >
        <ProfileJourney person={person} self={self} />
      </ProfileSection>

      {self && <PinnedNotes />}

      <ProfileSection id="feed" eyebrow="ফিড" title="আমার পোস্ট ও কাজ">
        <Tabs defaultValue="feed">
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="feed" className="flex-1 sm:flex-none">
              ফিড
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-1 sm:flex-none">
              পোর্টফোলিও
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex-1 sm:flex-none">
              বিক্রির জন্য
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-4">
            {self ? (
              <OwnProfileFeed author={person} items={feedItems} />
            ) : feedItems.length === 0 ? (
              <EmptyState icon="posts" title="এখনো কোনো পোস্ট নেই" />
            ) : (
              <div className="space-y-4">
                {feedItems.map((i) => (
                  <div key={i.id}>{i.node}</div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="mt-4">
            {theirPosts.filter(isRated).length === 0 && !self ? (
              <EmptyState icon="posts" title="পোর্টফোলিওতে এখনো কিছু নেই" />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {self && <MyPortfolioTiles />}
                {theirPosts
                  .filter(isRated)
                  .filter((p) => self || !p.audience || p.audience === "public")
                  .map((p) => (
                    <PortfolioTile key={p.id} post={p} />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shop" className="mt-4">
            {theirListings.length === 0 && !self ? (
              <EmptyState icon="market" title="বিক্রির জন্য কিছু নেই" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {self && <MyShopCards />}
                {theirListings.map((l) => (
                  <ListingCard key={l.id} listing={l} seller={person} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ProfileSection>

      {person.workHistory.length > 0 && (
        <ProfileSection
          id="clients"
          eyebrow="গ্রাহকের কথা"
          title="যাঁদের কাজ করে দিয়েছি"
          action={
            <span className="text-sm text-m-ink/65">
              গ্রাহকের রিভিউ <Num value={person.clientRating} decimals={1} />
            </span>
          }
        >
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {person.workHistory.slice(0, 6).map((w) => (
              <li key={w.id} className="flex flex-col rounded-2xl border border-m-ink/10 bg-m-ink/4 p-4">
                <p className="text-sm leading-relaxed text-m-ink/85">“{w.review}”</p>
                <p className="mt-auto pt-4 text-sm font-bold text-m-ink">{w.client}</p>
                <p className="text-xs text-m-ink/60">
                  {w.title} · <Num value={w.date.slice(0, 4)} /> · <Taka amount={w.amount} />
                </p>
              </li>
            ))}
          </ul>
        </ProfileSection>
      )}

      <ProfileSection id="connect" eyebrow={self ? "আমার CV" : "যোগাযোগ"} title={self ? "CV তৈরি করুন, নামান, আপলোড করুন" : "একসাথে কাজ করবেন?"}>
        {self ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-5">
              <CvFormatCards base="/media/me/cv" />
              <ResumeUpload />
            </div>
            <WalletCard seed={walletSeed} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <HireBar
              target={{
                handle: person.handle,
                nameBn: person.nameBn,
                services: person.skills.map((s) => s.skill),
                rate: person.rate,
                band: cat?.band ?? { low: 0, high: 0, unit: "" },
                responseTime: person.responseTime,
                threadId: thread?.id,
              }}
            />
            <div>
              <p className="mb-3 text-sm text-m-ink/70">এই প্রোফাইল থেকে {person.nameBn}-এর CV নামান — তিনটি ধরনের যেকোনোটি।</p>
              <CvFormatCards base={`/media/u/${person.handle}/cv`} />
            </div>
          </div>
        )}
      </ProfileSection>

      {self ? <PeopleYouMayKnow /> : <PeopleYouMayKnow about={person.handle} title="আরও যাঁদের চিনতে পারেন" />}
    </div>
  );
}
