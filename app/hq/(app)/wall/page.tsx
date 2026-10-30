import type { Metadata } from "next";
import { Wall } from "@/components/hq/tasks/wall";

export const metadata: Metadata = { title: "Celebration Wall" };

export default function Page() {
  return (
    <Wall />
  );
}
