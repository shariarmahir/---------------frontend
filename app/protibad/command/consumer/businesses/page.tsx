import type { Metadata } from "next";
import { Suspense } from "react";
import { BusinessList, BusinessListFallback } from "@/components/command/business-list";

export const metadata: Metadata = { title: "Businesses" };

export default function BusinessesPage() {
  return (
    <Suspense fallback={<BusinessListFallback />}>
      <BusinessList />
    </Suspense>
  );
}
