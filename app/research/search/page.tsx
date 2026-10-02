import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/research/search-view";

export const metadata: Metadata = { title: "অনুসন্ধান — গবেষণাকোষ" };

export default function ResearchSearchPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-white/5" />}>
      <SearchView />
    </Suspense>
  );
}
