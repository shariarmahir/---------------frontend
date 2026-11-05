import { Suspense } from "react";
import { Overview, OverviewFallback } from "@/components/command/overview";

export default function CommandOverviewPage() {
  return (
    <Suspense fallback={<OverviewFallback />}>
      <Overview />
    </Suspense>
  );
}
