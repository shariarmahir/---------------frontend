import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChannelView } from "@/components/media/academy/channel/channel-view";
import { teacherRecord, teacherRecords } from "@/data/media/academy";
import { getPerson } from "@/data/media/users";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return teacherRecords.map((t) => ({ id: t.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = getPerson(id);
  const record = teacherRecord(id);
  return {
    title: person ? `${person.nameBn} · শিক্ষক` : "শিক্ষক",
    description: record && person ? `${record.title}। ${person.bio}` : undefined,
  };
}

/** A teacher's channel: their classes by department, courses as playlists, and the record behind them. */
export default async function TeacherPage({ params }: Props) {
  const { id } = await params;
  if (!teacherRecord(id) || !getPerson(id)) notFound();
  return (
    <Suspense>
      <ChannelView handle={id} />
    </Suspense>
  );
}
