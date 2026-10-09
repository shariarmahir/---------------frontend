import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { factsOf } from "@/components/media/academy/finder/facts";
import { AcademyView } from "@/components/media/academy/university/academy-view";
import { academies, getAcademy } from "@/data/media/academy";

export function generateStaticParams() {
  return academies.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const a = getAcademy((await params).id);
  return a ? { title: `${a.name} · একাডেমি`, description: a.about } : { title: "একাডেমি" };
}

/** An academy's own page — step ২ of the road. */
export default async function AcademyPage({ params }: { params: Promise<{ id: string }> }) {
  const a = getAcademy((await params).id);
  if (!a) notFound();
  return <AcademyView academy={a} facts={factsOf(a)} />;
}
