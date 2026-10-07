import type { Metadata } from "next";
import { CourseBuilder } from "@/components/media/academy/desk/course-builder";

export const metadata: Metadata = { title: "নতুন কোর্স · ক্লাসরুম" };

export default function NewCoursePage() {
  return <CourseBuilder />;
}
