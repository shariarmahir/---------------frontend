import { redirect } from "next/navigation";

/** A course on the old desk is its first batch's classroom (the first batch carries the course code). */
export default async function DeskCoursePage({ params }: { params: Promise<{ id: string }> }) {
  redirect(`/media/academy/classroom/${(await params).id}`);
}
