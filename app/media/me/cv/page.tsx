import type { Metadata } from "next";
import { CvStudio } from "@/components/media/profile/cv-studio";
import { readFormat } from "@/lib/media/cv";

export const metadata: Metadata = { title: "আমার CV" };

/** The viewer's own CV: form, live preview, three layouts, print or PDF. */
export default async function MyCvPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const format = readFormat((await searchParams).f);
  return <CvStudio self format={format} base="/media/me/cv" />;
}
