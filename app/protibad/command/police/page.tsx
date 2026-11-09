import type { Metadata } from "next";
import { Suspense } from "react";
import { PoliceWorkspace, PoliceWorkspaceFallback } from "@/components/command/police-workspace";

export const metadata: Metadata = { title: "Police" };

export default function PolicePage() {
  return (
    <Suspense fallback={<PoliceWorkspaceFallback />}>
      <PoliceWorkspace />
    </Suspense>
  );
}
