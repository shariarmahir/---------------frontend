/**
 * Fair-price check. Every category carries a market band; a price or salary
 * well under it is flagged, because the platform promises that talent is
 * paid what the work is worth.
 */
export interface PriceBand {
  low: number;
  high: number;
  unit: string;
}

export type PriceVerdict = "unfair" | "under" | "fair" | "premium";

/** Below this share of the band's low end, an amount is called unfair. */
export const UNFAIR_RATIO = 0.75;

export function assessPrice(amount: number, band: PriceBand): PriceVerdict {
  if (amount < band.low * UNFAIR_RATIO) return "unfair";
  if (amount < band.low) return "under";
  if (amount <= band.high) return "fair";
  return "premium";
}
