import type { Metadata } from "next";
import { Suspense } from "react";
import { Intel, IntelFallback } from "@/components/command/intel";

export const metadata: Metadata = { title: "Crime intelligence" };

export default function IntelPage() {
  return (
    <Suspense fallback={<IntelFallback />}>
      <Intel />
    </Suspense>
  );
}
