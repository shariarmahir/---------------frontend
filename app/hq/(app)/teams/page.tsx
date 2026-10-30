import type { Metadata } from "next";
import { TeamsPage } from "@/components/hq/collab/teams";

export const metadata: Metadata = { title: "Teams" };

export default function Page() {
  return (
    <TeamsPage />
  );
}
