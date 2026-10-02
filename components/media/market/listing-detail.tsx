import Link from "next/link";
import { CircleCheck, Leaf, Link2, Lock, MapPin, ShieldAlert, Truck } from "lucide-react";
import { boardPosts, DELIVERY, MODES, STAGES } from "@/data/media/bazaar";
import { getCategory } from "@/data/media/categories";
import type { Listing, Person, SkillRating } from "@/data/media/types";
import { personOrThrow } from "@/data/media/users";
import { brokenAt, linkChain } from "@/lib/media/bazaar";
import { PageHeader, Panel } from "../ui/layout";
import { MediaFrame } from "../ui/media-frame";
import { MediaGallery } from "../ui/media-gallery";
import { Compact, Num, Taka } from "../ui/numerals";
import { PersonAvatar, PersonLine } from "../ui/person";
import { RatingPair } from "../ui/trust";
import { buyersFor, listingOffer, modesOf, placeOf, tagsOf } from "./matching";
import { ShipQuote } from "./ship-quote";
import { BuyerFees, TradeButtons } from "./trade";

/** Field to buyer, each step sealed with the hash of the one before. */
function Journey({ steps }: { steps: NonNullable<Listing["journey"]> }) {
  const chain = linkChain(steps);
  const intact = brokenAt(chain) === -1;
  return (
    <Panel title="পণ্যের যাত্রা">
      <p className={intact ? "mb-4 inline-flex items-center gap-1.5 rounded-full bg-bd-green px-2.5 py-1 text-xs font-bold text-white" : "mb-4 inline-flex items-center gap-1.5 rounded-full bg-national-crimson px-2.5 py-1 text-xs font-bold text-white"}>
        {intact ? <Link2 className="size-3.5" aria-hidden /> : <ShieldAlert className="size-3.5" aria-hidden />}
        {intact ? "শৃঙ্খল অক্ষত — কোনো ধাপ পরে বদলানো হয়নি" : "একটি ধাপ বদলানো হয়েছে"}
      </p>
      <ol className="relative space-y-4 border-l-2 border-signal-orange/40 pl-5">
        {chain.map((s) => (
          <li key={s.hash} className="relative">
            <span className="absolute top-1 -left-6.75 size-3 rounded-[3px] bg-signal-orange" aria-hidden />
            <p className="text-sm font-semibold text-white">{s.step}</p>
            <p className="text-xs text-white/65">{s.at} · {s.by}</p>
            <p className="mt-1 font-mono text-[11px] text-white/45">#{s.hash} ← {s.prev}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs leading-relaxed text-white/60">প্রতিটি ধাপের ছাপ আগের ধাপের ছাপের ওপর গড়া, তাই মাঝের কোনো তথ্য বদলালে পরের সব ছাপ মিলবে না।</p>
    </Panel>
  );
}

/** A listing's page body — shared by seeded listings and ones made in this browser. */
export function ListingDetail({
  listing,
  seller,
  rating,
  proofHref,
  children,
}: {
  listing: Listing;
  seller: Person;
  rating: Pick<SkillRating, "self" | "communityAvg" | "raters">;
  proofHref?: string;
  /** Extra sections below the main grid. */
  children?: React.ReactNode;
}) {
  const cat = getCategory(listing.category);
  const place = placeOf(listing);
  const buyers = buyersFor(listingOffer(listing), boardPosts);
  const samples = (listing.gallery ?? [listing.media]).filter((m) => m.play);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={listing.title} back={{ href: "/media/market", label: "বাজার" }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          {listing.gallery ? <MediaGallery media={listing.gallery} /> : <MediaFrame slot={{ ...listing.media, ratio: "16/9" }} priority sizes="(min-width: 1024px) 720px, 100vw" />}
          {samples.length > 0 && (
            <Panel title={samples.some((m) => m.kind === "audio") ? "নমুনা শুনুন" : "ভিডিও দেখুন"}>
              <ul className="space-y-4">
                {samples.map((m, i) => (
                  <li key={i} className="space-y-1.5">
                    <p className="text-sm font-semibold text-white">{m.label}{m.duration && <span className="ml-2 text-xs font-normal text-white/60">{m.duration}</span>}</p>
                    {m.kind === "audio" ? <audio controls preload="none" src={m.play} className="w-full" /> : <video controls preload="none" poster={m.src} src={m.play} className="aspect-video w-full rounded-xl bg-black" />}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
          <Panel>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/65">
              <span className="font-semibold text-signal-orange">{listing.customCategory ?? place.sub.bn}</span>
              {listing.stage && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">{STAGES[listing.stage].bn}</span>}
              {listing.organic && <span className="inline-flex items-center gap-1 rounded-full bg-bd-green px-2 py-0.5 text-xs font-bold text-white"><Leaf className="size-3" aria-hidden />বিষমুক্ত</span>}
              <span className="inline-flex items-center gap-1"><MapPin className="size-4" aria-hidden />{listing.location}</span>
              <span><Compact n={listing.sold} /> বার বিক্রি</span>
            </p>
            <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-white">{listing.description}</p>
            {listing.highlights.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                {listing.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-1.5 text-sm text-white/80">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-signal-orange" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 flex flex-wrap gap-2">
              {listing.delivery.map((d) => (
                <span key={d} className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-2.5 py-1 text-xs font-medium text-white/80">
                  <Truck className="size-3.5" aria-hidden />
                  {DELIVERY[d]}
                </span>
              ))}
            </p>
            <p className="mt-3 flex flex-wrap gap-1.5">
              {tagsOf(listing).map((t) => (
                <Link key={t} href={`/media/market?q=%23${encodeURIComponent(t)}`} className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80 hover:bg-signal-orange hover:text-text-primary">
                  #{t}
                </Link>
              ))}
            </p>
          </Panel>

          {listing.specs && listing.specs.length > 0 && (
            <Panel title="বিস্তারিত">
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {listing.specs.map((s) => (
                  <div key={s.k} className="border-b border-white/10 pb-2">
                    <dt className="text-xs text-white/60">{s.k}</dt>
                    <dd className="text-sm font-semibold text-white">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          )}

          {listing.kg !== undefined && (
            <Panel title="দাম ও ডেলিভারি হিসাব">
              <ShipQuote listing={{ ...listing, kg: listing.kg }} />
            </Panel>
          )}

          {listing.journey && listing.journey.length > 0 && <Journey steps={listing.journey} />}

          <Panel title="বিক্রেতার দক্ষতা — কেন বিশ্বাস করবেন">
            <PersonLine person={seller} size="lg" meta={seller.headline} />
            <p className="mt-4 mb-2 text-sm font-semibold text-white">{listing.skill}</p>
            <RatingPair self={rating.self} communityAvg={rating.communityAvg} raters={rating.raters} />
            {proofHref && (
              <Link href={proofHref} className="mt-4 inline-flex text-sm font-semibold text-signal-orange hover:underline">
                এই কাজের প্রমাণ-পোস্ট ও আলোচনা দেখুন →
              </Link>
            )}
          </Panel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          <Panel>
            <p className="text-3xl font-bold text-white">
              <Taka amount={listing.price} />
            </p>
            <p className="text-sm text-white/65">
              {listing.unit} · {listing.negotiable ? "দরদাম চলে" : "নির্ধারিত দাম"}
            </p>
            {(listing.stock !== undefined || listing.minOrder) && (
              <p className="mt-2 text-sm text-white/80">
                {listing.stock !== undefined && <>মজুত <Num value={listing.stock} /> {listing.unit}</>}
                {listing.minOrder ? <> · ন্যূনতম <Num value={listing.minOrder} /> {listing.unit}</> : null}
              </p>
            )}
            {listing.tiers && listing.tiers.length > 0 && (
              <table className="mt-4 w-full text-sm">
                <caption className="mb-1 text-left text-xs font-semibold text-white/65">পাইকারি দর</caption>
                <tbody>
                  {listing.tiers.map((t) => (
                    <tr key={t.min} className="border-t border-white/10">
                      <td className="py-1.5 text-white/80"><Num value={t.min} />+ {listing.unit}</td>
                      <td className="py-1.5 text-right font-bold text-signal-orange"><Taka amount={t.price} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-3 flex flex-wrap gap-1.5">
              {modesOf(listing).map((m) => (
                <span key={m} className="rounded-md bg-bd-green px-2 py-0.5 text-xs font-semibold text-white">{MODES[m].bn}</span>
              ))}
            </p>
            <BuyerFees price={listing.price} className="mt-4" />
            <div className="mt-4">
              <TradeButtons listing={listing} band={cat.band} size="lg" stacked />
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs text-white/65">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                টাকা এসক্রোতে থাকে; পণ্য বা সেবা বুঝে পেয়ে নিশ্চিত করলে বিক্রেতা পান। <Num value={7} /> দিনের মধ্যে সমস্যা জানালে মধ্যস্থতা।
              </span>
            </p>
          </Panel>

          {buyers.length > 0 && (
            <Panel title="যাঁরা এটাই খুঁজছেন">
              <ul className="space-y-3">
                {buyers.map((m) => {
                  const p = personOrThrow(m.post.author);
                  return (
                    <li key={m.post.id}>
                      <Link href={`/media/market?view=board#${m.post.id}`} className="flex items-center gap-3 rounded-xl p-1 hover:bg-white/5">
                        <PersonAvatar person={p} size="sm" />
                        <span className="min-w-0 flex-1 text-sm">
                          <span className="block truncate font-semibold text-white">{m.post.title}</span>
                          <span className="block truncate text-xs text-white/65">{p.nameBn} · {m.post.who}</span>
                        </span>
                        <span className="text-sm font-bold text-bdgreen-500"><Num value={m.score} />%</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </aside>
      </div>
      {children}
    </div>
  );
}
