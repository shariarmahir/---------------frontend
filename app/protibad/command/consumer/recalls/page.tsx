import type { Metadata } from "next";
import { Suspense } from "react";
import { RecallList, RecallListFallback } from "@/components/command/recall-list";

export const metadata: Metadata = { title: "Remove from sale" };

export default function RecallsPage() {
  return (
    <Suspense fallback={<RecallListFallback />}>
      <RecallList />
    </Suspense>
  );
}
