import type { Metadata } from "next";
import { TaskWindow } from "@/components/hq/tasks/task-window";

export const metadata: Metadata = { title: "Task" };

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskWindow id={id} />;
}
