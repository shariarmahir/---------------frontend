import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/research/search-view";

export const metadata: Metadata = { title: "Search — Genius" };

export default function ResearchSearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-12 h-96 max-w-7xl animate-pulse rounded-3xl bg-bdnavy-900 motion-reduce:animate-none" />}>
      <SearchView />
    </Suspense>
  );
}
