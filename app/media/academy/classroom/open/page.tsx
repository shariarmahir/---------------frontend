import type { Metadata } from "next";
import { OpenClassroom } from "@/components/media/academy/classroom/open-classroom";

export const metadata: Metadata = { title: "নতুন ক্লাসরুম · একাডেমি" };

/** An academy opens a classroom for a new batch of one of its courses. */
export default async function OpenClassroomPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course } = await searchParams;
  return <OpenClassroom initialCourse={course} />;
}
