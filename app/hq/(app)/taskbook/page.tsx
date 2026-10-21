import type { Metadata } from "next";
import { Suspense } from "react";
import { TaskBook } from "@/components/hq/tasks/taskbook";

export const metadata: Metadata = { title: "My TaskBook" };

export default function TaskBookPage() {
  return (
    <Suspense>
      <TaskBook />
    </Suspense>
  );
}
