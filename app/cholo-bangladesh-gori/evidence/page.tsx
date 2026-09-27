import type { Metadata } from "next";
import { Suspense } from "react";
import { EvidenceExplorer } from "@/components/gori/evidence/explorer";

export const metadata: Metadata = { title: "প্রমাণ অনুসন্ধান — চলো বাংলাদেশ গড়ি | কাণ্ডারী-ল্যাব" };

export default function EvidencePage() {
  return (
    <Suspense>
      <EvidenceExplorer />
    </Suspense>
  );
}
