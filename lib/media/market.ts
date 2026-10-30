/** Bargaining and auction rules for the marketplace. */

export const MAX_BARGAIN_ROUNDS = 3;

/** Share of the asking price a seller accepts outright. */
export const ACCEPT_RATIO = 0.92;

/** Offers under this share of the floor are declined without a counter. */
export const DECLINE_RATIO = 0.75;

export function canCounter(roundsSoFar: number): boolean {
  return roundsSoFar < MAX_BARGAIN_ROUNDS;
}

export type SellerResponse =
  | { kind: "accept"; amount: number }
  | { kind: "counter"; amount: number }
  | { kind: "decline" };

/**
 * How a seller answers an offer: accept near the asking price, decline an
 * offer far under the floor, otherwise counter halfway between offer and
 * asking price (rounded to ৳10), never below the floor.
 */
export function sellerResponse(offer: number, price: number, floor: number): SellerResponse {
  if (offer >= price * ACCEPT_RATIO) return { kind: "accept", amount: offer };
  if (offer < floor * DECLINE_RATIO) return { kind: "decline" };
  const midpoint = Math.round((offer + price) / 2 / 10) * 10;
  const floorRounded = Math.ceil(floor / 10) * 10;
  return { kind: "counter", amount: Math.max(midpoint, floorRounded) };
}

export function minNextBid(currentBid: number, startPrice: number, increment: number): number {
  return currentBid > 0 ? currentBid + increment : startPrice;
}

export function isValidBid(
  amount: number,
  currentBid: number,
  startPrice: number,
  increment: number,
): boolean {
  return Number.isFinite(amount) && amount >= minNextBid(currentBid, startPrice, increment);
}
