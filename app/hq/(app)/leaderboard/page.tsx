import type { Metadata } from "next";
import { Leaderboard } from "@/components/hq/tasks/leaderboard";

export const metadata: Metadata = { title: "Ranks & Badges" };

export default function Page() {
  return (
    <Leaderboard />
  );
}
