import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicView } from "@/components/research/topic-view";
import { FIELDS, type FieldId } from "@/lib/research/core";
import { findTrack, isFieldId, TRACK_IDS } from "@/lib/research/tracks";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...TRACK_IDS, ...(Object.keys(FIELDS) as FieldId[])].map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const name = findTrack(id)?.bn ?? (isFieldId(id) ? FIELDS[id].bn : "ধারা");
  return { title: `${name} — গবেষণাকোষ`, description: findTrack(id)?.blurb ?? `${name} বিষয়ের গবেষণা — গবেষণাকোষ।` };
}

/** One research track or subject field: its head, its works as cards, and the other topics. */
export default async function ResearchTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!findTrack(id) && !isFieldId(id)) notFound();
  return <TopicView id={id} />;
}
