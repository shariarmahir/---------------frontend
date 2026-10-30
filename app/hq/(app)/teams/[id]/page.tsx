import type { Metadata } from "next";
import { TeamConsole } from "@/components/hq/collab/teams";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamConsole id={id} />;
}
