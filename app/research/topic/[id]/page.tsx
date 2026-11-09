import { notFound, permanentRedirect } from "next/navigation";
import { FIELDS, type FieldId } from "@/lib/research/core";
import { findTrack, isFieldId, TRACK_IDS } from "@/lib/research/tracks";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...TRACK_IDS, ...(Object.keys(FIELDS) as FieldId[])].map((id) => ({ id }));
}

/** The old topic pages now live as JSTOR-style collections and subjects. */
export default async function ResearchTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (findTrack(id)) permanentRedirect(`/research/collections/${id}`);
  if (isFieldId(id)) permanentRedirect(`/research/subjects/${id}`);
  notFound();
}
