/**
 * Platform fees for শিক্ষিতদের মিডিয়া.
 *
 * The seller gives 5% of every sale to the platform; the buyer pays a 5%
 * service charge on top, which also covers the SSLCommerz gateway. Both
 * rates live here so a pricing change is one edit.
 */
export const SELLER_FEE_RATE = 0.05;
export const BUYER_FEE_RATE = 0.05;

export interface FeeBreakdown {
  price: number;
  sellerFee: number;
  sellerReceives: number;
  buyerCharge: number;
  buyerPays: number;
  platformTotal: number;
}

export function computeFees(price: number): FeeBreakdown {
  const p = Math.max(0, Math.round(price));
  const sellerFee = Math.round(p * SELLER_FEE_RATE);
  const buyerCharge = Math.round(p * BUYER_FEE_RATE);
  return {
    price: p,
    sellerFee,
    sellerReceives: p - sellerFee,
    buyerCharge,
    buyerPays: p + buyerCharge,
    platformTotal: sellerFee + buyerCharge,
  };
}
