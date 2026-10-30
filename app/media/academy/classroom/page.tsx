import type { Metadata } from "next";
import { ClassroomHub } from "@/components/media/academy/classroom/hub";

export const metadata: Metadata = { title: "ক্লাসরুম · একাডেমি" };

/** Every classroom the viewer learns or teaches in. */
export default function ClassroomPage() {
  return <ClassroomHub />;
}
