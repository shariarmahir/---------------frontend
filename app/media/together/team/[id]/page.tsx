import type { Metadata } from "next";
import { TeamRoomView } from "@/components/media/together/team-room";
import { getTeam } from "@/data/media/teams";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: getTeam(id)?.name ?? "টিম রুম" };
}

export default async function TeamRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamRoomView id={id} />;
}
