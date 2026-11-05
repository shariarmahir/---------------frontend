import type { Metadata } from "next";
import { Suspense } from "react";
import { PriceWatch, PriceWatchFallback } from "@/components/command/price-watch";

export const metadata: Metadata = { title: "Price watch" };

export default function PricesPage() {
  return (
    <Suspense fallback={<PriceWatchFallback />}>
      <PriceWatch />
    </Suspense>
  );
}
