import type { Metadata } from "next";
import { ClassroomHub } from "@/components/media/classroom/hub";

export const metadata: Metadata = { title: "ক্লাসরুম" };

export default function ClassroomPage() {
  return <ClassroomHub />;
}
