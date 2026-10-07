import type { Metadata } from "next";
import { CourseManager } from "@/components/media/academy/desk/course-manager";

export const metadata: Metadata = { title: "কোর্স ম্যানেজ · শিক্ষক ডেস্ক" };

export default async function ManageCoursePage({ params }: { params: Promise<{ id: string }> }) {
  return <CourseManager code={decodeURIComponent((await params).id)} />;
}
