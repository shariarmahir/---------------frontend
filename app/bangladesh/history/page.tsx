import type { Metadata } from "next";
import { ChapterShell } from "@/components/bangladesh-landing/chapter-shell";
import { BdCulture } from "@/components/bangladesh/bd-culture";
import { BdGrowth } from "@/components/bangladesh/bd-growth";
import { BdHistory } from "@/components/bangladesh/bd-history";
import { BdMap } from "@/components/bangladesh/bd-map";
import { BdNature } from "@/components/bangladesh/bd-nature";
import { BdCredits, BdPride } from "@/components/bangladesh/bd-pride";

export const metadata: Metadata = {
  title: "History — Bangladesh | Kandari-Lab",
  description:
    "Chapter 1 of Bangladesh: 2,500 years from Pundranagar to Victory Day, the eight divisions, rivers and nature, songs and crafts, the people who lit the way and the growth story.",
};

/* The story in order: where we come from, the land, its colours, its culture, its people, how far it has come. */
export default function BangladeshHistoryPage() {
  return (
    <ChapterShell chapter="history">
      <BdHistory />
      <BdMap />
      <BdNature />
      <BdCulture />
      <BdPride />
      <BdGrowth />
      <BdCredits />
    </ChapterShell>
  );
}
