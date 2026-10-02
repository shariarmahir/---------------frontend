import { resolveSub, type Pickable } from "@/data/media/market-sections";
import type { BoardPost, CategoryId, Listing } from "@/data/media/types";
import { canonTag, MATCH_MIN, matchScore, unitPrice, type MatchOffer, type Tier } from "@/lib/media/bazaar";

/** Listings and board posts in the shape the match rules read. */

export const districtOf = (l: Listing) => l.location.split(",").at(-1)!.trim();
/** Canonical, de-duplicated: #পাটালি and #গুড় show once, as #গুড়. */
export const tagsOf = (l: Listing) => [...new Set((l.tags ?? [l.skill]).map(canonTag))];
/** Older skill listings sell to individuals only. */
export const modesOf = (l: Listing) => l.modes ?? ["retail" as const];

/** Something for sale: a shop listing or a “বিক্রি করতে চাই” post. */
export interface Offer {
  id: string;
  owner: string;
  title: string;
  href: string;
  offer: MatchOffer;
  tiers?: Tier[];
}

export const listingOffer = (l: Listing): Offer => ({
  id: l.id,
  owner: l.seller,
  title: l.title,
  href: `/media/market/${l.id}`,
  tiers: l.tiers,
  offer: { sector: l.category, tags: tagsOf(l), price: l.price, stock: l.stock, minOrder: l.minOrder, district: districtOf(l), modes: modesOf(l), organic: l.organic },
});

export const postOffer = (p: BoardPost): Offer => ({
  id: p.id,
  owner: p.author,
  title: p.title,
  href: `/media/market?view=board#${p.id}`,
  offer: { sector: p.category, tags: p.tags, price: p.price ?? 0, stock: p.qty, district: p.district, modes: [p.mode], organic: p.organic },
});

/** Everything on sale: listings plus the sell side of the board. */
export const offersFrom = (listings: Listing[], posts: BoardPost[]) => [...listings.map(listingOffer), ...posts.filter((p) => p.side === "sell").map(postOffer)];

function score(o: Offer, want: BoardPost) {
  if (o.owner === want.author) return { score: 0, why: [] };
  return matchScore(
    { ...o.offer, price: unitPrice(want.qty, o.offer.price, o.tiers) },
    { sector: want.category, tags: want.tags, qty: want.qty, maxPrice: want.price, district: want.district, mode: want.mode, organic: want.organic },
  );
}

/** Offers that fill a buy post, best first. */
export function sellersFor(want: BoardPost, offers: Offer[]) {
  return offers
    .map((o) => ({ o, ...score(o, want) }))
    .filter((m) => m.score >= MATCH_MIN)
    .sort((a, b) => b.score - a.score);
}

/** Buy posts an offer fills, best first. */
export function buyersFor(o: Offer, posts: BoardPost[]) {
  return posts
    .filter((p) => p.side === "buy")
    .map((post) => ({ post, ...score(o, post) }))
    .filter((m) => m.score >= MATCH_MIN)
    .sort((a, b) => b.score - a.score);
}

/** Search across words and hashtags, so “coconut” finds #নারকেল. */
export function searchHit(l: Listing, needle: string, extra: string[] = []) {
  if (!needle) return true;
  const q = needle.toLowerCase().replace(/^#/, "");
  return tagsOf(l).includes(canonTag(q)) || [l.title, l.description, l.skill, l.location, l.customCategory ?? "", ...extra].some((f) => f.toLowerCase().includes(q));
}

export function postHit(p: BoardPost, needle: string, extra: string[] = []) {
  if (!needle) return true;
  const q = needle.toLowerCase().replace(/^#/, "");
  return p.tags.map(canonTag).includes(canonTag(q)) || [p.title, p.who, p.note ?? "", ...extra].some((f) => f.toLowerCase().includes(q));
}

/** The section and sub-section an item sits in; older items by category. */
export const placeOf = (x: { sub?: string; category: CategoryId }) => resolveSub(x.sub, x.category);
export const listingPick = (l: Listing): Pickable => ({ sub: placeOf(l).sub.id, modes: modesOf(l), organic: l.organic, stage: l.stage, tags: tagsOf(l) });
export const postPick = (p: BoardPost): Pickable => ({ sub: placeOf(p).sub.id, modes: [p.mode], organic: p.organic, tags: p.tags.map(canonTag) });

/** Most used tags first. */
export function trendingTags(listings: Listing[], posts: BoardPost[], n = 10) {
  const count = new Map<string, number>();
  for (const t of [...listings.flatMap(tagsOf), ...posts.flatMap((p) => p.tags.map(canonTag))]) count.set(t, (count.get(t) ?? 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1]).slice(0, n).map(([t]) => t);
}
