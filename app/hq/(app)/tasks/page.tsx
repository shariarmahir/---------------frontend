import type { Metadata } from "next";
import { Suspense } from "react";
import { TaskBoard } from "@/components/hq/tasks/board";

export const metadata: Metadata = { title: "Task Board" };

export default function TasksPage() {
  return (
    <Suspense>
      <TaskBoard />
    </Suspense>
  );
}
