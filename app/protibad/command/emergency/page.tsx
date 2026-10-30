import type { Metadata } from "next";
import { Suspense } from "react";
import { EmergencyDesk, EmergencyDeskFallback } from "@/components/command/emergency-desk";

export const metadata: Metadata = { title: "Emergency desk" };

export default function EmergencyPage() {
  return (
    <Suspense fallback={<EmergencyDeskFallback />}>
      <EmergencyDesk />
    </Suspense>
  );
}
