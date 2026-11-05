import type { Metadata } from "next";
import { IssueBoard } from "@/components/hq/collab/issues";

export const metadata: Metadata = { title: "Issue Board" };

export default function Page() {
  return (
    <IssueBoard />
  );
}
