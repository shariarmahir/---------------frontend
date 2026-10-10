import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseView } from "@/components/media/academy/course-page/course-page";
import { courses, getCourse, getDepartment } from "@/data/media/academy";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).id);
  return course ? { title: `${course.title} · একাডেমি`, description: course.outcome } : { title: "কোর্স" };
}

/** A course — step ৪ of the road: what it teaches week by week, who teaches it, and the way in. */
export default async function CoursePage({ params }: Props) {
  const course = getCourse((await params).id);
  const dept = course && getDepartment(course.dept);
  if (!course || !dept) notFound();
  return <CourseView course={course} dept={dept} />;
}
