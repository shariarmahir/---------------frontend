import type { Metadata } from "next";
import { WorkspaceView } from "@/components/research/workspace-view";

export const metadata: Metadata = { title: "Workspace — Genius" };

export default function WorkspacePage() {
  return <WorkspaceView />;
}
