import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/media/academy/checkout/checkout-view";

export const metadata: Metadata = { title: "চেকআউট · একাডেমি" };

/** The cart's checkout: confirm who is joining, pay into escrow, and join. */
export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutView />
    </Suspense>
  );
}
