import type { Metadata } from "next";
import { ClassroomRoom } from "@/components/media/classroom/room";
import { sampleClassroom } from "@/data/media/classroom";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: sampleClassroom(id)?.name ?? "ক্লাসরুম" };
}

export default async function ClassroomRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClassroomRoom id={id} />;
}
