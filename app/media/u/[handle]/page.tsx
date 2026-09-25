import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, CalendarDays, Clock, MapPin, SquarePen, Star, Users } from "lucide-react";
import { FollowButton } from "@/components/media/feed/post-actions";
import { HireBar } from "@/components/media/hire/hire";
import { ListingCard } from "@/components/media/market/listing-card";
import { FollowerCount, MyPortfolioTiles, MyShopCards, PortfolioTile, WalletCard } from "@/components/media/profile/profile-parts";
import { mediaButton } from "@/components/media/ui/button-styles";
import { EmptyState } from "@/components/media/ui/empty-state";
import { Panel } from "@/components/media/ui/layout";
import { Compact, Num, Taka } from "@/components/media/ui/numerals";
import { PersonAvatar } from "@/components/media/ui/person";
import { IdBadge, IdSeal, RatingPair, Stars } from "@/components/media/ui/trust";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategory } from "@/data/media/categories";
import { threads } from "@/data/media/chat";
import { listings } from "@/data/media/market";
import { posts } from "@/data/media/posts";
import { CURRENT_USER_HANDLE, getPerson, people } from "@/data/media/users";
import { walletSeed } from "@/data/media/wallet";

export const dynamicParams = false;

export function generateStaticParams() {
  return people.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = getPerson((await params).handle);
  return p ? { title: `${p.nameBn} — ${p.headline}`, description: p.bio } : {};
}

const monthsBn = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

/** A Bangladesh landscape per member, the same every visit. */
const covers = ["sajek", "haor", "teagarden", "mustard", "ratargul", "village", "river", "kashful", "sundarbans", "winterfog", "jaflong", "kaptai"];
function coverFor(handle: string) {
  let h = 0;
  for (const ch of handle) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `/bangladesh/${covers[h % covers.length]}.jpg`;
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-text-secondary">{icon}</span>
      <span>
        <span className="block text-base leading-tight font-bold text-text-primary">{value}</span>
        <span className="block text-xs text-text-muted">{label}</span>
      </span>
    </div>
  );
}

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const person = getPerson((await params).handle);
  if (!person) notFound();

  const self = person.handle === CURRENT_USER_HANDLE;
  const theirPosts = posts.filter((p) => p.author === person.handle);
  const theirListings = listings.filter((l) => l.seller === person.handle);
  const cat = getCategory(person.categories[0]);
  const thread = threads.find((t) => t.with === person.handle);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 lg:pb-0">
      <section className="overflow-hidden rounded-2xl border border-card-border bg-white">
        <div className="relative h-28 bg-bd-green-light sm:h-40" aria-hidden>
          <Image src={coverFor(person.handle)} alt="" fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
          <span className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
        </div>
        <div className="px-4 pb-6 sm:px-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-3 sm:-mt-14">
            <PersonAvatar person={person} size="xl" className="ring-4 ring-white" />
            <div className="flex flex-wrap gap-2">
              {self ? (
                <Link href="/media/post/new" className={mediaButton({ variant: "primary" })}>
                  <SquarePen aria-hidden /> দক্ষতা পোস্ট করুন
                </Link>
              ) : (
                <FollowButton handle={person.handle} size="md" />
              )}
            </div>
          </div>
          <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold text-text-primary">
            {person.nameBn}
            {person.idVerified && <IdSeal size={24} />}
          </h1>
          <p className="text-sm text-text-muted">
            {person.name} · @{person.handle}
          </p>
          <p className="mt-2 text-[15px] font-semibold text-text-secondary">{person.headline}</p>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-text-primary">{person.bio}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1"><MapPin className="size-4" aria-hidden />{person.area}, {person.district}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="size-4" aria-hidden />যোগ দিয়েছেন {monthsBn[Number(person.joined.slice(5, 7)) - 1]} <Num value={person.joined.slice(0, 4)} /></span>
            {person.idVerified && <IdBadge />}
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-card-border pt-5 sm:grid-cols-4">
            <Stat icon={<Users className="size-4.5" aria-hidden />} value={<FollowerCount handle={person.handle} base={person.followers} />} label="অনুসারী" />
            <Stat icon={<BriefcaseBusiness className="size-4.5" aria-hidden />} value={<Compact n={person.jobsDone} />} label="সম্পন্ন কাজ" />
            <Stat
              icon={<Star className="size-4.5 fill-amber-400 text-amber-400" aria-hidden />}
              value={
                <>
                  <Num value={person.clientRating} decimals={1} />
                </>
              }
              label="গ্রাহকের রিভিউ"
            />
            <Stat icon={<Clock className="size-4.5" aria-hidden />} value={person.responseTime} label="উত্তরের সময়" />
          </dl>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Panel title="দক্ষতা — নিজের দাবি বনাম কমিউনিটির যাচাই">
            <ul className="grid gap-5 md:grid-cols-2">
              {person.skills.map((s) => (
                <li key={s.skill} className="space-y-2.5">
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-bold text-text-primary">{s.skill}</span>
                    <span className="text-xs text-text-muted">{getCategory(s.category).bn}</span>
                  </p>
                  <RatingPair self={s.self} communityAvg={s.communityAvg} raters={s.raters} />
                </li>
              ))}
            </ul>
          </Panel>

          <Tabs defaultValue="portfolio">
            <TabsList className="w-full sm:w-fit">
              <TabsTrigger value="portfolio" className="flex-1 sm:flex-none">পোর্টফোলিও</TabsTrigger>
              <TabsTrigger value="work" className="flex-1 sm:flex-none">কাজের ইতিহাস</TabsTrigger>
              <TabsTrigger value="shop" className="flex-1 sm:flex-none">বিক্রির জন্য</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio">
              {theirPosts.length === 0 && !self ? (
                <EmptyState icon="posts" title="এখনো কোনো পোস্ট নেই" />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {self && <MyPortfolioTiles />}
                  {theirPosts.map((p) => (
                    <PortfolioTile key={p.id} post={p} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="work">
              {person.workHistory.length === 0 ? (
                <EmptyState icon="profile" title="প্ল্যাটফর্মে এখনো কাজ শেষ হয়নি" body="প্রথম কাজের পর গ্রাহকের রিভিউ এখানে দেখাবে।" />
              ) : (
                <ul className="space-y-3">
                  {person.workHistory.map((w) => (
                    <li key={w.id} className="rounded-2xl border border-card-border bg-white p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-text-primary">{w.title}</p>
                          <p className="text-sm text-text-muted">
                            {w.client} · <Num value={w.date} />
                          </p>
                        </div>
                        <p className="text-base font-bold text-text-primary">
                          <Taka amount={w.amount} />
                        </p>
                      </div>
                      <p className="mt-3 flex items-center gap-2">
                        <Stars value={w.rating} size={14} />
                        <span className="text-sm font-semibold"><Num value={w.rating} decimals={1} /></span>
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">“{w.review}”</p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="shop">
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
        </div>

        <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          {self ? (
            <WalletCard seed={walletSeed} />
          ) : (
            <HireBar
              target={{
                handle: person.handle,
                nameBn: person.nameBn,
                services: [...person.skills.map((s) => s.skill)],
                rate: person.rate,
                band: cat.band,
                responseTime: person.responseTime,
                threadId: thread?.id,
              }}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
