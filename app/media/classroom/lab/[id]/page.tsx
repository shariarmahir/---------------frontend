import type { Metadata } from "next";
import { LabRoomView } from "@/components/media/classroom/lab-room";
import { sampleLab } from "@/data/media/labs";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: sampleLab(id)?.name ?? "ল্যাব রুম" };
}

export default async function LabRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LabRoomView id={id} />;
}
