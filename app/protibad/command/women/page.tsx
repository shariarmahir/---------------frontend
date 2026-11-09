import type { Metadata } from "next";
import { Suspense } from "react";
import { WomenSafety, WomenSafetyFallback } from "@/components/command/women-safety";

export const metadata: Metadata = { title: "Women safety" };

export default function WomenSafetyPage() {
  return (
    <Suspense fallback={<WomenSafetyFallback />}>
      <WomenSafety />
    </Suspense>
  );
}
