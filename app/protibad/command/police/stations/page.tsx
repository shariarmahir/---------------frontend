import type { Metadata } from "next";
import { Suspense } from "react";
import { StationList, StationListFallback } from "@/components/command/station-list";

export const metadata: Metadata = { title: "Police stations" };

export default function StationsPage() {
  return (
    <Suspense fallback={<StationListFallback />}>
      <StationList />
    </Suspense>
  );
}
