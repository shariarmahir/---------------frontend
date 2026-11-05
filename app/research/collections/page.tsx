import type { Metadata } from "next";
import { CollectionCards } from "@/components/research/collection-cards";
import { COLUMN, H1 } from "@/components/research/kit";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Collections — Genius" };

/** Browse by collection: every rule-based shelf of the library. */
export default function CollectionsPage() {
  return (
    <div className={cn(COLUMN, "py-12 lg:py-16")}>
      <h1 className={cn(H1, "hero-rise")}>Collections</h1>
      <p className="hero-rise mt-4 max-w-[62ch] text-lg leading-relaxed text-white/80">Each collection gathers works by what they are about or how they were made. A new upload joins every collection it fits once it passes review.</p>
      <div className="mt-12"><CollectionCards /></div>
    </div>
  );
}
