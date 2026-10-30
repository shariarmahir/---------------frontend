import type { Metadata } from "next";
import { Suspense } from "react";
import { OtherQueue, OtherQueueFallback } from "@/components/command/other-queue";

export const metadata: Metadata = { title: "Other agencies" };

export default function OtherAgenciesPage() {
  return (
    <Suspense fallback={<OtherQueueFallback />}>
      <OtherQueue />
    </Suspense>
  );
}
