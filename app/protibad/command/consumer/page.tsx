import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsumerWorkspace, ConsumerWorkspaceFallback } from "@/components/command/consumer-workspace";

export const metadata: Metadata = { title: "Consumer rights (ভোক্তা অধিদপ্তর)" };

export default function ConsumerPage() {
  return (
    <Suspense fallback={<ConsumerWorkspaceFallback />}>
      <ConsumerWorkspace />
    </Suspense>
  );
}
