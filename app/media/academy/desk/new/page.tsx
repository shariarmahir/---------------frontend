import type { Metadata } from "next";
import { CourseBuilder } from "@/components/media/academy/desk/course-builder";

export const metadata: Metadata = { title: "নতুন কোর্স · শিক্ষক ডেস্ক" };

export default function NewCoursePage() {
  return <CourseBuilder />;
}
